# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Business Feature → Technical Platform Pattern

S-SHELL-1 已於 2026-09-16 完成，Application Shell lifecycle 不再是 current technical blocking gap。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

F-QUERY-1 已於 2026-09-17 完成第一輪 Read-only Query Pattern research cycle。Experiment Record：`experiments/feature-query/README.md`；General Platform synthesis：`knowledge/platform/application-platform-architecture.md` v0.3。

F-DETAIL-1 已於 2026-09-17 完成第一輪 Read-only General Master → Detail research cycle。Experiment Record：`experiments/feature-detail/README.md`；Consolidated Findings：`evidence/f-detail-1-findings.md`；Pattern Synthesis：`knowledge/platform/record-detail-pattern.md`。

F-DETAIL-1 baseline candidate：

```text
Query Context
→ Select Stable Record Identity
→ General Read-only Detail
→ Feature-defined Business Content
+ Platform-standard Audit
→ Return
→ Re-resolve Stable Record against current result ordering
→ Restore work context
```

重要 conclusions：Requirement Carrier 不可滲漏成 General Pattern responsibility；Common Pattern 不等於 auto-generated page；Audit 是 Platform Standard sub-pattern candidate；Long Text 與普通短欄位 presentation 應區分但 `Long Text ≠ Rich Text`；Query Context 不等於舊 page number；Production bounded anchor resolution 仍是 Open Contract。

### Current Pattern Challenge — F-MAINT-1 Single-record Maintenance

F-MAINT-1 已於 2026-09-17 啟動，直接承接 Phase 1 Query 與 Phase 2 Read Detail，不重新養一套查詢／明細。這一輪研究完整單檔 Maintenance lifecycle：

```text
Query
→ Read Detail / Create / Update
→ Effective Capability
→ Editable Form State
→ Validation
→ Dirty State
→ Save / Cancel
→ Optimistic Concurrency Check
→ Save Success / Conflict
→ Read Detail / Return Query Context
```

Prototype 目前採 logical surface-separated `Read / Create / Update` 以便觀察 lifecycle；這不是 Platform Rule。正式 Feature 仍可採 mode-based implementation，只要共享相同 semantic / operation contract。

Claire 過去 enterprise system 的實務案例繼續作 architecture pressure：

```text
ACCA01 → Create
ACCU01 → Update
ACCR01 → Read-only
```

本輪優先 pressure：

- `canCreate / canView / canEdit` 與 Record State 分離，再形成 Effective Capability。
- Frontend 不把單一 `status=Y/N` 當完整 Authorization proof。
- Create / Update field behavior 與 immutable field。
- required-field / unique business key validation。
- Save / Cancel。
- dirty state / unsaved changes guard。
- Browser reload / leave guard；更完整 Browser History integration 仍需 review 後決定是否加深。
- optimistic concurrency：loaded version vs current stored version。
- Save success → Read Detail 目前為 candidate policy。
- Audit 在 Read / Update lifecycle 中維持 Platform Standard semantics。

目前 Prototype 刻意不加入 Delete / Void / Approval、Master-detail child collection、real API / DB mutation、production authorization enforcement、pessimistic locking、DB load/isolation test。先把單筆 Create / Update / Read 的責任邊界收乾淨，別讓「單檔」一夜之間長成 ERP 神獸。

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

既有 Verified Evidence 必須優先拿來支撐 pattern analysis；只有 mechanism 或 runtime behavior 仍有不確定性時才新增 Experiment。不要把 Architecture / Rule design 偽裝成實驗，否則 Playground 最後會變成「凡事都做個 demo」博物館。

### UI research position

UI / interaction 仍是 Platform research 的必要部分，但不是先建 Design System。

F-QUERY-1 已建立 Read-only Query baseline；F-DETAIL-1 已建立 General Read-only Detail / Return Context baseline。F-MAINT-1 現在把 mutation lifecycle 疊上去，觀察相同 record semantics 在 Read / Create / Update 下如何保持一致，而不把 Prototype implementation 偷渡成 Platform architecture。

視覺 component library 仍不是 current Research Front。

---

## Graduated Baseline

已完成並可作 Architecture input：Supabase Auth、Native Data API / View Read、GitHub Actions execution、Supabase / Netlify Custom API runtime、Database-centric Custom API、External API Orchestration、Backend Service Access / Transaction Ownership、Netlify Trigger Boundary、Supabase Cron / Scheduling、**Application Shell lifecycle / composition**、**Read-only Query Pattern baseline**、**General Read-only Detail / Return Context baseline**。

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

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

Completed work 的 durable meaning 應留在 `knowledge/`、`evidence/`、Experiment Record；Short-term 不養 Completed 墓碑。

---

## Platform Rule / Design Queue

- Formal Nook Works Platform Shell design / module boundary extraction。
- Business Feature → Technical Platform Pattern taxonomy / contract。
- Query Operation Contract 的正式 Nook Works adoption，包括 pagination / sorting / page-size / boundedness semantics。
- Detail return-anchor production contract：position / cursor resolution。
- Maintenance mutation / validation / concurrency / Save policy contract。
- Transaction Pattern Selection。
- Authorization / Error Contract。
- Batch Execution Contract / retry / idempotency ownership。
- Production Identity / Secret / Connection Governance。
- Observability Contract。
- Requirement-to-platform traceability。

## Deferred / Candidate

- UI component / Design System / visual styling：等更多 representative interaction contract 穩定後再研究。
- Advanced Query variants：Cursor / Keyset Pagination、Infinite Scroll、Multi-column Sort、generic saved-query / URL restoration，等 Requirement 真正需要。
- Delete / Void / Approval / Master-detail Maintenance：等 F-MAINT-1 單筆 Create / Update / Read lifecycle 先收斂。
- A-SAFARI-LIFECYCLE intermittent explicit-logout Session restoration：Known Observation / root cause Unknown；只有 anomaly 再出現時帶 diagnostic purpose 重開，不反覆逼 Safari 表演靈異現象。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement；F-MAINT-1 optimistic concurrency 先研究 functional contract，不等於現在就做 DB load test。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。
