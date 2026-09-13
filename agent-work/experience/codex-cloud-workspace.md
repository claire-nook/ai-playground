# Codex Cloud Workspace｜實際工作模式與 Handoff Experience

- Date: 2026-09-13
- Status: Observed / Verified within current product behavior
- Context: `claire-nook/ai-playground` first real Codex Work Order → Audit → Fix → PR → Primary Agent Review cycle
- Related: `agent-work/README.md`
- Related PRs: `#1`, `#2`

## Purpose

這份紀錄保存第一次把 Codex 當成 Implementation Agent 實際加入 Playground 工作流程後，觀察到的 Workspace model、Git / GitHub handoff behavior、Human Relay friction 與可重用操作原則。

它不是 Codex 產品文件，也不宣稱描述永久不變的產品實作。以下內容只代表 2026-09-13 在本次 `ai-playground` 協作中真正觀察到的行為。

核心提醒：

> **不要把 Codex Cloud Workspace 想像成 Claire 本機上一個普通的 Git clone。**

---

## 1. 三個角色真的開始協作

這次流程首次實際跑通三個不同角色：

- **Claire / Human Relay & Functional Owner**：決定工作是否開始、在產品 UI 中選擇 Codex Workspace、轉交極短 Dispatch Instruction、觸發 Create PR，並保留最終 Human Gate。
- **Primary Agent / Architecture & Technical QC**：形成 Scope、建立 Work Order、審查 Codex Report / Diff / Evidence、決定 Accepted / Rework，並在授權後 Merge。
- **Codex / Implementation Agent**：在自己的 Cloud Workspace 讀 Repo、執行 Shell / Search / Edit / Validation、建立 local commit，並準備 PR handoff。

這次最大的流程證據不是「Codex 可以改 Markdown」，而是：

> **Experiment Ownership 與 Experiment Execution 可以分離，而且 GitHub PR 可以成為兩個 Agent 之間可重新檢查的交接面。**

Claire 不需要重新向 Codex解釋完整需求。Work Order 才是 Handoff Contract。

---

## 2. Workspace Selection 是真實執行 Context

第一次 Audit Dispatch 曾因登入 / MFA / Browser navigation 後選到錯誤 Workspace。Codex 當時看到的環境不是預期的 `ai-playground`，Work Order 不存在，而且無法從該環境取得正確 GitHub Repository。

Codex沒有猜測內容，也沒有偽造 Report，而是停止執行並回報環境 mismatch。

### Observation

Codex 的「目前在哪一個 Workspace」不是無關緊要的 UI 狀態，而是實際決定它能讀到哪些 Repository files 的 Execution Context。

### Operational Rule

Dispatch 前應確認產品 UI 選到預期 Repository / Workspace。若登入、MFA 或重新導航發生過，不能假設 Workspace selection 仍然正確。

> **Work Order 寫對 ≠ Codex 一定站在對的工地。**

---

## 3. Codex Cloud Workspace 不一定具有傳統 Git Remote Model

第二輪 Documentation Fix 的第一版 Preflight 假設 Codex Workspace 應具有：

- `origin` remote
- local / remote-tracking `main`
- GitHub CLI authentication

實際觀察到的 Workspace 卻是：

- local branch 為 `work`
- `git remote -v` 沒有 remote
- 沒有 local / remote-tracking `main`
- `gh auth status` 顯示沒有 GitHub authentication
- 但 Workspace HEAD 正好是 Primary Agent 剛建立 Work Order 的最新 `main` commit snapshot
- Work Order 與 Audit Report 都存在
- working tree clean

因此第一次 Fix Work Order 的 Preflight 失敗，Codex依規則在任何修改前停止。

### Judgment

這個結果支持目前的工作模型：

```text
Codex UI Repository / Workspace Selection
        ↓
Platform prepares repository snapshot
        ↓
Codex Cloud Workspace
  local branch may be `work`
  remote may be absent
  local `main` may be absent
  GitHub CLI auth may be absent
        ↓
Shell / Edit / Test / local Git commit
```

這是根據本次 Evidence 建立的操作模型，不代表已驗證 Codex 平台內部實作細節。

### Operational Rule

不要用「必須存在 Git remote / local main / gh auth」當作 Codex Cloud Workspace repository identity 的必要條件。

Preflight 應優先驗證可觀察 Context，例如：

- 指定 Work Order 是否存在
- Read First 文件是否存在
- 預期 Repository structure / target files 是否存在
- working tree 是否 clean
- 任務需要的 baseline artifacts 是否存在
- Workspace 是否由 Claire 在 Codex UI 選到預期 Repository

---

## 4. Workspace Snapshot 有時間邊界

第一次 Fix Work Order 停止後，Primary Agent 建立了新的 v2 Work Order。

舊 Codex Workspace 沒有 remote，因此不能合理假設它可以自行 fetch 剛進 `main` 的新文件。實際操作改為重新建立 Codex 工作並重新選擇 `claire-nook/ai-playground`，讓新 Workspace 取得新的 Repository snapshot。

### Operational Rule

如果 Primary Agent 在 Codex Workspace 建立後又把必要 Work Order / Context commit 到 `main`：

> **不要假設既有 Codex Workspace 自動取得最新 Repository state。**

目前保守做法是建立新的 Codex task / workspace，重新選擇 Repository，再確認新 Work Order 存在。

是否存在其他可靠 refresh / sync mechanism，本次沒有驗證。

---

## 5. Local Commit 與 GitHub-visible Commit 是兩個 State

第一次 Audit 中，Codex曾完成 local commit，但 Primary Agent 一開始在 GitHub 找不到該 SHA。直到 Claire 使用 Codex UI 的 Create PR 流程後，成果才成為 GitHub 可觀察的 PR。

第二次 Fix 更進一步提供直接 Evidence：

- Codex Reported Local Commit: `b38537e2b5f6c5fd80a82d13123b76aead98d09a`
- GitHub PR #2 Head Commit: `240b5890f38ccdf21edf40bb4e56bd4d3183471a`

兩者不同。

本次沒有 Evidence 可以確認 Create PR 流程中平台是否 rebase、重新建立 commit、轉換 Git state，或使用其他內部機制，因此不推測原因。

可以確認的是：

> **Codex Local Commit ≠ necessarily GitHub-visible PR Commit.**

### Operational Rule

- Codex 回報 local SHA，可以用來理解它在 Workspace 內完成了 commit。
- Primary Agent 真正 Review / Merge 時，應以 GitHub PR 的 `head_sha`、Diff、Files changed 與 GitHub-visible state 為準。
- 不要拿 Codex local SHA 當成 GitHub Observable Identity。

---

## 6. Create PR 是目前的重要 Publication Boundary

本次觀察到 Codex Workspace 內沒有可用的 GitHub CLI authentication，但 Codex Product UI 可以提供 Create PR 流程，把 Workspace 成果發布成 GitHub PR。

因此目前 Handoff 應拆成：

```text
Codex executes
    ↓
Local changes
    ↓
Local commit
    ↓
Codex UI Create PR
    ↓
GitHub-visible branch / commit / PR
    ↓
Primary Agent Review
```

這個 Publication Boundary 很重要。

> **「弟弟寫完作業」與「哥哥在 GitHub 收到作業」不是同一個 State。**

目前 Claire 的 Human Relay 工作之一，就是在 Codex Product UI 觸發這個 Create PR publication step。

---

## 7. Preflight 的目的不是模仿 Local Git，而是防止在錯 Context 施工

第一次錯 Workspace 證明 Preflight 必要；第二次過度依賴 Git remote / main / gh auth 又證明 Preflight 不能把錯誤的 Workspace model 寫成硬規則。

因此 Preflight 的真正目的應該是：

> **在修改前取得足夠 Evidence，確認 Codex 正在正確的 Context 上執行正確的 Work Order。**

而不是：

> 強迫 Cloud Agent 看起來像 Claire 本機的一個標準 Git clone。

Failure Is Deliverable 在這裡也得到實證。第二輪 Codex 因 Preflight mismatch 停止，沒有修改檔案、沒有 commit、working tree 保持 clean。這個「失敗」直接暴露 Primary Agent 對 Codex Workspace model 的錯誤假設，價值高於硬著頭皮繼續施工。

---

## 8. Audit → Review → Fix 比直接叫 Codex 改更可靠

本次 Netlify Documentation Cleanup 刻意拆成兩輪：

```text
Audit Work Order
    ↓
Codex只找問題，不修改既有文件
    ↓
PR #1: Audit Report
    ↓
Primary Agent Review
    ↓
Accepted Findings
    ↓
Fix Work Order
    ↓
Codex只修已核准 Findings
    ↓
PR #2: Minimal Diff
    ↓
Primary Agent Review
```

Audit 結果顯示 Codex 不只是做字串搜尋。它能區分：

- Current stale Artifact metadata
- 應保留的 Historical Evidence
- 尚未解決但不屬於文件 defect 的 Trigger Boundary

Fix 階段則精準只改兩份文件、四個 path replacements，沒有 Scope Creep。

### Current Judgment

對「範圍不大，但需要 Repository-wide reasoning，且修正前值得獨立判斷」的工作：

> **Audit First → Primary Agent accepts findings → Fix Second**

是目前已實際跑通且容易 QC 的 Candidate Pattern。

不代表所有小修改都要拆兩張 Work Order。治理重量仍應與風險成正比，不要因為弟弟會寫報告，就把換燈泡也送交兩階段委員會。

---

## 9. GitHub Identity 與 Review Limitation

Codex Create PR 最終以 Claire 的 GitHub identity 建立 PR；Primary Agent 透過 Claire 已連接的 GitHub Connector 進行 Review 時，GitHub 因此把 Reviewer 與 PR Author 視為同一個 GitHub user。

實際結果：

- `APPROVE` 被 GitHub拒絕，理由是不能 approve 自己的 PR。
- Primary Agent 可以留下 `COMMENT` Review，記錄 `Primary Agent Review: ACCEPTED`。
- 在 Claire 明確授權後，Primary Agent 可以執行 Merge。

### Operational Rule

目前不要把 GitHub native `APPROVED` state 當成 Primary Agent QC 的唯一表示方式。

在現有 identity model 下，可使用：

```text
Primary Agent COMMENT Review: ACCEPTED / REWORK
        ↓
Claire authorization when required
        ↓
Merge
```

如果未來不同 Agent 具有獨立 GitHub identity，再重新評估 native Review / Approval semantics。

---

## 10. Current Dispatch Model

截至 2026-09-13，較符合實際產品行為的流程是：

```text
Claire + Primary Agent
        ↓
Discussion / Scope / Architecture
        ↓
Primary Agent writes Work Order
        ↓
Work Order committed to GitHub
        ↓
Claire opens Codex and selects expected Repository / Workspace
        ↓
Codex reads Work Order and performs context-oriented Preflight
        ↓
Codex executes / validates / creates local commit
        ↓
Claire triggers Codex UI Create PR
        ↓
GitHub-visible PR
        ↓
Primary Agent reviews GitHub Diff / Report / Evidence
        ↓
COMMENT Review: ACCEPTED / REWORK
        ↓
Merge only after the applicable Human / Governance gate
```

Human Relay 的理想工作量仍然很小：

- 選對 Workspace
- 貼短 Dispatch Prompt
- 必要時處理登入 / MFA
- 按 Create PR
- 把「PR 已建立」帶回 Primary Agent

Claire 不應負責重新轉述完整 Requirement，也不應人工抄 Codex local SHA 給 Primary Agent，因為 Primary Agent應以 GitHub-visible PR state 為準。

---

## 11. Unknown / Not Verified

本次仍未驗證：

- Codex Cloud Workspace 內部如何建立 Repository snapshot。
- Create PR 時 local commit 為什麼可能轉成不同 GitHub commit SHA。
- 是否存在可靠的 Workspace refresh / sync mechanism，可在不開新 task 的情況下取得新的 `main`。
- 不同 Repository / account / permission configuration 是否會得到相同的 no-remote / no-`gh auth` behavior。
- 未來 Codex Product UI 更新後，上述操作模型是否仍成立。
- 是否能讓 Primary Agent 未來直接 Dispatch Codex，而不經 Claire Human Relay。

這些 Unknown 不妨礙目前流程工作，但不應被寫成已知平台事實。

---

## 12. Current Judgment

第一次實戰後，原本的 Handoff Model 可以從純 Candidate 往前推一步：

- **Work Order as Contract**：有效。
- **Claire as Human Relay, not Requirement Translator**：有效。
- **Codex as independent Implementation Agent**：有效。
- **GitHub PR as Observable Handoff Surface**：有效。
- **Primary Agent independent QC**：有效，但目前 GitHub identity 限制使 native `APPROVE` 不可用，需以 COMMENT Review 表達。
- **Traditional local-Git preflight assumptions**：不適用，已被本次 Evidence 修正。
- **Codex local SHA as review identity**：不可靠；以 GitHub-visible PR head 為準。

最值得保留的經驗不是某個按鈕在哪裡，而是：

> **Agent 有自己的 Workspace model。Handoff Rule 必須依可觀察 State 設計，而不是假設所有 Agent 都活在同一台電腦、同一個 Git context、同一組 Credential 裡。**

這個家現在確實有三個工作個體。一個人類，兩個不是人；GitHub 暫時兼任餐桌、聯絡簿與家庭會議紀錄。