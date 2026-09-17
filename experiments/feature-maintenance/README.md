# F-MAINT-1 — Single-record Maintenance Lifecycle Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Functional Pattern Research`
- Type: `Representative Functional Prototype`
- Predecessors:
  - `F-QUERY-1 — Read-only Query Pattern`
  - `F-DETAIL-1 — General Read-only Detail / Return Context Pattern`
- Shell Baseline: `S-SHELL-1`
- Status: `In Progress / Claire Functional Review`
- Data: `Synthetic Mock Fixture`

## Research Question

本 Experiment 不重新發明 Query / Detail，而是在既有 Phase 1 / Phase 2 baseline 上加入完整的單檔維護 lifecycle：

> Create / Update / Read 三種 operation 應共享哪些 Platform semantics；Capability、Validation、Save / Cancel、Dirty State、Concurrency 與返回 Query Context 應如何被一致處理，而不預設正式 Feature 必須共用同一個 page implementation？

## Baseline Reuse

沿用既有 Pattern：

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

F-MAINT-1 新增：

```text
Phase 3 — Maintenance
Create / Update Entry
→ Capability Resolution
→ Editable Form State
→ Validation
→ Dirty State
→ Save / Cancel
→ Optimistic Concurrency Check
→ Save Success / Conflict / Validation Failure
→ Query Work Context
```

## Prototype Strategy

Prototype 刻意使用三個 logical surface：

- Read Detail
- Create
- Update

這是用來觀察 lifecycle 的 implementation choice，不是 Platform Rule。正式 Feature 仍可採 mode-based implementation，只要遵守相同 contract。

Claire 過去 enterprise system 的 `ACCA01 / ACCU01 / ACCR01` 經驗因此被保留為 architecture pressure，而不是被貼上「舊式」標籤。

## Internal Enterprise Maintenance Baseline

本輪 review 辨識出一個重要 distinction：Nook Works 的一般單檔維護屬於 **internal enterprise maintenance**，不是 customer-facing guided flow。

一般維護作業的主要工作上下文是 Query / Worklist：

```text
Query / Worklist
├─ Create → Save / Cancel → Query
├─ Update → Save / Cancel → Query
└─ Read   → Return        → Query
```

Read → Update 可以存在，但 Update 完成後仍回 Query Worklist；Read Detail 不作為 Save success 的中繼站。

早期 Prototype 曾採：

```text
Update → Save → Read Detail → Return Query
```

Claire review 以高頻企業 key 單情境指出，這會對每筆修改增加一個沒有 Business Value 的 interaction。此 candidate 因此被否決，保留為 lifecycle negative evidence。

這裡的核心不是「guided flow 錯誤」，而是 interaction archetype 不同：

```text
Internal Maintenance
→ 熟練內部人員 / 高頻重複作業
→ Worklist-centric

Guided Process
→ 外部或低頻使用者 / 需要引導的 Business Process
→ Flow-centric
```

Nook Works 一般單檔維護採前者。Approval / Claims Authorization 等 Workflow 屬另一種 Platform Pattern，不應混進單純 Maintenance lifecycle。

## Capability Boundary

Prototype 將「User 是否具有 edit capability」與「Record 目前是否允許修改」分開：

```text
User Capability
+ Record State
→ Effective Record Capability
```

Frontend 不把某一個 `status=Y/N` 當作完整 authorization proof。Production Business Authorization 仍必須由 trusted boundary enforcement；本 Prototype 只研究 UI / lifecycle semantics。

## Save / Cancel Candidate

Create / Update 都具有：

- required-field validation；
- dirty-state indicator；
- Cancel 時若有未儲存變更則 guard；
- Save success 後返回 Query Worklist；
- Cancel 後返回 Query Worklist；
- Update Save 進行 optimistic concurrency version check；
- conflict 時拒絕覆寫並提供 reload-current-record candidate。

返回 Query 時沿用 Phase 2 的 Query Context / stable identity 思路。若修改後 record 仍在目前 Result Set，重新定位該 record；若已因欄位變更而不再符合 Criteria，保留 Query Context 並明確回報該 record 已離開目前結果。

## Action Semantics vs UI Placement

Prototype UI 只負責把動作演出來，不定義正式 UI Pattern。

Claire review 指出「新增」若與查詢／清除混在同一 action group，容易暗示它是 Query form action。Prototype 因此將：

- Query / Clear 視為 Query actions；
- Create 視為 Feature-level maintenance action；

並在畫面上分離。實際正式按鈕位置仍由 UI Specification / Design 決定，不在本 Experiment 宣稱為 Platform Rule。

## Concurrency Probe

Update surface 提供「模擬他人修改」操作，使 current stored version 前進，而 User form 仍持有舊 version。Save 時若 version 不一致：

```text
loaded version != current version
→ conflict
→ do not overwrite silently
```

這只驗證 functional contract，不代表已完成 Production transaction/isolation implementation。

## Explicitly Deferred

本輪不研究：

- Delete / Void / Approval workflow。
- Master-detail child collection maintenance。
- Real API / DB mutation。
- Production authorization enforcement。
- Production router / framework implementation。
- pessimistic locking。
- DB isolation / deadlock / load test。
- generic Form Framework / auto-generated UI。
- 正式 UI component placement / visual design system。

## Review Questions

1. Query / Read Detail 是否可以自然承接 Create / Update，而不是變成四套互不相識的 Feature？
2. 可修改 / 不可修改 record 的 entry behavior 是否符合工作直覺？
3. Worklist-centric 的 Save / Cancel → Query lifecycle 是否符合 internal maintenance 操作習慣？
4. Create / Update 的 field state、Validation、Audit 與 action semantics 是否合理？
5. Dirty State / Cancel guard 是否足夠明確？
6. optimistic concurrency conflict 的呈現與 recovery 是否合理？
7. surface-separated prototype 是否揭露了可共用的 Platform semantics，而沒有誤導成一定要三份程式？

## Evidence Boundary

目前為 deterministic synthetic Browser mock。Claire 的實機 review 可形成 Functional / Interaction Evidence；它不證明 Production Data Mutation、Authorization、Transaction、Concurrency 或 Routing implementation。

## Live Demo

- `/feature-maintenance/`
