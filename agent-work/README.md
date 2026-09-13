# Agent Work｜Agent 工程委派區

這個目錄保存需要交給其他 Engineering Agent 執行的 Work Order、委派工作的共同規則，以及實際協作後形成的 Experience。它不是新的 Project Management System，也不是 Codex 專屬祖厝。今天執行者可能是 Codex，未來也可能是其他具有適合 Workspace / Runtime / Tooling 的 Agent。

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**

Primary Agent 負責 Research Question、Architecture、Experiment Design、Technical Judgment 與 QC；Implementation Agent 可負責 Workspace / Shell / Runtime / Build / Test Loop。執行 Agent 的 Report 是 Observation Source，不會因為寫了「成功」就自動成為 Verified Evidence。

完整 Codex Experience：[`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。

---

## 1. 何時適合開 Work Order

優先委派：多檔 implementation、interactive runtime/debug loop、正式 Specification 已清楚、或 Primary 需要保留獨立 QC 角色。

不必為形式開單：Primary 幾步可完成的小 Probe、Research Question 尚未想清楚、或仍需要 Claire 補 Business Requirement / Technical Decision。

文件重量應與風險成正比。六段能講清楚，就不要硬長成六十頁招標文件。

---

## 2. Role Separation

### Claire

Business Intent / Functional Requirement / Functional Acceptance，以及目前產品架構必要的 Human Relay / Dispatch Gate。Human Relay 不等於 Requirement Translator。

### Primary Agent / Architecture & Technical QC

Research Question、Architecture / Responsibility Boundary、Technical Pattern、Security / Data Ownership、Work Order Scope、Evidence Review、Technical QC、Deployment Judgment。

### Implementation Agent / PG Pool

依 Work Order 執行 implementation / experiment，使用自己的 Workspace / Runtime / Tooling，保留 Diff、Test、Logs、Artifacts、Failure / Unknown，commit 可審查成果。Implementation authority 不等於 Architecture Decision authority。

### 2.1 Naming / Semantic Intent

Claire 在討論中提出的英文名稱、欄位名稱、變數名稱、檔名或技術詞彙，預設視為**語意指稱**，不是正式 Identifier Contract。Primary Agent 應先理解「這個東西代表什麼」，再依 Domain、Platform、Language、Repository convention、grammar 與未來維護性決定正式命名。

例如 Claire 說「加一個 `completeDate`」，預設意思是「需要一個表示 Experiment 完成日期的欄位」，不是要求正式欄位一定叫 `completeDate`。正式名稱可由 Primary 依語境決定，例如 `completedDate`、`completedAt` 或其他更合適的 Identifier。

只有 Claire 明確表示「這是正式名稱」、「名稱不要改」、「欄位就叫 X」或既有 Domain Specification 已定義 canonical term 時，才把字面名稱視為 Requirement。既有 Domain Term 不應因 Agent 覺得另一個英文比較順眼就私自改名。

如果 Claire 提出的 **Domain Name 本身語意含糊、容易誤導、與既有 Domain vocabulary 衝突，或真的取得有點蠢而可能留下長期技術債**，Primary 不應默默照抄，也不應擅自改掉；先指出問題與替代方案，跟 Claire 討論後再定正式名稱。Typo、漏字母與口語簡寫則應優先依上下文修正，不把打字失誤升格成 Architecture Decision。

> **Casual Name ≠ Required Identifier. Semantic Intent first; canonical naming is a design responsibility.**

### 2.2 Markdown / Diagram Expression

Playground 的 Markdown 文件在需要表達 **流程、架構關係、呼叫順序、狀態轉換、Dependency、資料關係或其他圖形化後明顯更容易理解的內容** 時，應主動考慮使用 Mermaid，而不是預設全部用純文字 ASCII / arrow 排版。

原則：

- Mermaid 是 Markdown Record 內的 text source，可被 Git diff、AI 閱讀與 Browser Renderer 呈現；不需要另外維護 PNG / SVG / drawio 才能保存基本技術圖。
- Flowchart、Sequence Diagram、State Diagram、ER Diagram、Mindmap 等可依語意選擇；圖型服務於理解，不為了展示 Renderer 能力而畫圖。
- 簡單的一行關係，例如 `Catalog → Gallery → Reader`，純文字更清楚時就維持純文字；不要看到箭頭就召喚 Mermaid。
- Diagram 不能取代 Evidence / Constraint / Conclusion 正文；圖是 Human View，不是新的 Source of Truth。
- 若 target Markdown Renderer 不確定支援 Mermaid，先確認 rendering capability；不要默默產生只有 source code、Claire 卻看不到圖的文件。
- Playground Human View Reader 已把 Mermaid 列為正式 rendering capability；未來撰寫 Experiment Record / Knowledge 文件時，可把 Mermaid 視為可用表達工具。
- 不因 Mermaid 已支援就順便導入數學 rendering dependency；LaTeX / KaTeX / MathJax 只有出現真實需求時再研究。

> **Diagram when it improves understanding; text when text is clearer. Mermaid is a documentation tool, not decoration.**

---

## 3. Handoff Model

```text
Claire + Primary Agent
        ↓
Research / Specification / Architecture
        ↓
Work Order
        ↓
Implementation Agent Workspace
        ↓
Code / Test / Evidence / Report
        ↓
GitHub-visible PR
        ↓
Primary Agent Technical QC
        ↓
Accepted / Rework / Deployment Candidate
        ↓
Human / Provider Gate when required
```

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**
>
> **Agent Report ≠ Verified Evidence.**
>
> **Provider Credential ≠ GitHub Execution Credential.**

### 3.1 Current Codex Dispatch Procedure

截至 2026-09-14，一般 ChatGPT Project Primary Agent 沒有直接 Dispatch Codex 的工具，Claire 是 Human Relay / Dispatch Gate。

1. Primary + Claire 將 Research Question / Specification / Scope 討論到足以委派。
2. Primary 建立 Work Order 並 commit 必要 Context。
3. Primary 交給 Claire 的 Dispatch Handoff **必須明確提供 Target Repository、Base Branch / expected starting branch、Work Order path，以及一段可直接複製貼給 Codex 的 Dispatch Prompt**。不要只說「工單開好了，去叫弟弟上班」，讓 Claire 再替 Agent 猜 repository / branch / 任務入口。
4. Dispatch Prompt 應短而完整：要求 Codex 先讀 Work Order 與其中 Read First / Preflight，以 repository 現況施工、完成 test 與 local commit，最後依 Work Order Report contract 回報。若 Work Order 已經包含完整 requirement，不要在 Prompt 再複製一份規格造成雙重 Source of Truth。
5. Claire 開 Codex，確認 Product UI 選到預期 Repository / Workspace；若 Primary 指定的是 default branch baseline，明確以該 branch 最新狀態建立新 task / workspace。
6. Codex 做 context-oriented Preflight，不把 Git remote / local main / `gh auth` 當 repository identity 必要條件。
7. Codex implementation / test / local commit。
8. Claire 由 Codex Product UI Create PR。
9. Primary 直接 Review GitHub-visible `head_sha` / Diff / Files / Report；需要時 `ACCEPTED` / `REWORK`。
10. Merge 依適用 Human / Governance Gate 執行。
11. 若 deployment 依賴 manual GitHub Action，Claire 再觸發 `workflow_dispatch`，Primary 直接檢查 GitHub Action / Provider Evidence。
12. Runtime / Functional Evidence 需要人類環境時，由 Claire 執行；最後才依 Knowledge Capture Protocol 升格 Verified Judgment。

Dispatch Handoff 建議固定呈現：

```text
Repository: owner/repo
Base branch: main
Work Order: agent-work/work-orders/<name>.md

可複製給 Codex：
請在 <owner/repo>，以 <branch> 最新狀態建立新的工作環境。先完整閱讀 <work-order-path> 與其中指定的 Read First / Preflight，依 Work Order 施工、測試並 local commit。不要自行擴張 Architecture / Scope；遇到缺少必要 context 或與 Work Order 衝突時停止並回報。完成後依 Work Order 的 Report contract 回報 changed files、tests、known limitations 與 local commit SHA，然後停止，等待 Claire 建立 PR。
```

如果 Primary 在 Codex Workspace 建立後才 commit 新必要 Context，不假設舊 Workspace 自動 refresh；目前保守做法是開新 task / workspace。

**Rework 例外：**新 Workspace 也不保證能接續既有 PR implementation branch。2026-09-14 Experiment Catalog REWORK 實際觀察到新 Workspace 只有 snapshot branch `work`、沒有 Git remote、沒有 PR #18 branch/ref，甚至缺少該 PR 才新增的 implementation files，因此無法在「不重做平行 implementation」的前提下修改既有 PR。遇到這種情況，Codex 應停止並回報，不要自行建立新的平行 PR。Primary 若具有 GitHub branch write capability，可直接對既有 PR head branch 做小型、低風險修正；否則應重新建立可取得正確 implementation context 的 execution surface。

### 3.2 Deployment-specific limitation learned from C-EXT-1

C-EXT-1 / PR #16 實證：Codex 可新增 deployment workflow，但該 Workspace 沒有 `gh` authentication，因此不能自行觸發 GitHub `workflow_dispatch`。

而且新 manual workflow 尚只存在 PR branch 時，Claire 在正常 Actions UI 看不到可執行入口。經 Primary QC 後先 merge 到 default branch，才由 Claire Run workflow，GitHub Actions 再用 repository secret 部署 Supabase。

因此目前已驗證的 deployment handoff 是：

```text
Codex writes code + workflow
→ Claire Create PR
→ Primary QC
→ Merge workflow to default branch
→ Claire Run workflow
→ GitHub Actions + provider secret
→ Provider deployment
→ Primary verifies provider evidence
```

不要在 Work Order 裡假設「Codex 有 Supabase deployment credential」或「Codex 能 Create PR」就等於它能操作 GitHub Actions。Credential / Publication / Execution 是不同 boundary。

---

## 4. Work Order Minimum Contract

至少說清楚：Objective、Read First / Context、必要 Preflight、Scope / Out of Scope、Constraints、Required Evidence / Acceptance、Deliverables、Decision Boundary。

正式 Implementation 優先引用正式 Repository 的 Specification / Pattern，不複製第二份 Source of Truth。穩定規則應逐步沉澱成 Pattern，讓後續 Work Order 收斂成 Requirement + Exceptions + Acceptance，而不是每次重寫整個宇宙。

---

## 5. Evidence Rule｜不要讓弟弟自己簽聯絡簿

Implementation Agent Report 只能證明「它這樣回報」。Primary 依風險檢查 Source / Diff、Test Result、Runtime Output、Provider Result、Log / Artifact、Claire Environment Evidence 或可重現步驟。

Codex Create PR 後，以 GitHub-visible PR state 為 QC identity，不以 local SHA 為準。目前 Codex Create PR 與 Primary GitHub Connector 使用 Claire 同一 GitHub identity，native `APPROVE` 可能被視為 self-approval；可用 COMMENT Review 記錄 `ACCEPTED` / `REWORK`。

Evidence 只支持部分結論時保持 Partial / Candidate / Open。Failure 也是 Deliverable，只要保留嘗試、錯誤、已排除與 Unknown。

---

## 6. Repository Boundary

Playground Experiment Work Order 留在 `ai-playground/agent-work/`；正式 Implementation Source of Truth 留在正式 Repository。只有真的出現大量 cross-repo dispatch need，才評估獨立 Agent Workbench。不要因為今天有一個 Codex 就先蓋 Codex 王國，Provider 會換，家訓最好別跟著搬家。

---

## 7. Current Judgment

截至 2026-09-14，已實際跑過 Documentation Audit/Fix、C-EXT-1 multi-artifact implementation + deployment handoff，以及 Experiment Catalog 的多輪 PR / REWORK handoff。目前可成立：

- Work Order as Handoff Contract：有效。
- Claire as Human Relay, not Requirement Translator：有效。
- Codex as independent Implementation Agent：有效。
- GitHub PR as Observable Handoff Surface：有效。
- Primary Agent independent Technical QC：有效。
- Context-oriented Preflight：必要；traditional local-Git assumptions 不適用。
- Codex local SHA：不可當 GitHub Review identity。
- Codex direct GitHub Actions trigger：本次 execution surface 不可用。
- Human-gated `workflow_dispatch` → GitHub Actions → provider deployment：已實際跑通。
- **New Codex Workspace ≠ existing PR branch continuation**：已實際觀察；沒有 PR branch/ref/remote 時，REWORK 應停止，不得假裝能接續或自行重建平行 implementation。
- **Primary direct GitHub patch 可作為小型 REWORK fallback**：當既有 PR branch 可由 Primary GitHub connector 寫入，且修正範圍小、Architecture 已定、風險可直接 QC 時成立；不要把它擴張成取代 Codex interactive implementation loop 的常態。
- Work Order 會迫使 Primary 將隱性 Architecture / Security / Acceptance Rule 顯性化，這是 delegation 的附帶價值；成熟 Pattern 應讓未來 Work Order 更短，而不是越寫越胖。

完整 Evidence / Unknown / Product-behavior boundary 見 [`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。