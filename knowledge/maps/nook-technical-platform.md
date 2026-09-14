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
├─ Backend Service Access
│  ├─ service identity → synthetic table Read/Update    [Verified D-BATCH-1 P1]
│  └─ service identity → normal secured table           [Phase 2-A]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions                                    [Verified]
│
└─ Batch Runtime / Scheduling                           [Partial D-BATCH-1]
   ├─ Cron → Database Function → synthetic INSERT       [Verified]
   ├─ Cron → pg_net → Edge Function                     [Verified]
   ├─ Edge → Data API synthetic SELECT / UPDATE         [Verified]
   ├─ Edge → formal place                               [Blocked: table privilege]
   ├─ Cron-scheduled Edge → External API                [Phase 2-B]
   └─ minimal full-chain confirmation                   [Phase 2-C]
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

Worker 對 formal `place` 的 SELECT 失敗已確認為 current service identity 缺少 table SELECT privilege。這不是 Cron limitation，也不是 Native Data API SELECT capability failure。

因 coordinates 未取得，D-BATCH-1 尚未進入 Cron-scheduled Open-Meteo call。C-EXT-1 只能證明一般 Edge Function outbound HTTP 可行，不能替 scheduled path 背書。

Row-level Memo 已在 Browser Observer 驗證，能直接顯示 item failure reason。

### Batch Phase 2

Phase 2 只補三個 evidence gate：

1. **Backend Service Access**：正常 privilege + RLS table，Custom API 如何取得明確、least-privilege read access。優先用 synthetic / formal-equivalent object，不直接放寬 formal `place`。
2. **Scheduled External HTTP**：以 synthetic coordinates 驗證 `Cron → Edge Function → Open-Meteo → synthetic result`。
3. **Minimal Integration Confirmation**：前兩項分別通過後，確認 `Cron → Edge → authorized Data API read → external API → synthetic update` 能完整串接。

完成後即可關閉 D-BATCH-1 第一輪 feasibility research。Retry、locking、concurrency / idempotency、quota / cost、正式 batch log 與 scheduler source-of-truth policy，只有在它們開始影響真正架構決策時才另開代表性 Probe。

## Important Authorization Note

Frontend User Access 與 Backend Service Access 是不同責任：

- Browser / user path 可採 `authenticated + RLS / application access`。
- Background worker 使用 service identity，不應假裝成某個 user，也不能假設 bypass RLS 等於自動擁有所有 table privileges。

D-BATCH-1 的 `place` 失敗正好證明 PostgreSQL table privilege 與 RLS 是不同層。

## Remaining Supabase-first Questions

1. Backend Service Access pattern。
2. Cron-scheduled outbound external HTTP。
3. Explicit Business Authorization / Error Contract，在真實 API 需要區分 No Data / No Access / Validation / Conflict 等 semantics 時再研究。
4. Pure Compute / Longer-running：保持 Deferred，直到有 representative workload。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
