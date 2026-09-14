# Dispatch Handoff｜派工通知規則

這份文件補充 `agent-work/README.md` 的 Dispatch Procedure，保存 2026-09-14 實際撞牆後確認的 execution-surface boundary。

## 核心原則

> **Work Order 是完整施工 contract；Dispatch Handoff 是短通知，不承載 Work Order 本文。**

Primary Agent 必須把完整 Work Order 放在 Implementation Agent 實際可讀的 execution surface。對目前 Codex workflow，預設就是 target Repository 內的 `agent-work/work-orders/`。

GitHub Issue、ChatGPT Project File、Connector-visible context 或 Primary Agent 私有上下文可以當 tracking / reference，但不得成為唯一施工來源。

如果 Implementation Agent 無法讀取某個外部 reference，不應要求它靠摘要猜測 Scope / Acceptance / Decision Boundary；應先把必要 contract 落到可讀位置，再重新 Dispatch。

## Dispatch Handoff 應包含什麼

固定包含：

- Repository
- Source baseline
- Work Order path
- Execution type：New implementation 或 PR continuation / REWORK
- 一段可直接複製給 Implementation Agent 的短 Prompt
- 僅在本次派工有特殊 execution 注意事項時補充 exception

不要在 Dispatch Prompt 重新複製第二份完整 Requirement。Requirement 的 Source of Truth 是 Work Order。

## 建議格式

```text
Repository: owner/repo
Source baseline: main
Work Order: agent-work/work-orders/<name>.md
Execution type: New implementation snapshot

可複製給 Implementation Agent：
請在 <owner/repo>，以 GitHub default branch <branch> 的最新狀態建立新的工作環境。Workspace 內部 branch 名稱不必是 <branch>，也不要求 Git remote。請先完成 repository preflight，完整閱讀 <work-order-path> 與其中指定的 Read First / Preflight，然後依 Work Order 施工、測試並 local commit。不要自行擴張 Architecture / Scope。完成後依 Work Order Report Contract 回報 changed files、tests、known limitations 與 local commit SHA，然後停止，等待 Claire 建立 PR。

本次特殊注意事項：
- <只有真的存在 execution-specific exception 才填>
```

## 2026-09-14 Observed Failure

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
