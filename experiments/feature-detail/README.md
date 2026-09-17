# F-DETAIL-1 — General Master → Detail Interaction Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Business Feature → Platform Pattern`
- Type: `Representative Functional Prototype`
- Predecessor: `F-QUERY-1 — Representative Read-only Query Vertical Prototype`
- Shell Baseline: `S-SHELL-1`
- Status: `Completed / Pattern Candidate Established`
- Verification: `Partial — Functional / Interaction Evidence`
- Data: `Synthetic Mock Fixture`
- Final Prototype: `v2`
- Consolidated Findings: `evidence/f-detail-1-findings.md`
- Pattern Synthesis: `knowledge/platform/record-detail-pattern.md`

## Research Question

F-QUERY-1 已刻意把 List-only Query 與 Master → Detail 分離。本 Experiment 研究：

> User 從 Query Result 選中一筆資料後，General Detail Pattern 應如何承接 stable record identity、Feature-defined content、Platform-standard Audit 與返回工作上下文；當 Result Set 在 Detail 停留期間發生異動時，平台應如何重新定位原 record，而不是把舊 page number 誤認為工作上下文？

---

## v1 — Failed Functional Attempt / Negative Evidence

第一版直接沿用 Batch requirement carrier，錯把 Requirement Carrier 當成 Pattern Subject，因而自行發明 Batch-specific `執行結果 / metrics / trace / lifecycle` 區塊。

Claire review 指出：

- General Pattern 不應預知 Business Object 是 Batch、City、User 或其他未來 Feature。
- 真實 `batch_log` 也沒有 v1 mock 所幻想的 metrics / trace structure。
- 若 Platform Pattern 內建這些 Batch-specific composition，Pattern 幾乎無法重用。

因此 v1 保留為 negative evidence：

> **Requirement Carrier 可以幫助 Pattern 落地，但不可滲漏成 General Pattern responsibility。**

---

## v2 — General Detail Pattern

v2 改用 Synthetic Business Object，刻意涵蓋：

- Text
- Reference / Code + Description
- Number
- Currency
- Percentage
- Date
- Datetime
- Boolean
- Nullable
- Long Text

目前收斂：

```text
Feature Specification
→ Business Content / 欄位 / 群組 / 順序 / business-specific composition

Platform Detail Pattern
→ common presentation conventions
→ responsive behavior
→ stable record identity
→ Detail lifecycle
→ Audit Pattern
→ return-context semantics
```

### Common Pattern ≠ Auto-generated Page

Prototype 使用 metadata-like fixture 是為了快速驗證 presentation capability，**不代表正式 Platform 應讀 DB schema / metadata 自動生成整張 Detail page**。

正式 Feature 仍可依 Specification composition / implementation；Pattern 規範做法與 contract，不接管每個欄位放在哪一格。

### Layout Candidate

Desktop 實機 review 顯示固定「一列三欄」會出現不自然空洞，因此不列為 Platform Rule。

`normal / wide / full` 目前只視為 layout capability / guideline candidate；Feature 可以表達閱讀空間需求，Responsive Layout 負責 desktop / tablet / mobile 退化方式。

### Long Text

Long Text 應提供較完整閱讀寬度、自然 wrapping、段落 / newline preservation。

```text
Long Text ≠ Rich Text
```

文字很長不代表要自動升級成 Markdown / HTML / CMS。

---

## Platform Standard Sub-pattern — Audit

Claire 指出一般單檔 Detail 的 Audit 應具有一致顯示方式，而不是每個 Feature 各自發明。

Baseline candidate：

```text
Created At / Created By
Updated At / Updated By
→ fixed semantic role
→ consistent grouping / ordering / presentation
```

Business Content 由 Feature Specification 決定；Audit 則是 Platform-standard composition。

---

## Master ↔ Detail Return Context

F-QUERY-1 留下的 design pressure 已在本 Experiment 被具體化：

```text
Query page 32
→ select stable record R
→ open Detail R
→ other users insert newer records
→ return
```

若排序為較新資料優先，R 可能已移到 page 33 / 34。若固定回 page 32，只恢復舊 pagination coordinate，沒有恢復 User 的工作目標。

Current Pattern Candidate：

```text
Preserve Query Criteria + Sort + Page Size + Stable Record Identity
→ on return resolve R against CURRENT result ordering
→ derive current page / location
→ render current page
→ restore selected-record visual / scroll anchor
```

因此：

> **Query Context ≠ Old Page Number**

若 record 已不存在或不再符合 current criteria，應明確 fallback，不應假裝定位成功。

### Production Boundary

v2 Browser mock 可以掃 current fixture 找 record；這只是 Prototype convenience。Production Backend 不應因此被推論成「把全部 Query Result 拉回 Browser 再找」。如何 bounded 地 resolve anchor position / cursor 仍是 Open Contract。

---

## Evidence / Review Result

Claire 已在 desktop / iPhone review v2：

- General Detail direction 相較 v1 已脫離 Batch-specific overfit。
- Mobile single-column presentation 可接受。
- Desktop 固定欄位 composition 暴露出 Pattern 不應接管 Feature layout composition。
- Long Text 應獨立處理閱讀寬度與 paragraph preservation。
- Audit 應提升為 Platform Standard Pattern。
- Query → Detail → Return 應以 stable record identity，而不是舊 page number，作為 work-context anchor。

完整整理見：`evidence/f-detail-1-findings.md`。

---

## Current Judgment

F-DETAIL-1 第一輪 research cycle 可以關閉。

Read-only General Master → Detail baseline：

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

Maturity：`Pattern Candidate / Functional Interaction Evidence`。

它足以進入下一輪 Maintenance Pattern，但不代表 Production routing、authorization、backend pagination / anchor resolution 已完成。

---

## Handoff — Maintenance Pattern

下一輪已辨識的重要 open question：Create / Update / Read 是否應共用同一 implementation surface，或可拆成獨立 Feature / Program Unit。

Claire 過去 enterprise system 的實務案例：

```text
ACCA01 → Create
ACCU01 → Update
ACCR01 → Read-only
```

這形成下一輪的重要架構壓力：

> **共用 Platform Pattern 不代表必須共用同一份 Page Implementation。**

Maintenance Pattern 應研究：

- Create / Update / Read 的共同語意與 lifecycle。
- capability / authorization：`canCreate / canView / canEdit`。
- View-first vs Edit-when-allowed entry policy。
- separate surfaces vs mode-based implementation。
- Field semantics / editable presentation / validation。
- Save / Cancel / Dirty State / Browser Back / Menu navigation。
- concurrent update / stale record conflict。
- Save 後回 Detail、Query 或維持 Edit 的 lifecycle。

不要因 Framework 方便就先宣布「三種模式一定同一頁」。平台應標準化 contract / behavior，不是程式檔案數量。

## Live Demo

- `/feature-detail/`
