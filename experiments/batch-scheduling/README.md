# D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Date: 2026-09-14
- Status: `Partial`（Phase 1 completed; one remaining scheduled external HTTP confirmation）
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `observability`

## Research Question

Nook Works 常見的 scheduled / batch responsibility，能否由 Supabase-managed scheduling 在 iPad-first 環境中，以合理的管理成本與 observability 承擔？

這不是 Production Architecture Decision。Playground 只驗證 scheduler / runtime mechanism 與必要 evidence，不把所有 downstream application design 都塞進 Cron Experiment。

可重用的 Supabase Cron 實作方式、認證、部署與 observability 注意事項已獨立整理：

- [`../../knowledge/implementation/supabase-cron.md`](../../knowledge/implementation/supabase-cron.md)

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

因此目前實際驗證的是 Native Data API 的 **Read + Update**，不是完整 Create / Read / Update / Delete 全集合。

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

```text
Cron → Edge Function                         ✅
Edge Function → authorized synthetic table  ✅
Edge Function → formal place                ❌ service_role table privilege
```

無論這支 Custom API 是由 Cron、人工 POST 或其他 caller 喚醒，只要仍以相同 service identity SELECT `place`，都會得到相同結果。Cron 不改變 Custom API 執行後的 database authorization identity。

這個 failure 暴露的是 **Backend Service Access** 架構問題。它值得另外研究，但不再視為 D-BATCH-1 / Cron feasibility 的 prerequisite。

### 6. Open-Meteo was not reached in Phase 1

Worker 必須先取得 `place.latitude / longitude` 才會呼叫 Open-Meteo。此次在 `place` SELECT 已失敗，因此 scheduled batch chain沒有進入 external provider call。

應記為：

> External API path not reached.

不能記為 Open-Meteo failure。

C-EXT-1 已獨立驗證一般 Supabase Edge Function outbound HTTP → Open-Meteo 可行；尚未直接驗證的是「由 Cron scheduled invoke 的 worker」走到 external provider 的 path。

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

例如單筆 downstream processing 失敗，該 row 記 `FAILED + Memo`，worker 繼續處理其他 items；整個 invocation 仍可能回 HTTP 200。

此 distinction 對未來正式 Batch Monitoring / Operations 有重用價值，但 Playground 不在此階段提早建 `batch_log`、retry framework 或完整 job-management subsystem。

---

# Remaining D-BATCH-1 Evidence Gate

D-BATCH-1 接下來只補一個與 Cron runtime 直接相關的問題：

> 由 Supabase Cron scheduled invoke 的 Edge Function，是否能執行 outbound HTTP call 到 external provider，並將結果寫回 synthetic table？

## Minimal adjustment

不再讀 formal `place`。直接讓 synthetic test row 帶測試用 latitude / longitude：

```text
Cron A
→ Database Function
→ INSERT PENDING + latitude + longitude

Cron B
→ Edge Function
→ SELECT synthetic row + coordinates
→ Open-Meteo
→ UPDATE synthetic result
```

這樣只新增一個變因：scheduled worker outbound HTTP。

Formal `place` lookup 會從 active probe path 移除；Git history 與 Phase 1 Evidence 保留原本 permission failure。Source 可留下簡短註解指出 formal Place lookup intentionally deferred to Backend Service Access research，不需要把舊程式整段註解保存成 active source 木乃伊。

成功條件：

```text
Cron → Edge Function → Open-Meteo → synthetic Data API update
```

有直接 runtime evidence 即可。

這一段本質上是一般 Custom API processing 的最後一張 scheduled-runtime confirmation，不代表要繼續擴張 Batch architecture scope。

---

# Separate Related Research — Backend Service Access

`place` failure 已經提出另一個值得保留的問題：

> 正常採 PostgreSQL privilege + RLS / application access boundary 的 table，server-side Custom API 應如何取得明確、least-privilege 的 backend access？

這題不再屬於 D-BATCH-1 的 completion gate，也不應為了讓 Cron Experiment 變綠而直接放寬 formal `place`。

未來若正式 workload 需要，可另以 synthetic / formal-equivalent object 驗證 authorization pattern，再形成 production migration / architecture decision。

---

# Current Judgment

**D-BATCH-1 remains `Partial`, but Phase 1 is complete and Cron mechanism is already reusable.**

目前可可靠主張：

```text
Cron → Database Function                         Verified
Cron → pg_net → Edge Function                    Verified
Edge Function → Native Data API SELECT/UPDATE
  on authorized synthetic table                 Verified
Formal place read by current service identity   Blocked by table privilege
Cron-scheduled Edge → external provider          Not yet reached / final evidence gate
```

這已足以支持 Supabase Cron 作為 Nook Works system scheduler 的 credible candidate，並已產生獨立 Implementation Guide。剩餘 probe 只確認 scheduled outbound HTTP；Backend Service Access 另題處理。

> Playground Evidence is not a Production Architecture Decision.

## Related Records

- Supabase Cron Implementation Guide: [`../../knowledge/implementation/supabase-cron.md`](../../knowledge/implementation/supabase-cron.md)
- Research Map: [`../../knowledge/maps/nook-technical-platform.md`](../../knowledge/maps/nook-technical-platform.md)
- Phase 1 Evidence: [`../../evidence/d-batch-1-phase-1.md`](../../evidence/d-batch-1-phase-1.md)
- Evidence Index: [`../../evidence/index.md`](../../evidence/index.md)
- Worker implementation note: [`../../agent-work/implementation-notes/supabase-cron-edge-observer.md`](../../agent-work/implementation-notes/supabase-cron-edge-observer.md)
- Supabase Custom API / External API baseline: [`../custom-api/README.md`](../custom-api/README.md)
