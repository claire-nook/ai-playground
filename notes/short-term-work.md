# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Business Feature → Technical Platform Pattern

S-SHELL-1 已於 2026-09-16 完成，Application Shell lifecycle 不再是 current technical blocking gap。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

F-QUERY-1 已於 2026-09-17 完成第一輪 Read-only Query Pattern research cycle。Experiment Record：`experiments/feature-query/README.md`；General Platform synthesis：`knowledge/platform/application-platform-architecture.md` v0.3。

F-DETAIL-1 已於 2026-09-17 完成第一輪 Read-only General Master → Detail research cycle。Experiment Record：`experiments/feature-detail/README.md`；Consolidated Findings：`evidence/f-detail-1-findings.md`；Pattern Synthesis：`knowledge/platform/record-detail-pattern.md`。

F-MAINT-1 已於 2026-09-17 完成第一輪 Single-record Maintenance research cycle。Experiment Record：`experiments/feature-maintenance/README.md`；Consolidated Findings：`evidence/f-maint-1-findings.md`；Pattern Synthesis：`knowledge/platform/single-record-maintenance-pattern.md`。

目前三層 Functional Pattern baseline 已形成：

```text
Query / Worklist
→ Read-only Detail
→ Create / Update Maintenance
```

F-MAINT-1 收斂出的 Internal Enterprise Maintenance baseline：

```text
Query / Worklist Context
├─ Read   → Return        → Query Context
├─ Create → Save / Cancel → Query Context
└─ Update → Save / Cancel → Query Context
```

重要 conclusions：

- Nook Works ordinary Maintenance 採 Worklist-centric，不採 customer-facing Guided Flow 作預設。
- `Update → Save → Read Detail → Return Query` 已被 Claire functional review 否決，保留為 lifecycle negative evidence。
- Common Pattern 不等於 common page implementation；mode-based / surface-separated 都可存在。
- Effective Capability 應區分 User Capability、Record State 與 Feature / Business Rule input；Frontend capability 不等於 backend authorization。
- Dirty State / Unsaved Changes Guard 是 Maintenance lifecycle responsibility。
- Audit 延續 F-DETAIL-1 Platform Standard sub-pattern。
- UI button placement / visual hierarchy 不是本輪 Platform Rule；Prototype UI 只負責把 operation 演出來。
- Concurrency handling 是 Mutation Policy decision point，不是所有 Update 的預設 optimistic locking。
- Ordinary Maintenance current default candidate 為 Last Write Wins；Feature 可明確升級為 stale-update detection 或 business-state-sensitive mutation。
- Maintenance 與 Workflow / Approval 是不同 Pattern；一筆 Business Object 可以被維護，同時另外參與審批流程。

下一個 Research Front 尚未選定。不要因為剛收斂完 Maintenance 就立刻把 Delete、Approval、Master-detail 全部抓進來煮一鍋，這種衝動通常就是 ERP 神獸的出生證明。

---

## Business Specification ↔ Platform Responsibility

Business Specification 應描述 Business Operation 與必要 contract；Platform 應提供穩定的 technical interpretation。

例如，同樣是畫面上的 `Save`：

- 單純單一資料物件維護，可能對應 Standard Maintenance / Native CRUD。
- 有 feature-specific business rule 的作業，可能由 Business Spec 指向明確 Custom API 與 input contract。
- 跨物件、必須 all-or-nothing 的 operation，可能需要 Custom API / RPC 與明確 Transaction Owner。

Business Spec 不需要因此描述 Edge Function、PostgreSQL Client 或 transaction implementation detail；這些由 Platform Pattern / Technical Contract 決定。

```text
Business Specification
        ↓
Business Operation Contract
        ↓
Platform Pattern
        ↓
Native Data API / View / Custom API / RPC / DB
        ↓
Authorization / Transaction / Error / Lifecycle Contract
```

### Research dimensions

研究 representative Business Feature / Operation 時，至少檢查：

- Query / Mutation 的 operation shape。
- Native Data API、View Read Model、Custom API、RPC 的適用 responsibility。
- Authentication Identity、Application Context、Feature Entry、Feature Data Access、Business Authorization 的 boundary。
- Token / current Session propagation 是否涉及 Feature invocation。
- Transaction ownership 與 Business Operation boundary。
- Feature state 與 Shell state 的 boundary。
- Browser History、Save / Cancel、unsaved state、query-state restoration 的 lifecycle。
- Error / validation / partial failure contract。
- Mutation Policy：Last Write Wins、stale-update detection、business-state-sensitive mutation。

既有 Verified Evidence 必須優先拿來支撐 pattern analysis；只有 mechanism 或 runtime behavior 仍有不確定性時才新增 Experiment。不要把 Architecture / Rule design 偽裝成實驗，否則 Playground 最後會變成「凡事都做個 demo」博物館。

### UI research position

UI / interaction 仍是 Platform research 的必要部分，但不是先建 Design System。

F-QUERY-1、F-DETAIL-1、F-MAINT-1 已分別建立 Query、Read Detail、Single-record Maintenance baseline。這些 Prototype 的畫面用來承載 lifecycle / state / operation contract；按鈕位置、視覺 component library、正式 layout rule 仍不是 current Research Front。

---

## Graduated Baseline

已完成並可作 Architecture input：Supabase Auth、Native Data API / View Read、GitHub Actions execution、Supabase / Netlify Custom API runtime、Database-centric Custom API、External API Orchestration、Backend Service Access / Transaction Ownership、Netlify Trigger Boundary、Supabase Cron / Scheduling、**Application Shell lifecycle / composition**、**Read-only Query Pattern baseline**、**General Read-only Detail / Return Context baseline**、**Single-record Maintenance baseline**。

S-SHELL-1 verified baseline：

```text
Login / Session Restore
→ Auth Identity
→ app_user / Application Eligibility
→ Application User Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Render
→ explicit Logout / Invalidation
```

F-QUERY-1 candidate baseline：

```text
Feature Identity
→ Query Criteria
→ Query Action
→ Server-side Filter / Sort / Page
→ Bounded Result + Total / Page Metadata
→ Result Interaction
```

F-DETAIL-1 candidate baseline：

```text
Query Context
→ Stable Record Identity
→ Read-only Detail
→ Feature Content + Platform Audit
→ Return
→ Current-result Re-location
```

F-MAINT-1 candidate baseline：

```text
Query / Worklist Context
→ Read / Create / Update
→ Effective Capability
→ Feature-defined Field State
→ Validation + Dirty State
→ Save / Cancel
→ Selected Mutation Policy
→ Restore Worklist Context
```

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

Completed work 的 durable meaning 應留在 `knowledge/`、`evidence/`、Experiment Record；Short-term 不養 Completed 墓碑。上述 graduated baseline 只保留目前前緣需要知道的銜接點。

---

## Platform Rule / Design Queue

- Formal Nook Works Platform Shell design / module boundary extraction。
- Business Feature → Technical Platform Pattern taxonomy / contract。
- Query Operation Contract 的正式 Nook Works adoption，包括 pagination / sorting / page-size / boundedness semantics。
- Detail return-anchor production contract：position / cursor resolution。
- Maintenance mutation / validation / capability / Save policy contract。
- Mutation Policy default / Specification decision guardrail。
- Transaction Pattern Selection。
- Authorization / Error Contract。
- Batch Execution Contract / retry / idempotency ownership。
- Production Identity / Secret / Connection Governance。
- Observability Contract。
- Requirement-to-platform traceability。

## Deferred / Candidate

- UI component / Design System / visual styling：等更多 representative interaction contract 穩定後再研究。
- Advanced Query variants：Cursor / Keyset Pagination、Infinite Scroll、Multi-column Sort、generic saved-query / URL restoration，等 Requirement 真正需要。
- Delete / Void：等有 representative Business Requirement，再判斷是 Maintenance extension 或 Business Operation。
- Approval / Workflow：獨立 Pattern candidate，不混入 ordinary Maintenance。
- Master-detail Maintenance：等單檔 baseline 需要被真實 Requirement 延伸時再研究。
- A-SAFARI-LIFECYCLE intermittent explicit-logout Session restoration：Known Observation / root cause Unknown；只有 anomaly 再出現時帶 diagnostic purpose 重開，不反覆逼 Safari 表演靈異現象。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement；F-MAINT-1 只建立 mutation-policy decision point，不等於完成 DB concurrency test。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。
