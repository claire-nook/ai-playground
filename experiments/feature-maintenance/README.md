# F-MAINT-1 — Single-record Maintenance Lifecycle Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Functional Pattern Research`
- Type: `Representative Functional Prototype`
- Predecessors:
  - `F-QUERY-1 — Read-only Query Pattern`
  - `F-DETAIL-1 — General Read-only Detail / Return Context Pattern`
- Shell Baseline: `S-SHELL-1`
- Status: `Completed / Pattern Candidate Established`
- Verification: `Partial — Functional / Interaction Evidence`
- Data: `Synthetic Mock Fixture`
- Consolidated Findings: `evidence/f-maint-1-findings.md`
- Pattern Synthesis: `knowledge/platform/single-record-maintenance-pattern.md`

## Research Question

本 Experiment 不重新發明 Query / Detail，而是在既有 Phase 1 / Phase 2 baseline 上研究完整的單檔維護 lifecycle：

> Read / Create / Update 應共享哪些 Platform semantics；Capability、Validation、Dirty State、Save / Cancel、Mutation Policy 與返回 Query Context 應如何被一致處理，而不預設正式 Feature 必須共用同一個 page implementation？

## Baseline Reuse

```text
Phase 1 — Query
Feature Identity
→ Criteria
→ Paged Result
→ Stable Record Selection

Phase 2 — Read Detail
Stable Record Identity
→ Feature-defined Business Content
+ Platform-standard Audit
→ Return Context Restoration
```

F-MAINT-1 疊加的 Maintenance lifecycle：

```text
Query / Worklist Context
→ Select Read / Create / Update
→ Resolve Effective Capability
→ Present Feature-defined Fields
→ Validation
→ Dirty State
→ Save / Cancel
→ Apply selected Mutation Policy
→ Return Query / Worklist Context
```

## Converged Interaction Baseline

Nook Works 的一般單檔維護採 **internal enterprise maintenance / worklist-centric** baseline：

```text
Query / Worklist
├─ Create → Save / Cancel → Query Context
├─ Update → Save / Cancel → Query Context
└─ Read   → Return        → Query Context
```

`Read → Update` 可以存在，但 Update 完成後仍回 Query Worklist；Read Detail 不作為 Save success 的預設中繼站。

### Negative Evidence — Save → Read Detail

早期 Prototype 曾採：

```text
Update → Save → Read Detail → Return Query
```

Claire review 以高頻企業 key 單情境指出，若 Operator 連續維護數百筆資料，這會對每筆修改增加一個沒有 Business Value 的 interaction。此 candidate 因此被否決，保留為 lifecycle negative evidence。

這不代表 Guided Flow 本身錯誤，而是 Interaction Archetype 不同：

```text
Internal Maintenance
→ 熟練內部人員 / 高頻重複作業
→ Worklist-centric

Guided Process
→ 外部或低頻使用者 / 需要步驟引導
→ Flow-centric
```

Nook Works 一般 Maintenance 採前者。Approval / Claims Authorization 等 Workflow 是另一種 Platform Pattern，不應混入普通單檔維護 lifecycle。

## Prototype Strategy

Prototype 刻意使用三個 logical surface：

- Read Detail
- Create
- Update

這是用來觀察 lifecycle 的 implementation choice，不是 Platform Rule。正式 Feature 可採 mode-based 或 surface-separated implementation，只要遵守相同 semantic / operation contract。

Claire 過去 enterprise system 的 `ACCA01 / ACCU01 / ACCR01` 經驗因此被保留為 architecture pressure，而不是被貼上「舊式」標籤。

## Capability Boundary

Prototype 將「User 是否具有 capability」與「Record 目前是否允許 operation」分開：

```text
User Capability
+ Record State
+ Feature / Business Rule input
→ Effective Capability
```

Frontend capability 只負責 presentation / interaction，不構成 backend authorization proof。Production Authorization 仍必須在 trusted boundary enforcement。

## Save / Cancel Baseline

Create / Update 都具有：

- required-field validation；
- dirty-state indicator；
- Cancel / leave 時若有未儲存變更則 guard；
- Save success 後返回 Query Worklist；
- Cancel 後返回 Query Worklist；
- Audit 沿用 F-DETAIL-1 Platform Standard semantics。

返回 Query 時沿用 Phase 2 的 Query Context / stable identity 思路。若 record 仍在目前 Result Set，可重新定位；若因修改後不再符合 Criteria，應保留 Query Context 並清楚表示該 record 已離開目前結果。

## Mutation / Concurrency Decision

初版 Prototype 將 optimistic concurrency detection 放得太接近 Standard Update，review 後已修正。

Concurrency handling 是 **Mutation Policy decision point**，不是所有 Update 的 universal rule。

### Standard Maintenance

Current default candidate：

```text
Last Write Wins
```

若兩位 User 先後 Save，同一筆資料以最後一次成功 Update 為準，Audit 記錄最後修改人 / 時間。若 Business 可接受此風險，Platform 不應擅自加重流程。

Native CRUD 是自然 implementation candidate。

### Concurrency-sensitive Maintenance

若 Requirement 明確不能接受 silent overwrite：

```text
loaded updated_at / version
vs
current stored updated_at / version
→ mismatch
→ reject stale update
```

技術上可研究 conditional Native Update 或 Custom Operation；是否需要精準 Business Error Semantics、transaction boundary 等會影響選擇。

### Business-state-sensitive Mutation

若 mutation 是否允許取決於 current authoritative state，例如 record 已作廢、狀態改變後不可再修改：

```text
Mutation Request
→ Validate Current Business State
→ Validate Authorization / Rule
→ Apply Mutation
```

這不是單純「多人同時修改」問題，而是 Business Operation precondition，通常更接近 Custom API / RPC / transaction boundary。

### Platform Default / Decision Guardrail

是否允許 concurrent overwrite 是 Business / Functional decision，但不能假設每位 SA 都會主動提出。

因此 Current Pattern Candidate 是：

```text
Ordinary Maintenance default
→ Last Write Wins

Feature may explicitly upgrade to
→ stale-update detection
or
→ business-state-sensitive mutation
```

Platform / Specification guidance 應把這個 decision point 顯性化，而不是讓 omission 變成沒有被意識到的 accidental behavior。

Demo 保留 concurrency interaction，但已明確標示為 **Optional Concurrency Probe**，不代表 Standard Maintenance 預設必須做 optimistic locking。

## Action Semantics vs UI Placement

本 Prototype 的 UI 只是用來模擬 operation，不定義正式 UI Pattern。

Claire review 指出「新增」若與查詢／清除混在同一 action group，會錯誤暗示 Create 是 Query form action。因此 Prototype 將：

```text
Query / Clear → Query actions
Create        → Feature-level maintenance action
```

在畫面上分離。

這只修正 action semantics；正式按鈕位置、spacing、visual hierarchy、component library 都不在本 Experiment 宣稱為 Platform Rule。

## Maintenance ≠ Workflow

企業內部系統的一般 Maintenance 與 Workflow / Approval 應分開：

```text
Maintenance
= 維護 Business Object 本身

Workflow / Approval
= 讓該 Business Object 經過 Actor / Decision / State Transition
```

例如理賠案件可以使用一般 Maintenance surface 維護資料，同時另外參與金額授權 / 審批 Workflow。Workflow 不應因此被內建成每個 Maintenance screen 的 step flow。

## Explicitly Deferred

本輪不研究：

- Delete / Void / Approval workflow；
- Master-detail child collection maintenance；
- Real API / DB mutation；
- Production authorization enforcement；
- Production router / Browser History implementation；
- pessimistic locking；
- DB isolation / deadlock / load test；
- generic Form Framework / auto-generated UI；
- 正式 UI component placement / visual design system。

## Final Judgment

F-MAINT-1 stop condition 已滿足。第一輪 Single-record Maintenance Pattern 可收斂為：

```text
Query / Worklist Context
→ Read / Create / Update Operation
→ Effective Capability
→ Feature-defined Field State
→ Validation + Dirty State
→ Save / Cancel
→ Selected Mutation Policy
→ Restore Worklist Context
```

其中：

- Worklist-centric 是 Nook Works ordinary internal maintenance baseline；
- Common Pattern 不等於 common page implementation；
- Audit 延續 F-DETAIL-1 Platform Standard sub-pattern；
- UI placement 不是本輪 Platform Rule；
- Last Write Wins 是 ordinary maintenance default candidate；
- stale-update detection / business-state-sensitive mutation 必須由 Requirement / Feature 明確升級；
- Workflow / Approval 不是 Maintenance lifecycle 的內建步驟。

## Evidence Boundary

目前為 deterministic synthetic Browser mock，Claire 已完成 Functional / Interaction review。此 Experiment 可作 Architecture input，但不證明 Production Data Mutation、Authorization、Transaction、Concurrency、Routing 或 DB behavior。

## Live Demo

- `/feature-maintenance/`
