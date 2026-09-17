# F-QUERY-1 — Representative Read-only Query Vertical Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Requirement-driven Vertical Slice`
- Type: `Representative Functional Prototype`
- Business Requirement Source: `nook-works/docs/business/specifications/batch/daily-weather.md`
- Shell Baseline: `S-SHELL-1`
- Status: `In Research / Claire Functional Review`
- Data: `Representative Mock Fixture`

## Research Question

第一個真實 Nook Works Requirement 以 Batch 執行紀錄作為 Requirement Carrier，但本 Experiment 的研究目標不是替 `batch_log` 客製一張漂亮頁面，而是從真實需求中找出可重用的 **Generic Read-only Query Feature Pattern**。

本輪要回答：

> 一個 authenticated application 裡最單純的唯讀查詢 Feature，哪些畫面責任應該一致、哪些內容應由各 Feature 自己定義；當需求包含 Detail、Pagination、Responsive Form Controls 時，又應在哪裡拆成不同 Pattern 或後續研究問題？

## Why Mock First

Native Data API / View Read Model capability 已有既存 Evidence。第一輪主要未知不是「Browser 能不能讀 DB」，而是 Functional Interaction 是否合理。

因此本輪刻意使用 deterministic representative fixtures，讓 Claire 可以無成本推翻欄位、資訊階層、查詢條件與 responsive behavior，而不讓既有 API / DB implementation 反過來綁架 Functional Design。

```text
Formal Business Requirement
→ Shell-like Functional Prototype
→ Representative Mock Data
→ Claire Functional Review
→ Generic / Feature-specific responsibility split
→ Technical Responsibility Analysis
→ Real Shell Integration
→ Real Data Mechanism
→ Current Working Pattern
```

## F-QUERY-1A — First Functional Review Findings

### 1. Generic Query Page 與 Feature-specific Content 必須分離

第一版把 `今日 Daily Weather` summary 放在 Query 上方，這是過度深入 Batch / Daily Weather business semantics 的設計。

Generic Read-only Query Pattern 的候選結構先收斂為：

```text
Feature Identity
→ Query Criteria
→ Query Result
→ Pagination（待代表性資料驗證）
```

其中：

- `Feature Identity`、`Query Criteria`、`Query Result` 是候選共通責任。
- `Batch`、`執行狀態`、`執行日期`、實際 Result columns 是 Feature-specific content。
- Dashboard / Today Summary / KPI 類資訊不得因第一支 Requirement 是 Batch 就偷渡成 Query Pattern 標準區塊。

### 2. Result Region 使用中性語意

第一版 Result Region 標題使用 `執行紀錄`，使共通區塊綁定 Batch semantics。

候選規則：

- 頁面 Feature Name 可為 `Batch 執行記錄`。
- 共通 Result Region 使用 `查詢結果` 等中性語意。
- Platform 不應要求每支 Feature 客製共通區塊名稱，除非 Requirement 明確需要另一種 composition。

### 3. Feature Identity 需要 Stable Identifier

Claire 過往 SA / PG 協作需要一個可直接指涉 Feature 的穩定代號。Business display name 適合與 User / SA 溝通，但 Pool PG、Issue、Specification、Log 等技術協作不應只依賴自然語言名稱。

目前只確認需求：

> Feature 頁面應可顯示 Stable Feature Identifier，作為 Business / SA / PG 的共同 communication anchor。

尚未決定正式名稱是 `feature_code`、`function_code`、`program_id` 或其他，也尚未決定 Business Function 與實際 Program 的 mapping cardinality。這是後續 Shell metadata / Technical Design 問題，不由 Prototype 偷跑定義。

### 4. Safari / iPhone Form Control 是 Platform Constraint

Claire 在 Safari 實機觀察到：

- `date` controls 在窄畫面可能寬度飄移或超出 container。
- Native disabled / form controls 可能保留 Browser-specific appearance。
- Action buttons 若缺乏一致 sizing rule，容易出現視覺與操作尺寸不一致。

因此這不是單支 Feature 的 CSS 修補，而是 Candidate Platform UI Rule：input / select / date / button 需要 form-control normalization，至少涵蓋 `box-sizing`、inline size boundary、min/max width、disabled appearance、touch target 與窄畫面 layout。

本輪只建立 Candidate；仍需 Safari 實機回看後才能形成 Evidence。

### 5. List-only 與 Master → Detail 是不同 Pattern

第一版將完整 fixture detail 預先放在 Browser memory，點 `明細` 只做 inline expand。這個 Prototype 行為不應被誤認為 Technical Decision。

目前拆成：

```text
A. List-only Query
Query → Result List

B. Master → Detail Query
Query → Result List → Select Record → Dedicated Detail Surface
```

Master → Detail 的 Data Retrieval 至少仍有：

1. List Query 已取得完整資料，Detail 只是 presentation。
2. List Query 只取 summary，進入 Detail 再取得完整資料。
3. Hybrid，依 Data Shape / Cost / Security 決定。

三者目前皆未決定。

### 6. Inline Detail 不作為目前 Candidate Default

Claire 指出 generic inline expansion 容易被以下條件破壞：

- Detail 欄位數增加。
- Memo / Error Message 等 variable-length content。
- Responsive layout。
- 不同 Feature 的 Detail shape 差異過大。

因此下一版 Prototype 不再用 inline expand 假裝 Detail Pattern 已定案。若 Requirement 需要 Detail，先以 `Dedicated Detail Surface` 作為研究概念；Route / View / Modal / Drawer 等 presentation 仍未決定。

### 7. Pagination 尚未形成 Evidence

第一版 fixture 數量不足，無法觀察 Pagination。

後續 representative scenarios 至少應能觀察：

- 0 筆。
- 少量、單頁。
- 超過一頁。
- 多頁資料。

Page Size、Page Navigation、Query Criteria 改變後的 page reset、窄畫面 presentation 都仍是 Open Question。

## F-QUERY-1A Revision Scope

依第一輪 review，Prototype 下一版只做已足夠清楚的修正：

- 移除 `今日 Daily Weather` 客製 Summary。
- Result Region 改為中性 `查詢結果`。
- Feature heading 顯示暫時性的 Prototype Feature Identifier，僅驗證「需要可見識別點」，不宣告正式 metadata naming。
- 移除 inline Detail expansion，保留明細需求為後續 Pattern Research。
- 修正 Safari / narrow viewport form-control sizing 與 action button consistency，等待 Claire Safari 實機回看。
- Prototype Scenario 保留為 Experiment Control，不視為正式 Query Pattern 元件。

本次不趁機設計 Pagination，不用五筆假資料演一齣「我們已經研究過分頁」的戲。

## Evidence Boundary

本 Prototype 的 Browser 行為只能形成 **Functional / Interaction Evidence**。它不證明正式 Data Access、Authorization、Detail Retrieval、Pagination contract 或 Production UI Architecture。

`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule ≠ Production Implementation.`

## Current Review Target

第二輪 Claire review 聚焦：

1. Generic Query Page 的資訊階層是否開始合理。
2. Feature Identifier 的位置與用途是否自然。
3. Safari / iPhone 的 form controls 是否仍 overflow / 飄移。
4. Query Criteria 與 Query Result 是否已經不再被 Batch-specific semantics 污染。
5. 下一個研究應先進入 Pagination，還是先確認 Requirement 1 是否真的需要 Master → Detail。

Prototype 被推翻不是 Experiment Failure。這個東西目前的主要功能，本來就是讓問題提早暴露，而不是提早獲得掌聲。
