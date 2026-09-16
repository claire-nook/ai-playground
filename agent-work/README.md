# Agent Work｜Agent 工程委派區

這個目錄保存 Primary Agent（墨衡）委派給其他 Engineering Agent 的 Work Order、派工規則、協作 Experience 與可重用 execution guidance。

它不是 Project Management System，也不是 Codex 專屬祖厝。Executor 可以是 Codex，也可以是其他具有適合 Workspace / Runtime / Tooling 的 Agent。

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**
>
> **Work Order 管理工單，不管理 Worker KPI / task progress。**
>
> **Agent Report ≠ Verified Evidence.**
>
> **Reduce ceremony, not boundaries.**
>
> **Governance weight should scale with risk.**

---

## 0. Primary Agent Start Here｜墨衡派工入口

建立、查找或重新理解 Work Order，走 Progressive Reading Path：

1. 本 `agent-work/README.md`：角色、派工與 QC governance。
2. [`work-orders/index.md`](work-orders/index.md)：歷史 Work Order Catalog / Governance。
3. [`templates/work-order.md`](templates/work-order.md)：建立新 Work Order 前必讀的 canonical contract。
4. [`dispatch-handoff.md`](dispatch-handoff.md)：Work Order commit 後的短 Dispatch Handoff、Task mode 與 Execution Profile。
5. 只有遇到 execution-surface / provider behavior 問題時，再讀 `experience/`。若 Primary 需要理解 Implementation Agent 的 Context / Workspace model、能力與權限邊界、self-review limitation、Agent-to-Agent asynchronous collaboration，或正在調整 Agent Work governance，按需閱讀 [`experience/codex-implementation-agent-self-introduction.md`](experience/codex-implementation-agent-self-introduction.md)。

不要從歷史 Work Order 複製舊格式。新 Work Order 一律從 canonical Template 建立；歷史文件保留當時 dispatch contract，不 retroactive rewrite。

Completion 只承認兩個 executor 終態：

- `Cannot Complete`：fail closed、保留 failure evidence、回報 blocker / residue / decision needed。
- `Completed`：表示 **Executor Completion**；不自動等於 Technical QC、Deployment、Human Acceptance、Provider Verification 或 Experiment Verified。

外部驗證留在 `External Gates`，不要為了描述「executor 做完、實機還沒驗」發明模糊的 Partially Completed。

---

## 1. 何時適合開 Work Order

優先委派：多檔 implementation、interactive runtime/debug loop、正式 Specification 已清楚、獨立 investigation/review，或 Primary 需要保留 Technical QC 角色。

不必為形式開單：Primary 幾步可安全完成的小 Probe / typo / link fix、Research Question 尚未想清楚、或仍需要 Claire 補 Business Requirement / Technical Decision。

**Micro Work Order 不是要求所有小事都派工。** 它只處理「已決定值得委派、但風險低且 deterministic」的工作。

Canonical Template 只有一份，以 `Work Weight` 控制密度：

- `Micro`：最小充分 contract。
- `Standard`：一般 implementation / investigation / documentation。
- `High-Risk`：Auth、Security、Migration、Transaction、Provider integration、Production、Architecture experiment、Adversarial review 等需要更完整 boundary / evidence 的工作。

不要養三份 Template。文件會 drift，然後大家開始研究哪一份 `final-v3-really-final` 才是真的。

---

## 2. Role Separation

### Claire

負責 Business Intent / Functional Requirement / Functional Acceptance，以及必要的 Human Relay / Dispatch Gate。Human Relay 不等於 Requirement Translator。

Claire 的核心責任在 System Analysis / System Design / Architecture-oriented judgment，不以 Programming、Framework、DevOps Tooling 熟練度作角色前提。

### Primary Agent / Architecture & Technical QC｜墨衡

負責 Research Question、Architecture / Responsibility Boundary、Technical Pattern、Security / Data Ownership、Work Order Scope、Evidence Review、Technical QC 與 Deployment Judgment。

「墨衡」代表 Primary Agent / Architecture Lead role continuity。接手者應透過 Repository 恢復 System Mental Model，不假設自己擁有前一個 Session 的記憶。

### Implementation Agent / PG Pool

依 Work Order 執行 implementation / experiment / investigation / review，使用自己的 Workspace / Runtime / Tooling，保留 Diff、Test、Logs、Artifacts、Failure / Unknown。

**Implementation authority ≠ Architecture Decision authority.**

Executor 可以指出 Work Order 問題、提出更安全替代方案、回報 scope 外 blocker；但不能因為「順手」就把 Candidate 直接蓋成 Platform Decision。

---

## 3. Collaboration Orientation

Playground 同時服務 Product / Architecture 與 interest-driven technical exploration。不是每個 Research 都必須立刻轉成 Production Implementation。

建議保留：

`Discovery → Mechanism → Capability / Constraint → Alternatives → Architecture Implication → Evidence → Judgment`

有價值的 Experiment / Evidence / Experience 應沉澱進 Repository，並保留日期、條件、Evidence strength 與 Provider-change risk。

> **Optimize for understanding and sound judgment, not merely task completion.**

---

## 4. Naming / Documentation Expression

Claire 在討論中提出的英文名稱、欄位名稱、變數名稱、檔名或技術詞彙，預設是 semantic intent，不自動成為正式 Identifier Contract。Primary 依 Domain、Platform、Repository convention 與 maintainability 決定 canonical naming；既有正式 Domain Term 不得私改。

Markdown 在流程、架構關係、狀態轉換、Dependency 或資料關係用圖更清楚時可使用 Mermaid。Diagram 服務理解，不取代 Evidence / Constraint / Conclusion。

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
Cannot Complete ──→ Primary / Claire decision

or

Implementation / Test / Validation
        ↓
Executor Completion
        ↓
Traceable Commit + Publication Adapter
        ↓
GitHub-visible Handoff Surface
        ↓
Primary Agent Technical QC
        ↓
Accepted / Rework / Deployment Candidate
        ↓
External Gates when required
        ↓
Verified / Accepted state at the appropriate layer
```

> **Prompt Access ≠ Tool Access ≠ Workspace Access.**
>
> **Provider Credential ≠ GitHub Execution Credential.**

### 5.1 Stable Governance vs Execution Adapter

穩定治理要求：

1. Research / Requirement / Scope 已足以委派。
2. Repository-local Work Order 可被 executor 讀取。
3. Source baseline / required context 可重現。
4. Executor 依 `Must / Must Not / Acceptance / Executor Judgment` 工作。
5. Missing context / unsafe condition 時 fail closed。
6. Completed 時有 validation、final diff check、traceable commit / change identity。
7. 需要 Technical QC 的 change 最終有 GitHub-visible handoff surface。
8. Primary 以 GitHub-visible state 做 QC。
9. Human / Provider / Environment Gate 依風險保留。

Publication mechanics 由 `Execution Profile` 決定：

- Codex Product UI：通常 local commit → report → stop → Claire Create PR；continuation 由 Claire Update Branch。
- CLI / GitHub-integrated Agent：若已授權，可由 Agent commit / publish / create PR。
- Human-supervised Agent：Agent 完成 change，由 human push / PR。

**Governance Contract 保持穩定；publication mechanics 隨 execution surface 演進。**

完整 adapter 與 Dispatch Prompt 見 [`dispatch-handoff.md`](dispatch-handoff.md)。

### 5.2 Snapshot / Continuation Boundary

`Source baseline: main` 描述 dispatch 時要求的 GitHub-visible snapshot，不代表 workspace local branch 必須叫 `main`。

對 Codex Product UI，目前沒有直接證據證明 Primary 後來寫入 GitHub 的 Work Order / repo file / PR comment 會自動同步進 Existing Task workspace，因此保守視為 task-creation snapshot。

- New implementation：驗 required snapshot content。
- Existing PR REWORK：保留原 implementation lineage；若 required context 無法可靠同步，建立 GitHub-visible checkpoint 後開 New Task，不平行重建。

其他 runtime 依自己的 Direct Evidence 判斷，不把 Codex Cloud limitation 當所有 Agent 的限制。

---

## 6. Canonical Work Order Contract

Canonical Source：[`templates/work-order.md`](templates/work-order.md)。

Work Order 的主要 reading contract：

`Metadata → Objective → Why / Context → Read First → Context Preflight → Must → Must Not → Suggested Method → Acceptance → Executor Judgment → External Gates → Deliverables → Report Contract → Completion Contract`

這個結構刻意把：

- contract requirement (`Must`)
- prohibition / boundary (`Must Not`)
- 可驗收結果 (`Acceptance`)
- 建議方法 (`Suggested Method`)
- 刻意授權的低風險裁量 (`Executor Judgment`)
- executor 無法自行完成的驗證 (`External Gates`)

分開，避免背景文字與 implementation suggestion 淹沒真正 contract。

Work Order 不維護 `Status`。Assigned / In Progress / Done、工時、KPI、百分比不屬 Work Order Governance。Work Order 保存 dispatch intent；PR / Commit 保存 change；Experiment / Evidence 保存研究與驗證。

---

## 7. Report Contract

Report 是 execution handoff，不是第二套 Knowledge Base。

Report weight 依 `Type / Work Weight`：

- Implementation / Documentation：短摘要、changed files、validation、limitations、commit / publication、External Gates。
- Investigation：Evidence、alternatives、unknown、reproduction、candidate conclusion。
- Experiment：完整 execution evidence，但 durable truth 仍進 Experiment Record / Evidence。
- Review：findings、impact、evidence、required rework / recommendation。
- Cannot Complete：blocker、attempt、failure evidence、residue、decision needed。

避免 Source 說一次、commit 說一次、PR 說一次、Report 又寫成長篇小說。未來 Agent 也是要讀這些東西的，請不要報復它。

---

## 8. Dispatch Handoff Contract

Canonical Source：[`dispatch-handoff.md`](dispatch-handoff.md)。

Dispatch Handoff 是短通知，只負責 Repository、Source baseline、Work Order path、Execution type、Execution Profile、可複製 Prompt 與本次特殊 exception。

Requirement 與 Completion Source of Truth 是 Work Order，不在 Dispatch 重抄第二份。

---

## 9. Evidence Rule｜不要讓弟弟自己簽聯絡簿

Implementation Agent Report 只能證明「它這樣回報」。Primary 依風險檢查 Source / Diff、Test Result、Runtime Output、Provider Result、Log / Artifact、Claire Environment Evidence 或 reproduction steps。

Primary Technical QC 以 GitHub-visible state 為 review identity；workspace/local SHA 可以是 executor completion marker，但不假設等於 PR head SHA。

Evidence 只支持部分結論時保持 Partial / Candidate / Open。Failure 也是 Deliverable，只要保留 attempt、error、已排除與 Unknown。

認知角色分離 / execution context 分離 / review round 分離，不自動等於合規上的 independent principal 或 four-eyes approval。若未來需要 formal approval authority，identity / credential / approval model 必須另行設計。

---

## 10. Repository Boundary

Playground Experiment Work Order 留在 `ai-playground/agent-work/`；正式 Implementation Source of Truth 留在正式 Repository。

Work Order 所需穩定 Context 必須存在 executor 實際可讀的 execution surface。ChatGPT Project-level file、private connector context 或 Primary 私有上下文，不得被假裝成 workspace 必然可讀的 repository file。

只有真的出現大量 cross-repo dispatch need，才評估獨立 Agent Workbench。不要因為今天有一個 Codex 就先蓋 Codex 王國，Provider 會換，家訓最好別跟著搬家。

---

## 11. Root Files / Reading Ownership

- `README.md`：角色、Governance、Progressive Reading Path、Dispatch / QC 高階模型。
- `templates/work-order.md`：canonical Work Order contract、Weight、Report / Completion semantics。
- `dispatch-handoff.md`：Task mode、Execution Profile、publication adapter、snapshot boundary。
- `work-orders/index.md`：Work Order Catalog / historical navigation。
- `report-language-guideline.txt`：Report 語言規則。
- `experience/`：Provider / Agent execution Direct Experience 與 workflow design input。
- `experience/codex-implementation-agent-self-introduction.md`：Codex Implementation Agent 的 self-reported operating model / Working Contract Input；供 Primary 在理解 Context、Workspace、能力邊界、self-review limitation 或調整 Agent collaboration governance 時按需閱讀，不視為 Provider Specification 或 Verified Evidence。

這是刻意的 Progressive Disclosure。不要讓同一規則在三個地方各長一個版本。

---

## 12. Current Judgment｜2026-09-16

目前可成立：

- Work Order as Handoff Contract：有效。
- Work Order Catalog as Historical Navigation：有效；不是 Task Board。
- 一份 Canonical Template + `Work Weight`：採用；不建立 Micro / Standard / High-Risk 三套模板。
- `Cannot Complete / Completed`：保留兩個合法 executor 終態。
- `Completed = Executor Completion`：External Gates 可仍待完成。
- `Must / Must Not / Acceptance / Executor Judgment`：作為主要 contract semantics。
- Report weight 應依 Type / Risk 調整。
- Claire as Human Relay, not Requirement Translator：有效。
- GitHub-visible state as Observable Handoff Surface：有效。
- Primary Technical QC：有效；Agent Report 不等於 Verified Evidence。
- Context-oriented / snapshot-oriented Preflight：必要。
- Workspace branch name ≠ Repository baseline identity。
- Project-level context ≠ Repository file。
- Governance Contract ≠ Execution Adapter。
- Codex Product UI 的 Create PR / Update Branch 是已驗證 adapter，不是所有 Agent runtime 的固定 completion protocol。
- Primary direct GitHub patch 可作小型低風險 REWORK fallback，但不取代需要 interactive implementation surface 的工作。

2026-09-16 Implementation Agent field feedback 已保存於 [`experience/implementation-agent-work-order-feedback-2026-09-16.md`](experience/implementation-agent-work-order-feedback-2026-09-16.md)。

未來流程改變時，先判斷變的是 Work Order Contract、Execution Profile、Dispatch mechanism、Agent runtime behavior 還是 Evidence / QC，再修改對應 Source of Truth。文件會繁殖，人類與 AI 都已經吃過這個虧。