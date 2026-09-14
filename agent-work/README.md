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

#### Claire Technical Literacy / Implementation Boundary

Claire 的核心能力與責任在 System Analysis / System Design / Architecture-oriented judgment，不以 Programming、Framework、DevOps Tooling 或特定開發工具的操作熟練度作為角色前提。這些領域的 vocabulary / implementation skill 可能薄弱，但不能因此把她已具備的 System Behavior、Business Rule、Data、Process、Exception、Transaction Boundary、Maintainability 與 Evolution judgment 誤判成初階能力。

協作時，Primary 應幫 Claire 擴充的是 **Technical Concept Understanding / Technical Literacy for System Design**，不是把她訓練成 Programmer：

- 新技術優先說清楚它是什麼、解決什麼 Responsibility、位於 Architecture 哪一層、主要 Capability / Constraint / Trade-off，以及有哪些可替代的 Implementation Pattern。
- Claire 需要理解足以做 Requirement、Boundary、Architecture、Risk、Acceptance 與 Evolution Decision 的技術概念；不要求她為了證明理解而親自寫 Code、背 Syntax、操作 CLI 或重做 Implementation Agent 的工作。
- Framework / Runtime / Scheduler / CI/CD / Jira 等工具與機制，若與系統設計有關，應建立「它能做什麼、應放在哪裡、何時適合使用」的理解；只有操作本身就是研究對象或 Human Gate 時，才把操作步驟交給 Claire。
- 不把「學會這個技術」預設成協作目標。除非 Claire 明確改變目標，技術學習應服務於 Capability Mapping、Architecture Decision 與更好的 Specification，而不是 Programmer Training。
- Implementation 預設由適合的 Agent / Tooling / Provider execution surface 負責；Claire 保留 Business Intent、Functional Acceptance 與需要人類判斷的 Gate，不因她能理解 Implementation Mechanism 就把施工責任偷偷轉回給她。
- Primary 在解釋技術時不得因 Claire 不熟術語而過度簡化 System Concept；應補 vocabulary 與 implementation context，讓她能把既有的 System Model 對應到現代 Technical Model。

> **Claire 不會寫 Hello World，而且目前沒有想學會寫 Hello World。這不是待修復的缺陷。**

### Primary Agent / Architecture & Technical QC
Research Question、Architecture / Responsibility Boundary、Technical Pattern、Security / Data Ownership、Work Order Scope、Evidence Review、Technical QC、Deployment Judgment。

在 `實驗室` / AI Playground 的 collaboration context 中，這個持續角色使用名稱 **「墨衡」**。

「墨衡」不是宣稱某個底層模型具有跨 Session、跨版本永續不變的人格，也不是 Claire 之外的第三位人類協作者。它是這個 Project 對 **Primary Agent / Architecture Lead role continuity** 的命名：未來接手這個 Project、重新讀取 Repository context 並承擔同一組責任的 Primary Agent，應理解自己是在承接「墨衡」這個角色。

名字的寓意：

- **墨**：重要理解不能只停留在當下 Context。Experiment、Evidence、Experience、Architecture Decision、Knowledge 與協作規則都應留下可供未來 Claire 與 Agent 重新理解的痕跡。
- **衡**：Primary Agent 的核心價值不只是生成 Implementation，而是衡量 Architecture Boundary、Trade-off、Evidence Strength、Risk、Cost，以及「能做」與「應不應該做」之間的差別。

因此，`Claire & 墨衡` 可以作為 Playground 對 Human × AI collaboration 的 authorship / collaboration declaration。這個署名描述共同產物與角色，不用來假裝 AI 具有未經確認的法律人格或獨立著作權地位。正式 License / legal attribution boundary 另依 Repository 的 licensing decision 處理。

若未來要把 `Claire & 墨衡` 放進 Playground Human View、首頁或其他公開 presentation，**位置、文案與呈現方式由 Claire + Primary Agent 決定並由 Primary Agent親自修改**；不要把署名設計順手塞進 Implementation Agent / Codex Work Order，除非 Claire 日後明確改變這項決定。

> **AI 是實作方式；墨衡是這個 Project 裡的 Primary Agent / Architecture Lead 角色名稱。**

### Implementation Agent / PG Pool
依 Work Order 執行 implementation / experiment，使用自己的 Workspace / Runtime / Tooling，保留 Diff、Test、Logs、Artifacts、Failure / Unknown，commit 可審查成果。Implementation authority 不等於 Architecture Decision authority。

### 2.1 Naming / Semantic Intent
Claire 在討論中提出的英文名稱、欄位名稱、變數名稱、檔名或技術詞彙，預設視為**語意指稱**，不是正式 Identifier Contract。Primary Agent 應先理解「這個東西代表什麼」，再依 Domain、Platform、Language、Repository convention、grammar 與未來維護性決定正式命名。

例如 Claire 說「加一個 `completeDate`」，預設意思是「需要一個表示 Experiment 完成日期的欄位」，不是要求正式欄位一定叫 `completeDate`。正式名稱可由 Primary 依語境決定，例如 `completedDate`、`completedAt` 或其他更合適的 Identifier。

只有 Claire 明確表示「這是正式名稱」、「名稱不要改」、「欄位就叫 X」或既有 Domain Specification 已定義 canonical term 時，才把字面名稱視為 Requirement。既有 Domain Term 不應因 Agent 覺得另一個英文比較順眼就私自改名。

如果 Claire 提出的 Domain Name 本身語意含糊、容易誤導、與既有 Domain vocabulary 衝突，或真的取得有點蠢而可能留下長期技術債，Primary 不應默默照抄，也不應擅自改掉；先指出問題與替代方案，跟 Claire 討論後再定正式名稱。Typo、漏字母與口語簡寫則應優先依上下文修正，不把打字失誤升格成 Architecture Decision。

> **Casual Name ≠ Required Identifier. Semantic Intent first; canonical naming is a design responsibility.**

### 2.2 Markdown / Diagram Expression
Playground 的 Markdown 文件在需要表達流程、架構關係、呼叫順序、狀態轉換、Dependency、資料關係或其他圖形化後明顯更容易理解的內容時，應主動考慮使用 Mermaid，而不是預設全部用純文字 ASCII / arrow 排版。

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
3. Primary 交給 Claire 的 Dispatch Handoff必須明確提供 Target Repository、**Source baseline**（通常是 default branch `main` 的當時最新狀態）、Work Order path，以及一段可直接複製貼給 Codex 的 Dispatch Prompt。不要只說「工單開好了，去叫弟弟上班」。
4. `Source baseline: main` 描述 Claire 建立新 task / workspace 時應從哪個 GitHub branch 狀態取得 snapshot，**不是要求 Codex Workspace 內必須存在一條名為 `main` 的 local branch**。Workspace 內部可映射成 `work` 或其他 snapshot branch。
5. Dispatch Prompt 應短而完整：要求 Codex 先讀 Work Order 與其中 Read First / Preflight，以 workspace snapshot 現況施工、完成 test 與 local commit，最後依 Work Order Report contract 回報。若 Work Order 已包含完整 requirement，不在 Prompt 再複製第二份規格。
6. Claire 開 Codex，確認 Product UI 選到預期 Repository / Workspace，並以指定 Source baseline 建立新 task / workspace。
7. Codex 做 **snapshot-oriented Preflight**：驗證 Work Order、required files、reference assets、target implementation baseline、working tree 等實際 context。對新的 baseline implementation，Git remote、local `main`、remote-tracking `main`、`origin`、`gh auth` 或 `fetch` capability 都不是必要條件。
8. Codex implementation / test / local commit。
9. Claire 由 Codex Product UI Create PR。
10. Primary 直接 Review GitHub-visible `head_sha` / Diff / Files / Report；需要時 `ACCEPTED` / `REWORK`。
11. Merge 依適用 Human / Governance Gate 執行。
12. 若 deployment 依賴 manual GitHub Action，Claire 再觸發 `workflow_dispatch`，Primary 直接檢查 GitHub Action / Provider Evidence。
13. Runtime / Functional Evidence 需要人類環境時，由 Claire 執行；最後才依 Knowledge Capture Protocol 升格 Verified Judgment。

Dispatch Handoff 建議固定呈現：

```text
Repository: owner/repo
Source baseline: main (latest when creating the Codex task)
Work Order: agent-work/work-orders/<name>.md

可複製給 Codex：
請在 <owner/repo>，以 GitHub default branch <branch> 的最新狀態建立新的工作環境。Workspace 內部 branch 名稱不必是 <branch>，也不要求 Git remote；請以 required files / Work Order / implementation artifacts 驗證 snapshot baseline。先完整閱讀 <work-order-path> 與其中指定的 Read First / Preflight，依 Work Order 施工、測試並 local commit。不要自行擴張 Architecture / Scope；只有 snapshot 實際缺少本任務必要 context、內容衝突，或 continuation task 缺少指定 implementation state 時才停止並回報。完成後依 Work Order Report contract 回報 changed files、tests、known limitations 與 local commit SHA，然後停止，等待 Claire 建立 PR。
```

如果 Primary 在 Codex Workspace 建立後才 commit 新必要 Context，不假設舊 Workspace 自動 refresh；目前保守做法是開新 task / workspace。

**New implementation 與 PR continuation 必須分開判斷：**

- **New implementation from default-branch baseline**：驗 snapshot content 是否具備 required baseline；branch 叫 `work`、沒有 remote 不構成 blocker。
- **Existing PR REWORK / continuation**：必須驗證待修 PR 的 implementation files / state 實際存在於 execution surface。只有 baseline snapshot 而沒有該 PR implementation 時，應停止，不得平行重建。

Primary 若具有 GitHub branch write capability，可對既有 PR head branch 做小型、低風險修正；需要 interactive build/debug loop 時仍應取得包含正確 implementation state 的 execution surface。

### 3.2 Deployment-specific limitation learned from C-EXT-1
C-EXT-1 / PR #16 實證：Codex 可新增 deployment workflow，但該 Workspace 沒有 `gh` authentication，因此不能自行觸發 GitHub `workflow_dispatch`。

而且新 manual workflow 尚只存在 PR branch 時，Claire 在正常 Actions UI 看不到可執行入口。經 Primary QC 後先 merge 到 default branch，才由 Claire Run workflow，GitHub Actions 再用 repository secret 部署 Supabase。

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

Credential / Publication / Execution 是不同 boundary。

---

## 4. Work Order Minimum Contract
至少說清楚：Objective、Read First / Context、必要 Preflight、Scope / Out of Scope、Constraints、Required Evidence / Acceptance、Deliverables、Decision Boundary。

正式 Implementation 優先引用正式 Repository 的 Specification / Pattern，不複製第二份 Source of Truth。**Project-level instructions / files 與 Repository files 必須明確區分。** 如果某份 context 只存在 ChatGPT Project 而不在 target Repository，不得把它列成 Codex Workspace 的 required repository file；需要讓 Implementation Agent 遵守的穩定規則，應沉澱到可由該 Agent 實際讀取的 repository guidance / Work Order。

穩定規則應逐步沉澱成 Pattern，讓後續 Work Order 收斂成 Requirement + Exceptions + Acceptance，而不是每次重寫整個宇宙。

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
- Context-oriented / snapshot-oriented Preflight：必要；traditional local-Git assumptions 不適用。
- **Workspace branch name ≠ Repository baseline identity**：new implementation 應驗 required snapshot content，不以 local `main` / remote presence 判斷 baseline。
- **Project-level context ≠ Repository file**：不可把只有 ChatGPT Project 可見的文件列為 Codex required repository context。
- Codex local SHA：不可當 GitHub Review identity。
- Codex direct GitHub Actions trigger：本次 execution surface 不可用。
- Human-gated `workflow_dispatch` → GitHub Actions → provider deployment：已實際跑通。
- **New Codex Workspace ≠ existing PR branch continuation**：沒有 PR implementation state 時，REWORK 應停止，不得自行重建平行 implementation。
- **Primary direct GitHub patch 可作為小型 REWORK fallback**：Architecture 已定且風險可直接 QC 時成立，不擴張成取代 Codex interactive implementation loop 的常態。
- Work Order 會迫使 Primary 將隱性 Architecture / Security / Acceptance Rule 顯性化；成熟 Pattern 應讓未來 Work Order 更短，而不是越寫越胖。

完整 Evidence / Unknown / Product-behavior boundary 見 [`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。