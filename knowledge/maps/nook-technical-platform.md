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
└─ Batch Runtime / Scheduling                           [Partial D-BATCH-1]
   ├─ Cron → Database Function → synthetic INSERT       [Verified]
   ├─ Cron → pg_net → Edge Function                     [Verified]
   ├─ Edge → Data API synthetic SELECT / UPDATE         [Verified]
   ├─ Cron-scheduled Edge → External API → update       [Verified]
   └─ Cron → parameterized Edge invocation              [Remaining]
      ├─ fixed parameters                               [Remaining]
      └─ execution-time dynamic parameters              [Remaining]
```

## Current Judgment

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation，以及 Custom API orchestration。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Supabase Custom API workload coverage

C-DB-1 已驗證 Database-centric path；C-EXT-1 已驗證 API composition 與 Edge Function outbound HTTP → Open-Meteo。Supabase Edge Functions 因此仍是 Nook Works Primary Custom API Runtime Candidate。這是 Research Judgment，不是 Production Architecture Decision。

### Batch Runtime / Scheduling — scheduled runtime chain verified, parameter gate remains

D-BATCH-1 已直接確認：

```text
Cron → PostgreSQL Database Function → synthetic row                     Verified
Cron → pg_net → Edge Function                                          Verified
Edge Function → Native Data API Read/Update synthetic table             Verified
Cron → Edge Function → Open-Meteo → synthetic SUCCESS + temperature     Verified
```

可重用的實作方式與注意事項已整理於：`knowledge/implementation/supabase-cron.md`。

因此 Supabase Cron 已具備作為 Nook Works platform scheduler candidate 的主要 runtime evidence。正式關閉第一輪 Cron research 前，仍需補一個由 Nook Works `daily-weather` Batch Specification 暴露出的能力缺口：**parameterized invocation**。

代表性 scheduled input：

```text
executor_oid = -1
query_date   = execution date - 1
process_mode = scheduled mode
```

研究需區分：

- Fixed parameter：Cron request body 能帶固定值。
- Execution-time dynamic parameter：Cron job 執行當下能以 SQL / PostgreSQL expression 計算值並組入 HTTP body，例如 `current_date - 1`。

若參數準備需要查詢 DB、套用 business rules、建立多段日期範圍或其他 orchestration，責任不應繼續膨脹到 Cron。預期 pattern 為：

```text
Simple schedule:  Cron → Main Batch API
Complex schedule: Cron → Launcher / Preparation API → Main Batch API
Manual:           UI / Admin → Main Batch API
```

Cron research 的邊界停在「可靠啟動帶參數的 endpoint」；Launcher 內部參數準備屬 Custom API orchestration。

### Backend Service Access — C-BSA-1

D-BATCH-1 曾因 worker SELECT formal `place` 得到 `permission denied for table place`。Root cause 已確認：current service identity 缺少 table SELECT privilege；bypass RLS 不等於自動取得 table privilege。

這不是 Cron limitation。新的 C-BSA-1 將獨立研究 Supabase Edge Function 作為 backend service 時，如何以明確、least-privilege 的方式存取正式 PostgreSQL objects，包含：

- Native Data API `SELECT / INSERT / UPDATE / DELETE` 的 table privilege 與 RLS boundary。
- RPC / PostgreSQL Function 的 `EXECUTE` privilege 與 function security context。
- 需要 atomicity 的多步驟 DB operation 應如何形成 transaction boundary。
- Frontend User Access (`authenticated + RLS`) 與 Backend Service Access 的責任分離。

Nook Works `daily-weather` Batch Specification 已提供真實代表性需求，例如 `Delete + Insert` 必須同一 Transaction、失敗時 rollback，因此 transaction 不再只是抽象 checklist，而是 C-BSA-1 應驗證的實際 capability。

## Remaining Supabase-first Questions

1. D-BATCH-1：Cron fixed + execution-time dynamic parameter invocation。
2. C-BSA-1：Backend Service Access，包括 formal-style table CRUD、RPC / Function access 與 transaction boundary。
3. Explicit Business Authorization / Error Contract，在真實 API 需要區分 No Data / No Access / Validation / Conflict 等 semantics 時再研究。
4. Pure Compute / Longer-running：保持 Deferred，直到有 representative workload。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
