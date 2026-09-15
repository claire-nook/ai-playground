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
├─ Backend Service Access                               [Planned C-BSA-1]
│  ├─ service identity → synthetic table Read/Update    [Verified D-BATCH-1]
│  ├─ service identity → formal-style secured table CRUD [Planned]
│  ├─ service identity → RPC / PostgreSQL Function      [Planned]
│  └─ transaction boundary / atomic DB operation        [Planned]
│
├─ Remote Execution / Toolchain
│  └─ GitHub Actions                                    [Verified]
│
└─ Batch Runtime / Scheduling                           [Verified D-BATCH-1]
   ├─ Cron → Database Function → synthetic INSERT       [Verified]
   ├─ Cron → pg_net → Edge Function                     [Verified]
   ├─ Edge → Data API synthetic SELECT / UPDATE         [Verified]
   ├─ Cron-scheduled Edge → External API → update       [Verified]
   └─ Cron → parameterized Edge invocation              [Verified]
      ├─ static literal                                 [Verified]
      ├─ execution-time SQL expression                  [Verified]
      └─ PostgreSQL Function return value               [Verified]
```

## Current Judgment

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation，以及 Custom API orchestration。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Supabase Custom API workload coverage

C-DB-1 已驗證 Database-centric path；C-EXT-1 已驗證 API composition 與 Edge Function outbound HTTP → Open-Meteo。Supabase Edge Functions 因此仍是 Nook Works Primary Custom API Runtime Candidate。這是 Research Judgment，不是 Production Architecture Decision。

### Batch Runtime / Scheduling — D-BATCH-1 verified

D-BATCH-1 已直接確認：

```text
Cron → PostgreSQL Database Function → synthetic row                     Verified
Cron → pg_net → Edge Function                                          Verified
Edge Function → Native Data API Read/Update synthetic table             Verified
Cron → Edge Function → Open-Meteo → synthetic SUCCESS + temperature     Verified
Cron → static parameter → Edge Function                                 Verified
Cron → execution-time SQL expression → Edge Function                    Verified
Cron → PostgreSQL Function return value → Edge Function                 Verified
```

Cron job lifecycle 亦已實測可由 SQL 管理：

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

可重用實作與 SQL sample：`knowledge/implementation/supabase-cron.md`。
Parameter evidence：`evidence/d-batch-1-parameter-invocation.md`。

### Parameter preparation responsibility ladder

D-BATCH-1 的重要產出不是單一 Cron 語法，而是未來 Platform Pattern 的 responsibility placement evidence：

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層已有直接 runtime Evidence。`Cron → Launcher / Preparation API → Core API` 不另做專用 probe，因其 building blocks 已由 Custom API composition、Native Data API 與 outbound HTTP 分別驗證；它屬已知可行 architecture option，而非未解 Cron capability。

平台初期不需要把所有可行層次一次建完。應區分：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

可先選 1～2 個 Preferred Pattern，其他已知能力保留為 Deferred / Future Expansion Candidate。平台本身會隨需求與成熟度成長，不把「目前未納入」誤寫成「技術不需要 / 不可用」。

未來實際開發的 Pattern Guide 應回答「平台目前提供哪些 Pattern、如何選、怎麼用」；另外保留 known-but-not-yet-standardized capability index，作為平台下一階段演進依據，而不是每次新需求再從零猜還能做什麼。

### Backend Service Access — C-BSA-1

D-BATCH-1 曾因 worker SELECT formal `place` 得到 `permission denied for table place`。Root cause 已確認：current service identity 缺少 table SELECT privilege；bypass RLS 不等於自動取得 table privilege。

這不是 Cron limitation。新的 C-BSA-1 將獨立研究 Supabase Edge Function 作為 backend service 時，如何以明確、least-privilege 的方式存取正式 PostgreSQL objects，包含：

- Native Data API `SELECT / INSERT / UPDATE / DELETE` 的 table privilege 與 RLS boundary。
- RPC / PostgreSQL Function 的 `EXECUTE` privilege 與 function security context。
- 需要 atomicity 的多步驟 DB operation 應如何形成 transaction boundary。
- Frontend User Access (`authenticated + RLS`) 與 Backend Service Access 的責任分離。

Nook Works `daily-weather` Batch Specification 已提供代表性需求，例如 `Delete + Insert` 必須同一 Transaction、失敗時 rollback，因此 transaction 不再只是抽象 checklist，而是 C-BSA-1 應驗證的實際 capability。

## Remaining Supabase-first Questions

1. C-BSA-1：Backend Service Access，包括 formal-style table CRUD、RPC / Function access 與 transaction boundary。
2. Explicit Business Authorization / Error Contract，在真實 API 需要區分 No Data / No Access / Validation / Conflict 等 semantics 時再研究。
3. Pure Compute / Longer-running：保持 Deferred，直到有 representative workload。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
