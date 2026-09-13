# Codex Cloud Workspace｜實際工作模式與 Handoff Experience

- Date: 2026-09-13
- Status: Observed / Verified within current product behavior
- Context: `claire-nook/ai-playground` real Codex Work Orders, PR handoff, deployment-gated experiment
- Related: `agent-work/README.md`
- Related PRs: `#1`, `#2`, `#16`, `#17`, `#18`, `#19`

## Purpose
這份紀錄保存把 Codex 當成 Implementation Agent 加入 Playground 後，實際觀察到的 Workspace model、Git / GitHub handoff behavior、deployment boundary、Human Relay friction 與可重用操作原則。

它不是 Codex 產品文件，也不宣稱描述永久不變的產品實作。以下內容只代表 2026-09-13 至 2026-09-14 在本次 `ai-playground` 協作中真正觀察到的行為。

> **不要把 Codex Cloud Workspace 想像成 Claire 本機上一個普通的 Git clone，也不要把「能 Create PR」誤認成「擁有 GitHub execution authority」。**

---

## 1. 三個角色真的開始協作
- **Claire / Human Relay & Functional Owner**：決定工作是否開始、在產品 UI 中選擇 Codex Workspace、轉交極短 Dispatch Instruction、觸發 Create PR，並保留必要 Human Gate。
- **Primary Agent / Architecture & Technical QC**：形成 Scope、建立 Work Order、審查 Codex Report / Diff / Evidence、決定 Accepted / Rework、Deployment Judgment，並在授權後 Merge。
- **Codex / Implementation Agent**：在自己的 Cloud Workspace 讀 Repo、執行 Shell / Search / Edit / Validation、建立 local commit，並準備 PR handoff。

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

> **Workspace branch name ≠ Repository baseline identity.**

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

> **Codex 能寫 deployment mechanism ≠ Codex 能執行 GitHub-side deployment trigger。**

GitHub Actions 具有 `SUPABASE_ACCESS_TOKEN` secret，只代表 Runner 執行 workflow 時能取得 Supabase deployment credential；它不會反向賦予 Codex GitHub Actions execution authority。

> **Provider Credential ≠ GitHub Execution Credential。**

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

Operational Rule：新 manual workflow 尚未進 default branch 時，不把流程寫成 Create PR 後直接 Run workflow。已驗證流程是 Codex implementation → Create PR → Primary QC → Merge workflow → Claire Run workflow → GitHub Actions → Provider Evidence。

---

## 8. Preflight 的目的不是模仿 Local Git
Preflight 真正目的：在修改前取得足夠 Evidence，確認 Codex 正在正確 Context 執行正確 Work Order。第一次錯 Workspace 證明 Preflight 必要；過度要求 remote / main / gh auth 又證明不能把錯誤 Workspace model 寫成硬規則。

Failure Is Deliverable：Codex 曾因 Preflight mismatch 停止、保持 working tree clean，直接暴露 Primary Agent 對 Workspace model 的錯誤假設。這種失敗比硬做一份錯誤成果更有價值。

### 8.1 Experiment Catalog REWORK：新 Workspace 無法接續既有 PR branch
2026-09-14 Experiment Catalog REWORK 的新 Workspace 只有 baseline snapshot，沒有 PR #18 implementation branch/ref/files。Codex 正確停止，沒有重做平行 implementation。先前另一個 Workspace 在相同 context 缺失下誤把修程式要求寫進 Work Order，產生只改文件的 PR #19。

> **New Workspace ≠ Existing PR continuation context.**

> **能看到 Repository baseline，不代表能看到某張尚未 merge 的 PR implementation。**

PR REWORK 前必須確認 execution surface 真的包含待修 implementation state。沒有時停止；小型且 Architecture 已定的 REWORK 可由 Primary 對既有 GitHub PR branch narrowly patch，需要 interactive build/debug 時仍應取得正確 Workspace。

### 8.2 Playground Human View：Project Context 與 Repository Context 混淆
2026-09-14 Playground Human View Work Order 第一次 Dispatch 時，Codex 在 Preflight 停止，沒有修改、commit 或 PR。這次停止本身是正確執行 Work Order，但暴露兩個 Primary specification 問題。

第一個問題：Work Order 把 `playground.md` 列為 required Read First。實際上該檔是 ChatGPT Project-level context，不存在於 `claire-nook/ai-playground` Repository。Codex 執行 `test -f playground.md` 得到 exit code 1，依「缺必要 context 就停止」規則停工。

這不是 Codex repository 缺檔，而是 Primary 把 **Project-visible context 誤寫成 Implementation Agent 可讀的 Repository context**。

> **Project-level context ≠ Repository file.**

需要 Implementation Agent 長期遵守的規則，必須沉澱到 target Repository 可讀的 `README` / Agent guidance / Work Order；不能只因 Primary 在 ChatGPT Project 看得到，就假設 Codex Workspace 也看得到。

第二個問題：同一 Preflight 回報 local branch 只有 `work`、HEAD `5415e3a`、沒有 `main` / remote / `origin`，因此表示無法「確認最新 main」。然而該 snapshot 已包含剛建立的 Human View Work Order 與兩份 Claire visual reference assets，working tree 也乾淨。這再次證明 new implementation 不應用 traditional Git topology 判斷 baseline。

對新的 default-branch-based implementation，應驗：

```text
expected Work Order exists
+ required repository guidance exists
+ reference assets exist
+ target implementation baseline exists
+ working tree is safe
= sufficient snapshot context to begin
```

而不是：

```text
local branch must be main
+ origin must exist
+ fetch must work
= allowed to begin
```

> **Source baseline 是 Workspace 建立來源的語意，不是 Workspace 內 local branch naming contract。**

這與 8.1 的 PR continuation case 必須分開：new implementation 可由完整 snapshot 開始；existing PR REWORK 若缺 PR implementation state 則必須停止。

---

## 9. Work Order 會反過來改善 Primary Agent 的 Specification
C-EXT-1 是第一次把跨多個 artifact 的實驗施工完整交給 Codex。Work Order 的成本不只是 delegation overhead，也會迫使 Primary 把高 Context 對話中的「當然」顯性化。

成熟 Pattern 應讓 Work Order 逐漸縮短成 Requirement + Exceptions + Acceptance，而不是每次重新寫一篇技術小說。

> **越能委派，Primary Agent 越需要把隱性設計原則整理成可交接的 Contract。**

---

## 10. Audit → Review → Fix 是 Candidate Pattern，不是宗教
Netlify Documentation Cleanup 已跑通 Audit Work Order → Primary Review → Fix Work Order → Minimal Diff。對範圍不大但值得先獨立判斷的 Repository-wide consistency work，這是可用 Pattern。

不代表所有小修改都要拆兩張 Work Order。治理重量應與風險成正比，不要因為弟弟會寫報告，就把換燈泡送交兩階段委員會。

---

## 11. GitHub Identity 與 Review Limitation
Codex Create PR 與 Primary Agent GitHub Connector 最終都使用 Claire 的 GitHub identity，因此 native `APPROVE` 會被 GitHub 視為 self-approval。Primary Agent 可用 COMMENT Review 記錄 `ACCEPTED` / `REWORK`，再依 Human / Governance Gate Merge。

---

## 12. Current Dispatch / Deployment Model
截至 2026-09-14，目前最符合實證的模型：

```text
Claire + Primary Agent
        ↓
Discussion / Scope / Architecture
        ↓
Primary writes Work Order + commits required repository context
        ↓
Primary gives Claire Repository + Source baseline + Work Order + copyable Dispatch Prompt
        ↓
Claire creates new Codex task from expected Repository / source baseline
        ↓
Codex snapshot-oriented Preflight
        ↓
New implementation: validate required snapshot content
PR continuation: validate actual PR implementation state
        ↓
Implementation / local validation / local commit
        ↓
Claire triggers Codex UI Create PR
        ↓
GitHub-visible PR
        ↓
Primary reviews Diff / Report / Evidence
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
Primary verifies GitHub / Provider Evidence
        ↓
Claire performs human/runtime acceptance when needed
```

Human Relay 理想工作量仍應很小：選對 Repository / source baseline、貼短 Dispatch Prompt、必要登入 / MFA、Create PR、按必要 Human Gate。Claire 不應重新翻譯 Requirement，也不應人工搬運能由 Primary 從 GitHub-visible state 取得的資訊。

---

## 13. Unknown / Not Verified
- Codex Cloud Workspace 內部如何建立 Repository snapshot。
- Create PR 時 local commit 為什麼可能變成不同 GitHub commit SHA。
- 是否存在可靠的 Workspace refresh / sync mechanism，可在不建立新 task 的情況下取得 Primary 後續 commit。
- Codex Product 未來是否會提供直接可驗證的 source branch / snapshot identity metadata。

這些 Unknown 不應靠推測補齊。產品行為若改變，重新實驗即可。