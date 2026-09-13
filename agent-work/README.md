# Agent Work｜Agent 工程委派區

這個目錄保存需要交給其他 Engineering Agent 執行的 Work Order，以及委派工作的共同規則。

它不是新的 Project Management System，也不是 Codex 專屬祖厝。今天執行者可能是 Codex，未來也可能是其他具有適合 Workspace / Runtime / Tooling 的 Agent。這裡描述的是 **Engineering Role**，不是 Provider 身分。

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**

Primary Agent 可以負責 Research Question、Architecture、Experiment Design、Technical Judgment 與 QC，而把需要大量 Interactive Workspace、Shell、Runtime、Build / Test Loop 的工程勞動委派給 Coding / Implementation Agent。

委派不是把判斷責任一起外包。執行 Agent 的 Report 屬於 Observation Source，不會因為它寫了「成功」就自動成為 Verified Evidence。

---

## 1. 何時適合開 Work Order

優先考慮委派的情況：

- Experiment 需要大量互動式 Shell / Runtime / Build / Test / Debug loop。
- 用 GitHub Actions 等現有 Remote Execution 可以做，但 feedback loop 過慢或 orchestration 成本不合理。
- 正式 Specification 已經清楚，需要大量 Implementation，而不是繼續探索 Architecture。
- Primary Agent 需要保留獨立 QC / Architecture Review 角色，避免 Designer / Implementer / Reviewer 全部由同一個 Agent 自我認證。

不必為了形式開 Work Order：

- Primary Agent 用現有工具幾步就能直接驗證的小型 Probe。
- 尚未想清楚真正 Research Question，只是想叫另一個 Agent「隨便研究看看」。
- 工作本身需要 Claire 先補 Business Requirement 或做 Technical Decision。

文件重量應與委派風險成正比。六段說清楚的 Experiment 不要硬長成六十頁招標文件。

---

## 2. Role Separation｜角色分工

### Claire

主要負責 Business Intent / Functional Requirement / Functional Acceptance。

正式功能完成後，Claire 驗證：

> **功能是否符合真正需求。**

### Primary Agent / Architecture & Technical QC

主要負責：

- Research Question / Experiment Design
- Architecture / Responsibility Boundary
- Technical Pattern Mapping
- Platform / Security / Data Ownership Rule
- Work Order Scope / Constraint
- Evidence Review
- Architecture / Technical QC
- Deployment Judgment

Primary Agent 驗證：

> **實作與實驗方法是否符合技術規範，而且 Evidence 是否足以支持結論。**

### Implementation Agent / PG Pool

主要負責：

- 依 Work Order 執行 Experiment 或 Implementation。
- 使用自己的 Workspace / Shell / Runtime / Tooling 完成工程工作。
- 保留必要的 Diff、Test Result、Log Summary、Artifact 與限制。
- Commit 可審查的成果。
- 清楚回報 Failure / Unknown，不把推論偽裝成成功。

Implementation Agent 不因為負責施工，就自動取得 Architecture / Platform Decision Authority。

---

## 3. Handoff Model｜交接模型

```text
Claire + Primary Agent
        ↓
Research / Specification / Architecture
        ↓
Work Order
        ↓
Implementation Agent Workspace
        ↓
Code / Experiment / Test / Evidence / Report
        ↓
Git Commit
        ↓
Primary Agent Technical QC
        ↓
Accepted Evidence / Deployment Candidate / Rework
        ↓
Claire Functional Acceptance（正式功能時）
```

Git Repository 是主要 Agent 與 Implementation Agent 之間的 **observable handoff surface**。

Agent 不需要共享大腦，也不需要相信對方的口頭保證；應盡量共享可以重新檢查的 Files、Diff、Logs、Test Results、Artifacts 與 Reports。

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**
>
> **Agent Report ≠ Verified Evidence.**

---

## 4. Work Order 最小內容

Work Order 可以從 [`templates/work-order.md`](templates/work-order.md) 開始，依工作大小刪減。

最低限度應讓執行者知道：

1. **Objective**：到底要回答什麼問題或完成什麼工作。
2. **Context / Read First**：先讀哪些文件，哪些既有 Evidence / Pattern 已成立。
3. **Scope / Out of Scope**：可以碰什麼，不可以順手改什麼。
4. **Constraints**：必須遵守哪些 Platform / Security / Data / Repository Rule。
5. **Required Evidence / Acceptance**：什麼結果才算有交作業。
6. **Deliverables**：要 Commit 哪些 Code / Artifact / Report。
7. **Decision Boundary**：哪些事情執行者可以自行決定，哪些只能回報 Candidate / Observation。

正式 Implementation 可以直接引用正式 Repository 的 Specification、Technical Pattern、Acceptance Criteria，不要複製成第二份 Source of Truth。

---

## 5. Evidence Rule｜不要讓弟弟自己簽聯絡簿

Implementation Agent 的文字報告只能證明「它這樣回報」，不能單獨證明技術事實。

Primary Agent 應依風險檢查至少一種或多種可觀察 Evidence：

- Source / Diff
- Test Result
- Runtime Output
- Provider Result
- Log / Artifact
- Claire Environment Evidence
- 可重現步驟

如果 Evidence 只支持部分結論，Status 應保持 `Partial` / `Candidate` / `Open`，不要因為施工者語氣很有自信就升格 `Verified`。

若 Experiment 由 Implementation Agent 執行，最終仍依 `knowledge/README.md` 的 Knowledge Capture Protocol 更新 Experiment Record、Catalog、Evidence Index、Research Map / Open Exploration。

---

## 6. Failure Is Deliverable｜失敗也要交貨

Work Order 不要求執行者一定成功。

遇到失敗時，應保留足以避免下一個 Agent 重撞同一面牆的資訊，例如：

- 嘗試了什麼。
- 哪一步失敗。
- 實際 Error / Result。
- 已排除什麼。
- 尚未確認什麼。
- 是否值得換 Candidate / Environment / Tool 再試。

「做不到」不是報告；「在這些條件下做不到，而且 Evidence 是這些」才是工程結果。

---

## 7. Repository Boundary｜先不要成立 Codex 王國

目前 Work Order 優先留在產生 Research Context 的 Repository。

Playground Experiment 的委派工作留在 `ai-playground/agent-work/`；正式 Implementation 的 Source of Truth 仍在正式 Repository，不應因為 Codex 執行就搬來 Playground。

只有當未來 Work Order 大量跨多個 Repository，並真的需要中央 Dispatch / Queue / Cross-repo Agent Coordination 時，才評估建立獨立 Agent Workbench Repository。

不要因為今天有一個 Codex 就先蓋 `codex-repo`。Provider 會換，家訓最好不要跟著搬家。

---

## 8. First Research Target｜先驗證這套合作本身

這套 Handoff Model 目前是 `Candidate`，不是已驗證最佳實務。

第一批實際 Work Order 應觀察：

- Codex 是否會可靠閱讀 `Read First` 引用文件。
- Context 寫多少才足夠，多少只是餵文件吃到昏迷。
- Experiment Work Order 與正式 Implementation Work Order 是否需要不同 Template。
- Report / Evidence 放哪裡最容易由 Primary Agent QC。
- Commit 粒度是否容易 Review。
- 執行者是否會越過 Scope 或擅自形成 Architecture Decision。
- Failure 如何交付最有價值。

等實際跑過幾次，再用 Evidence 修改這份規則。治理應該從撞牆長出來，不是坐在會議室裡一次幻想完整。