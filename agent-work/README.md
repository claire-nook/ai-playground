# Agent Work｜Agent 工程委派區

這個目錄保存需要交給其他 Engineering Agent 執行的 Work Order、委派工作的共同規則，以及實際協作後形成的 Experience。

它不是新的 Project Management System，也不是 Codex 專屬祖厝。今天執行者可能是 Codex，未來也可能是其他具有適合 Workspace / Runtime / Tooling 的 Agent。這裡描述的是 **Engineering Role**，不是 Provider 身分。

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**

Primary Agent 可以負責 Research Question、Architecture、Experiment Design、Technical Judgment 與 QC，而把需要大量 Interactive Workspace、Shell、Runtime、Build / Test Loop 的工程勞動委派給 Coding / Implementation Agent。

委派不是把判斷責任一起外包。執行 Agent 的 Report 屬於 Observation Source，不會因為它寫了「成功」就自動成為 Verified Evidence。

目前 Codex Cloud 的實際 Workspace / Git / PR 工作模式已經過第一輪真實 Handoff 驗證，完整 Experience：[`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。

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

主要負責 Business Intent / Functional Requirement / Functional Acceptance，以及目前產品架構下必要的 Human Relay / Dispatch Gate。

正式功能完成後，Claire 驗證：

> **功能是否符合真正需求。**

Human Relay 不等於 Requirement Translator。Claire 不應替兩個 Agent 重講一次完整需求。

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

概念模型：

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
Observable Handoff
        ↓
Primary Agent Technical QC
        ↓
Accepted Evidence / Deployment Candidate / Rework
        ↓
Claire Functional Acceptance（正式功能時）
```

Git Repository / Pull Request 是目前 Primary Agent 與 Implementation Agent 之間主要的 **observable handoff surface**。

Agent 不需要共享大腦，也不需要相信對方的口頭保證；應盡量共享可以重新檢查的 Files、Diff、Logs、Test Results、Artifacts 與 Reports。

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**
>
> **Agent Report ≠ Verified Evidence.**

### 3.1 Dispatch Procedure｜目前怎麼真的叫 Codex 工作

截至 2026-09-13，一般 ChatGPT Project 對話中的 Primary Agent 沒有直接 Dispatch Codex 開始工作的工具。Claire 是目前刻意保留的 Human Relay / Dispatch Gate。

第一輪真實 Work Order 已證明，Codex Cloud Workspace 不應被假設為一般 local Git clone。它可能只有 local `work` branch、沒有 Git remote、沒有 local / remote-tracking `main`、也沒有 `gh` authentication；但仍可由 Codex Product 根據 Claire 選擇的 Repository 建立可工作的 snapshot。

目前標準流程：

1. Primary Agent 與 Claire 先把 Research Question / Specification / Scope 討論到足以委派。
2. Primary Agent 建立 Work Order，Playground 工作優先放在 `agent-work/work-orders/`。
3. Primary Agent 將 Work Order 與必要 Context / Rule Commit 到 GitHub。
4. Primary Agent 告訴 Claire Target Repository、Work Order path，以及一句可直接交給 Codex 的 Dispatch Prompt。
5. Claire 開啟 Codex，**確認 Product UI 選到預期 Repository / Workspace**。若剛經過登入、MFA 或 Browser navigation，不假設先前 Workspace selection 仍正確。
6. Codex 讀 Work Order，先做 **context-oriented Preflight**：確認 Work Order / Read First / target files / baseline artifacts / clean working tree 等任務真正需要的 Context。除非任務本身依賴，否則不要用 Git remote、local `main` 或 `gh auth` 當 repository identity 的必要條件。
7. Codex 在自己的 Workspace 執行、測試、修正並建立 local commit。Work Order 才是主要 Handoff Contract。
8. Claire 使用 Codex Product UI 的 **Create PR** 流程，把 Workspace 成果發布成 GitHub-visible PR。
9. Claire 只需要回 Primary Agent「PR 已建立」；Primary Agent 應直接從 GitHub 取得 PR `head_sha`、Diff、Files changed、Report 與 Evidence，不要求 Claire 人工抄 local SHA。
10. Primary Agent Review GitHub-visible state。需要 Rework 時，建立明確 Review Instruction / Work Order，再由 Claire Relay。
11. 通過 QC 後，才依 Knowledge Capture Protocol 將 Experiment Result 升格成相應 Evidence / Judgment；正式功能則再進 Claire Functional Acceptance。

這個流程的設計重點仍然是：

> **Claire 負責按門鈴，不負責替兩個 Agent 重講一次需求。**

而且現在多了一條實證：

> **Codex local commit ≠ necessarily GitHub-visible PR commit。Primary Agent Review 以 GitHub-visible state 為準。**

如果 Primary Agent 在 Codex Workspace 建立後又 Commit 新的必要 Work Order / Context，目前不要假設舊 Workspace 會自動取得最新 `main`。保守做法是開新的 Codex task / workspace，重新選 Repository 並確認新 Context 存在。其他 refresh / sync mechanism 尚未驗證。

完整 Evidence、Unknown 與 Workspace model 見 [`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。

---

## 4. Work Order 最小內容

Work Order 可以從 [`templates/work-order.md`](templates/work-order.md) 開始，依工作大小刪減。

最低限度應讓執行者知道：

1. **Objective**：到底要回答什麼問題或完成什麼工作。
2. **Context / Read First**：先讀哪些文件，哪些既有 Evidence / Pattern 已成立。
3. **Execution Context Preflight（需要時）**：修改前如何確認 Agent 站在正確 Context；驗證真正需要的可觀察 State，不要照抄 local Git 假設。
4. **Scope / Out of Scope**：可以碰什麼，不可以順手改什麼。
5. **Constraints**：必須遵守哪些 Platform / Security / Data / Repository Rule。
6. **Required Evidence / Acceptance**：什麼結果才算有交作業。
7. **Deliverables**：要 Commit 哪些 Code / Artifact / Report，以及是否需要 GitHub-visible PR。
8. **Decision Boundary**：哪些事情執行者可以自行決定，哪些只能回報 Candidate / Observation。

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

若成果經 Codex Create PR 發布，Primary Agent 應以 GitHub-visible PR 的 Diff / `head_sha` / changed files 為主要 QC identity，而不是只相信 Codex Workspace 回報的 local commit SHA。

目前 Codex Create PR 與 Primary Agent GitHub Connector 都使用 Claire 的 GitHub identity，因此 GitHub native `APPROVE` 會被視為 self-approval 而拒絕。Primary Agent 可使用 `COMMENT` Review 明確記錄 `ACCEPTED` / `REWORK`，再依適用的 Human / Governance Gate Merge。

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

2026-09-13 的 Codex Fix Preflight 已提供實例：Work Order 錯把 Git remote / local `main` / `gh auth` 當必要條件，Codex 因 mismatch 在修改前停止，working tree 保持 clean。這次 Failure 直接修正了 Primary Agent 對 Codex Cloud Workspace 的錯誤假設，因此本身就是有價值的 Deliverable。

---

## 7. Repository Boundary｜先不要成立 Codex 王國

目前 Work Order 優先留在產生 Research Context 的 Repository。

Playground Experiment 的委派工作留在 `ai-playground/agent-work/`；正式 Implementation 的 Source of Truth 仍在正式 Repository，不應因為 Codex 執行就搬來 Playground。

只有當未來 Work Order 大量跨多個 Repository，並真的需要中央 Dispatch / Queue / Cross-repo Agent Coordination 時，才評估建立獨立 Agent Workbench Repository。

不要因為今天有一個 Codex 就先蓋 `codex-repo`。Provider 會換，家訓最好不要跟著搬家。

---

## 8. Current Judgment｜第一輪實戰後

這套 Handoff Model 已不再只是紙上 Candidate。2026-09-13 的 Netlify Boundary Documentation Audit / Fix 已完整跑過：

```text
Audit Work Order
→ Codex Audit
→ Create PR #1
→ Primary Agent Review
→ Merge
→ Fix Work Order
→ Preflight Failure / Workspace Model Correction
→ Fix Work Order v2
→ Codex Fix
→ Create PR #2
→ Primary Agent Review
→ Merge
```

目前可成立的 Judgment：

- Work Order as Handoff Contract：有效。
- Claire as Human Relay, not Requirement Translator：有效。
- Codex 能閱讀 Repository Context、遵守 Audit-only / Minimal Diff Scope，並在 Preflight mismatch 時停止：本次已觀察成立。
- GitHub PR as Observable Handoff Surface：有效。
- Primary Agent independent QC：有效，但目前 native GitHub `APPROVE` 受同 identity 限制。
- Audit First → Review → Fix Second：對需要先判斷再修改的小型 Repository-wide consistency work 是可用 Candidate Pattern，不應機械套用所有任務。
- Traditional local-Git preflight assumptions：不適用 Codex Cloud Workspace；應改成 context-oriented Preflight。
- Codex local SHA：不可作為 GitHub Review identity；以 PR `head_sha` 為準。

仍需繼續觀察：

- Context 寫多少才足夠，多少只是餵文件吃到昏迷。
- Experiment Work Order 與正式 Implementation Work Order 是否需要不同 Template。
- 更大型 Code / Runtime / Build / Test 任務下，Codex 是否仍能維持 Scope discipline。
- Workspace refresh / sync 的實際能力。
- 不同 Repository / account / permission configuration 是否有不同 Workspace behavior。
- 未來是否能由 Primary Agent 直接 Dispatch Codex，移除 Human Relay 的產品操作步驟。

治理繼續從 Evidence 長出來，不要坐在會議室裡幻想完整。弟弟現在正式有房間了，但還不需要成立戶政事務所。