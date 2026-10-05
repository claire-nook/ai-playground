# Dispatch Handoff｜派工通知規則

這份文件補充 `agent-work/README.md`，保存實際撞牆後確認的 execution-surface boundary 與 publication adapter。

## 核心原則

> **Work Order 是完整施工 contract；Dispatch Handoff 是短通知。**
>
> **Governance Contract 保持穩定；publication mechanics 依 Execution Profile 替換。**

Primary 建立新 Work Order 前先讀：

1. `agent-work/work-orders/index.md`
2. `agent-work/templates/work-order.md`

完整 Work Order 必須存在 executor 真正可讀的 execution surface。GitHub Issue、ChatGPT Project File、Connector-visible context 或 Primary 私有 context 可當 reference，但不得是唯一施工來源。

若 executor 無法讀取 required context，不要求它靠摘要猜 Scope / Acceptance / Boundary；依 `Cannot Complete` fail closed。

## Dispatch Handoff 必須包含什麼

- Repository
- Source baseline
- Work Order path
- Execution type：`New Task | Existing Task continuation / REWORK`
- Execution Profile
- 可直接複製給 executor 的短 Prompt
- 本次特有 execution exception，若有

不要在 Dispatch Prompt 複製第二份 Requirement，也不要重寫 Template 的 Completion Contract。

## Task Mode

### New Task

從指定 GitHub-visible source baseline 建立新的 workspace / snapshot，重新讀 Work Order 與 Read First。

### Existing Task continuation / REWORK

保留原 implementation lineage，在原 Task / workspace 能安全延續時處理 QC delta。若 Primary 後續變更的 required context 無法可靠進入原 workspace，建立新的 GitHub-visible checkpoint，再啟動 New Task；不要平行猜測重建。

> **New Task starts from a reproducible GitHub-visible repository state, not Claire's oral history.**

## Execution Profiles｜Publication Adapter

### Codex Product UI

目前已直接觀察的模式：

- New Task：Codex local commit + report → stop → Claire **Create PR**。
- Existing Task continuation：Codex local commit + report → stop → Claire **Update Branch** 發布到既有 PR。
- Codex local SHA 不保證等於 GitHub-visible PR head SHA。
- GitHub PR comment 不保證自動進入既有 Codex workspace；REWORK delta 由 Claire relay 回原 Task。

### New Codex Cloud（2026-10-05 Verified Profile）

2026-10-05 以 Work Order `2026-10-05-new-codex-cloud-execution-profile-validation`、Draft PR #46 / #47 與 Primary GitHub QC 驗證目前新版 Cloud surface。

目前直接觀察的模式：

- Task UI 仍以單一 Repository + source branch 建立工作；executor workspace 內實際 local branch 可為 `work`，不等於 requested baseline branch。
- Published Cloud Environment 對 Claire 是可設定 / publish / selection 的 runtime surface；但 executor task 內沒有可直接辨識 Environment display name、ID、revision 或 setup provenance 的 metadata。只能觀察已配置好的 runtime 結果，不把 toolchain 來源硬歸因給 Environment。
- Codex 可讀 repository-local Work Order、執行 shell / validation、修改 workspace 並建立 local commit；workspace 仍可能沒有 configured Git remote，`gh` 也可能未登入。
- New Task 完成後，Claire 在 Web UI 看到 **建立草稿 PR**；觸發後平台把成果發布為 GitHub-visible Draft PR。Claire 不需要另外在 GitHub commit 或 push。
- GitHub-visible 後，Primary 可直接從 GitHub 執行 Technical QC，並在授權範圍內完成 Ready for Review、Merge 與 superseded PR cleanup。正常 happy path 下，Claire 的 publication 工作可收斂為「建立草稿 PR」這個 Human Gate。
- Codex local commit SHA 仍不保證等於 GitHub-visible PR head SHA。Phase 1 local `dcfa9cf...` 發布為 PR #46 head `f5fc7a2...`，再次直接驗證 identity separation。
- **重要 continuation 差異：同一 Cloud conversation 不等於同一 GitHub PR lineage。** PR #46 建立後，在同一 Cloud conversation 做第二次 local commit，再次觸發 **建立草稿 PR**，平台沒有更新 #46，而是建立新的 branch 與 Draft PR #47。
- 因此不要把舊 Codex Product UI 的 `Existing Task → Update Branch → same PR` 套用到 New Codex Cloud。若 continuation 產生新 Draft PR，由 Primary 以 GitHub-visible diff / report 判斷新的 canonical PR，QC 後 merge canonical artifact 並關閉 superseded PR。
- `make_pr` 類 executor-visible metadata surface、Claire 看見的 publication control、以及真正 GitHub-visible PR 是三個不同 observation surface；沒有 direct evidence 時不要宣稱它們內部如何因果串接。

目前推薦的 happy path：

```text
Primary writes repository-local Work Order
        ↓
Claire creates / continues New Codex Cloud task
        ↓
Codex preflight / implementation / validation / local commit
        ↓
Claire triggers 「建立草稿 PR」
        ↓
GitHub-visible Draft PR
        ↓
Primary Technical QC
        ↓
Accepted: Primary Ready / Merge / cleanup
Rework: return delta to Codex; subsequent publication may create a NEW Draft PR
        ↓
Primary selects canonical PR and closes superseded PR
```

> **Cloud conversation lineage ≠ GitHub PR lineage.**
>
> **New Codex Cloud publication gate ≠ GitHub commit / push work for Claire.**

Verified artifact：`agent-work/reports/2026-10-05-new-codex-cloud-execution-profile-validation.md`。PR #46 保存 Phase 1 publication evidence；PR #47 為 continuation 後 canonical artifact，經 Primary QC 後 merge。

### CLI / GitHub-integrated Agent

若 runtime 已具有被授權的 commit / push / PR capability，可由 Agent 直接完成 publication。完成後仍以 GitHub-visible PR / commit 作 Primary QC surface，不因 Agent 能 publish 就省略 QC。

### Human-supervised Agent

Agent 可完成 workspace change / validation / commit，由 human 負責 push / PR publication。Human publication 不等於 Technical QC。

### Unknown / New Runtime

先確認 Prompt Access、Tool Access、Workspace Access、GitHub publication capability，再選 adapter。不要把 provider-specific UI 步驟硬套成 canonical completion semantics。

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**
>
> **Provider Credential ≠ GitHub Execution Credential.**

## New Task 建議格式

```text
Repository: owner/repo
Source baseline: main
Work Order: agent-work/work-orders/<name>.md
Execution type: New Task
Execution Profile: <profile>

可複製給 Implementation Agent：
請在 <owner/repo> 以 GitHub-visible <branch-or-ref> 建立符合 Execution Profile 的工作環境。先確認 Work Order 與 Read First 可讀、required baseline context 存在，再依 Work Order 執行。Must / Must Not / Acceptance 是 contract；Suggested Method 可在不違反 boundary 下調整；Executor Judgment 內的低風險 implementation detail 由你決定。不要自行擴張 Architecture / Scope。最後依 Work Order 的 Report Contract 與 Completion Contract 結案；若 Cannot Complete，停止並保留 blocker / failure evidence；若 Completed，完成 validation、diff check、commit 與本 Execution Profile 支援的 publication handoff，再停止等待 Primary Technical QC / External Gates。
```

## Existing Task REWORK 建議格式

```text
Repository: owner/repo
PR: #<number>
Execution type: Existing Task continuation / REWORK
Execution Profile: <profile>

可複製給 Implementation Agent：
保留原 implementation lineage，依本訊息中的 REWORK delta 修正，不要擴張原 Work Order scope。先確認目前 workspace / branch / HEAD 與既有 implementation 的關係；若 required context 無法安全取得，依 Cannot Complete 停止，不要平行重建。完成後依原 Work Order 的 Completion Contract 做 validation、diff check、commit，並依 Execution Profile 發布或回報 publication state，等待 Primary 重新 QC。
```

若 REWORK 只是局部修正，delta 直接放 continuation message。不要假設 GitHub review comment 會自動同步到 executor workspace。

## Snapshot / Continuation Boundary

目前已驗證 Codex Product UI 的 **Codex → GitHub → Primary** publication；尚未驗證 **Primary → GitHub → Existing Codex Task workspace** 必然自動同步。

因此對 Codex Product UI 保守採用：Existing Task repo context 視為建立 Task 時的 snapshot。Primary 後續修改 repo / Work Order / PR comment，不假設舊 Task 自動取得。

其他 Execution Profile 應依自己的直接 evidence 判斷，不把 Codex Cloud 的限制誤當所有 Agent runtime 的限制。

## Historical Direct Evidence｜Codex Product UI

### 2026-09-14：Work Order 不在 execution surface

Batch Scheduling 首次 Dispatch 時，Primary 把 ChatGPT Project-level `playground.md` 與 private GitHub Issue 當 required context；Codex workspace 無法取得，因而停止。這是正確的 fail-closed 行為。

形成穩定規則：

> **Repo-local Work Order first; short Dispatch second.**

### 2026-09-14：PR continuation / Update Branch

Batch Scheduling PR #23 驗證：首次 Create PR 發布 implementation；原 Task continuation 產生後續 local commit，但 PR 不會自行更新；Claire 使用 Update Branch 後，既有 PR head 才改變並保留 lineage。

因此 `Create PR / Update Branch` 是 **Codex Product UI adapter 的直接 Evidence**，不是所有 Implementation Agent 的固定 publication protocol。

## Current Judgment

穩定治理核心：

- Repository-local Work Order。
- reproducible source baseline / context preflight。
- explicit Must / Must Not / Acceptance / Executor Judgment。
- Missing context 時 fail closed。
- Implementation authority ≠ Architecture Decision authority。
- Agent Report ≠ Verified Evidence。
- GitHub-visible state 作 Primary QC handoff surface。
- Human / Provider / Environment Gate 依風險保留。

Execution mechanics 可以隨 runtime 演進。不要因為換了一個 Agent provider，就把整本家訓重新抄一遍。