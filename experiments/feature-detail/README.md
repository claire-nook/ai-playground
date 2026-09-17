# F-DETAIL-1 — Master → Detail Interaction Prototype

## Experiment Identity

- Date: `2026-09-17`
- Phase: `Nook Works Technical Platform / Requirement-driven Vertical Slice`
- Type: `Representative Functional Prototype`
- Predecessor: `F-QUERY-1 — Representative Read-only Query Vertical Prototype`
- Shell Baseline: `S-SHELL-1`
- Status: `In Progress / Claire Functional Review`
- Data: `Representative Mock Fixture`

## Research Question

F-QUERY-1 已刻意把 List-only Query 與 Master → Detail 分離。本 Experiment 接著研究：

> User 從 Query Result 選中一筆資料後，Dedicated Detail Surface 應如何承接 record identity、資訊層級與返回工作上下文；哪些責任屬於 Detail，哪些仍屬 Query / Shell / 後續 Maintenance Pattern？

這一輪先建立可被 Claire 批評的 Functional Prototype，不把 mock interaction 假裝成 Production Architecture。

## Starting Pressure from Pattern 1

F-QUERY-1 已留下幾個 known design pressure：

- Result List 只承載辨識、比較、選擇所需的 curated columns。
- 完整資訊應進 Dedicated Detail Surface，而不是繼續把 List 撐胖。
- Master → Detail 需要 stable row identity。
- 返回 Query 時應恢復有意義的工作上下文，而不是只機械記住舊 page number。
- Browser History、Feature transition 與 business action 不能混成同一件事。

## Prototype Scope — Round 1

本輪只驗證 Read-only Detail functional shape：

```text
Query Context
→ Result List
→ Select Record
→ Dedicated Detail Surface
→ Return to Query Context
```

Detail candidate responsibility：

- 明確 Feature / Detail identity。
- 明確目前 record identity 與狀態。
- 將資訊分成 summary / execution / result 等可閱讀區塊，而不是把 database record 全欄位攤平。
- 提供 deterministic「返回查詢結果」interaction。
- Prototype 中保存 Query Context，讓 Claire 可以觀察返回後的工作連續性。

## Explicitly Deferred

本輪**不研究**：

- Edit / Save / Cancel。
- unsaved changes / dirty-state guard。
- real API / database retrieval。
- authorization / 401 / 403 contract。
- production router / state library。
- cross-tab state synchronization。
- Detail → next/previous record navigation。
- Export。

這些不是忘了，是刻意不把 Pattern 2 第一刀切成瑞士刀。

## Review Questions

Claire review 時主要觀察：

1. Query List 上的「明細」入口是否自然，是否破壞 curated Result List。
2. Detail Surface 的資訊階層是否符合「看一筆資料」的工作方式。
3. Detail 是否應維持原 Query Feature identity，或需要更明確的 Detail sub-context。
4. 「返回查詢結果」是否足夠明確，返回後 Query Context / selected record anchor 是否符合預期。
5. iPad / iPhone 下 Detail 是否仍是閱讀介面，而不是桌面表格硬塞進窄螢幕。

## Evidence Boundary

目前 Live Demo 使用 deterministic mock fixture。Claire 的實機 review 可形成 Functional / Interaction Evidence；它不證明正式 Data Access、Authorization、Routing Architecture 或 Production UI Design。

## Live Demo

- `/feature-detail/`
