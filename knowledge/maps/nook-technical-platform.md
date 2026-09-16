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
│  ├─ Application Shell                                 [Verified S-SHELL-1]
│  │  ├─ bootstrap / Application User Context            [Verified]
│  │  ├─ metadata-driven Navigation / Feature Entry      [Verified]
│  │  ├─ deep link / reload / Back / Forward             [Verified]
│  │  ├─ Session refresh / invalidation / explicit Logout[Verified]
│  │  └─ iPad / iPhone responsive lifecycle              [Verified]
│  └─ Feature UI / Maintenance Interaction               [Next Research Front]
│     ├─ list / table / query interaction                 [To Research]
│     ├─ CRUD / form lifecycle                            [To Research]
│     └─ Browser History vs Business Action               [To Research]
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

### Application Shell — S-SHELL-1 verified 2026-09-16

S-SHELL-1 已完成 deployed vertical slice 與 Claire Environment Evidence。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

Verified composition：

```text
Browser Entry / Deep Link
→ Login / Session Restore
→ Auth Identity
→ active app_user / Application Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Render
→ explicit Logout / Invalidation
```

Environment Evidence 已涵蓋 admin/user/guest Feature Entry、三種 real integration、iPad/iPhone responsive、deep link、reload、same-browser new-tab persisted Session、cross-browser unauthenticated entry、Back/Forward 與 explicit Logout。

重要 boundary：

```text
Authentication Identity
≠ Application Eligibility
≠ Navigation Visibility
≠ Route / Feature Entry
≠ Feature Data Access
≠ Backend Authorization
```

另外：

```text
Browser Navigation ≠ Logout ≠ Business Action
```

Historical explicit-logout Session restoration anomaly 保留為 `A-SAFARI-LIFECYCLE` Known Observation，intermittent / root cause Unknown；它不再阻擋 S-SHELL-1 closure，也沒有被誤寫成已證實的 Shell/Safari/Supabase root cause。

Formal Nook Works 應把 S-SHELL-1 的 verified contracts、portable logic 與 lifecycle traps 帶回 Platform Shell design，而不是直接把 disposable monolithic `app.js` 當 Production architecture。

### Architecture readiness checkpoint — 2026-09-16

Backend / Data / Integration 與 Application Shell lifecycle 的 core feasibility Evidence 已足以進入 Platform Architecture / UI interaction design；目前沒有已識別的 technical Blocking Gap。

研究前緣從 broad capability probing 轉成：

```text
Verified Capability
→ Architecture Candidate
→ Platform Rule / Open Decision
→ Production Implementation
```

Cross-cutting design queue：Transaction Pattern Selection、Authorization / Error Contract、Batch Execution Contract、Production Identity / Secret / Connection Governance、Observability Contract、Requirement-to-platform traceability。

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation、Custom API orchestration與 Application Shell composition。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Next Research Front — Feature UI / Maintenance Interaction

S-SHELL-1 回答「Feature 如何裝進 Application Runtime」，不回答 Feature 內的 CRUD / query interaction。

下一階段 candidate：List/Table、Pagination、Sort、Filter/Search、Loading/Empty/Error、responsive presentation、Create/Edit/Delete/Save/Cancel、Validation/Dialog/Toolbar，以及：

```text
Query
→ Detail / Edit
→ Save / Cancel
→ Return
→ Browser Back / Forward
→ unsaved changes / query-state restoration
```

Browser History 不應隱性觸發 Business Mutation；實際 Save-success history replacement、unsaved-change guard 與 query-state restoration contract 留給 Platform UI research。

### Supabase Custom API workload coverage

C-DB-1 已驗證 Database-centric path；C-EXT-1 已驗證 API composition 與 Edge Function outbound HTTP → Open-Meteo。Supabase Edge Functions 因此仍是 Nook Works Primary Custom API Runtime Candidate。這是 Research Judgment，不是 Production Architecture Decision。

### Batch Runtime / Scheduling — D-BATCH-1 verified

D-BATCH-1 已直接確認 Cron → Database Function、Cron → pg_net → Edge Function、Edge → Data API、Cron-scheduled Edge → External API，以及 static / execution-time SQL expression / PostgreSQL Function return value parameter invocation。可重用實作與 SQL sample：`knowledge/implementation/supabase-cron.md`；parameter evidence：`evidence/d-batch-1-parameter-invocation.md`。

Parameter responsibility ladder：

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層有直接 runtime Evidence；後兩層保留為 architecture option。`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule`。

### Backend Service Access — C-BSA-1 verified

C-BSA-1 已完成 Access / Operation / Transaction 三個 dimensions 的 runtime verification。Backend Service Identity 不等於 unrestricted DB access；object privilege / RLS / Function EXECUTE 是不同 authorization boundaries；RPC 可持有 Database-owned Transaction，Edge PostgreSQL client 可持有 Backend-owned Transaction。

Evidence-backed Current Judgment：`Transaction boundary 應由擁有完整 Business Operation 的那一層決定。` 完整 findings：`evidence/c-bsa-1-consolidated-findings.md`。

## Remaining Supabase-first / Platform Questions

目前沒有已識別的 Backend / Data / Integration / Shell technical Blocking Gap。剩餘議題依性質分流：

1. **Feature UI / Maintenance Interaction**：下一個 focused research front。
2. **Explicit Business Authorization / Error Contract**：Platform Rule / Design；只有 mechanism 存疑才另做 Experiment。
3. **Batch Idempotency / Retry / Run Identity**：先由 formal requirement 與 Platform Rule 定義。
4. **Production Identity / Secrets / Connection Governance**：Platform Rule / Design。
5. **Observability / Correlation Contract**：Platform Rule / Design；隨 representative workflow 驗收。
6. **A-SAFARI-LIFECYCLE**：Known intermittent observation；只有 anomaly 再現且可取得 diagnostic Evidence 時重開。
7. **Pure Compute / Longer-running、Concurrency / Isolation / Deadlock、Distributed Compensation、Advanced Workflow Orchestration**：保持 Deferred，直到 representative workload / correctness requirement 出現。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，不是 Production Architecture Rule。正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
