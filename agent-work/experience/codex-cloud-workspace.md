# Codex Cloud Workspace｜實際工作模式與 Handoff Experience

- Date: 2026-09-13
- Status: Observed / Verified within current product behavior
- Context: `claire-nook/ai-playground` real Codex Work Orders, PR handoff, deployment-gated experiment
- Related: `agent-work/README.md`
- Related PRs: `#1`, `#2`, `#16`

## Purpose

這份紀錄保存把 Codex 當成 Implementation Agent 加入 Playground 後，實際觀察到的 Workspace model、Git / GitHub handoff behavior、deployment boundary、Human Relay friction 與可重用操作原則。

它不是 Codex 產品文件，也不宣稱描述永久不變的產品實作。以下內容只代表 2026-09-13 在本次 `ai-playground` 協作中真正觀察到的行為。

核心提醒：

> **不要把 Codex Cloud Workspace 想像成 Claire 本機上一個普通的 Git clone，也不要把「能 Create PR」誤認成「擁有 GitHub execution authority」。**

---

## 1. 三個角色真的開始協作

- **Claire / Human Relay & Functional Owner**：決定工作是否開始、在產品 UI 中選擇 Codex Workspace、轉交極短 Dispatch Instruction、觸發 Create PR，並保留必要 Human Gate。
- **Primary Agent / Architecture & Technical QC**：形成 Scope、建立 Work Order、審查 Codex Report / Diff / Evidence、決定 Accepted / Rework、Deployment Judgment，並在授權後 Merge。
- **Codex / Implementation Agent**：在自己的 Cloud Workspace 讀 Repo、執行 Shell / Search / Edit / Validation、建立 local commit，並準備 PR handoff。

核心 Evidence：

> **Experiment Ownership 與 Experiment Execution 可以分離，而且 GitHub PR 可以成為兩個 Agent 之間可重新檢查的交接面。**

Claire 不需要重新向 Codex 解釋完整需求。Work Order 才是 Handoff Contract。

---

## 2. Workspace Selection 是真實執行 Context

第一次 Audit Dispatch 曾因登入 / MFA / Browser navigation 後選到錯誤 Workspace。Codex 看不到預期 Work Order，也無法取得正確 Repository，因此停止執行而沒有猜測內容。

Operational Rule：Dispatch 前確認產品 UI 選到預期 Repository / Workspace；登入、MFA 或重新導航後，不假設 Workspace selection 仍正確。

> **Work Order 寫對 ≠ Codex 一定站在對的工地。**

---

## 3. Codex Cloud Workspace 不一定具有傳統 Git Remote Model

實際觀察過：local branch `work`、無 Git remote、無 local / remote-tracking `main`、`gh auth status` 無 GitHub authentication；但 Workspace snapshot 仍可包含正確 Work Order / Repository content，並可 Shell / Edit / Test / local commit。

因此 Preflight 應驗證真正需要的 Context：Work Order、Read First、target files、baseline artifacts、working tree，而不是硬要求 remote / main / gh auth。

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**

---

## 4. Workspace Snapshot 有時間邊界

若 Primary Agent 在 Codex Workspace 建立後才 commit 新的必要 Context，不假設舊 Workspace 自動取得最新 Repository state。2026-09-13 的保守可行做法是建立新 Codex task / workspace、重新選 Repository，再確認新 Work Order 存在。

可靠 refresh / sync mechanism 尚未驗證。

---

## 5. Local Commit 與 GitHub-visible Commit 是兩個 State

實測曾出現 Codex reported local SHA 與 Create PR 後 GitHub PR head SHA 不同。平台是否 rebase / recreate commit 沒有 Evidence，不推測原因。

Operational Rule：Primary Agent Review 以 GitHub-visible PR `head_sha`、Diff、Files changed、Report 為準，不以 Codex local SHA 當 GitHub Observable Identity。

> **Codex Local Commit ≠ necessarily GitHub-visible PR Commit.**

---

## 6. Create PR 是 Publication Boundary，不是 GitHub Execution Authority

Codex Workspace 內沒有可用 GitHub CLI authentication，但 Codex Product UI 可以由 Claire 觸發 Create PR，把 Workspace 成果發布成 GitHub-visible PR。

```text
Codex executes / local validates / commits
        ↓
Claire triggers Codex UI Create PR
        ↓
GitHub-visible PR
        ↓
Primary Agent Review
```

C-EXT-1 / PR #16 又補出一個重要限制：Codex 能建立 GitHub Actions workflow source，但在本次 Workspace 中不能自行使用 `gh` 或 GitHub API 觸發 `workflow_dispatch`。

因此：

> **Codex 能寫 deployment mechanism ≠ Codex 能執行 GitHub-side deployment trigger。**

同理，GitHub Actions 具有 `SUPABASE_ACCESS_TOKEN` secret，只代表 Runner 執行 workflow 時能取得 Supabase deployment credential；它不會反向賦予 Codex GitHub Actions execution authority。

> **Provider Credential ≠ GitHub Execution Credential。**

這兩層 Authorization 必須分開思考，否則很容易煮成一鍋 Auth 粥。

---

## 7. New `workflow_dispatch` 有 Default Branch Publication Gate

PR #16 新增 `.github/workflows/deploy-test-weather-orchestrator.yml`。PR 尚未 merge 時，Claire 在 Repository Actions 頁面看不到正常可手動執行的 `Deploy Test Weather Orchestrator` 入口。

Primary Agent Technical QC 通過後，PR #16 merge 至 default branch `main`；workflow 隨即成為 Actions 可見的手動 workflow，Claire 再由 UI 觸發 Run #1，成功完成：

```text
Claire Human Gate
→ GitHub workflow_dispatch
→ GitHub-hosted Runner
→ Supabase CLI 2.117.0
→ test-weather-orchestrator deployed
```

GitHub-visible Run ID：`34762954904`，conclusion `success`。

### Operational Rule

當 Work Order **新增一支尚不存在 default branch 的 manual workflow** 時，目前不要把流程寫成「Create PR 後直接 Run workflow」。已驗證的安全流程是：

```text
Codex implementation
→ Create PR
→ Primary Technical QC
→ Merge workflow to default branch
→ Claire Run workflow
→ GitHub Actions executes provider deployment
→ Primary verifies Action / Provider Evidence
```

這個 Merge 只代表 deployment mechanism 經 QC 後進入 Playground main，不代表 Experiment runtime 已 Verified。Provider / Browser Evidence 仍須另外取得。

---

## 8. Preflight 的目的不是模仿 Local Git

Preflight 真正目的：在修改前取得足夠 Evidence，確認 Codex 正在正確 Context 執行正確 Work Order。第一次錯 Workspace 證明 Preflight 必要；過度要求 remote / main / gh auth 又證明不能把錯誤 Workspace model 寫成硬規則。

Failure Is Deliverable：Codex 曾因 Preflight mismatch 停止、保持 working tree clean，直接暴露 Primary Agent 對 Workspace model 的錯誤假設。這種失敗比硬做一份錯誤成果更有價值。

---

## 9. Work Order 會反過來改善 Primary Agent 的 Specification

C-EXT-1 是第一次把跨多個 artifact 的實驗施工完整交給 Codex：Edge Function、Browser UI、GitHub Actions workflow、report / evidence preparation。

實際協作顯示，Work Order 的成本不只是 delegation overhead，也會迫使 Primary Agent 把原本存在於高 Context 對話中的「當然」顯性化，例如：

- Weather API 不可直接 DB / RPC，必須使用 Valid Place API。
- caller JWT 必須原樣往 downstream 傳。
- 不得使用 `service_role`。
- zero places 不呼叫 provider。
- per-Place provider failure 必須隔離。
- deployment 不可使用 `--no-verify-jwt`。
- Agent Report 不是 Provider Evidence。

這些規則若未來沉澱成穩定 Pattern，Work Order 應逐漸縮短成 Requirement + Exceptions + Acceptance，而不是每次重新寫一篇技術小說。

> **越能委派，Primary Agent 越需要把隱性設計原則整理成可交接的 Contract。**

這是 delegation 的真實收益之一，不只是「少寫幾行 code」。

---

## 10. Audit → Review → Fix 是 Candidate Pattern，不是宗教

Netlify Documentation Cleanup 已跑通 Audit Work Order → Primary Review → Fix Work Order → Minimal Diff。對範圍不大但值得先獨立判斷的 Repository-wide consistency work，這是可用 Pattern。

不代表所有小修改都要拆兩張 Work Order。治理重量應與風險成正比，不要因為弟弟會寫報告，就把換燈泡送交兩階段委員會。

---

## 11. GitHub Identity 與 Review Limitation

Codex Create PR 與 Primary Agent GitHub Connector 最終都使用 Claire 的 GitHub identity，因此 native `APPROVE` 會被 GitHub 視為 self-approval。Primary Agent 可用 COMMENT Review 記錄 `ACCEPTED` / `REWORK`，再依 Human / Governance Gate Merge。

如果未來不同 Agent 有獨立 GitHub identity，再重新評估 native Review semantics。

---

## 12. Current Dispatch / Deployment Model

截至 2026-09-13，目前最符合實證的完整模型：

```text
Claire + Primary Agent
        ↓
Discussion / Scope / Architecture
        ↓
Primary Agent writes Work Order and commits Context
        ↓
Claire opens new Codex task / expected Repository
        ↓
Codex context-oriented Preflight
        ↓
Implementation / local validation / local commit
        ↓
Claire triggers Codex UI Create PR
        ↓
GitHub-visible PR
        ↓
Primary Agent reviews Diff / Report / Evidence
        ↓
ACCEPTED / REWORK
        ↓
Merge when applicable
        ↓
If deployment needs manual workflow:
Claire triggers workflow_dispatch
        ↓
GitHub Actions executes with provider credential
        ↓
Primary Agent verifies GitHub / Provider Evidence
        ↓
Claire performs human/runtime acceptance when needed
```

Human Relay 理想工作量仍應很小：選對 Workspace、貼短 Dispatch Prompt、必要登入 / MFA、Create PR、按必要 Human Gate。Claire 不應重新翻譯 Requirement，也不應人工搬運 local SHA / logs 給 Primary Agent，能從 GitHub-visible state 取得的就由 Primary 自己讀。

---

## 13. Unknown / Not Verified

- Codex Cloud Workspace 內部如何建立 Repository snapshot。
- Create PR 時 local commit 為什麼可能變成不同 GitHub commit SHA。
- 是否存在可靠 Workspace refresh / sync mechanism。
- 不同 Repository / account / permission 是否都有相同 no-remote / no-`gh auth` behavior。
- Codex 未來是否能直接取得 GitHub Actions trigger authority。
- Primary Agent 未來是否能直接 Dispatch Codex，而不經 Claire Human Relay。
- 新 workflow 在其他 GitHub configuration 下的 `workflow_dispatch` visibility 是否完全相同。

以上是 Product / Environment behavior observation，不應包裝成永久平台規格。

---

## 14. Current Judgment

- **Work Order as Contract**：有效。
- **Claire as Human Relay, not Requirement Translator**：有效。
- **Codex as independent Implementation Agent**：有效。
- **GitHub PR as Observable Handoff Surface**：有效。
- **Primary Agent independent Technical QC**：有效，但 native APPROVE 受同 identity 限制。
- **Codex implementation → Human-gated GitHub Actions deployment**：已在 C-EXT-1 實際跑通。
- **Codex direct GitHub Actions trigger**：本次 execution surface 不可用，不應寫進派工假設。
- **Traditional local-Git preflight assumptions**：不適用。
- **Codex local SHA as review identity**：不可靠，以 GitHub-visible PR state 為準。

最值得保留的經驗仍是：

> **Agent 有自己的 Workspace、Credential 與 Publication Boundary。Handoff Rule 必須依可觀察 State 設計，而不是假設所有 Agent 活在同一台電腦、同一個 Git context、同一組權限裡。**

這個家現在確實有三個工作個體。一個人類，兩個不是人；GitHub 暫時兼任餐桌、聯絡簿與家庭會議紀錄。