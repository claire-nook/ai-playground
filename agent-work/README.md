# Agent Work｜Agent 工程委派區

這個目錄保存 Primary Agent（墨衡）委派給其他 Engineering Agent 的 Work Order、派工規則、協作 Experience 與可重用的 execution guidance。

它不是 Project Management System，也不是 Codex 專屬祖厝。今天執行者可能是 Codex，未來也可能是其他具有適合 Workspace / Runtime / Tooling 的 Agent。

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**
>
> **Work Order 管理工單，不管理 Worker KPI / task progress。**
>
> **Agent Report ≠ Verified Evidence.**

---

## 0. Primary Agent Start Here｜墨衡派工入口

未來 Primary Agent 只要準備建立、查找或重新理解 Work Order，先走這條 Progressive Reading Path：

1. 本 `agent-work/README.md`：理解角色、派工與 QC governance。
2. [`work-orders/index.md`](work-orders/index.md)：查歷史 Work Order Catalog 與 Work Order Governance。
3. [`templates/work-order.md`](templates/work-order.md)：**建立新 Work Order 前必讀**。這是 canonical Work Order structure，包含固定 Metadata、Sections、Report Contract 與 Completion Contract。
4. [`dispatch-handoff.md`](dispatch-handoff.md)：Work Order commit 後，依 New Task / Existing Task continuation 產生給 Claire 的短 Dispatch Handoff。
5. 只有遇到 execution-surface / provider behavior 問題時，再讀 [`experience/codex-cloud-workspace.md`](experience/codex-cloud-workspace.md) 等 Experience。

**不要從歷史 Work Order 複製一張再改。** 歷史文件保留當時 dispatch contract，結構可能屬於舊版。新 Work Order 一律從 canonical Template 建立；不適用的固定欄位 / Section 填 `None`，不要刪除。

Template 的 `Completion Contract` 是 Primary Agent 與 Implementation Agent 的固定工作準則。目前只承認兩種合法終態：

- `Cannot Complete`：停止、保留 failure evidence、回報 blocker / workspace residue / decision needed。
- `Completed`：完成 Scope 與 validation、檢查 diff、**local commit**、回報 local commit SHA、停止，等待 Claire Create PR。

除非實際 Agent execution model 出現第三種合法終態，Primary 不應在每張 Work Order 重新發明 completion procedure。

---

## 1. 何時適合開 Work Order

優先委派：多檔 implementation、interactive runtime/debug loop、正式 Specification 已清楚、獨立 investigation/review，或 Primary 需要保留 Technical QC 角色。

不必為形式開單：Primary 幾步可完成的小 Probe、Research Question 尚未想清楚、或仍需要 Claire 補 Business Requirement / Technical Decision。

文件重量應與風險成正比。Template 結構固定，不代表每個 Section 都要寫成招標文件；不適用就 `None`，適用則寫到足以施工與驗收。

---

## 2. Role Separation

### Claire

負責 Business Intent / Functional Requirement / Functional Acceptance，以及目前產品架構必要的 Human Relay / Dispatch Gate。Human Relay 不等於 Requirement Translator。

Claire 的核心能力與責任在 System Analysis / System Design / Architecture-oriented judgment，不以 Programming、Framework、DevOps Tooling 或特定開發工具操作熟練度作為角色前提。

Primary 應協助建立足以進行 Requirement、Boundary、Architecture、Risk、Acceptance 與 Evolution Decision 的 Technical Literacy，而不是把協作偷偷改造成 Programmer Training。

### Primary Agent / Architecture & Technical QC｜墨衡

負責 Research Question、Architecture / Responsibility Boundary、Technical Pattern、Security / Data Ownership、Work Order Scope、Evidence Review、Technical QC 與 Deployment Judgment。

「墨衡」是這個 Project 對 **Primary Agent / Architecture Lead role continuity** 的命名。未來接手 Project、重新讀取 Repository context 並承擔同一組責任的 Primary Agent，應理解自己是在承接這個角色，而不是假設自己擁有前一個 Session 的記憶。

因此重要理解必須沉澱進 Repository。Repository structure 應讓冷啟動的墨衡能逐步恢復 System Mental Model，而不是要求它靠聊天考古或一次吞完整個 Repository。

### Implementation Agent / PG Pool

依 Work Order 執行 implementation / experiment / investigation / review，使用自己的 Workspace / Runtime / Tooling，保留 Diff、Test、Logs、Artifacts、Failure / Unknown，並依 Work Order Completion Contract 結案。

Implementation authority 不等於 Architecture Decision authority。

---

## 3. Collaboration Orientation

Playground 同時服務 Product / Architecture 與 interest-driven technical exploration。不是每個 Research 都必須立刻轉成 Production Implementation。

建議保留：

`Discovery → Mechanism → Capability / Constraint → Alternatives → Architecture Implication → Evidence → Judgment`

有價值的 Experiment / Evidence / Experience 應沉澱進 Repository，但必須保留日期、條件、Evidence strength 與 Provider-change risk。

> **Optimize for understanding and sound judgment, not merely task completion.**

---

## 4. Naming / Documentation Expression

Claire 在討論中提出的英文名稱、欄位名稱、變數名稱、檔名或技術詞彙，預設是 semantic intent，不自動成為正式 Identifier Contract。Primary 應依 Domain、Platform、Repository convention 與 maintainability 決定 canonical naming；既有正式 Domain Term 則不得私改。

Markdown 在流程、架構關係、狀態轉換、Dependency 或資料關係用圖更清楚時，可使用 Mermaid。Diagram 服務理解，不取代 Evidence / Constraint / Conclusion，也不因 Renderer 支援就強迫每個箭頭變成一張圖。

---

## 5. Handoff Model

```text
Claire + Primary Agent
        ↓
Research / Specification / Architecture
        ↓
Canonical Work Order
        ↓
Implementation Agent Workspace
        ↓
Cannot Complete report
        │
        └──→ Primary / Claire decision

or

Implementation / Test / Validation
        ↓
Local Commit + Report SHA
        ↓
Claire Create PR / Update Branch
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
> **Provider Credential ≠ GitHub Execution Credential.**

### 5.1 Current Codex Dispatch Procedure

目前 Claire 是 Codex Product 的 Human Relay / Dispatch Gate。

1. Primary + Claire 將 Research Question / Specification / Scope 討論到足以委派。
2. Primary 先讀 `work-orders/index.md` 與 `templates/work-order.md`。
3. Primary **由 canonical Template 建立 Work Order**，填妥固定 Metadata / Sections；不適用填 `None`。不得從歷史 Work Order 複製舊結構。
4. Primary 同步在 `work-orders/index.md` Catalog 新增 `Date / Type / Work Order / Primary Objective`。
5. Primary commit Work Order、Catalog 與 Implementation Agent 必要 Context。
6. Primary 讀 `dispatch-handoff.md`，判斷 `New Task` 或 `Existing Task continuation / REWORK`，交給 Claire 可直接複製的 Dispatch Handoff。Dispatch 不重寫完整 Requirement 或 Completion Contract。
7. Claire 在 Codex Product UI 選擇預期 Repository / source baseline，建立新 Task；REWORK 則回原 Task continuation。
8. Codex 依 Work Order 做 snapshot-oriented Preflight。Git remote、local `main`、remote-tracking `main`、`origin`、`gh auth` 或 `fetch` capability 不是新 implementation 的通用必要條件。
9. Codex 依 Work Order 執行，最後只能依 Completion Contract 進入 `Cannot Complete` 或 `Completed`。
10. `Completed` 必須包含 validation、final diff check、local commit、Report 與 local commit SHA；完成後停止。
11. Claire 由 Codex Product UI Create PR；Existing Task continuation 則使用 Update Branch 發布後續 local result。
12. Primary 以 GitHub-visible `head_sha` / Diff / Files / Report 做 Technical QC，需要時記錄 `ACCEPTED` / `REWORK`。
13. Merge / deployment / runtime evidence 依 Human / Provider / Knowledge Capture Gate 處理。

完整 Dispatch Prompt 與 execution-mode 規則以 [`dispatch-handoff.md`](dispatch-handoff.md) 為準，不在 README 維護第二份易漂移的 Prompt。

### 5.2 Snapshot / Continuation Boundary

`Source baseline: main` 描述 Claire 建立新 Task / Workspace 時應從哪個 GitHub-visible state 取得 snapshot，不代表 Codex Workspace local branch 必須叫 `main`。

如果 Primary 在 Workspace 建立後才 commit 新必要 Context，不假設舊 Workspace 自動 refresh。

- **New implementation**：驗 required snapshot content 是否存在。
- **Existing PR REWORK / continuation**：必須保有待修 implementation lineage；只有 baseline snapshot 而沒有 PR implementation 時應停止，不得平行重建。

完整 Direct Evidence 與撞牆紀錄見 `dispatch-handoff.md` 與 `experience/`。

---

## 6. Canonical Work Order Contract

Canonical Source：[`templates/work-order.md`](templates/work-order.md)。

Work Order Template 固定承載：Metadata、Objective、Context、Read First、Preflight、Scope、Out of Scope、Constraints、Tasks、Required Evidence / Acceptance、Deliverables、Decision Boundary、Report Contract、Completion Contract。

這份 Template 是 Work Order 的 reading contract。未來墨衡不應靠記憶補「記得叫弟弟 commit」之類流程細節；穩定規則應寫在 Template，讓每張新 Work Order 自動繼承。

Work Order **不維護 Status**。Codex 的 Assigned / In Progress / Done、工時、KPI、完成百分比不屬 Work Order Governance。Work Order 保存 dispatch intent / contract；PR / Commit 保存 change；Experiment / Evidence 保存研究與驗證。

---

## 7. Dispatch Handoff Contract

Canonical Source：[`dispatch-handoff.md`](dispatch-handoff.md)。

Dispatch Handoff 是短通知，只負責：

- Repository
- Source baseline
- Work Order path
- Execution type
- 可直接複製給 Implementation Agent 的短 Prompt
- 本次特有 execution exception，若有

Dispatch Prompt 應要求 Implementation Agent **依 Work Order 的 Report Contract 與 Completion Contract 結案**，而不是由 Primary 每次手工重新列出完整交付程序。

---

## 8. Evidence Rule｜不要讓弟弟自己簽聯絡簿

Implementation Agent Report 只能證明「它這樣回報」。Primary 依風險檢查 Source / Diff、Test Result、Runtime Output、Provider Result、Log / Artifact、Claire Environment Evidence 或可重現步驟。

Codex Create PR 後，以 GitHub-visible PR state 為 QC identity，不以 local SHA 為準。Codex local SHA 是 Workspace completion marker，不等於 GitHub PR head SHA。

Evidence 只支持部分結論時保持 Partial / Candidate / Open。Failure 也是 Deliverable，只要保留嘗試、錯誤、已排除與 Unknown。

---

## 9. Repository Boundary

Playground Experiment Work Order 留在 `ai-playground/agent-work/`；正式 Implementation Source of Truth 留在正式 Repository。

Work Order 所需的穩定 Context 必須存在 Implementation Agent 實際可讀的 execution surface。ChatGPT Project-level file、private connector context 或 Primary 私有上下文，不得被假裝成 Codex Workspace 必然可讀的 repository file。

只有真的出現大量 cross-repo dispatch need，才評估獨立 Agent Workbench。不要因為今天有一個 Codex 就先蓋 Codex 王國，Provider 會換，家訓最好別跟著搬家。

---

## 10. Root Files / Reading Ownership

`agent-work/` 根目錄目前三份入口文件各自負責：

- `README.md`：角色、Governance、Progressive Reading Path、Dispatch / QC 高階流程。
- `dispatch-handoff.md`：New Task / Existing Task continuation 的實際派工通知與 execution-surface boundary。
- `report-language-guideline.txt`：Implementation Agent Report 的語言規則。

詳細 Work Order history / governance 在 `work-orders/index.md`；canonical structure 在 `templates/work-order.md`；Provider / Agent execution Experience 在 `experience/`。

這個分工是刻意的 Progressive Disclosure。不要再把所有細節塞回 README，也不要讓同一規則在三個地方各長一個版本。

---

## 11. Current Judgment

截至 2026-09-16，目前可成立：

- Work Order as Handoff Contract：有效。
- Work Order Catalog as Historical Navigation：已建立；不是 Task Board。
- Canonical Work Order Template：已建立；新 Work Order 應從 Template 產生。
- Completion Contract：固定承載 `Cannot Complete / Completed` 兩種合法終態；Completed 必須 local commit + report SHA。
- Claire as Human Relay, not Requirement Translator：有效。
- Codex as independent Implementation Agent：有效。
- GitHub PR as Observable Handoff Surface：有效。
- Primary Agent independent Technical QC：有效。
- Context-oriented / snapshot-oriented Preflight：必要；traditional local-Git assumptions 不適用。
- Workspace branch name ≠ Repository baseline identity。
- Project-level context ≠ Repository file。
- Codex local SHA ≠ GitHub Review identity。
- New Codex Workspace ≠ existing PR branch continuation。
- Existing Task continuation 的 local result 需 Claire Update Branch 才成為 GitHub-visible evidence。
- Primary direct GitHub patch 可作小型低風險 REWORK fallback，但不取代 interactive implementation surface。

未來流程改變時，先判斷變的是 Work Order Contract、Dispatch mechanism、Agent execution behavior 還是 Evidence / QC，再修改對應 Source of Truth。不要看到一條新規則就到處複製，文件會繁殖，人類與 AI 都會遭殃。
