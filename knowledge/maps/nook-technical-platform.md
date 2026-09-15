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
│  ├─ Custom API Invocation
│  │  ├─ Browser → Edge Function / CORS                  [Verified C-DB-1]
│  │  ├─ Auth JWT propagation                           [Verified C-DB-1]
│  │  └─ authenticated Weather Orchestration             [Verified C-EXT-1]
│  └─ Application Shell                                 [Next Focus]
│     ├─ bootstrap / session context                     [To Verify]
│     ├─ navigation / menu                               [To Verify]
│     ├─ route / page lifecycle                          [To Verify]
│     ├─ permission-aware feature entry                  [To Verify]
│     └─ global loading / error boundary                 [To Design]
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
│  ├─ Custom API → Native Data API                      [Verified C-DB-1 / C-BSA-1]
│  ├─ Custom API → RPC → PostgreSQL Function            [Verified C-DB-1 / C-BSA-1]
│  ├─ Custom API → Custom API                           [Verified C-EXT-1]
│  ├─ Custom API → External API                         [Verified C-EXT-1]
│  └─ Edge Function → PostgreSQL Client                 [Verified C-BSA-1]
│
├─ Backend Service Access                               [Verified C-BSA-1]
│  ├─ object privilege / RLS boundary                   [Verified]
│  ├─ formal-style secured table CRUD                   [Verified]
│  ├─ Function EXECUTE / security context               [Verified]
│  ├─ Database-owned Transaction                        [Verified]
│  └─ Backend-owned Transaction                         [Verified]
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

### Architecture readiness checkpoint — 2026-09-15

Primary review 與獨立 Codex Blind Spot Review 得到一致方向：**Backend / Data / Integration 的 core feasibility Evidence 已足以開始形成 Platform Architecture draft，目前沒有已識別的 technical Blocking Gap。**

這不代表 Platform Architecture 已完成。研究前緣應從 broad capability probing 逐步轉成：

```text
Verified Capability
→ Architecture Candidate
→ Platform Rule / Open Decision
→ Production Implementation
```

獨立 Review 特別提醒以下 cross-cutting concerns。它們多數不是新 Experiment：

- Transaction Pattern Selection：依完整 Business Operation owner 與 atomicity requirement 選 Native Data API、Database-owned RPC 或 Backend-owned Transaction。
- Authorization / Error Contract：RLS empty result / zero affected rows 是 security mechanism semantics，不自動等於 Business Operation result contract。
- Batch Execution Contract：logical run identity、idempotency、retry ownership、failure persistence 應先由 Business Specification / Platform Rule 定義；只有 chosen contract 需要 provider-specific assurance 時才開 focused experiment。
- Production Identity / Secret / Connection Governance：C-BSA-1 Phase D 的 `postgres` identity 只證明 feasibility；Production 必須回到 least privilege、restricted role、secret custody 與 connection lifecycle。
- Observability Contract：Scheduler、HTTP、runtime、DB 與 business outcome 是不同 layers；未來需 operation / run correlation 與 durable outcome model。
- Requirement-to-platform traceability：正式 Platform Architecture 定稿前，應抽樣 Nook Works representative Specifications，確認沒有 requirement responsibility 落在 Research Map 之外。這是 review / design work，不是 provider Experiment。

獨立 Review Report 由 Work Order `agent-work/work-orders/2026-09-15-nook-platform-readiness-blind-spot-review.md` 派出；其 Report 進入 `agent-work/reports/` 後，作為 collaboration history 與 independent review evidence 保存。

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation，以及 Custom API orchestration。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Application Shell — separate from Feature UI

Application Shell 應視為 **browser-side composition layer**，不是單純 UI presentation。Menu 雖然有畫面，但其 architecture responsibility 涉及 Navigation、Session Context、Route lifecycle、permission-aware feature entry 與 cross-feature bootstrap，因此從一般 Feature UI Pattern 拆開研究。

目前合理的最小 focused experiment 應驗證 lifecycle，而不是 aesthetics：

```text
cold start / deep link
→ session restore / invalid session
→ application user eligibility
→ route resolution
→ menu / feature visibility
→ direct route / backend authorization
→ sign-out / state invalidation
```

Acceptance 重點是 deterministic lifecycle、沒有 stale privileged state / redirect loop，並再次證明 navigation visibility 不是 authorization boundary。Component library、visual style、spacing 等留給 Feature UI exploration。

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

### Backend Service Access — C-BSA-1 verified

C-BSA-1 已完成 Access / Operation / Transaction 三個 dimensions 的 runtime verification。

```text
ACCESS
PostgreSQL privilege + RLS

OPERATION
Direct object operation
vs approved Function EXECUTE

TRANSACTION
Request-owned
vs Database-owned
vs Backend-owned
```

已驗證：

- Backend Service Identity 不等於 unrestricted DB object access。
- PostgreSQL object privilege 與 RLS 是分離的 authorization boundaries。
- Function `EXECUTE` 可形成 operation-level authorization boundary。
- Separate Native Data API requests 不共享 rollback boundary。
- RPC / PostgreSQL Function 可以持有 Database-owned Transaction。
- Edge Function PostgreSQL client 可以持有 Backend-owned Transaction。

Evidence-backed Current Judgment：

> **Transaction boundary 應由擁有完整 Business Operation 的那一層決定。**

這仍不是自動生效的 Platform Rule。完整 findings：`evidence/c-bsa-1-consolidated-findings.md`。

## Remaining Supabase-first Questions

目前沒有已識別的 Backend / Data / Integration technical Blocking Gap。剩餘議題依性質分流：

1. **Application Shell Lifecycle**：下一個 focused experiment candidate；與 Feature UI 拆開，但可共用後續 UI exploration artifact。
2. **Explicit Business Authorization / Error Contract**：優先進 Platform Rule / Design；只有 mechanism 存疑才另做 Experiment。
3. **Batch Idempotency / Retry / Run Identity**：先由 formal requirement 與 Platform Rule 定義；出現 duplicate / concurrent / retry contract 時再 focused verify。
4. **Production Identity / Secrets / Connection Governance**：Platform Rule / Design；不要把 Playground feasibility credential 當 Production approval。
5. **Observability / Correlation Contract**：Platform Rule / Design；隨第一個 representative workflow 驗收即可。
6. **Pure Compute / Longer-running、Concurrency / Isolation / Deadlock、Distributed Compensation、Advanced Workflow Orchestration**：保持 Deferred，直到 representative workload / correctness requirement 出現。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
