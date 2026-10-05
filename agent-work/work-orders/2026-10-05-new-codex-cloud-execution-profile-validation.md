# Work Order｜New Codex Cloud Execution Profile Validation

## Metadata

- Work Order ID: `2026-10-05-new-codex-cloud-execution-profile-validation`
- Date: `2026-10-05`
- Type: `Investigation`
- Work Weight: `Standard`
- Primary Objective: `Characterize what changed in the new Codex Cloud execution surface relative to the previously observed Codex Product UI behavior, with emphasis on environment, workspace, repository, validation, and publication/handoff behavior.`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main at dispatch time; use the GitHub-visible snapshot containing this Work Order and Catalog entry`
- Execution Profile: `Other — New Codex Cloud (under investigation)`
- Related Phase: `Codex Cloud capability revalidation after 2026-10 update`
- Related Experiment / Research: `None`
- Related Specification: `None`
- Related Evidence / Report: `agent-work/experience/codex-implementation-agent-self-introduction.md; agent-work/dispatch-handoff.md`
- Related PR / Issue: `None`
- Supersedes: `None`

## Objective｜目標

調查新版 Codex Cloud execution surface 相對於 repository 既有的 Codex Product UI direct experience，實際改變了哪些可觀察行為。

本次不是重新設計 Claire / Primary / Implementation Agent 的協作治理，也不是證明 Codex 能否完成一般 coding task。既有 Work Order、GitHub-visible handoff、Primary Technical QC 等 governance 先視為穩定基線。

本次要形成可驗證的 current-runtime observation，特別回答：

1. Published Cloud Environment 對新 Task 實際提供了什麼。
2. Task 建立後的 repository / branch / workspace model 為何。
3. Codex 是否仍以單一 repository 為主要 task scope，以及 Environment 與 repository selection 的關係。
4. 新 runtime 能自行觀察哪些 environment / setup / tool / validation capability。
5. commit 與 publication handoff 行為是否仍符合舊版 `Codex Product UI` adapter，或已出現新的 UI / capability。
6. 哪些舊有 Codex execution assumptions 仍成立、哪些需要降級為 historical evidence、哪些已有新 direct evidence 可取代。

## Why / Context｜為什麼做

2026-10-05 已觀察到新版 Codex Cloud 引入 reusable Cloud Environment onboarding / publish flow。Environment setup 可針對 repositories 分析開發需求並產生 environment configuration；Task UI 目前仍顯示 repository 與 branch selection。

Repository 既有 collaboration governance 已刻意把穩定 contract 與 provider-specific publication mechanics 分離：

- `agent-work/README.md` 定義角色、Work Order、QC 與 GitHub-visible handoff。
- `agent-work/dispatch-handoff.md` 保存舊版 Codex Product UI 的 direct experience 與 publication adapter。
- 新 runtime 應先被觀察，不應把舊版 UI mechanics 當成新版事實，也不應因 provider 更新就重寫整套 governance。

這次 Investigation 的價值是建立「新版弟弟到底改了什麼」的 direct evidence。

## Read First｜先讀這些

1. `agent-work/README.md`
2. `agent-work/dispatch-handoff.md`
3. `agent-work/experience/codex-implementation-agent-self-introduction.md`
4. `README.md`
5. 本 Work Order

其他 repository content 僅在回答本 Investigation 時按需閱讀，不要求掃描整個 repository。

## Context Preflight｜執行環境確認

開始 Investigation 前：

1. 確認本 Work Order 與上述 Read First 均可從目前 workspace 讀取。
2. 記錄目前 task 可直接觀察到的 repository identity、workspace / branch identity，以及任何 Cloud Environment / setup 相關資訊；不要用猜測補齊 UI-only context。
3. 確認目前 workspace 可以安全執行 read-only inspection 與低風險 validation。
4. 若某項能力只能由 Claire 在 Web / iPad UI 觀察或操作，標記為 External Gate，不假裝 executor 能看見 provider UI。

若 required context 不可讀，依 `Cannot Complete` fail closed。

## Must｜必須做到

- 以目前 New Codex Cloud task 的 direct observation 為主要證據，描述 execution surface。
- 將「目前 runtime 直接觀察」與「repository 中保存的 historical Codex evidence」明確分開。
- 調查 Published Environment / setup 對此 task 可觀察到的影響；若無法直接確認 Environment metadata 或 provenance，明確標示 Unknown。
- 記錄 repository / workspace / branch model 能直接證明到什麼程度。
- 調查可用 toolchain / runtime / dependency / validation capability；只執行低風險、與 repository 既有流程相容的 probe。
- 觀察 Codex 在完成 substantive report 後能提供的 commit / publication handoff 能力；不要預先假設仍有 `Create PR` / `Update Branch`。
- 對 `agent-work/dispatch-handoff.md` 中與 Codex Product UI 有關的 historical assumptions，逐項分類：
  - Still Observed
  - Changed
  - Not Observable In This Task
  - Needs External Gate
- 將完整 Investigation report 寫入：
  `agent-work/reports/2026-10-05-new-codex-cloud-execution-profile-validation.md`
- Report 必須保留 Evidence / Inference / Unknown / Limitations，並提出 candidate update recommendation；不要直接修改既有 governance / experience 文件。
- 最終只提交本 Investigation 授權的 report artifact；若為了執行 Investigation 產生其他暫存檔，結案前清除。

## Must Not｜不得做

- 不得修改既有 collaboration governance、Work Order template、dispatch-handoff、experience、knowledge、experiment 或 evidence 文件。
- 不得把新版行為直接升格成永久 architecture / provider rule。
- 不得修改 application / experiment source code 來製造測試結果。
- 不得部署 Netlify / Supabase 或影響任何 external / formal system。
- 不得使用 secrets、credentials 或 private data。
- 不得為測試 cross-repo capability 嘗試繞過目前 Task 的 repository boundary。
- 不得把 UI 中只有 Claire 看得到的狀態寫成 executor direct evidence。
- 不得因為 publication UI 尚未由 executor 看見，就推論功能不存在。

## Suggested Method｜建議方法

1. 先從 Read First 建立 historical baseline，特別是舊版 Codex Product UI 的 snapshot / commit / Create PR / Update Branch adapter。
2. 在目前 task 中記錄可直接觀察的 workspace facts，例如 repository、current branch / HEAD、filesystem shape、runtime / tool availability，以及 setup 後已存在的 dependency / generated state。
3. 使用 repository 既有且低風險的 validation / inspection command 做最小 probe；避免為了「多測一點」改動 source。
4. 比較 current observation 與 historical baseline，避免把 inference 寫成 evidence。
5. 建立 durable report、final diff check、commit。
6. 到 publication handoff 時，只回報目前 runtime 實際提供的選項 / state；若下一步必須 Claire 操作 UI，列入 External Gates Remaining。

## Acceptance｜可驗收條件

- [ ] Report 可讓 Primary 不依賴 Codex chat transcript，就能理解本次 runtime observation。
- [ ] Report 清楚列出 current direct evidence、historical evidence、inference、unknown 與 external gates。
- [ ] 至少回答 Environment、repository/workspace、runtime/validation、commit/publication 四個面向。
- [ ] Historical Codex Product UI assumptions 已逐項分類為 Still Observed / Changed / Not Observable / Needs External Gate。
- [ ] 所有 current-runtime claim 都附有可重現 command、path、output summary 或明確 observation basis；UI-only claim 不冒充 executor evidence。
- [ ] Final diff 僅包含 `agent-work/reports/2026-10-05-new-codex-cloud-execution-profile-validation.md`。
- [ ] 有可追溯 local commit / change identity。
- [ ] Executor 停在 publication handoff，不自行擴張成 governance rewrite。
- [ ] Primary 可在 GitHub-visible handoff 後獨立 QC report 與 diff。

## Executor Judgment｜執行者裁量

可自行決定：

- 為確認 runtime / workspace facts 所需的低風險 read-only command。
- repository 既有 validation 中哪些最適合作為最小 probe。
- Report 的內部章節編排，只要 Acceptance 所需分類完整。

不得自行決定：

- 修改 collaboration governance。
- 將 current observation 宣告為永久 provider contract。
- 擴張到其他 repository 或 external deployment。
- 因本次結果直接淘汰 historical evidence。

## External Gates｜外部驗證 Gate

以下可能只能由 Claire / Primary 在 Codex Web / iPad / GitHub surface 完成：

- New Codex Cloud task 建立時實際選取的 Published Environment、repository、branch UI state。
- Codex completion 後 Web UI 提供的 publication controls 名稱與行為。
- 若有 Create PR / Publish / Update Branch 等按鈕，由 Claire 執行必要 publication gate。
- GitHub-visible PR / commit 出現後，由 Primary 執行 Technical QC。
- iPad ChatGPT App 的 Cloud Environment 可選性不屬本 Work Order executor scope；目前另視為 client rollout / UI observation。

## Deliverables｜交付物

- Artifact / Code / Document: `agent-work/reports/2026-10-05-new-codex-cloud-execution-profile-validation.md`
- Report: 同上，完整 substantive Investigation report。
- Commit: 一個只包含上述 report 的可追溯 local commit。
- GitHub-visible PR / Commit: 依 New Codex Cloud 當前實際 publication capability / Claire UI gate 形成；不得預設 mechanics。
- Other: final response 僅需短 handoff summary，包含 Result、Report path、Commit SHA / change identity、publication state、External Gates Remaining。

## Report Contract｜執行後回報

套用 Durable Report Handoff Rule。

完整 report 必須至少包含：

- Executive Summary
- Current Runtime Direct Evidence
- Historical Baseline Used
- Environment Observation
- Repository / Workspace / Branch Observation
- Runtime / Tool / Validation Observation
- Commit / Publication Observation
- Historical Assumption Classification
- Inference
- Unknown / Limitations
- External Gates Remaining
- Candidate Recommendation for Primary

若 current task 無法直接觀察某項 provider behavior，保留 Unknown / External Gate，不以推論填空。

Executor response 只保留短 handoff，不要求 Claire 搬運完整分析。

## Completion Contract｜固定結案準則

### A. Cannot Complete｜無法完成

若 Work Order / Read First 不可讀、workspace 無法安全調查、必要 capability 缺失，或其他 blocker 使 Investigation 無法形成可信 report：

1. 停止，不猜缺失 Context。
2. 不製造無意義修改或 commit。
3. 回報 blocker、已完成 observation、workspace residue 與 decision needed。
4. 若已有可信 partial evidence 但不足以形成完整 report，可在不誤標 Completed 的前提下保留 failure evidence，並清楚說明限制。

### B. Completed｜Executor Completion

1. 完成 Must 並確認未違反 Must Not。
2. 完成最小必要 validation / observation。
3. 將完整 report 寫入指定 path。
4. 確認 final diff 僅包含授權 report。
5. 建立可追溯 local commit / change identity。
6. 依 New Codex Cloud 當前實際 publication surface 停在正確 handoff point。
7. 短回報 Result、Report path、commit identity、publication state、External Gates Remaining。
8. 停止，等待 Primary Technical QC。

`Completed` 僅代表 Executor Completion，不代表本次 observations 已成為 Verified Evidence，也不代表既有 Execution Profile 應立即改寫。
