# Codex Technical Review / Investigation Experience

- Date: 2026-09-13
- Status: Observed / Candidate operating pattern
- Context: Netlify Trigger Boundary Case B v2
- Related: `agent-work/experience/codex-cloud-workspace.md`
- Related: `agent-work/reports/README.md`
- Related PR: `#5`

## Purpose

這份紀錄保存一次把 Codex 從 Implementation Agent 暫時切換成 Technical Reviewer / Investigator 後，觀察到的能力、限制與協作摩擦。

這不是 Codex 產品能力的永久宣告，只記錄本次實際工作模式。

## 1. Codex 不只適合 Implementation

在 PR #5 的 Netlify Trigger Boundary Failure 中，Codex 沒有被要求修改檔案，而是收到 Provider Evidence、既有 Rule 與 Research Question，進行獨立技術分析。

它能夠將內容區分為：

- 已由目前 Evidence 證明的事實
- 根據 shell / Git / Netlify semantics 的強推論
- 尚需 Experiment 驗證的假設

並指出目前 rule 的 comparison model 與真正 Research Question 不一致：

```text
目前 rule 實際較接近回答：
從某個 Netlify cached deploy commit 到本次 commit，Deploy Trigger Surface 是否曾改變？

真正想回答：
本次 PR / Git change 自己是否改變 Deploy Trigger Surface？
```

這支持一個 Candidate Role：Codex 可以在具體 Repository / Provider Evidence 下，作為 Technical Reviewer / Investigator，而不只作為 Coding Executor。

## 2. Independent Review 比「請確認我的答案」更有價值

本次 Dispatch 刻意沒有要求 Codex 認同 Primary Agent 的既有 hypothesis，而是要求：

- 可直接指出 Primary Agent 的分析可能有錯。
- 分離 Evidence / Inference / Unknown。
- 提出替代 boundary / comparison strategy。

這比把答案塞進 Prompt 再要求 Agent「確認」更能降低假性 Multi-Agent Consensus。

> **兩個 Agent 說一樣的話，不等於有兩份 Evidence。**

Independent Review 的價值在於暴露 assumption、missing evidence 與不同 experiment design。

## 3. Codex 擅長把工程問題拆成可驗證項目

本次 Review 中，Codex 額外指出多個 Primary Agent 尚未直接取得的觀察缺口，例如：

- `$CACHED_COMMIT_REF` 的實際 SHA
- `$COMMIT_REF` 的實際 SHA
- PR head vs synthetic merge commit
- 當次 `git diff --name-only` 的實際輸出
- merge-base 可用性
- cache / retry / first Deploy Preview 對 comparison baseline 的影響

這類拆解很適合作為 Experiment Design input。

但 Reviewer 列出的所有 probe 不應自動全部執行。Primary Agent 仍需判斷哪些觀察能最小成本回答 Research Question，避免把完整測試矩陣當成必要儀式。

## 4. 分析型 Task 的聊天輸出不是理想 Handoff Surface

本次 Technical Review 沒有使用 Git Report。Codex 將長篇分析留在 ChatGPT / Codex Task UI。

結果 Primary Agent 無法直接透過 GitHub Connector取得該內容；ChatGPT 分享連結也沒有成為可靠的 Agent-to-Agent reading surface。Claire 最後必須人工複製部分分析內容。

這違反我們希望的 Human Relay 原則：

> **Claire 負責 Dispatch Gate，不負責人工搬運兩個 Agent 的長篇 reasoning / report。**

因此新增 `agent-work/reports/` 作為分析型 Handoff Channel。

## 5. Task Success 與 Create PR Product Boundary

同日另一次 Codex Preflight Task 顯示：當 Codex Runtime 根據 Work Order 判定 Task 失敗 / 停止時，Codex Product UI 不一定提供 Create PR。

這代表若目標是產生 GitHub-visible Report / Change：

- Runtime 任務本身應有可完成的 Deliverable。
- 不應要求 Runtime 執行它沒有的 Product-level PR 操作。
- Codex 應完成修改 / report / validation / local commit 後正常結束。
- Claire 再從 Product UI 觸發 Create PR。

目前觀察模型：

```text
Product UI selects Repository / Branch
        ↓
Workspace snapshot
        ↓
Codex Runtime executes on local workspace
        ↓
local commit / successful Task completion
        ↓
Product UI Create PR
        ↓
GitHub-visible handoff
```

Product-level Branch Selection 與 Runtime local branch identity 是不同層級。Runtime 可能仍顯示 local `work`。

## 6. Candidate Role Split

目前較合理的分工：

### Primary Agent

- Research Question
- Architecture framing
- Experiment priority
- Technical Governance
- 最終 Evidence / Judgment QC

### Codex as Implementation Agent

- Code / Config / Experiment Implementation
- Runtime / Shell / Test / Debug loop
- Repository-local evidence gathering

### Codex as Technical Reviewer / Investigator

- 針對明確 Evidence 做 Failure Analysis
- 找 assumption / contradiction / missing evidence
- 提 Candidate explanation / experiment options
- 不自行升格 Architecture Decision

### Claire

- Business / Functional Intent
- Product-level Dispatch Gate
- Provider UI Evidence（需要登入或人工操作時）
- Human / Functional acceptance

## 7. Current Operating Rule

分析型 Codex 工作若預期產出超過短篇回覆，優先要求 Git Report：

```text
Work Order
→ Codex Investigation / Review
→ agent-work/reports/<report>.md
→ local commit
→ Claire Create PR
→ Primary Agent GitHub Review
```

這讓 Agent Communication 從「人類搬聊天內容」轉成「共享 Observable Artifact」。

## 8. Unknown

尚未驗證：

- Codex 在更大型 Architecture Question 上的獨立 Review 品質。
- Codex 是否能穩定在同一 Task 中由 Implementation role 切換為 Reviewer role，而不混入先前執行偏誤。
- Report-based handoff 在多輪 Rework / Reply 時是否需要 Thread / Index 機制。
- 未來 Codex / ChatGPT 是否會提供直接 Agent-to-Agent handoff，讓 Git Report 不再必要。

在這些能力出現前，GitHub Report 是目前最可觀察、最少依賴產品內部聊天 UI 的方法。
