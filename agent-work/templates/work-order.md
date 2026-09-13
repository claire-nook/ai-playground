# Work Order Template

> 這是 Handoff Contract，不是官僚表單。沒有內容的 Section 可以刪掉；高風險工作再補細節。

## Metadata

- Work Order:
- Status: `Draft | Ready | In Progress | Reported | Review | Accepted | Rework | Closed`
- Work Type: `Experiment | Implementation | Investigation | Review Support`
- Requested By:
- Intended Executor: `Codex | Implementation Agent | Unassigned`
- Target Repository / Branch:
- Related Research / Specification:

## Objective｜目標

這次到底要回答什麼問題，或完成什麼可驗收工作？

用一句話寫出成功後我們「知道了什麼」或「多了什麼」。

## Context / Read First｜先讀這些

執行前應閱讀的文件、既有 Experiment、Evidence、Specification、Technical Pattern 或 Platform Rule。

- 

不要假設執行 Agent 自動知道 Claire / Nook / Playground 的歷史脈絡。

## Execution Context Preflight｜執行環境確認（需要時）

Preflight 的目的，是在修改前確認 Agent 正在正確的 Context 執行正確的 Work Order，不是強迫所有 Cloud Workspace 模仿傳統 local Git clone。

Codex Cloud Workspace 目前已觀察到可能只有 local `work` branch、沒有 Git remote、沒有 local / remote-tracking `main`、也沒有 `gh` authentication；因此除非任務本身真的依賴這些能力，不要把它們寫成 repository identity 的必要條件。

可依任務選擇驗證：

- 指定 Work Order / Read First 文件存在。
- 預期 Repository structure / target files 存在。
- working tree 在施工前 clean。
- 必要 baseline Artifact / Context 存在。
- Claire 已在 Codex UI 選擇預期 Repository / Workspace。

如果任何必要 Context mismatch，停止修改並回報。完整已觀察工作模式見 `agent-work/experience/codex-cloud-workspace.md`。

## Scope｜範圍

可以做：

- 

## Out of Scope｜不要順手裝修隔壁

不要做：

- 

如果發現 Out of Scope 的問題，記在 Report，不要自行擴張工程範圍。

## Constraints｜限制與必守規則

例如：

- Security / Credential Boundary
- Formal DB mutation boundary
- Public Playground data rule
- Applicable Technical Pattern
- Provider / Runtime / Version constraint
- 不得改動的 File / Object / Environment

具體限制：

- 

## Tasks / Suggested Method｜工作內容

這裡可以指定必要步驟，也可以只描述要驗證的 Cases，讓執行者自行安排低風險 Implementation Detail。

1. 

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

至少留下哪些可重新檢查的結果？

- [ ] Source / Diff
- [ ] Test Result
- [ ] Runtime Output / Log Summary
- [ ] Provider Result
- [ ] Artifact / Screenshot / Response Sample（適用時）
- [ ] Reproduction Steps（適用時）
- [ ] Failure Evidence（若失敗）

這些 checkbox 是提醒，不是每張單都必須全勾。

## Deliverables｜交付物

- Code / Experiment Artifact:
- Report:
- Local Commit（若 Workspace 支援）:
- GitHub-visible PR / Commit（若需要 Primary Agent Review）:
- Other:

若執行者是 Codex Cloud，不要預設 local commit SHA 等於 GitHub PR head SHA。Primary Agent Review 應以 Create PR 後的 GitHub-visible state 為準。

## Decision Boundary｜決策邊界

執行者可以自行決定：

- 低風險 Implementation Detail，只要不違反既有 Rule / Pattern / Scope。

執行者不得自行拍板：

- Architecture / Platform Rule 變更。
- 正式 Business Requirement 變更。
- 擴張 Formal DB / Production mutation scope。
- 將 Experiment Result 自動升格成 Production Decision。

遇到需要以上決策才能繼續時，停止該部分並在 Report 標示 `Decision Needed`。

## Report｜執行後填寫

### Result

實際結果。

### Evidence

Evidence 路徑、Test / Runtime Result、Log / Artifact 摘要。

### Deviations

與 Work Order 原方法或 Scope 有何差異，以及原因。

### Failure / Unknown

哪些失敗、哪些仍未知。不要把 Unknown 補成推論。

### Observation

值得 Primary Agent Review 的技術觀察。

### Candidate Conclusion

執行者可以提出 Candidate，但不得自行標記為正式 Technical Decision。

### Follow-up / Decision Needed

需要 Primary Agent / Claire 決定或後續驗證的事項。