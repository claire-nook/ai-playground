# Supabase Cron Implementation Guide

- Source Experiment: `D-BATCH-1`
- Status: `Tested implementation guidance`
- Scope: Supabase Cron scheduling、Database Function job、HTTP / Edge Function job、server-side auth、deployment / observability
- Not a Production Architecture Decision

## Purpose

這份文件不是 Experiment Record，也不是 runtime Evidence 清單。

它回答的是：

> 未來 Nook Works 真正需要 scheduled / batch responsibility 時，已經實驗過的 Supabase Cron 要怎麼實作，哪些設定是關鍵，哪些坑不要再踩一次？

實驗細節與歷史 failure 留在 `experiments/batch-scheduling/README.md`；runtime Evidence 留在 `evidence/`。這裡只沉澱可重用的 implementation recipe 與 operational cautions。

---

## Supported Scheduling Shapes

D-BATCH-1 已直接驗證兩種基本形態。

### 1. Cron → PostgreSQL Database Function

適合：

- 工作本身主要是 database operation。
- 不需要外部 HTTP、application runtime 或複雜 orchestration。
- 希望責任留在 PostgreSQL 內。

受測形態：

```text
Supabase Cron
→ PostgreSQL Database Function
→ table mutation
```

D-BATCH-1 中，Cron 依固定 cadence 呼叫 test Database Function，成功建立 synthetic `PENDING` rows。

### 2. Cron → HTTP → Supabase Edge Function

適合：

- 工作需要 application code。
- 需要呼叫 external API、Custom API、做資料轉換或其他非純 SQL orchestration。
- 希望 scheduled job 與既有 Edge Function responsibility 共用 runtime。

受測形態：

```text
Supabase Cron
→ pg_net HTTP POST
→ Supabase Edge Function
→ application processing
```

D-BATCH-1 已確認 scheduled HTTP request 可由 `pg_net` 抵達 Edge Function。

---

## Database Function Job Recipe

1. 先建立具有明確單一責任的 PostgreSQL Function。
2. Function 本身先以人工方式驗證輸入、資料 mutation 與 error behavior。
3. 再由 Supabase Cron 建立 schedule，讓 job 呼叫該 Function。
4. 用 scheduler history 與實際資料狀態雙重確認，不只看 Dashboard 綠燈。
5. 對正式系統應把 Function / schema change 納入正式 migration source of truth；Playground 當時的 Cron 設定來源不應直接視為 production rule。

### 注意

Cron scheduler success 只代表 scheduler 執行了 job command。最終 operation 是否真的完成，仍要看 database result / application state。

---

## HTTP / Edge Function Job Recipe

### A. Edge Function authentication contract

D-BATCH-1 最後採用 provider-supported server-side contract：

```text
withSupabase({ auth: "secret" })
```

Handler 內使用 helper 提供的 privileged client：

```text
ctx.supabaseAdmin
```

不要自行做 duplicated secret equality check。D-BATCH-1 早期曾讓 Cron request 帶一份 credential、Function runtime 再保存另一份 copy，然後人工比較兩者；這造成同步風險並實際產生 HTTP 403。

### B. Deployment mode

Server-side Supabase Secret Key 不是一般 user JWT。受測 Edge Function deployment 使用 JWT gateway verification disabled 的方式，讓 server helper 自己處理 Secret Key authentication。

在目前 repo 中，對應 deployment workflow：

```text
.github/workflows/deploy-test-cron-edge-worker.yml
```

對應 worker：

```text
supabase/functions/test-cron-edge-worker/index.ts
```

正式實作時應保留相同責任概念，但不要直接複製 Playground function 名稱或 synthetic processing logic。

### C. Scheduler HTTP caller

Supabase Cron 的 HTTP job 經 `pg_net` 發出 POST。

受測 request 使用 server-side Supabase Secret Key 作為 caller credential。Secret value 不應：

- 寫入 repository。
- 放進 Browser artifact。
- 寫入 Evidence / log / response。
- 被複製成第二份 runtime secret 再人工比對。

Playground runtime Evidence 已確認 scheduled request 的 user agent 為 `pg_net/0.20.4`，並可在 Edge Function Invocation 中看到實際 HTTP status / duration。

本文件刻意不保存包含 credential value 的 raw Cron command。正式系統若以 Dashboard 或 migration 建立 HTTP job，credential persistence / source-of-truth policy 應另外明確定義。

---

## Database Access from Scheduled Edge Function

Cron 只負責叫醒 Edge Function；它不會改變 Edge Function 對 PostgreSQL 的 authorization identity。

D-BATCH-1 已驗證：

```text
scheduled Edge Function
→ supabaseAdmin / service_role
→ Native Data API SELECT / UPDATE synthetic table
```

可行。

但 `supabaseAdmin` / `service_role` 並不等於「自動擁有所有 table privilege」。Formal `public.place` 在受測環境中沒有授予 `service_role` SELECT privilege，因此同一支 worker SELECT `place` 時得到：

```text
permission denied for table place
```

這是 Backend Service Access 問題，不是 Cron limitation。

因此正式 scheduled worker 若需要讀寫 application tables，必須先確認：

- service identity 是否具有所需 table privilege。
- RLS 與 table privilege 各自扮演什麼角色。
- 是否應直接授權 table，或提供更窄的 backend operation contract。

Frontend User Access 與 Backend Service Access 不應混為同一個 authorization model。

---

## Observability Recipe

D-BATCH-1 最有價值的 operational lesson 之一，是不要把不同 evidence layer 的綠燈混成同一件事。

```text
Scheduler History
→ Runtime Lifecycle
→ HTTP Invocation
→ Data API / PostgreSQL Result
→ Application / Data State
```

### Scheduler History

回答：Cron 是否執行 job command。

對 asynchronous `pg_net` HTTP job，Dashboard `Succeeded` 不代表 downstream HTTP 2xx。

### Runtime Lifecycle

Boot / Shutdown 只能證明 runtime lifecycle 發生，不足以判斷 request 或 business processing 成功。

### HTTP Invocation

確認 request 是否真正抵達 Edge Function，以及 HTTP status / duration。

D-BATCH-1 曾直接觀察到：

- Scheduler `Succeeded`
- Edge Function Invocation HTTP `403`

這是 `Scheduler Success != HTTP Success` 的直接反例。

### Data API / PostgreSQL Result

確認 application processing 是否通過 table privilege / RLS / query execution。

### Application / Data State

最終仍應有 application-visible evidence，例如 status、updated_at、memo、batch result 等，而不是只相信 platform logs。

---

## Failure Semantics Guidance

實驗中自然觀察到兩種不同 failure responsibility：

### Batch / System Failure

整批工作無法開始，例如連待處理資料都讀不到。通常應讓 invocation 本身失敗，保留明確 HTTP / log evidence。

### Item Failure

單筆資料失敗，但其他 item 可以繼續。D-BATCH-1 以 synthetic row 的 `FAILED + Memo` 保存原因；因此整個 invocation 即使 HTTP 200，也可能包含 item failures。

正式系統是否採 retry、batch log、queue、locking / idempotency，應由真實 workload 決定，不從這份 Playground Guide 自動長出 framework。

---

## Common Pitfalls Proven by D-BATCH-1

1. **不要自行複製兩份 secret 再比較。** 曾直接造成 scheduled invocation HTTP 403。
2. **使用 server helper 的 privileged client 時要拿對 client。** 受測 worker 改用 `supabaseAdmin` 後，早期 authorization / permission path 才進入正確 server-side model。
3. **`service_role` bypass RLS 不代表自動取得 table privilege。** `place` 是直接證據。
4. **Scheduler `Succeeded` 不等於 downstream success。** HTTP job 必須看 Invocation。
5. **Boot / Shutdown 不等於 request success。** Runtime lifecycle 不能代替 HTTP evidence。
6. **Credential 不進 Browser。** Browser Observer 應使用自己的 authenticated session，只做允許的 read-only observation。
7. **不要把實驗 business logic 當成 Cron recipe。** Open-Meteo、Place lookup、temperature processing 都只是 probe payload；Cron mechanism 與這些 application logic 是不同責任。

---

## Reusable Source References

- Experiment Record: `experiments/batch-scheduling/README.md`
- Phase 1 Evidence: `evidence/d-batch-1-phase-1.md`
- Edge worker: `supabase/functions/test-cron-edge-worker/index.ts`
- Deployment workflow: `.github/workflows/deploy-test-cron-edge-worker.yml`
- Browser Observer: `public/cron-edge-observer/index.html`
- Experiment-specific implementation note: `agent-work/implementation-notes/supabase-cron-edge-observer.md`

這些 source 可用來回看當時實作，但正式 Nook Works 不應直接 copy synthetic table / function naming 或 probe-specific business logic。

---

## What Is Still Not a Cron Question

以下問題即使在 D-BATCH-1 中被發現，也不應綁成 Cron implementation prerequisite：

- Custom API 如何取得正式 application table 的 backend service access。
- External API business logic 如何設計。
- Retry / rate limit / provider-specific failure policy。
- 正式 Batch domain model、batch log、queue、locking、idempotency。

這些都是 application / backend architecture 題。Cron 的責任到「何時、如何觸發既有 operation」為止。

---

## Current Implementation Judgment

在 D-BATCH-1 已取得的 runtime Evidence 下，可以把以下做法視為可重用的 tested recipe：

```text
Database-centric scheduled work
→ Supabase Cron → PostgreSQL Function

Application / orchestration scheduled work
→ Supabase Cron → pg_net POST → authenticated Supabase Edge Function
```

正式採用前仍需依 production workload 補 Security、Operations、Cost 與 configuration source-of-truth 決策；但不需要再從「Supabase Cron 到底能不能叫 Function / Edge Function」重新猜一次。
