# Nook Technical Platform Research Map

- Research Topic: Nook Works Technical Platform Architecture Exploration
- Status: Active
- Started: 2026-09-12
- Tags: `nook-platform`, `ipad-first`, `supabase`, `netlify`, `browser`, `security`

## Research Intent

沿著 Nook Works 真正需要的 Platform Responsibility 取得實作 Evidence，而不是做 Provider 功能清單競賽。

```text
Responsibility → credible candidate → minimal experiment → evidence → later decision
```

## Current Research Graph

```text
Nook Technical Platform
│
├─ Browser Application
│  ├─ Authentication / Supabase Auth                    [Verified A]
│  ├─ Native Table CRUD                                 [Verified B]
│  ├─ Native View Read Model                            [Verified B-1]
│  └─ Custom API Invocation
│     ├─ Browser → Edge Function / CORS                  [Verified C-DB-1]
│     ├─ Auth JWT propagation                           [Verified C-DB-1]
│     └─ authenticated Weather Orchestration             [Verified C-EXT-1]
│
├─ Custom API Runtime
│  ├─ Supabase Edge Functions
│  │  ├─ Deployment Lifecycle                           [Verified C-0]
│  │  ├─ Database-centric workload                      [Verified C-DB-1]
│  │  └─ API composition / External API orchestration   [Verified C-EXT-1]
│  └─ Netlify Functions                                 [Verified lifecycle C-NF-0]
│
├─ Application Operation Mechanism
│  ├─ Native Data API                                   [Verified B/B-1]
│  ├─ Custom API → Native Data API SELECT               [Verified C-DB-1]
│  ├─ Custom API → RPC → PostgreSQL Function            [Verified C-DB-1]
│  ├─ Custom API → Custom API                           [Verified C-EXT-1]
│  └─ Custom API → External API                         [Verified C-EXT-1]
│
├─ Backend Service Access                               [Separate research question]
│  ├─ service identity → synthetic table Read/Update    [Verified D-BATCH-1 P1]
│  └─ service identity → normal secured table           [Candidate]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions                                    [Verified]
│
└─ Batch Runtime / Scheduling                           [Partial D-BATCH-1]
   ├─ Cron → Database Function → synthetic INSERT       [Verified]
   ├─ Cron → pg_net → Edge Function                     [Verified]
   ├─ Edge → Data API synthetic SELECT / UPDATE         [Verified]
   └─ Cron-scheduled Edge → External API                [Remaining evidence gate]
```

## Current Judgment

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation，以及 Custom API orchestration。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Supabase Custom API workload coverage

C-DB-1 已驗證 Database-centric path；C-EXT-1 已驗證 API composition 與 Edge Function outbound HTTP → Open-Meteo。Supabase Edge Functions 因此仍是 Nook Works Primary Custom API Runtime Candidate。這是 Research Judgment，不是 Production Architecture Decision。

### Batch Runtime / Scheduling — Phase 1 complete

D-BATCH-1 Phase 1 已確認：

```text
Cron → PostgreSQL Database Function → synthetic PENDING row     Verified
Cron → pg_net → Edge Function                                  Verified
Edge Function → Native Data API Read/Update synthetic table     Verified
```

可重用的實作方式與注意事項已獨立整理於：

`knowledge/implementation/supabase-cron.md`

因此未來正式開發不需要重新從「Cron 怎麼叫 Database Function / Edge Function、server-side auth 怎麼做、如何判讀 Scheduler / Invocation / Data State」開始考古。

目前 Batch track 尚缺最後一張直接 runtime Evidence：

```text
Cron → Edge Function → outbound External API → synthetic update
```

C-EXT-1 已證明一般 Edge Function outbound HTTP 可行，但不能替 scheduled invocation path 自動背書。D-BATCH-1 下一步只需用 synthetic coordinates 隔離驗證這一段，不再把 formal `place` authorization 混進 Cron capability test。

### Backend Service Access — separate from Cron

D-BATCH-1 中 worker SELECT formal `place` 失敗，root cause 已確認為 current service identity 缺少 table SELECT privilege。這暴露出一個獨立而重要的架構問題：

> 正式 backend service 應如何取得 application table 的明確、least-privilege access？

這不是 Cron limitation，也不是完成 D-BATCH-1 的 prerequisite。它應作為 Backend Service Access 研究題另行處理，而不是讓 Cron Experiment 無限增生。

Frontend User Access 與 Backend Service Access 應分開描述：

- Browser / user path 可採 `authenticated + RLS / application access`。
- Background worker 使用 service identity，不應假裝成 user，也不能假設 bypass RLS 等於自動擁有所有 table privileges。

### Remaining Batch Evidence Gate

D-BATCH-1 接下來只需補：

```text
Cron
→ Edge Function
→ synthetic latitude / longitude
→ Open-Meteo
→ synthetic Data API update
```

這是 Cron-scheduled runtime capability confirmation，不是新的 Batch architecture design。完成後即可關閉 D-BATCH-1 第一輪 feasibility research。

Retry、locking、concurrency / idempotency、quota / cost、正式 batch log 與 scheduler source-of-truth policy，只有在它們開始影響真正架構決策時才另開代表性 Probe。

## Remaining Supabase-first Questions

1. Backend Service Access pattern：獨立 research question，不阻擋 Cron 結案。
2. Cron-scheduled outbound external HTTP：D-BATCH-1 remaining evidence gate。
3. Explicit Business Authorization / Error Contract，在真實 API 需要區分 No Data / No Access / Validation / Conflict 等 semantics 時再研究。
4. Pure Compute / Longer-running：保持 Deferred，直到有 representative workload。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
