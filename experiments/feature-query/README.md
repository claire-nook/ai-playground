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

第一個真實 Nook Works Requirement 要求 Claire 能確認每日天氣 Batch 是否有執行，以及其執行結果。正式 Data Access Pattern 尚未決定前，先用 S-SHELL-1 已驗證的 Application Shell interaction language，建立可實際操作的 read-only query prototype。

本 Experiment 不是要先制定全域 UI Standard，而是回答：

> 一個 authenticated application 裡的「單檔、唯讀、歷史紀錄型 Business Feature」，Claire 實際操作時需要看到什麼、怎麼查、哪些狀態必須被辨識？

## Why Mock First

目前 Native Data API / View Read Model capability 已有既存 Evidence，第一輪主要未知不是「Browser 能不能讀 DB」，而是 Functional Interaction 是否合理。

因此本輪刻意使用 deterministic representative fixtures，讓 Claire 可以無成本推翻欄位、資訊階層、查詢條件與 responsive behavior，也可以穩定觀察成功、部分異常、失敗、執行中與 empty state，而不必等待真實 Batch 配合演出。

```text
Formal Business Requirement
→ Real Shell interaction language
→ Representative Mock Data
→ Functional UI / Interaction
→ Claire Functional Review
→ Technical Responsibility Analysis
→ Real Data Mechanism
→ Working Platform Pattern
```

## Prototype Scope

Prototype 暫定 Feature 名稱：`Batch 執行紀錄`。

第一輪提供：

- Batch code / status / execution date 的 read-only query semantics。
- Result list，優先呈現「何時跑、哪支 Batch、成功/失敗/執行中、結果摘要」。
- 可展開單筆執行紀錄，閱讀 memo / error detail。
- Responsive presentation：較寬畫面使用 Table；窄畫面改為 Cards。
- Deterministic Scenario Switch：Normal / Mixed / Empty，用來觀察不同 UI state。
- 明確標示 `Representative Mock`，避免把 Prototype 誤認為正式 Runtime Evidence。

本輪不處理：

- 真實 `batch_log` Data Access。
- Production Authorization / RLS design。
- Pagination / server-side sorting 的正式 contract。
- Create / Edit / Delete。
- 全域 Design System / visual standardization。
- Weather history visualization。

## Evidence Boundary

本 Prototype 的 Browser 行為只能形成 **Functional / Interaction Evidence**。它不證明 `batch_log` 正式應採 Native Table API、View Read Model 或 Custom API，也不證明 Production Authorization boundary。

`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule ≠ Production Implementation.`

## Review Target

Claire 的第一輪 review 可以直接毒舌以下問題：

1. 第一眼是否能回答「今天的 Daily Weather Batch 有沒有正常跑？」
2. Query conditions 是否符合實際使用習慣？
3. List 欄位是否過多、過少或資訊階層錯誤？
4. Error / partial failure 應該在 List 暴露多少？
5. Detail 是否真的有存在價值？
6. iPad portrait / landscape 下是否自然？

Prototype 被 Claire 推翻不是 Experiment Failure。第一輪本來就是拿來被罵的，否則我們只是在替自己做漂亮簡報。
