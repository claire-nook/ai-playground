# Work Order Template

> Canonical Work Order structure for Primary Agent dispatch management.
>
> Work Order 管理的是「派出了什麼工作」，不是 Worker KPI / task progress。建立新 Work Order 時複製本結構；Section 與 Metadata label 保持固定。當次不適用的欄位或 Section 明確填 `None`，不要刪除，避免未來 Primary Agent 必須猜測「沒有」還是「漏寫」。

## Metadata

- Work Order ID: `YYYY-MM-DD-short-name`
- Date: `YYYY-MM-DD`
- Type: `Implementation | Investigation | Review | Documentation | Experiment`
- Primary Objective: `<one-line objective>`
- Requested By: `Primary Agent | Claire | Primary Agent / Claire`
- Intended Executor: `Codex | Implementation Agent | Unassigned`
- Target Repository: `<owner/repo | None>`
- Source Baseline: `<branch / ref / snapshot contract | None>`
- Related Phase: `<research / delivery phase | None>`
- Related Experiment / Research: `<path / ID | None>`
- Related Specification: `<path / ID | None>`
- Related Evidence / Report: `<path / ID | None>`
- Related PR / Issue: `<reference | None>`
- Supersedes: `<Work Order ID | None>`

### Metadata Rules

- `Type` 表達這張 Work Order 的**主要工作性質**，只選一個 canonical value；不要用 slash 疊加多個近義 Type。
- `Primary Objective` 用一句話讓未來 Primary Agent 不開全文也能知道這張工單主要在做什麼，並作為 Work Order Catalog 摘要來源。
- `Source Baseline` 描述 dispatch 時要求的 source snapshot / branch / ref，不要求 Codex Cloud local branch name 必須與其相同。
- `Related ...` 欄位是 navigation pointers，不代表執行者必須能跨 Repository 存取；真正 Required Context 仍由 `Read First` 定義。
- Work Order 不維護 `Status`。執行進度、Worker KPI、task board state 不屬 Work Order Governance。
- 歷史 Work Order 不因 Template 演進而強制 retroactive rewrite；Catalog 可依歷史內容做 normalized navigation metadata。

## Objective｜目標

描述這次到底要回答什麼問題，或完成什麼可驗收工作。

成功後應能清楚回答「我們知道了什麼」或「多了什麼」。

## Context / Background｜背景

提供理解本次工作所需、但不適合塞進 Metadata 的背景、既有 Evidence、已知限制或 architecture context。

若無額外背景：`None`

## Read First｜先讀這些

列出執行前真正需要閱讀的 Repository / Specification / Experiment / Evidence / Technical Pattern。

- `None`

不要假設執行 Agent 自動知道 Claire / Nook / Playground 的歷史脈絡，也不要為了儀式要求掃完整個 Repository。

## Execution Context Preflight｜執行環境確認

Preflight 用來確認 Agent 正在正確 Context 執行正確 Work Order，不是要求 Cloud Workspace 模仿傳統 local Git clone。

可依任務驗證：

- 指定 Work Order / Read First 文件存在。
- 預期 Repository structure / target files 存在。
- working tree 在施工前 clean。
- 必要 baseline Artifact / Context 存在。
- Claire 已在 Codex Product UI 選擇預期 Repository / source baseline。

Codex Cloud Workspace 可能只有 local `work` branch、沒有 Git remote、沒有 local / remote-tracking `main`、也沒有 `gh` authentication；除非任務本身真的依賴這些能力，不要把它們寫成 repository identity 的必要條件。

若本任務不需要 Preflight：`None`

## Scope｜範圍

可以做：

- `None`

## Out of Scope｜不要順手裝修隔壁

不要做：

- `None`

若發現 Out of Scope 問題，記入 Report，不自行擴張工程範圍。

## Constraints｜限制與必守規則

可包含 Security / Credential Boundary、Formal DB mutation boundary、Public Playground data rule、Technical Pattern、Provider / Runtime constraint、不得改動的 File / Object / Environment。

- `None`

## Tasks / Suggested Method｜工作內容

指定必要步驟、Cases 或執行方向；低風險 implementation detail 可留給執行者。

1. `None`

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

定義 Primary Agent 後續可以重新檢查的完成證據與驗收邊界。

- [ ] `None`

Evidence 類型依任務選擇，例如 Source / Diff、Test Result、Runtime Output、Provider Result、Artifact、Reproduction Steps、Failure Evidence。不要把 Implementation Agent Report 自動視為 Verified Evidence。

## Deliverables｜交付物

- Artifact / Code / Document: `None`
- Report: `None`
- Local Commit: `None`
- GitHub-visible PR / Commit: `None`
- Other: `None`

若執行者是 Codex Cloud，不要預設 local commit SHA 等於 GitHub PR head SHA。Primary Agent Technical QC 以 GitHub-visible state 為準。

## Decision Boundary｜決策邊界

執行者可以自行決定：

- 低風險 Implementation Detail，只要不違反既有 Rule / Pattern / Scope。

執行者不得自行拍板：

- Architecture / Platform Rule 變更。
- 正式 Business Requirement 變更。
- 擴張 Formal DB / Production mutation scope。
- 將 Experiment / Report Result 自動升格成 Production Decision 或 Verified Evidence。

若本任務有不同 Decision Boundary，明確覆寫上述 generic boundary；若沒有額外內容：`None`。

## Report Contract｜執行後回報

Report 預設遵守 `agent-work/report-language-guideline.txt`：說明與判斷使用繁體中文，technical terms、code、path、command、field、log marker 與 raw provider output 保留英文。

至少回報：

### Result

實際完成結果。

### Evidence / Validation

Evidence 路徑、Test / Runtime Result、Log / Artifact 摘要。

### Deviations

與 Work Order 原方法或 Scope 的差異及原因；若無：`None`。

### Failure / Unknown

失敗與仍未知事項；若無：`None`。不要把 Unknown 補成推論。

### Observation / Candidate Conclusion

值得 Primary Agent Review 的技術觀察或 Candidate；若無：`None`。不得自行升格成正式 Technical Decision。

### Follow-up / Decision Needed

需要 Primary Agent / Claire 決定或後續驗證的事項；若無：`None`。

## Completion Contract｜固定結案準則

本 Section 是 Primary Agent 與 Implementation Agent 之間的 canonical working protocol。除非實際執行模式出現新的合法終態，建立新 Work Order 時**不要刪除、改名或自由改寫本 Section**。

目前 Work Order 執行只有兩種合法結案方式：`Cannot Complete` 或 `Completed`。

### A. Cannot Complete｜無法完成

若因 Preflight failure、必要 Context 缺失、權限或 execution-surface 限制、需求矛盾、安全邊界、不可接受風險或其他 blocker，導致 Work Order 無法安全完成：

1. 停止工作，不猜測缺失 Context，不用 workaround 繞過明確限制，也不為了交付而擴張 Scope。
2. 保留已取得的真實 observation / failure evidence；不要把部分完成描述成完成。
3. 最終回報至少包含：
   - Blocker / reason。
   - 已完成到哪個步驟。
   - 是否修改任何檔案，以及 changed files。
   - 是否存在未提交修改或其他 workspace residue。
   - 已執行的 validation / evidence，若無則填 `None`。
   - 需要 Primary Agent / Claire 補充、判斷或授權的事項。
4. 不建立虛假的完成訊號；若沒有符合本 Work Order 的可交付結果，不要為了產生 PR 而製造無意義修改。
5. 回報後停止，等待 Primary Agent / Claire 決定後續處理。

### B. Completed｜可以完成

若 Work Order 可以完成：

1. 完成 Scope 內工作，並確認沒有把 Out of Scope 修改混入交付。
2. 執行本 Work Order 要求的 validation / test / static check；不能執行的項目必須明確列為 limitation，不得假裝已驗證。
3. 檢查 final diff / changed files，確認交付內容與 Work Order 一致。
4. **建立 local commit。Work Order 未完成 local commit，不視為 Completed handoff。**
5. 最終回報至少包含：
   - Completed work summary。
   - Changed files / artifact paths。
   - Validation / test result。
   - Known limitations / unknowns；若無則填 `None`。
   - Local commit SHA。
6. Local commit SHA 只代表 Codex Workspace 的完成節點，不等同未來 GitHub PR head SHA。
7. 完成上述回報後停止，不再自行擴張工作；等待 Claire 使用 Codex Product UI 的 **Create PR** 建立 GitHub-visible handoff surface，供 Primary Agent Technical QC。

除非特定 Work Order 明確定義不同的 delivery mechanism，否則不得省略 `local commit → report SHA → stop → Claire Create PR` 這個 Completed handoff sequence。