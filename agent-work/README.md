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

截至 2026-09-13，一般 ChatGPT Project Primary Agent 沒有直接 Dispatch Codex 的工具，Claire 是 Human Relay / Dispatch Gate。

1. Primary + Claire 將 Research Question / Specification / Scope 討論到足以委派。
2. Primary 建立 Work Order 並 commit 必要 Context。
3. Primary 給 Claire Target Repository、Work Order path、短 Dispatch Prompt。
4. Claire 開 Codex，確認 Product UI 選到預期 Repository / Workspace。
5. Codex 做 context-oriented Preflight，不把 Git remote / local main / `gh auth` 當 repository identity 必要條件。
6. Codex implementation / test / local commit。
7. Claire 由 Codex Product UI Create PR。
8. Primary 直接 Review GitHub-visible `head_sha` / Diff / Files / Report；需要時 `ACCEPTED` / `REWORK`。
9. Merge 依適用 Human / Governance Gate 執行。
10. 若 deployment 依賴 manual GitHub Action，Claire 再觸發 `workflow_dispatch`，Primary 直接檢查 GitHub Action / Provider Evidence。
11. Runtime / Functional Evidence 需要人類環境時，由 Claire 執行；最後才依 Knowledge Capture Protocol 升格 Verified Judgment。

如果 Primary 在 Codex Workspace 建立後才 commit 新必要 Context，不假設舊 Workspace 自動 refresh；目前保守做法是開新 task / workspace。

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

2026-09-13 已實際跑過 Documentation Audit/Fix 與 C-EXT-1 multi-artifact implementation + deployment handoff。目前可成立：

- Work Order as Handoff Contract：有效。
- Claire as Human Relay, not Requirement Translator：有效。
- Codex as independent Implementation Agent：有效。
- GitHub PR as Observable Handoff Surface：有效。
- Primary Agent independent Technical QC：有效。
- Context-oriented Preflight：必要；traditional local-Git assumptions 不適用。
- Codex local SHA：不可當 GitHub Review identity。
- Codex direct GitHub Actions trigger：本次 execution surface 不可用。
- Human-gated `workflow_dispatch` → GitHub Actions → provider deployment：已實際跑通。
- Work Order 會迫使 Primary 將隱性 Architecture / Security / Acceptance Rule 顯性化，這是 delegation 的附帶價值；成熟 Pattern 應讓未來 Work Order 更短，而不是越寫越胖。

完整 Evidence / Unknown / Product-behavior boundary 見 [`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md)。