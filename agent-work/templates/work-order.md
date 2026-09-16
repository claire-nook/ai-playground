# Work Order Template

> Canonical Work Order structure for Primary Agent dispatch management.
>
> Work Order 管理「派出了什麼工作」，不是 Worker KPI / task progress。核心原則是 **Reduce ceremony, not boundaries**：使用同一份 canonical Template，以 `Work Weight` 控制內容密度，不為 Micro / Standard / High-Risk 維護多套會逐漸 drift 的 Template。

## Metadata

- Work Order ID: `YYYY-MM-DD-short-name`
- Date: `YYYY-MM-DD`
- Type: `Implementation | Investigation | Review | Documentation | Experiment`
- Work Weight: `Micro | Standard | High-Risk`
- Primary Objective: `<one-line objective>`
- Requested By: `Primary Agent | Claire | Primary Agent / Claire`
- Intended Executor: `Codex | Implementation Agent | Unassigned`
- Target Repository: `<owner/repo | None>`
- Source Baseline: `<branch / ref / snapshot contract | None>`
- Execution Profile: `<Codex Product UI | CLI Agent | GitHub-integrated Agent | Human-supervised Agent | Other>`
- Related Phase: `<research / delivery phase | None>`
- Related Experiment / Research: `<path / ID | None>`
- Related Specification: `<path / ID | None>`
- Related Evidence / Report: `<path / ID | None>`
- Related PR / Issue: `<reference | None>`
- Supersedes: `<Work Order ID | None>`

### Metadata Rules

- `Type` 表達主要工作性質，只選一個 canonical value。
- `Work Weight` 控制文件密度，不改變 governance boundary：
  - `Micro`：已決定委派、低風險且 deterministic 的小變更；只保留足以施工與驗收的內容。
  - `Standard`：一般 implementation / investigation / documentation。
  - `High-Risk`：Auth、Security、Data migration、Transaction、Provider integration、Production deployment、Architecture experiment、Adversarial review 等需要更完整 Context / Preflight / Evidence / Risk boundary 的工作。
- `Execution Profile` 描述 publication / workspace mechanics；它不是治理原則。不要把某一個 Agent runtime 的 UI 操作寫成所有 executor 的宇宙定律。
- `Primary Objective` 應讓未來 Primary Agent 不開全文也能知道主要工作。
- `Source Baseline` 描述 dispatch 時要求的 reproducible source snapshot / branch / ref，不要求 workspace local branch 同名。
- `Related ...` 是 navigation pointers；真正 required context 由 `Read First` 定義。
- Work Order 不維護 `Status`。
- 歷史 Work Order 不因 Template 演進而 retroactive rewrite。

## Objective｜目標

完成什麼、回答什麼。成功後應能清楚回答「我們知道了什麼」或「多了什麼」。

## Why / Context｜為什麼做

只放會影響 executor 判斷的背景、既有 Evidence、已知限制或 architecture context。不要把 Work Order 寫成技術小說。

`Micro` 無必要背景時：`None`

## Read First｜先讀這些

列出真正必要的 Repository / Specification / Experiment / Evidence / Technical Pattern。通常以最小充分 context 為原則，不要求為儀式掃完整個 Repository。

- `None`

不要假設 executor 自動知道 Claire / Nook / Playground 的歷史脈絡。

## Context Preflight｜執行環境確認

確認 Agent 正在正確 Context 執行正確 Work Order，而不是要求 Cloud Workspace 模仿傳統 local Git clone。

視風險確認：

- Work Order / Read First 可讀。
- target files / baseline artifacts 存在。
- working tree / workspace 足以安全施工。
- required source snapshot / implementation lineage 正確。
- 任務真正依賴的 tool / provider capability 可用。

Git remote、local `main`、`origin`、`gh auth`、`fetch` 等只有在任務或 Execution Profile 真正依賴時才是必要條件。

`Micro` 通常可簡化為一兩項 context check；不需要時：`None`。

## Must｜必須做到

這裡是 contract requirements，不是建議方法。

- `None`

## Must Not｜不得做

集中寫 Scope boundary、Security / Credential Boundary、Formal DB mutation boundary、Public Playground data rule、不得改動的 File / Object / Environment，以及其他不可越界事項。

- `None`

發現 scope 外問題可記入 Report / Observation，但不要善意擴建。

## Suggested Method｜建議方法

必要 Cases、候選步驟或已知安全做法。除非同時列在 `Must`，本 Section 不應鎖死 executor 的低風險 implementation detail。

1. `None`

## Acceptance｜可驗收條件

定義可重跑、可觀察、可判定 pass / fail 的 acceptance，以及 Primary Agent 後續能獨立檢查的 Evidence。

- [ ] `None`

Evidence 可包含 Source / Diff、Test Result、Runtime Output、Provider Result、Artifact、Reproduction Steps、Failure Evidence。**Agent Report ≠ Verified Evidence.**

## Executor Judgment｜執行者裁量

明確說明哪些 implementation detail 是**刻意留給 executor 決定**，而不是 Primary 漏寫。

預設可自行決定：

- 不違反既有 Rule / Pattern / Must / Must Not 的低風險 implementation detail。

預設不得自行拍板：

- Architecture / Platform Rule 變更。
- 正式 Business Requirement 變更。
- 擴張 Formal DB / Production mutation scope。
- 將 Experiment / Report Result 升格成 Production Decision 或 Verified Evidence。

本任務若有不同 boundary，明確覆寫；無額外內容：`None`。

## External Gates｜外部驗證 Gate

列出 executor workspace 無法或不應自行宣稱完成、必須由 Primary / Claire / Provider / Deployment / 真實裝置完成的驗證。

- `None`

`External Gates` 不阻止 executor 對自身 Scope 宣告 `Completed`，除非 Work Order 明確把該 Gate 定義成 executor completion requirement。

## Deliverables｜交付物

- Artifact / Code / Document: `None`
- Report: `None`
- Commit: `None`
- GitHub-visible PR / Commit: `None`
- Other: `None`

GitHub-visible state 是 Primary Technical QC 的 handoff surface。Workspace/local commit SHA 不必等於 GitHub PR head SHA。

## Report Contract｜執行後回報

Report 預設遵守 `agent-work/report-language-guideline.txt`。Report weight 應與 `Type` / `Work Weight` 成正比，不要把同一件事在 Source、commit、PR、Report 重寫四遍。

### Implementation / Documentation 預設

- Result / changed files。
- Validation / tests。
- Limitations / unknowns。
- Commit / PR publication state。
- External Gates Remaining。

### Investigation / Experiment 預設

除上述外，保留 Evidence、alternatives、failure、unknown、reproduction、candidate conclusion；Experiment 的 durable truth 應進 Experiment Record / Evidence，而不是只躺在 Agent Report。

### Review 預設

保留 findings、severity / impact、supporting evidence、required rework / recommendation；不要把 reviewer opinion 偽裝成 provider evidence。

### Cannot Complete 預設

保留 blocker、attempt、failure evidence、changed files / workspace residue、decision needed。

## Completion Contract｜固定結案準則

核心治理只承認兩種 executor 終態：`Cannot Complete` 或 `Completed`。不要新增模糊的 `Partially Completed`。

### A. Cannot Complete｜無法完成

若因必要 Context 缺失、權限 / execution-surface 限制、需求矛盾、安全邊界、不可接受風險或其他 blocker，無法安全完成：

1. 停止，不猜缺失 Context，不繞過明確限制，不為交付擴張 Scope。
2. 保留真實 observation / failure evidence，不把部分完成包裝成完成。
3. 回報 blocker、已完成步驟、changed files、workspace residue、validation / evidence、需要 Primary / Claire 決定的事項。
4. 不為了產生 commit / PR 製造無意義修改。

### B. Completed｜Executor Completion

若 executor Scope 可以完成：

1. 完成 `Must`，確認未違反 `Must Not`。
2. 執行要求的 validation；不能執行的項目列為 limitation 或 `External Gates Remaining`。
3. 檢查 final diff / changed files。
4. 依 `Execution Profile` 建立可追溯 commit，並完成該 runtime 支援的 publication handoff。
5. 回報 Result、changed files、validation、known limitations / unknowns、commit identity、GitHub publication state、External Gates Remaining。
6. 完成後停止擴張工作，進入 Primary Technical QC / External Gate。

`Completed` 表示 **Executor Completion**，不自動等於 Technical QC PASS、Deployment PASS、Human Acceptance PASS、Provider Verification PASS 或 Experiment Verified。

### Publication Adapter｜依 Execution Profile 發布

穩定 governance requirement 是：**有可追溯 change identity；需要 QC 的變更最終有 GitHub-visible handoff surface；Primary 以 GitHub-visible state 做 Technical QC。**

具體 mechanics 依 Execution Profile：

- `Codex Product UI`：通常 local commit + report → stop → Claire Create PR；continuation / REWORK 由 Claire Update Branch。
- `CLI / GitHub-integrated Agent`：若 runtime 已被授權，可由 Agent commit / publish / create PR，再停止等待 Primary QC。
- `Human-supervised Agent`：可由 human push / create PR。
- 其他 runtime：Work Order 明確指定 adapter；不要假設某個 provider UI 必然存在。

> **Governance Contract 保持穩定；publication mechanics 隨 execution surface 演進。**