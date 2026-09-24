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

Platform research 在 core feasibility 足夠後，進一步從 Nook Works 的 Business / Functional Requirement 反推 Technical Responsibility。Claire 可用企業系統 SA 熟悉的 functional language 描述需求；Primary Agent 負責補上 technical decomposition，避免 Business Specification 被迫承擔 Technical Architecture。

```text
Business / Functional Requirement
→ Interaction Semantics
→ Technical Responsibility Decomposition
→ Platform Pattern Candidate
→ Existing Evidence Mapping
→ Gap / Open Decision
→ Minimal Experiment only when needed
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
│  └─ Business Feature → Technical Platform Pattern      [Active Research Front]
│     ├─ Read-only Query                                 [Completed F-QUERY-1]
│     │  ├─ curated result / field semantics             [Candidate established]
│     │  ├─ business vs technical query boundary         [Candidate established]
│     │  ├─ server-side pagination / sorting baseline    [Candidate established]
│     │  ├─ total / page navigation / page size          [Candidate established]
│     │  └─ complete-set Browser variant                 [Bounded variant]
│     ├─ Master → Detail return context                  [Known next pressure]
│     ├─ CRUD / maintenance operation lifecycle          [To Research]
│     ├─ authorization / token / transaction boundary    [Cross-cutting design]
│     └─ Browser History / unsaved state                 [To Research]
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

S-SHELL-1 的 synthetic metadata 已分開 Feature Registry、Navigation Definition 與 `user_type → Feature Entry` mapping；這只證明 coarse Feature Entry / metadata-driven Navigation 的 conceptual shape，不形成 Production Role / Permission / RBAC schema。

Historical explicit-logout Session restoration anomaly 保留為 `A-SAFARI-LIFECYCLE` Known Observation，intermittent / root cause Unknown；它不再阻擋 S-SHELL-1 closure，也沒有被誤寫成已證實的 Shell/Safari/Supabase root cause。

Formal Nook Works 應把 S-SHELL-1 的 verified contracts、portable logic 與 lifecycle traps 帶回 Platform Shell design，而不是直接把 disposable monolithic `app.js` 當 Production architecture。

### Read-only Query — F-QUERY-1 completed 2026-09-17

F-QUERY-1 已完成第一輪 requirement-driven Read-only Query Pattern research cycle。Experiment Record：`experiments/feature-query/README.md`；General Architecture synthesis：`knowledge/platform/application-platform-architecture.md` v0.3。

這一輪不是證明一套 Production Query framework，而是形成足以帶往下一個 Requirement 的 Current Judgment：

```text
Business Query Boundary
→ Requirement / SA 定義合理查詢範圍

Technical Result Boundary
→ Platform / Technical Design 保證單次 interaction cost 有界
```

對 enterprise-style query，baseline candidate 為：

```text
criteria + sort + page + pageSize
→ validated operation contract
→ server-side filter
→ server-side sort
→ server-side page
→ bounded rows + total / page metadata
```

Page navigation、previous / next、current page、total count 與 page-size selector 被視為 paged Query 的基本完整性，不再因「目前資料看起來不多」延後到不明未來。若某 Feature 能明確證明完整 Result Set 小且 bounded，Browser-side sort / pagination 仍可作受限 implementation variant。

Nook Works 的 no-horizontal-scroll 決定仍只是 Pattern-specific candidate；它提供 design pressure，不升格為 general browser-platform law。

Master → Detail 尚未進入正式 Pattern 2，但已知 return-context 不能只理解成 `restore pageNumber`。若資料在 User 看 Detail 期間插入，原 anchor record 可能移到另一頁；因此 stable row identity / work-context restoration 是下一 Pattern 必須正面處理的 design pressure。

### Architecture readiness checkpoint — 2026-09-17

Backend / Data / Integration、Application Shell lifecycle 與 Read-only Query first baseline 已足以支持下一輪 Business Feature Pattern research；目前沒有已識別的 technical Blocking Gap 要求先回頭做 broad capability probing。

研究前緣現在是：

```text
Verified / Candidate Platform Baseline
→ Next Real Business Requirement
→ Reuse / Extend / Refactor / Replace
→ Focused Experiment only when behavior is uncertain
```

Cross-cutting design queue：Transaction Pattern Selection、Authorization / Error Contract、Query Operation Contract adoption、Batch Execution Contract、Production Identity / Secret / Connection Governance、Observability Contract、Requirement-to-platform traceability。

### Browser / Backend baseline

Netlify-hosted Browser 已實測 Supabase Auth、Native CRUD、View Read Model、authenticated cross-origin Custom API invocation、Custom API orchestration與 Application Shell composition。`Netlify = Web/UI delivery` 與 `Supabase = Auth/API/DB` 已有多條 runtime chain 支持。

### Next Research Front — Master → Detail / Maintenance Challenge

下一階段不先宣布一套 Pattern 2 framework，也不先做 Design System。應等待或選擇下一個真實 Nook Works Requirement，讓它挑戰目前 Architecture v0.3。

若 Requirement 包含 Query → Detail / Edit，至少應檢查：

- Query context restoration 是否以 stable row identity 而非死守舊 page number 為 anchor。
- current criteria / sort / pageSize 與 Browser History 如何保存或重建。
- Detail retrieval 是否仍能維持 Feature-facing Operation Contract。
- Edit / Save / Cancel、validation、dirty state、unsaved-change guard 的 lifecycle。
- Business Domain 若採 Void / Cancel / Invalidate 而非 physical delete，Technical Pattern 應尊重該 invariant，而不是替不存在的 hard-delete edge case 蓋宮殿。
- Mutation operation 的 Transaction Owner、Authorization、Error mapping 是否挑戰目前 boundaries。

UI research 的目的仍是確認 interaction 如何承載 Platform Contract；不是先制定 component styling、按鈕大小或顏色。

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

**Provider change note (recorded 2026-09-24):** Supabase 將於 **2026-10-30** 對 existing projects 強制停止替新建 `public` tables 自動提供 Data API default grants。這不推翻 C-BSA-1；未來反而必須把 object GRANT 視為 explicit design。Native Data API、PostgREST / GraphQL / `supabase-js`，以及經 Data API 使用 `service_role` 的 Custom API，都必須確認新 table 已取得所需 least-privilege grants。Direct PostgreSQL connection 則是另一條 authorization path。詳細 dated interpretation 已補入 `evidence/c-bsa-1-consolidated-findings.md` 與 Provider Assumption Register。

Evidence-backed Current Judgment：`Transaction boundary 應由擁有完整 Business Operation 的那一層決定。` 完整 findings：`evidence/c-bsa-1-consolidated-findings.md`。

## Remaining Supabase-first / Platform Questions

目前沒有已識別的 Backend / Data / Integration / Shell / basic Read-only Query technical Blocking Gap。剩餘議題依性質分流：

1. **Master → Detail / Maintenance Pattern**：下一個 focused feature-pattern front，由真實 Requirement 啟動；return-context / stable row anchor 已是 known pressure。
2. **Formal Query Operation Contract adoption**：把 criteria / sort / page / pageSize / total-count / boundedness semantics 帶回 Nook Works technical design，不直接複製 Playground prototype。
3. **Explicit Business Authorization / Error Contract**：Platform Rule / Design；只有 mechanism 存疑才另做 Experiment。
4. **Batch Idempotency / Retry / Run Identity**：先由 formal requirement 與 Platform Rule 定義。
5. **Production Identity / Secrets / Connection Governance**：Platform Rule / Design。
6. **Observability / Correlation Contract**：Platform Rule / Design；隨 representative workflow 驗收。
7. **A-SAFARI-LIFECYCLE**：Known intermittent observation；只有 anomaly 再現且可取得 diagnostic Evidence 時重開。
8. **Pure Compute / Longer-running、Concurrency / Isolation / Deadlock、Distributed Compensation、Advanced Workflow Orchestration**：保持 Deferred，直到 representative workload / correctness requirement 出現。
9. **Advanced Query variants**：Cursor / Keyset Pagination、Infinite Scroll、Multi-column Sort、generic saved-query / URL restoration，等 Requirement 真正需要，不因名字很像「平台能力」就先養起來。

## Decision Boundary

`Verified` 表示「真的做過且留下 Evidence」，`Completed / Pattern Candidate` 表示該輪 Research Question 已形成可帶往下一 Requirement 的 Current Judgment。兩者都不是 Production Architecture Rule。

正式 Technical Decision 仍應回到 Nook Works formal repository，結合 Specification、Security、Operations、Provider capability、Cost 與 Playground Evidence 再形成。
