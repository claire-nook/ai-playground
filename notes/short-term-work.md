# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Architecture Synthesis

S-SHELL-1 已於 2026-09-16 完成，Application Shell lifecycle 不再是 current technical blocking gap。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

F-QUERY-1 已於 2026-09-17 完成第一輪 Read-only Query Pattern research cycle。Experiment Record：`experiments/feature-query/README.md`；General Platform synthesis：`knowledge/platform/application-platform-architecture.md` v0.3。

F-DETAIL-1 已於 2026-09-17 完成第一輪 Read-only General Master → Detail research cycle。Experiment Record：`experiments/feature-detail/README.md`；Consolidated Findings：`evidence/f-detail-1-findings.md`；Pattern Synthesis：`knowledge/platform/record-detail-pattern.md`。

F-MAINT-1 已於 2026-09-17 完成第一輪 Single-record Maintenance research cycle。Experiment Record：`experiments/feature-maintenance/README.md`；Consolidated Findings：`evidence/f-maint-1-findings.md`；Pattern Synthesis：`knowledge/platform/single-record-maintenance-pattern.md`。

加上既有 D-BATCH-1，Nook Works 目前四個常見 internal enterprise application archetype 已有第一輪 baseline：

```text
Scheduled / Cron
Query
Query → Detail
Single-record Maintenance
```

因此 Research Front 已從「再做下一個 Feature Prototype」切換到 **Nook Works Application Architecture Synthesis**。

Primary 已建立：

- `knowledge/platform/nook-works-application-architecture.md` — Architecture Baseline Candidate v0.1。
- `agent-work/work-orders/2026-09-17-nook-works-architecture-v01-adversarial-review.md` — Codex High-Risk Review Work Order。
- GitHub Issue `#44` — Review dispatch surface。

Review 要求 Codex 同時以 Architecture Reviewer / Implementer 視角攻擊 v0.1：責任邊界錯置、過早抽象、provider coupling、不可施工 contract、hidden assumption、deferred item 是否其實阻擋 baseline。

v0.1 review 前不急著新增 Master-detail / One-to-many / Workflow Prototype。那些屬於 requirement-driven extension，不因為企業系統「可能會有」就現在先蓋 framework。人類很喜歡在還沒需求時先造萬用引擎，最後通常只得到一台很重的腳踏車。

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

## Current Architecture Review Queue

v0.1 已把目前 baseline 收斂成：

```text
Application Shell
→ Feature Activation
→ Business Feature / Interaction Pattern
→ Feature-facing Operation Contract
→ proportionate Execution Mechanism
→ Trusted Backend / Data Source
```

並把 Scheduled / Batch 視為與 Browser Feature 平行的 execution entry surface。

Codex adversarial review 完成後，Primary 要逐項判斷：

- Keep。
- Revise。
- Downgrade to Open Contract。
- Remove。
- Need New Evidence。

這一輪的目標是 Architecture v0.2，而不是再堆一個 Demo。

## Platform Rule / Design Queue

- Business Authorization Contract。
- Feature-facing Error Contract。
- Validation ownership / error semantics。
- Mutation Policy declaration / Specification decision guardrail。
- Transaction Pattern Selection。
- Detail return-anchor production contract：position / cursor resolution。
- Browser History / unsaved-state route integration。
- Batch Run Identity / retry / idempotency contract。
- Production Identity / Secret / Connection Governance。
- Observability / correlation contract。
- Requirement → Pattern → Operation Contract traceability。

## Deferred / Candidate

- UI component / Design System / visual styling：等更多 representative interaction contract 穩定後再研究。
- Advanced Query variants：Cursor / Keyset Pagination、Infinite Scroll、Multi-column Sort、generic saved-query / URL restoration，等 Requirement 真正需要。
- Delete / Void：等有 representative Business Requirement，再判斷是 Maintenance extension 或 Business Operation。
- Approval / Workflow：獨立 Pattern candidate，不混入 ordinary Maintenance。
- Master-detail / one-to-many / many-to-many Maintenance：等真實 Requirement 挑戰 current single-record baseline 時再研究。
- A-SAFARI-LIFECYCLE intermittent explicit-logout Session restoration：Known Observation / root cause Unknown；只有 anomaly 再出現時帶 diagnostic purpose 重開，不反覆逼 Safari 表演靈異現象。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement；F-MAINT-1 只建立 mutation-policy decision point，不等於完成 DB concurrency test。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。
