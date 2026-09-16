# Implementation Agent Work Order Feedback｜2026-09-16

## Context

2026-09-16，Claire 在 Codex Product Task 中直接訪談 Implementation Agent，詢問現行 Agent Work / Work Order 派工模式對 executor 是否友善、哪些限制有價值、哪些流程造成不必要摩擦。

本文件保存的是 **Agent Experience / Design Input**，不是 provider specification，也不是 Verified Evidence。正式 governance 仍以 `agent-work/README.md`、`templates/work-order.md`、`dispatch-handoff.md` 為準。

## Strong Positive Feedback

Implementation Agent 認為下列設計顯著降低「做很多但做錯題」的風險：

- Repository-local Work Order 作完整施工 contract。
- Scope / Out of Scope / Constraints 顯性化，避免善意擴張。
- `Read First` 採 progressive disclosure，不要求一次吞完整 repository history。
- Preflight 驗 context / baseline / required artifacts，而不是迷信傳統 local Git 形狀。
- `Cannot Complete` 是合法終態，Failure 可以是 Deliverable。
- `Agent Report ≠ Verified Evidence`，Primary 仍需獨立 QC。
- Primary / Implementation Agent 的 authority boundary 清楚；implementation authority 不等於 architecture authority。

核心觀察：適當限制沒有壓抑 executor reasoning，反而降低猜測、scope creep、假完成與無法驗收的輸出。

## Friction / Improvement Candidates

### 1. Governance weight should scale with risk

固定 Template 對高風險、跨檔、Experiment、Architecture validation 很合適；若委派的是低風險 deterministic change，過多 `None` 會稀釋真正重要要求。

採納方向：**維持一份 canonical Template，不建立多套會 drift 的 Template；以 `Work Weight = Micro | Standard | High-Risk` 控制資訊密度。**

Micro 不是「所有小事都要派工」。是否 delegate 仍先由 Primary 判斷；Primary 幾步能安全完成的事情不必為形式開單。

### 2. Executor Completion ≠ External Acceptance

二元終態 `Cannot Complete / Completed` 應保留，不新增模糊的 `Partially Completed`。

但 `Completed` 應明確表示 **Executor Completion**。Deployment、Provider、Claire 真實裝置、Production runtime 等 executor 無法完成的驗證，列為 `External Gates Remaining`，由後續 gate 決定。

### 3. Reduce technical-novel Work Orders

過度詳細會同時造成：

- implementation detail 被不必要鎖死；
- 真正不可違反的 requirements 被背景文字稀釋。

採納方向：把 contract semantics 集中成：

`Objective → Why / Context → Read First → Must → Must Not → Acceptance → Executor Judgment → External Gates → Completion`

`Suggested Method` 明確只是候選方法；除非同時列在 `Must`，executor 可在 boundary 內選擇更簡單、安全的 implementation。

### 4. Report weight should follow Type / Risk

Implementation 不需要長篇重述 Source、commit、PR 已表達的內容。Investigation / Experiment / Review 才需要較完整的 Evidence / Alternatives / Unknown / Findings。

Experiment durable truth 應進 Experiment Record / Evidence，不應只存在 Agent Report。

### 5. Governance Contract ≠ Execution Adapter

過去直接 Evidence 建立的：

`Codex local commit → stop → Claire Create PR / Update Branch`

對 Codex Product UI 是正確 adapter，但不是所有 Agent runtime 的 canonical semantics。

穩定治理應要求：

`traceable change → validation → GitHub-visible handoff → Primary QC → External Gate when required`

publication mechanics 依 runtime 選擇，例如 Codex Product UI、CLI / GitHub-integrated Agent、Human-supervised Agent。

### 6. Independent Review identity limitation

認知角色分離、execution context 分離、review round 分離與 GitHub-visible evidence，不等於合規上的 independent principal / four-eyes approval。若 Implementation 與 Primary 最終使用同一 GitHub identity，不能把 self-review UI 限制包裝成真正的人員職務分離。

對 Playground 足夠；若未來進入需要 formal approval authority 的企業 governance，identity / approval model 必須另行處理。

## Adopted Design Direction

> **Reduce ceremony, not boundaries.**
>
> **Governance weight should scale with risk.**

保留的核心：

- Repository-local Work Order。
- 明確 Objective / boundary。
- Read First / context preflight。
- 可驗證 Acceptance。
- Missing context fail closed。
- Implementation authority ≠ Architecture Decision authority。
- Agent Report ≠ Verified Evidence。
- GitHub-visible change 作 handoff surface。
- Primary Technical QC。
- Human / Provider / Environment Gate 依風險保留。

可以演進的部分：

- Work Order 文件密度。
- Report 密度。
- publication mechanics。
- provider-specific UI handoff steps。

## Primary Agent Judgment

這次 feedback 不支持「放寬治理讓 Agent 自由發揮」。相反地，Implementation Agent 最重視的是清楚 boundary、足夠 context、可停止、可驗收與 authority separation。

因此 Agent Work 下一階段不是移除護欄，而是把成熟後已穩定的護欄壓縮成更清楚的 contract，減少儀式性重複與 provider-specific 偶合。

一句話：不要每次換燈泡都成立工程委員會，但真的要拆配電盤時，工單還是給我寫清楚。