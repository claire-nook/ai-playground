# F-QUERY-1 — Representative Read-only Query Vertical Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Requirement-driven Vertical Slice`
- Type: `Representative Functional Prototype`
- Business Requirement Source: `nook-works/docs/business/specifications/batch/daily-weather.md`
- Shell Baseline: `S-SHELL-1`
- Status: `In Research / Functional Shape Reviewed`
- Data: `Representative Mock Fixture`

## Research Question

第一個真實 Nook Works Requirement 以 Batch 執行記錄作為 Requirement Carrier，但本 Experiment 的研究目標不是替 `batch_log` 客製一張漂亮頁面，而是從真實需求中找出可重用的 **Generic Read-only Query Feature Pattern**。

核心問題是：

> 一個最單純的唯讀查詢 Feature，Pattern 應承載哪些 Functional responsibilities；哪些複雜度應留在 Feature Requirement、API Contract、Detail、Export 或其他獨立 capability，而不是塞進 Query Pattern？

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

Generic Read-only Query Pattern 的候選結構收斂為：

```text
Feature Identity
→ Query Criteria
→ Query Result
```

其中：

- `Feature Identity`、`Query Criteria`、`Query Result` 是候選共通責任。
- `Batch`、`執行狀態`、`執行日期`、實際 Result columns 是 Feature-specific content。
- Dashboard / Today Summary / KPI 類資訊不得因第一支 Requirement 是 Batch 就偷渡成 Query Pattern 標準區塊。

### 2. Result Region 使用中性語意

頁面 Feature Name 可為 `Batch 執行記錄`，但共通 Result Region 使用 `查詢結果` 等中性語意。Platform 不應要求每支 Feature 客製共通區塊名稱，除非 Requirement 明確需要另一種 composition。

### 3. Feature Identity 需要 Stable Identifier

Business display name 適合與 User / SA 溝通，但 Pool PG、Issue、Specification、Log 等技術協作不應只依賴自然語言名稱。

目前確認：Feature 頁面需要可見的 Stable Feature Identifier，作為 Business / SA / PG 的共同 communication anchor。

尚未決定正式名稱是 `feature_code`、`function_code`、`program_id` 或其他，也尚未決定 Business Function 與實際 Program 的 mapping cardinality。這是後續 Shell metadata / Technical Design 問題，不由 Prototype 偷跑定義。

### 4. Safari / iPhone Form Control 是 Platform Constraint

Safari 實機曾觀察到 native date/select/input/button 的 intrinsic sizing、disabled appearance 與 narrow-screen layout 差異。Prototype 已加入 feature-local normalization candidate；需實機回看後才能決定是否提升為 Platform UI Rule。

### 5. List-only 與 Master → Detail 是不同 Pattern

第一版將完整 fixture detail 預先放在 Browser memory，點 `明細` 只做 inline expand。這個 Prototype 行為不應被誤認為 Technical Decision。

```text
A. List-only Query
Query → Result List

B. Master → Detail Query
Query → Result List → Select Record → Dedicated Detail Surface
```

Master → Detail 的 retrieval / presentation 應在真正需要它的 Requirement 中研究，不由最單純 Query Pattern 預先承載。

## F-QUERY-1B — Second Review: Design Rationale

第二輪 Review 沒有再發現需要大量調整畫面的問題，反而收斂出 Query Pattern 背後的設計理由。這些 rationale 比某一版 Prototype 的 CSS 更耐久。

### 1. Query Pattern 不承載 Backend Data Complexity

一張普通 Query Page 背後可能是：

- 一個 table。
- 多個 tables / views 的 join。
- Derived / mapped fields。
- Custom API orchestration。

這些是 **Data Access / API Contract / Technical Specification** 的責任，不是 Query UI Pattern 的責任。

```text
Query Pattern
→ 定義 User 如何給條件、取得結果、理解結果

API / Data Contract
→ 定義結果如何取得、由哪些資料來源組成、預設排序與資料邊界
```

因此 Pattern 不因後端是 `3 views + 5 tables` 就增加 UI complexity。後端複雜不等於 User 應該看見複雜。

### 2. Nook Works Candidate：Result Table 不使用 Horizontal Scroll

這不是因為 scrollbar 難看，而是刻意保留 **design pressure**。

Result List 的目的，是讓 User 在目前工作情境下辨識、比較、選擇資料，而不是把 database record 或 API response 全欄位攤在畫面上。

```text
Result columns 放不下
→ 先檢查是否真的都是辨識 / 比較所需的精華資訊
→ 非必要完整資訊進 Detail
→ 大量資料外部使用需求另評估 Export capability
```

因此 Nook Works 目前採取：

> **Result Table 不以 horizontal scrolling 作為正常設計能力。欄位必須由 SA / Requirement 精準收斂至可在結果區合理閱讀的資訊。**

這是目前 Nook Works 的 Candidate Decision，不宣告為所有企業系統的普遍真理。未來若真實 Requirement 證明某個 Feature 必須同時比較大量欄位，可以重新挑戰此 Decision。

Horizontal scroll 的問題不只是 UI。它容易把「再加一欄」變成近乎零成本，進而形成欄位膨脹，接著自然衍生 freeze columns、不同 Feature 固定不同欄數、複雜 table interaction 等需求。技術上的容錯能力可能反而削弱 Functional Design 的約束。

欄位增加也可能擴大 payload；若欄位牽涉 join、large text、derived data 等，還可能增加 DB query、serialization、network transfer 與 Browser rendering 成本。但這些成本需依實際 Data Contract 評估，不能把「欄位多」直接等同「Server 一定很慢」。

### 3. Query List、Detail、Export 是不同 Capability

```text
Query List
≠ Detail
≠ Export
```

- **Query List**：辨識、比較、選擇目標資料。
- **Detail**：閱讀單筆較完整資訊。
- **Export**：將較大量 / 較完整資料帶離 Application UI 供外部處理。

Export 即使 technically read-only，也可能具有更高的 data exfiltration risk。User 可以逐筆查閱資料，不代表 User 應自動取得大量下載能力。因此 Export 不能只是因為 Table 欄位塞不下就順手加一顆「匯出 Excel」按鈕；它需要獨立 Requirement，並視資料性質評估 Authorization、Scope、Masking、Volume Limit、Audit 等安全責任。

### 4. Single-column Sorting：完整 Result Set 時由 Browser 負責

本輪討論的前提是：資料量足以在一次 Query 中完整載入 Browser。

```text
Query
→ API 使用 Requirement-defined Default Sort
→ 完整 Result Set 載入 Browser
→ Render

User 點可排序 Column Header
→ 不重新 Call API
→ Browser 對完整 Result Set 做 Single-column Sort
→ ASC / DESC 切換
```

這種排序是 User 對既有查詢結果的臨時閱讀需求，不取代 API Contract 中的 Default Sort。

目前只需要 **Single-column Sorting**。不因 UI library 免費提供 Multi-column Sort 就自動擴張 capability。

若未來資料量需要 Server-side Pagination，sorting responsibility 也會改變；那時應重新研究 Server-side Query State / Sorting / Pagination，不能只排序目前 page 的 records 卻讓 User 誤以為排序的是完整結果。

### 5. Multi-select 是 Field Capability，不是所有 Dropdown 的 Default

現代 UI / Browser / API 技術可以支援 Query Criteria 的 multi-select，例如：

```text
status ∈ {SUCCESS, FAILED, RUNNING}
```

但 Generic Query Pattern 不應讓所有 dropdown 預設 multi-select。是否 multi-select 由 Feature Requirement / Field semantics 決定。

理由除了 SQL / Query performance 必須依實際條件評估，也包含 Select All、Clear All、空集合語意、mobile interaction、query-state representation 等額外 complexity。技術可做，不等於免費，也不等於應該到處做。

### 6. Pattern 的核心不是「有什麼元件」，而是 Responsibility Boundary

目前收斂後，最單純 Query Pattern 不需要知道後端 schema，也不需要承載 Detail、Export、Server-side Pagination 或複雜 Data Grid capability。

它的責任可以保持樸素：

```text
Feature Identity
→ Query Criteria
→ Query Action
→ Query Result
   ├─ curated result columns
   ├─ requirement-defined default ordering from API
   └─ optional client-side single-column sorting
```

Criteria field 可以依 Requirement 使用 text / date / single-select / multi-select 等 input capability，但 Pattern 不替每個 Feature 決定 field semantics。

## Current Judgment

F-QUERY-1 已足以證明一件比「Batch Log 畫面長什麼樣」更重要的事：**Generic Query Pattern 應該保持簡單，並用明確 responsibility boundary 阻止 Feature-specific、Data-access-specific 與 convenience-driven complexity 無限制滲入。**

Nook Works 目前的 Query Pattern Candidate：

- 共通骨架為 Feature Identity / Query Criteria / Query Action / Query Result。
- Result columns 由 Requirement 精準選擇，不把完整 record 當成 Result List。
- Result Table 不以 horizontal scroll 作為正常能力。
- 完整 Result Set 可支援 Browser-side single-column sorting。
- Multi-select 是 Criteria Field capability，由 Requirement 指定。
- Detail、Export、Server-side Pagination / Sorting 是獨立研究與 capability boundary。
- Backend table/view/join complexity 屬 API / Data Contract，不滲入 Query Pattern。

這些仍是 **Current Judgment / Pattern Candidate**，不是跨所有 Requirement 永久不可推翻的戒律。下一個真實 Requirement 可以重用它，也可以拿證據把它打壞。

## Evidence Boundary

本 Prototype 的 Browser 行為形成 **Functional / Interaction Evidence**。它不證明正式 Data Access、Authorization、Detail Retrieval、Export Security、Server-side Pagination contract 或 Production UI Architecture。

`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule ≠ Production Implementation.`

## Next Step Boundary

F-QUERY-1 不需要為了「讓 Experiment 看起來比較完整」繼續增加不存在於 Requirement 1 的功能。

下一步應回到 Requirement-driven flow：把目前 Query Pattern Candidate 帶入正式 Nook Works 技術設計；若 Requirement 需要的 Data Access / Shell Integration 還有技術未知，再針對未知建立最小 Experiment。

至於 Detail、Export、Server-side Pagination 等，等真的有 Requirement 來敲門再研究。Platform 不需要預先替不存在的 User 許三個願望。
