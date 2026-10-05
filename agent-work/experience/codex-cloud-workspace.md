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

## 13. 2026-10-05 Revalidation｜New Codex Cloud

2026-10-05 因 Codex Cloud 產品更新，使用正式 Investigation Work Order 重新驗證 execution surface。這次不是重新設計 collaboration governance，而是確認新版弟弟相對於 2026-09 historical profile 改變了什麼。

### 13.1 Governance survived the product update

以下核心沒有因新版 Cloud 改變：

- repository-local Work Order 仍可作 executor contract。
- snapshot / context preflight、Must / Must Not / Acceptance、fail closed 仍有效。
- executor 可 inspection / validation / edit / local commit。
- local commit identity 與 GitHub-visible identity 必須分離看待。
- GitHub-visible PR 仍是 Primary Technical QC 的可靠 handoff surface。
- Agent Report 仍不等於 Verified Evidence；Primary 需獨立讀 diff / report / GitHub state。

這次更新證明先前把 governance contract 與 provider-specific publication adapter 分離是正確設計。產品換 execution surface，不需要把整套協作制度推倒重寫。

### 13.2 Published Environment is runtime configuration, not self-describing task context

Claire 可在新版 Codex Cloud 建立、設定並 Publish Cloud Environment；Task UI 可由 repository / branch 啟動工作。

但 executor 內本次直接觀察不到 Published Environment 的 display name、ID、revision、publication timestamp 或 setup provenance。它能看到的是已配置完成的 Linux runtime、toolchain、managed environment signals 與 workspace filesystem。

因此目前證據支持：

```text
Claire / Product UI
  → selects / publishes Environment
  → provider prepares runtime
  → Codex Task observes configured runtime result
```

不支持：

```text
Codex Task
  → can reliably introspect which Published Environment / revision created it
```

Environment identity 屬 UI / external evidence；runtime tool availability 屬 executor direct evidence。兩者不要混寫。

### 13.3 Single-task observation remains repository-scoped

本次 task filesystem 只觀察到 `/workspace/ai-playground` 一個 Git working tree。requested source baseline 為 `main`，executor local branch 為 `work`，`.git/FETCH_HEAD` 保存 requested GitHub `main` → starting HEAD lineage。

這再次驗證：

> **Source baseline identity ≠ workspace local branch name.**

本次沒有嘗試繞過 repository boundary，因此只能說「本 task 實際是 single-repository workspace」，不能升格成 provider 永久只支援一個 repository 的規格。

### 13.4 New publication happy path is simpler for Claire

第一階段 executor local commit 完成後，Claire 在 New Codex Cloud Web UI 直接看到 **建立草稿 PR**。

Claire 觸發後：

- GitHub 建立 open Draft PR #46。
- base 為 `main`。
- 只有指定 Investigation report。
- Claire 不需要另外進 GitHub commit 或 push。
- local commit `dcfa9cf...` 與 GitHub-visible PR head `f5fc7a2...` 不同，再次驗證 commit identity separation。

GitHub-visible 後，Primary 透過 GitHub surface 可以獨立 QC。後續 canonical PR #47 由 Primary 轉 Ready、Squash Merge，並關閉 superseded PR #46。

因此目前 iPad-first happy path 可收斂為：

```text
Primary → Work Order / QC
Claire  → Dispatch + 「建立草稿 PR」 Human Gate
Codex   → workspace implementation / validation / local commit
Cloud   → GitHub Draft PR publication
Primary → GitHub QC / Ready / Merge / cleanup
```

在一般 implementation publication 上，Claire 不再需要人工執行 Git commit、push 或 merge。

### 13.5 Major change: Cloud conversation lineage is not PR lineage

為驗證 continuation，PR #46 建立後，在**同一 New Codex Cloud conversation** 要求 Codex 做第二次最小 report update。Codex 建立第二個 local commit後，Claire UI 再次顯示 **建立草稿 PR**，而不是 historical profile 的 `Update Branch`。

Claire 再次觸發後，GitHub 沒有更新 #46，而是：

- 建立新的 Draft PR #47。
- 建立不同 head branch：`codex/set-up-investigation-environment-for-new-codex-cloud-y5dpdo`。
- PR #46 保持 open、head 不變。
- PR #47 從 `main` 提供完整較新版 report，而不是在 GitHub 上延續 #46 head。
- #47 經 Primary QC 成為 canonical artifact；#46 被關閉並保留為 Phase 1 evidence。

因此 2026-09 的：

```text
Existing Task → Update Branch → same PR
```

**不能套用到 2026-10-05 New Codex Cloud。**

目前直接 Evidence 是：

```text
Same Cloud conversation
  → local continuation
  → 「建立草稿 PR」
  → NEW branch
  → NEW Draft PR
```

> **Cloud conversation lineage ≠ GitHub PR lineage.**

Operational consequence：REWORK 可以繼續使用同一 Cloud conversation，但 publication 後 Primary 必須以 GitHub-visible state 選定新的 canonical PR，並清理 superseded PR。不要期待 UI 自動更新既有 PR。

### 13.6 What “new Codex” changed

相對於 2026-09 historical Codex Product UI，本次可保守下結論：

| Area | 2026-09 observed profile | 2026-10-05 New Codex Cloud |
| --- | --- | --- |
| Work contract | Repo-local Work Order | **Still valid** |
| Workspace | Snapshot-oriented Cloud workspace | **Still observed** |
| Local branch vs baseline | Can differ | **Still observed** |
| Local commit vs GitHub SHA | Can differ | **Still observed again** |
| New publication | Claire `Create PR` | Claire **建立草稿 PR** |
| Continuation publication | `Update Branch` → same PR | **建立草稿 PR → new PR / new branch** |
| Environment | No reusable Published Environment profile in recorded flow | **Published Environment added as product/runtime configuration surface** |
| Environment introspection | N/A | **Not exposed reliably inside executor task** |
| Claire after publication | Human relay + publication gates; GitHub steps depended on flow | **After Draft PR, Primary can take over QC / Ready / Merge / cleanup** |

最重要的產品更新不是「Codex 突然變成另一種 Agent」，而是 **Environment 與 publication surface 改變，而既有 governance 仍然有效**。

### 13.7 Evidence chain

- Work Order：`agent-work/work-orders/2026-10-05-new-codex-cloud-execution-profile-validation.md`
- Executor / Investigation report：`agent-work/reports/2026-10-05-new-codex-cloud-execution-profile-validation.md`
- PR #46：Phase 1 New Task Draft publication evidence，後續 closed / superseded。
- PR #47：same-conversation continuation 產生的新 Draft PR；Primary QC 後作 canonical artifact merge。
- Canonical merge commit：`5301cd250ff3a7a407e688989892aab3a730c0c1`

這些 evidence 描述 2026-10-05 的產品行為，不宣稱永久 provider contract。產品再改，就再撞一次牆，不靠信仰維護文件。

---

## 14. Unknown / Not Verified
- Codex Cloud Workspace 內部如何建立 Repository snapshot。
- Create PR 時 local commit 為什麼可能變成不同 GitHub commit SHA。
- 是否存在可靠的 Workspace refresh / sync mechanism，可在不建立新 task 的情況下取得 Primary 後續 commit。
- Codex Product 未來是否會提供直接可驗證的 source branch / snapshot identity metadata。

這些 Unknown 不應靠推測補齊。產品行為若改變，重新實驗即可。