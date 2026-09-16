# Dispatch Handoff｜派工通知規則

這份文件補充 `agent-work/README.md` 的 Dispatch Procedure，保存實際撞牆後確認的 execution-surface boundary 與 Codex Task continuation 行為。

## 核心原則

> **Work Order 是完整施工 contract；Dispatch Handoff 是短通知，不承載 Work Order 本文。**

Primary Agent 建立新 Work Order 前，必須先讀：

1. `agent-work/work-orders/index.md`：Work Order Catalog / Governance 與 Historical Navigation。
2. `agent-work/templates/work-order.md`：canonical Work Order structure 與 Completion Contract。

新 Work Order 應由 canonical Template 建立，而不是從某張歷史 Work Order 複製後繼續遺傳舊格式。Template 的固定 Section 不適用時填 `None`，不要刪除。

Primary Agent 必須把完整 Work Order 放在 Implementation Agent 實際可讀的 execution surface。對目前 Codex workflow，預設就是 target Repository 內的 `agent-work/work-orders/`。

GitHub Issue、ChatGPT Project File、Connector-visible context 或 Primary Agent 私有上下文可以當 tracking / reference，但不得成為唯一施工來源。

如果 Implementation Agent 無法讀取某個外部 reference，不應要求它靠摘要猜測 Scope / Acceptance / Decision Boundary；應先把必要 contract 落到可讀位置，再重新 Dispatch。

## Dispatch Handoff 必須明確標示 Task 模式

Primary Agent 要 Claire 通知 Codex 工作時，必須明確告訴 Claire 這次屬於哪一種模式，不得只說「請弟弟處理」：

- **新 Task（New Task / New implementation snapshot）**：需要從指定 GitHub-visible source baseline 建立新的 workspace，重新讀取 Work Order 與 Read First。
- **原 Task 繼續施工（Existing Task continuation / REWORK）**：回到原 Codex Task，使用「要求變更或詢問問題」繼續同一 workspace / implementation lineage；完成後由 Claire 使用「更新分支」把後續修改發布到既有 PR。

這個標示是 execution contract 的一部分，因為兩種模式取得 repo context 的方式不同。

## Dispatch Handoff 應包含什麼

固定包含：

- Repository
- Source baseline
- Work Order path
- Execution type：New Task / Existing Task continuation (REWORK)
- 一段可直接複製給 Implementation Agent 的短 Prompt
- 僅在本次派工有特殊 execution 注意事項時補充 exception

不要在 Dispatch Prompt 重新複製第二份完整 Requirement，也不要重寫 Template 已經固定承載的 Completion Contract。Requirement 與 completion behavior 的 Source of Truth 是 Work Order。

## 新 Task 建議格式

```text
Repository: owner/repo
Source baseline: main
Work Order: agent-work/work-orders/<name>.md
Execution type: New Task / New implementation snapshot

可複製給 Implementation Agent：
請在 <owner/repo>，以 GitHub-visible <branch-or-ref> 的最新狀態建立新的工作環境。Workspace 內部 branch 名稱不必是 <branch-or-ref>，也不要求 Git remote。請先完成 repository preflight，完整閱讀 <work-order-path> 與其中指定的 Read First / Preflight，然後依 Work Order 執行。不要自行擴張 Architecture / Scope。最後必須依 Work Order 的 Report Contract 與 Completion Contract 結案；若無法完成，依 Cannot Complete 規則停止並回報 blocker；若可以完成，依 Completed 規則完成 validation、local commit、回報 local commit SHA 後停止，等待 Claire 建立 PR。
```

## 原 Task REWORK 建議格式

```text
Repository: owner/repo
PR: #<number>
Execution type: Existing Task continuation / REWORK

可複製給 Implementation Agent：
回到原 Codex Task 繼續施工。Primary Agent 已完成 QC；依本訊息中的 REWORK delta 修正，不要擴張原 Work Order scope。修改前先確認目前 workspace / branch / HEAD 與原 implementation lineage 的關係。完成後依原 Work Order 的 Report Contract 與 Completion Contract 結案：完成 validation、local commit 並回報修改後 local commit SHA 與 branch / PR 關係後停止。Claire 之後使用「更新分支」發布到既有 PR；若無法安全完成 REWORK，停止並明確回報 blocker，不製造看似完成的 handoff。
```

若 REWORK 只是小型評語、需求澄清或局部修正，必要 delta 應直接放進原 Task continuation message，不得假設 GitHub PR comment 會自動進入 Codex workspace。

## Primary 更新 Repo 後的 Context Boundary

目前已驗證的是 **Codex → GitHub → Primary** 的發布方向；尚未驗證 **Primary → GitHub → Existing Codex Task workspace** 會自動同步。

因此在取得反向同步的直接證據前，採保守規則：

> **Existing Codex Task 的 repo context 視為建立 Task 時取得的 snapshot；Primary 後續修改 GitHub PR comment、Work Order 或 repo file，不得假設原 Task 自動取得。**

若 Primary 的變更大到 Implementation Agent 必須重新取得多個 repo files / Work Order 的最新完整 context，不應把大量新 requirement 塞進舊 Task message。應建立一個 GitHub-visible checkpoint ref，再啟動 **新 Task**。

Checkpoint 可以是已合併的 `main`，也可以是明確 feature / experiment branch；不為了讓新 Task 看得到就強迫半成品 merge `main`。

> **New Task starts from a reproducible GitHub-visible repository state, not Claire's oral history.**

## 2026-09-14 Observed Failure：Work Order 不在 execution surface

Batch Scheduling Work Order 首次 Dispatch 時，Primary Agent 把 ChatGPT Project-level `playground.md` 列成 required file，並把 private GitHub Issue #21 當成唯一完整 Work Order。Codex workspace 實際上：

- 沒有 `playground.md`
- 無法存取 private Issue #21
- `gh` 未登入
- Repository snapshot 本身正常

Codex 因缺少完整施工 contract 而停止，沒有猜測實作。這個停止是正確行為。

由此形成穩定規則：

> **Prompt Access ≠ Tool Access ≠ Workspace Access。Primary 看得到，不代表 Implementation Agent 看得到。**

以及：

> **Repo-local Work Order first; short Dispatch second.**

## 2026-09-14 Direct Evidence：PR continuation / Update Branch

Batch Scheduling PR #23 提供第二組直接撞牆證據：

1. Codex 完成首次 implementation，Claire 建立既有 PR。
2. Primary QC 發現 authorization boundary 需要 REWORK。
3. Claire 回到原 Codex Task，透過「要求變更或詢問問題」要求原 Task 繼續施工。
4. Codex 在原 workspace lineage 產生第二個 local commit；當時 GitHub PR 仍維持 1 commit，證明 continuation 完成後不會自動發布。
5. Claire 按「更新分支」後，既有 PR #23 的 GitHub-visible head 改變，commit count 由 1 增為 2，沒有建立新 PR。
6. Primary 隨即可從同一 PR 重新讀取修改後程式並完成 QC。

因此目前可確認：

> **Create PR = 首次把 Task implementation 發布成 PR；Update Branch = 同一 Task 後續修改發布到既有 PR。**

以及：

> **Existing Task continuation 可以保留 implementation lineage，但 continuation 的 local result 仍需要 Claire 主動「更新分支」才會成為 Primary 可見的 GitHub evidence。**

尚未驗證、不得提前升格為規則的部分：Existing Codex Task 是否能主動 refresh Primary 後來寫入 GitHub 的 Work Order / repo files。未取得直接 Evidence 前，一律依前述 snapshot boundary 處理。
