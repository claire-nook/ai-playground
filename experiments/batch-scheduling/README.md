# D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Date: 2026-09-14
- Status: `Partial`（Phase 1 completed; Phase 2 planned）
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `observability`

## Research Question

Nook Works 常見的 scheduled / batch responsibility，能否由 Supabase-managed scheduling 在 iPad-first 環境中，以合理的管理成本與 observability 承擔？

這不是 Production Architecture Decision。Playground 先拆開驗證 scheduler、database function、custom API、Native Data API、backend service authorization 與 external API 等責任，再決定哪些能力足以進入正式架構討論。

---

# Phase 1 — Scheduling / Runtime Chain Evidence

## Experiment Shape

兩條 path 共用 synthetic table `public.test_b8c3q1`：

```text
Cron A → PostgreSQL Database Function → INSERT PENDING test row
```

```text
Cron B → pg_net → test-cron-edge-worker
       → Supabase Native Data API SELECT / UPDATE
       → formal place read attempt
       → Open-Meteo（only if coordinates are obtained）
```

Cron A 是 producer；Cron B 與 Edge Function worker 是 consumer。

## Phase 1 Result Summary

### 1. Supabase Cron can act as a system scheduler — Verified

Cron job 已依排程重複執行，並留下 scheduler / runtime / data evidence。對 HTTP job 必須注意：Scheduler `Succeeded` 只代表 Cron 成功執行 dispatch command，不代表 downstream HTTP 或 business processing 一定成功。

### 2. Cron → PostgreSQL Database Function — Verified

`test-cron-db-probe-01` 已依 3-minute cadence 呼叫 `public.test_f8c3q1(...)`，並在 synthetic table 建立 `PENDING` rows。

```text
Supabase Cron → PostgreSQL Database Function → test-table INSERT
```

此 tested path 可標示 `Verified`。

### 3. Cron → Custom API / Edge Function — Verified

`test-cron-edge-probe-01` 已依 5-minute cadence，經 `pg_net` 發出 HTTP POST 並抵達 `test-cron-edge-worker`。

```text
Supabase Cron → pg_net → HTTP POST → Edge Function
```

早期 invocation 曾因 worker 自訂 duplicated secret equality check 回 HTTP 403。該失敗保留為有效 Evidence；後續改為 provider-supported `withSupabase({ auth: "secret" })` contract，並使用 helper 提供的 `supabaseAdmin` privileged client。

修正後 scheduled invocation 已得到 HTTP 200，因此「Cron 可以啟動 Custom API」在受測 path 中已確認。

### 4. Edge Function → Native Data API on authorized synthetic table — Verified

Worker 以 `supabaseAdmin` 對 `public.test_b8c3q1` 執行：

- SELECT `PENDING` rows：Verified
- UPDATE row status / metadata：Verified

因此目前實際驗證的是 Native Data API 的 **Read + Update**，不是完整 Create / Read / Update / Delete 全集合。不要把平台理論能力偷渡成實驗證據。

### 5. Formal `place` read failed because of table privilege — Root Cause Confirmed

Worker 進一步以同一個 `supabaseAdmin / service_role` client SELECT formal `public.place` 時，PostgreSQL 回：

```text
permission denied for table place
```

DB inspection 已確認：

- `place` 啟用 RLS。
- `authenticated` 具有 SELECT table privilege，並受 `private.can_access_application()` RLS policy 約束。
- `service_role` 對 `place` 沒有 SELECT table privilege。

因此這次失敗發生在 PostgreSQL table privilege 層，並不是 Cron-specific limitation，也不是 Native Data API SELECT capability failure。

正確解讀是：

```text
Cron → Edge Function                         ✅
Edge Function → authorized synthetic table  ✅
Edge Function → formal place                ❌ service_role table privilege
```

無論這支 Custom API 是由 Cron、人工 POST 或其他 caller 喚醒，只要仍以相同 service identity SELECT `place`，都會得到相同結果。Cron 不改變 Custom API 執行後的 database authorization identity。

### 6. Open-Meteo was not reached in D-BATCH-1 Phase 1

Worker 必須先取得 `place.latitude / longitude` 才會呼叫 Open-Meteo。此次在 `place` SELECT 已失敗，因此 scheduled batch chain **沒有進入 external provider call**。

應記為：

> External API path not reached.

不能記為 Open-Meteo failure。

注意：C-EXT-1 已獨立驗證一般 Supabase Edge Function outbound HTTP → Open-Meteo 可行；尚未驗證的是「由 Cron scheduled invoke 的 worker」完整走到 external provider 的 path。

### 7. Row-level Memo observability — Verified

Synthetic table 已增加 nullable `t09 text` 作為 row-level Memo。

Worker behavior：

- `SUCCESS` → `t09 = null`
- `FAILED` → `t09 = reason`

Authenticated Browser Observer `/cron-edge-observer/` 已同步顯示 Memo。Runtime evidence 已直接看到新版 worker 寫入：

```text
place_select_failed: permission denied for table place
```

舊 FAILED rows 沒有 Memo，新 FAILED rows 開始持久化原因，形成清楚的前後對照。

## Phase 1 Observability Model

本次實驗建立以下 evidence layers：

```text
Scheduler History
  → Runtime Lifecycle
    → HTTP Invocation
      → Data API / PostgreSQL result
        → Observer / Data State
```

各層回答不同問題：

1. Scheduler History：job command 是否被執行。
2. Runtime Lifecycle：Edge runtime 是否 Boot / Shutdown。
3. HTTP Invocation：request 是否抵達、HTTP status / duration。
4. Data API / PostgreSQL：資料存取是否通過 privilege / RLS / query execution。
5. Observer / Data State：item 最後形成什麼 application-visible state。

所以：

> Scheduler Success ≠ HTTP Success ≠ Item Success。

## Failure Semantics Learned

目前 worker 已自然形成兩類失敗：

### Batch / System Failure

例如連 `PENDING` rows 都無法 SELECT，整批無法開始，可回 HTTP 500。

### Item Failure

例如某一筆 `place` read、coordinates、external provider 或 row processing 失敗，該 row 記 `FAILED + Memo`，worker 繼續處理其他 items；整個 invocation 仍可能回 HTTP 200。

此 distinction 對未來正式 Batch Monitoring / Operations 有重用價值，但 Playground 不在此階段提早建 `batch_log`、retry framework 或完整 job-management subsystem。

---

# Phase 2 — Planned Experiments

Phase 2 只補目前阻擋技術判斷的兩個洞，再做一次最小 integration confirmation。不要順手把 Playground 養成 ERP。

## P2-A — Backend Service Access to a normally secured table

### Question

正常採用 PostgreSQL privilege + RLS / application access boundary 的 table，應如何讓 server-side Custom API 以明確、可維護、least-privilege 的方式讀取？

### What must be learned

- `service_role / supabaseAdmin` 與 table privilege / RLS 的實際責任邊界。
- Custom API 是否應直接取得 specific table privilege，或採用更窄的 backend access contract。
- 如何避免為了 Batch 測試而無限制放寬正式 `place`。
- Frontend User Access 與 Backend Service Access 應分開描述，不把 `authenticated + RLS` 模型誤套到 background worker。

### Safety boundary

Phase 2 不應直接把 formal `place` 權限放寬當成實驗捷徑。優先以 synthetic / formal-equivalent object 驗證 authorization pattern；只有 pattern 被理解並明確批准後，才討論正式 table migration。

## P2-B — Cron-scheduled Custom API → External API

### Question

由 Supabase Cron scheduled invoke 的 Edge Function，是否能實際執行 outbound HTTP call 到 external provider，並留下可觀察結果？

### Minimal shape

移除 formal `place` privilege 這個無關 dependency。可直接使用 synthetic coordinates 或 synthetic test data：

```text
Cron → Edge Function
     → synthetic coordinates
     → Open-Meteo
     → synthetic result / Memo
```

這次要驗的是 scheduled runtime 的 outbound HTTP path，不是再測一次 Place authorization。

## P2-C — Integration confirmation, not a new large experiment

P2-A 與 P2-B 分別通過後，再做一次最小完整鏈確認：

```text
Cron
→ Edge Function
→ authorized Data API read
→ external API
→ synthetic Data API update
```

這個 checkpoint 的目的只是避免「A 單獨成功 + B 單獨成功」被自動腦補成 A→B 串起來必定成功。若完整鏈跑通，即可關閉 D-BATCH-1 第一輪 feasibility research；retry、locking、concurrency、quota / cost 等留給真正出現架構決策需求時再研究。

---

# Current Judgment

**D-BATCH-1 remains `Partial`, but Phase 1 is complete.**

目前可可靠主張：

```text
Cron → Database Function                         Verified
Cron → pg_net → Edge Function                    Verified
Edge Function → Native Data API SELECT/UPDATE
  on authorized synthetic table                 Verified
Formal place read by current service identity   Blocked by table privilege
Cron-scheduled Edge → external provider          Not yet reached / not yet verified
```

這已足以支持 Supabase Cron 作為 Nook Works system scheduler 的 credible candidate。Phase 2 將回答 Backend Service Access 與 scheduled external HTTP 兩個剩餘問題，再以最小 integration chain 收尾。

> Playground Evidence is not a Production Architecture Decision.

## Related Records

- Research Map: [`../../knowledge/maps/nook-technical-platform.md`](../../knowledge/maps/nook-technical-platform.md)
- Evidence Index: [`../../evidence/index.md`](../../evidence/index.md)
- Worker implementation note: [`../../agent-work/implementation-notes/supabase-cron-edge-observer.md`](../../agent-work/implementation-notes/supabase-cron-edge-observer.md)
- Supabase Custom API / External API baseline: [`../custom-api/README.md`](../custom-api/README.md)
