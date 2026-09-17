# F-DETAIL-1 — Master → Detail Interaction Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Requirement-driven Vertical Slice`
- Type: `Representative Functional Prototype`
- Predecessor: `F-QUERY-1 — Representative Read-only Query Vertical Prototype`
- Shell Baseline: `S-SHELL-1`
- Status: `In Progress / Claire Functional Review`
- Data: `Synthetic Mock Fixture`
- Current Prototype: `v2`

## Research Question

F-QUERY-1 已刻意把 List-only Query 與 Master → Detail 分離。本 Experiment 研究：

> User 從 Query Result 選中一筆資料後，General Detail Pattern 應如何承接 stable record identity、Feature-defined content、Platform-standard Audit 與返回工作上下文；當 Result Set 在 Detail 停留期間發生異動時，平台應如何重新定位原 record，而不是把舊 page number 誤認為工作上下文？

## v1 — Failed Functional Attempt / Negative Evidence

第一版直接沿用 Batch requirement carrier，錯把 Requirement Carrier 當成 Pattern Subject，因而自行發明 Batch-specific `執行結果 / metrics / trace / lifecycle` 區塊。

Claire review 指出：

- General Pattern 不應預知 Business Object 是 Batch、City、User 或其他未來 Feature。
- 真實 `batch_log` 也沒有 v1 mock 所幻想的 metrics / trace structure。
- 若 Platform Pattern 內建這些 Batch-specific composition，Pattern 幾乎無法重用。

因此 v1 不視為可微調的 UI，而視為有價值的 negative evidence：**Requirement Carrier 可以幫助 Pattern 落地，但不可滲漏成 General Pattern responsibility。**

## v2 — General Detail Pattern

v2 改用 Synthetic Business Object，刻意涵蓋多種 field semantics：

- Text
- Code + Description / Reference
- Number
- Currency
- Percentage
- Date
- Datetime
- Boolean
- Nullable value
- Long-form text

Business Content 的欄位、順序與群組由 Feature Specification 決定；Platform Pattern 只研究一致的 read-only presentation、Detail lifecycle 與 interaction contract。

### Platform Standard Sub-pattern — Audit

Claire 指出 Audit 應列為平台固定 Pattern。對一般單檔 Detail，建立/異動資訊不應由每個 Feature 各自發明 presentation。

v2 因此把 Audit 明確獨立為 Platform Standard Sub-pattern：

```text
created_at / created_by
updated_at / updated_by
→ fixed semantic role
→ consistent presentation
→ reusable across ordinary single-record Detail surfaces
```

實際欄位命名或 data source 可由正式 Architecture / Specification 再定義；本 Prototype 先驗證一致 interaction / visual role。

## Master ↔ Detail Return Context

F-QUERY-1 已留下重要 pressure：返回 Query 時不能只記住舊 page number。

例如：

```text
Query Result / page 32
→ select stable record R
→ open Detail R
→ other users insert newer records
→ return
```

若排序為「最近建立優先」，R 的 current rank 會改變，因此它可能已位於 page 33 / 34 或其他頁。平台若硬回 page 32，只恢復了 technical pagination state，沒有恢復 User 的工作資料上下文。

v2 candidate algorithm：

```text
Preserve Query Criteria + Sort + Page Size + Stable Record Identity
→ on return, obtain current result ordering
→ locate Stable Record Identity in CURRENT result set
→ derive current page from current rank
→ render that page
→ restore selected-record visual / scroll anchor
```

若 record 已不在 current result set，Prototype 會保留 Query Context 並明確回報 anchor 已失效，而不是假裝成功定位。

這裡的核心 distinction：

**Query Context ≠ Old Page Number**

Page number 是當下 Result Set 的衍生位置；stable record identity 才是返回原工作目標的重要 anchor candidate。

## Prototype Scope — v2

```text
Query Criteria / Sort / Page Size
→ Paginated Result List
→ Select Stable Record
→ General Read-only Detail
→ optional simulated concurrent inserts
→ Return
→ Re-locate Stable Record in current result ordering
```

## Explicitly Deferred

本輪仍不研究：

- Edit / Save / Cancel。
- unsaved changes / dirty-state guard。
- real API / database retrieval。
- authorization / 401 / 403 contract。
- production router / state library。
- cross-tab state synchronization。
- Detail → next/previous record navigation。
- Export。
- Cursor / Keyset Pagination 的 production algorithm。

特別注意：v2 在 Browser mock 中可以直接掃描 current fixture 找 record；Production Backend 不應因此被推論成「把全部 Result 拉回 Browser 再找」。正式 Data Contract 必須另外研究如何 bounded 地 resolve anchor position / cursor。

## Review Questions

Claire review 時主要觀察：

1. Synthetic Detail 是否已脫離特定 Business Object，仍足以觀察不同 data type presentation。
2. Audit 作為固定 Platform sub-pattern 的位置與顯示方式是否合理。
3. Query → Detail → Return 是否應以 stable record identity 作工作 anchor。
4. Result Set 異動後重新定位 record、推導 current page，是否符合實際工作直覺。
5. record 不存在 / 不再符合 Query Criteria 時，return fallback 應如何定義。
6. iPad / iPhone 下 Detail 是否仍維持一致閱讀結構。

## Evidence Boundary

目前 Live Demo 使用 deterministic synthetic fixture。Claire 的實機 review 可形成 Functional / Interaction Evidence；它不證明正式 Data Access、Authorization、Routing Architecture、Production pagination algorithm 或 Production UI Design。

## Live Demo

- `/feature-detail/`
