# Work Order — Nook Works Platform Architecture Readiness / Blind Spot Review

## Metadata

- Work Order: `2026-09-15-nook-platform-readiness-blind-spot-review`
- Status: `Ready`
- Work Type: `Review Support`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository / Branch: `claire-nook/ai-playground` / current Codex workspace
- Related Repository: `claire-nook/nook-works`
- Related Research: `Nook Technical Platform Architecture Exploration`

## Objective｜目標

以未參與前期研究推理的獨立 Reviewer 角度，檢查目前 Nook Works Technical Platform 的 Experiment / Evidence coverage，回答：**除了已知下一階段的 UI presentation / visual design 研究之外，在開始形成 Platform Architecture 前，是否仍存在被 Primary Agent 與 Claire 遺漏的重要 Platform Capability Gap、boundary 或 hidden assumption？**

成功後，我們應得到一份可回溯的 independent Gap Analysis，而不是新的功能 wishlist。

## Why This Work Order Exists｜為什麼現在派這張單

Primary Agent 與 Claire 已共同完成多輪 Platform Experiment，長時間共享同一套 assumptions。這會提高一種風險：不是沒有檢查，而是兩個 Reviewer 已經習慣用相同角度檢查。

本 Work Order 刻意不提供 Primary Agent 自己的 Gap 結論。Codex 的價值在於作為沒有參與前期推理的第三個 Reviewer，獨立檢查目前研究是否真的接近 Architecture Readiness。

這張 Work Order 與後續 Report 也屬於 `agent-work` 的 durable collaboration history：未來 Primary Agent 應能回頭知道曾經把什麼問題交給 Codex、Codex 當時看到什麼、哪些觀察後來被採納或否決。

## Context / Read First｜先讀這些

### ai-playground

至少閱讀：

1. `playground.md`
2. `README.md`
3. `knowledge/README.md`
4. `knowledge/experiments.md`
5. `knowledge/open-exploration.md`
6. `knowledge/maps/nook-technical-platform.md`
7. `knowledge/evidence-backed-technical-writing.md`
8. `agent-work/README.md`
9. `agent-work/report-language-guideline.txt`

並閱讀目前與 Nook Technical Platform 直接相關的 Experiment / Evidence：

10. `experiments/auth/`
11. `experiments/data-api/`
12. `experiments/data-api-view/`
13. `experiments/custom-api/`
14. `experiments/batch-scheduling/`
15. `evidence/` 中與上述 Experiment 對應的重要 Evidence
16. `evidence/c-bsa-1-consolidated-findings.md`
17. `knowledge/implementation/` 中已存在的 reusable implementation knowledge

不要只讀 Catalog 摘要。若某項結論會影響 Gap 判斷，回到 Experiment / Evidence 確認它實際驗證了什麼。

GitHub Actions、Netlify Deployment、Agent Collaboration 等研究若與 Platform Readiness 有關可以閱讀，但不要讓 AI Engineering / Codex collaboration 題目沖淡本次 Nook Works Platform Review。

### nook-works

理解目前 `claire-nook/nook-works` 的 docs / architecture / business specifications 結構。

至少閱讀：

- `docs/business/specifications/batch/daily-weather.md`

並自行挑選其他具有代表性的現有 Business Specification / Schema / Architecture 文件。目的不是 Review Business Specification 文筆，而是從真實 Business Requirement 反推 Platform 必須提供哪些 capability / pattern / rule。

## Responsibility Model｜本次 Review 使用的責任模型

Business Specification 應描述 Business Intent、Processing Flow、Data Semantics、Transaction Boundary、Commit Point、Rollback Scope、Failure Persistence，以及需求本身要求的 Authorization / Business Rule。

Business Specification 不應被迫指定 Supabase SDK method、RPC vs PostgreSQL client、Framework、implementation language 或其他 provider-specific implementation detail。

Platform Architecture / Rule 負責把 Business Intent 映射成 approved technical pattern；Developer / AI Developer 依 `Business Specification + Platform Rule` 實作。

請用這個 responsibility model 檢查目前 Platform Evidence 是否足夠。

## Execution Context Preflight｜執行環境確認

本次是 read-heavy Review，不要求 Cloud Workspace 具備傳統 local clone 的完整 Git topology。

執行前確認：

- 本 Work Order 可讀。
- `ai-playground` 的上述 Research / Evidence 文件可讀。
- `nook-works` Repository 可讀；若 Codex Workspace 無法直接讀第二個 Repository，停止該部分並在 Report 明確標示 limitation，不得假裝已 Review。
- 若要新增 Report，確認工作目錄沒有會被本任務誤覆蓋的既有修改。

## Scope｜範圍

可以做：

- 閱讀既有 Repository、Experiment、Evidence、Specification、Architecture / Knowledge 文件。
- 建立 responsibility-oriented coverage map。
- 找出 Potential Gap、Hidden Assumption、Cross-cutting Concern。
- 判斷某問題屬 `BLOCKING`、`SHOULD VERIFY`、`PLATFORM RULE / DESIGN`、`DEFERRED` 或 `NOT A GAP`。
- 對 Application Shell 的 architecture placement 提出 independent assessment。
- 建議 minimal future Experiment，但不得自行開始 Experiment。
- 新增本 Work Order 指定的 Review Report。

## Out of Scope｜不要順手裝修隔壁

不要做：

- 修改 Production Code 或 Playground Experiment Code。
- 修改 Supabase / Database / Netlify / GitHub Actions。
- 修改既有 Research Map、Experiment Catalog、Evidence 或 Knowledge 文件。
- 修改 Nook Works Business Specification / Architecture 文件。
- 自行建立新的 Experiment。
- 把 UI visual design / component aesthetics 當成本次主要 Gap。
- 為了 checklist 完整而研究 hypothetical scale / exotic provider feature。
- 將 Review Candidate 自動升格為 Platform Decision。

若發現 Out of Scope 問題，記入 Report，不要自行擴張施工範圍。

## Constraints｜限制與必守規則

### 1. 不做 Provider 功能點燈

不要把「Supabase / PostgreSQL / Netlify 有某功能」直接列成研究缺口。

只有當某 capability 對 Nook Works Platform Responsibility 有實際 architecture relevance、現有 Evidence 不足、而且建立平台前合理需要答案時，才是 True Gap。

### 2. 嚴格區分成熟度

```text
Verified Capability
≠ Architecture Candidate
≠ Preferred Pattern
≠ Platform Rule
≠ Production Implementation
```

### 3. 不為完整而製造研究

Pure compute、extreme performance、distributed consistency、massive-scale concurrency、provider comparison 等議題，若沒有 representative Nook Works workload，應優先判斷是否 `DEFERRED`。

### 4. 從 Responsibility / Boundary 思考

不要只按 `UI / Batch / API / CRUD` program type 分類。特別注意橫跨多種程式類型的 Platform Responsibility。

### 5. Research Map 也是 Review 對象

不要假設 `knowledge/maps/nook-technical-platform.md` 已經完整。

### 6. Confidential historical Procedure boundary

不得把 confidential historical Procedure 寫入任何 Repo。若相關背景對 reasoning 有用，只能使用抽象原則：

> `Transaction owner = layer owning complete Business Operation.`

## Application Shell Review Boundary

純 UI presentation / visual design 暫不列為本次 Gap，例如 Form / Table visual style、responsive spacing、Dialog appearance、Theme、component aesthetics，因為 UI Pattern exploration 本來就是下一階段。

但 **Application Shell 不自動排除**。

可檢查但不限於：

- Authentication / Session Context
- Application bootstrap
- Navigation / Menu
- Route / Page lifecycle
- Permission-aware navigation
- Global application state
- Feature entry mechanism

請獨立判斷 Application Shell 是否應成為獨立 Platform Research Area；若是，建立 Platform Architecture 前需要驗證到什麼程度；哪些可以與 UI exploration 一起處理。不要因為 Work Order 提到它就預設答案是「一定要獨立」。

## Tasks / Review Questions｜工作內容

### A. Evidence-backed Coverage

以 Platform Responsibility / Boundary 整理目前已有 Evidence。不要只是照 Experiment ID 重抄 Catalog。

### B. True Gaps

檢查開始形成 Nook Works Platform Architecture 前，是否仍有非純 UI capability 必須先取得 Evidence。

每個 Candidate Gap 說明：

- Platform Responsibility 是什麼？
- 為什麼現有 Evidence 不足？
- 哪個 Nook Works requirement / architecture concern 會用到？
- 不處理會造成什麼實際 architecture risk？
- 需要 Experiment，還是其實只需要 Platform Rule / Documentation？

### C. Deferred Topics

指出看似重要但現在沒有必要研究的項目，並寫明 future trigger。避免把未來十年的工程問題一次塞進 Playground。

### D. Hidden Assumptions

尋找目前 Research Map / Experiments 看起來成立，但其實依賴未被明講或沒有 Evidence 的 assumption。這是本次核心任務之一。

### E. Cross-cutting Responsibilities

從整體平台檢查尚未處理的 cross-cutting responsibility。可使用以下 lens，但它不是待辦 checklist：

- identity / session
- authorization
- error contract
- transaction
- idempotency
- concurrency
- configuration
- secrets
- observability
- deployment / environment boundary
- retry / failure handling
- application shell

不要預設每項都缺，也不要為了顯示勤奮而替每個名詞生一張 Experiment。

### F. Platform Readiness Judgment

回答：

1. Backend / Data / Integration research 是否已達到「足以開始形成 Platform Architecture」的程度？
2. 若還不能，真正 Blocking 的項目是什麼？
3. 若可以，哪些項目應直接進 Platform Architecture / Rule design，哪些仍值得先做 focused experiment？
4. Application Shell 應視為 UI research 一部分、獨立 Platform Layer，或其他分類？理由是什麼？

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

- [ ] Review 實際涵蓋 ai-playground 的 Experiment Catalog、Technical Platform Map 與重要 underlying Evidence。
- [ ] Review 有使用至少一份 Nook Works representative Business Specification 作需求反推；若 Repository access 不可用，明確標示 limitation。
- [ ] Coverage 以 responsibility / boundary 表達，而不是 Experiment ID 清單。
- [ ] Potential Blind Spots 有 severity / disposition 分類。
- [ ] 明確區分「需要 Experiment」與「只需要 Platform Rule / Design」。
- [ ] 明確列出 Deferred topics 與 future trigger。
- [ ] 有 Application Shell assessment。
- [ ] 有 Hidden Assumptions。
- [ ] 最終回答是否存在 Blocking Gap。
- [ ] 不修改本 Work Order 允許範圍外的任何 artifact。

## Deliverables｜交付物

唯一允許新增的 durable artifact：

- Report: `agent-work/reports/2026-09-15-nook-platform-readiness-blind-spot-review.md`

Report 至少包含：

- `# Executive Judgment`
- `# Evidence-backed Coverage Map`
- `# Potential Blind Spots`
- `# Application Shell Assessment`
- `# Hidden Assumptions`
- `# Recommended Next Research`
- `# Final Independent Assessment`

Potential Blind Spot 請使用以下 disposition：

- `BLOCKING`
- `SHOULD VERIFY`
- `PLATFORM RULE / DESIGN`
- `DEFERRED`
- `NOT A GAP`

若建議 Experiment，至少寫出：

- Research Question
- Why now
- Minimal Evidence needed
- Stop Condition

完成後回報：

1. Report path
2. Commit SHA（若 Workspace / delivery flow 提供）
3. Top 3 Findings
4. 是否存在 Blocking Gap

## Decision Boundary｜決策邊界

Codex 可以自行決定：

- 閱讀哪些 additional relevant files。
- 如何組織 reasoning 與 coverage map。
- Candidate Gap 的 independent classification。
- 是否認為 Primary Research 已經足夠，不需要新增 Blocking Experiment。

Codex 不得自行拍板：

- Architecture / Platform Rule。
- Business Requirement。
- Production technology adoption。
- 新 Experiment scope / implementation。
- Formal Repository mutation。

若某問題需要以上決策才能回答，標示 `Decision Needed`。

## Independence Requirement｜保持獨立

Primary Agent 在派出本 Work Order 前已做過一次自己的 readiness review，但刻意沒有把 Gap 結論寫進本 Work Order。

不要猜 Primary Agent 想聽什麼。

若你的結論是「Backend 核心已足夠，沒有新的 Blocking Experiment」，直接寫。

若你發現一個目前完全沒碰到、但建立 Platform 前必須知道的 boundary，也直接指出。

若某問題只需要 Architecture Decision，不要為了顯示勤奮而要求 Experiment。

我們需要的是 Blind Spot Review，不是研究題目生成器。

## Report Language｜報告語言

遵守 `agent-work/report-language-guideline.txt` 與 Playground Language Convention：

- reasoning / explanation 使用繁體中文。
- standard IT terminology 保留 English。
- 不做逐段雙語翻譯。

## Final Question｜最後一定要回答

> 如果你是 Nook Works Tech Lead，看到目前這些 Evidence，你會不會允許團隊開始撰寫 Platform Architecture？如果不會，缺什麼？如果會，哪些未知事項可以在 Architecture 中保留為 Deferred / Open Decision？
