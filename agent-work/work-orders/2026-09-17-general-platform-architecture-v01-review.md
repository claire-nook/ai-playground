# Work Order — General Platform Architecture v0.1 Review

## Metadata

- Work Order ID: `2026-09-17-general-platform-architecture-v01-review`
- Date: `2026-09-17`
- Type: `Review`
- Work Weight: `High-Risk`
- Primary Objective: `Adversarially review General Application Platform Architecture v0.1 from both architecture-reviewer and implementer perspectives.`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main containing knowledge/platform/application-platform-architecture.md v0.1`
- Execution Profile: `Codex Product UI`
- Related Phase: `General Platform Architecture / Pattern 1`
- Related Experiment / Research: `experiments/feature-query/README.md`
- Related Specification: `None`
- Related Evidence / Report: `evidence/s-shell-1-application-shell-findings.md`
- Related PR / Issue: `None`
- Supersedes: `None`

## Objective｜目標

獨立挑戰 `knowledge/platform/application-platform-architecture.md` v0.1，回答兩個不同問題：

1. **Reviewer perspective**：責任邊界、Evidence strength、generalization 與 internal consistency 是否站得住腳？
2. **Implementer perspective**：如果依這份 architecture 實作第一個 Read-only Query Feature，哪些地方仍會迫使施工者猜測、重複決策、建立多餘 abstraction，或在真實 code pressure 下自然違反 boundary？

Review 的目的不是替 Primary 背書，也不是要求找碴湊數，而是盡可能在 Pattern 2 之前暴露 v0.1 的弱點。

## Why / Context｜為什麼做

目前第一個 Functional Pattern 已從 F-QUERY-1 收斂，Primary 已第一次把既有 Shell Evidence + Query Pattern Evidence 統整成 general application platform architecture。

這份 architecture 刻意保持薄，不預先設計 CRUD、Master-Detail、Export、Server-side Pagination、RBAC、Design System 等未被 Pattern 1 要求的能力。

下一步不是直接把它當 Platform Rule，而是先接受 independent implementation/review challenge，再由下一個 Feature Pattern 做 evolutionary challenge。

## Read First｜先讀這些

1. `knowledge/platform/application-platform-architecture.md`
2. `experiments/feature-query/README.md`
3. `evidence/s-shell-1-application-shell-findings.md`
4. `knowledge/maps/nook-technical-platform.md`，只用於理解 Evidence provenance；不要把 Nook-specific wording 當 general architecture requirement。
5. `agent-work/README.md`

## Context Preflight｜執行環境確認

- 確認上述文件均來自同一個 GitHub-visible source snapshot。
- 本任務是 Architecture Review，不需要 Provider credential、Supabase management access、Netlify deployment 或 Formal DB mutation。
- 若 source snapshot 缺少 v0.1 architecture 文件，停止並回報 baseline mismatch，不依記憶猜內容。

## Must｜必須做到

- 分開輸出 Reviewer perspective 與 Implementer perspective findings。
- 每個 finding 指出具體 architecture section / claim，不做抽象感想。
- 對重要 finding 說明 impact：contradiction、unsupported generalization、implementation ambiguity、unnecessary abstraction、missing boundary、security/lifecycle risk 或 maintainability cost。
- 檢查 v0.1 是否把 F-QUERY-1 / Nook Works 特定偏好誤升格為 general platform rule。
- 檢查 `Application Shell → Feature Runtime → Feature Interaction Pattern → Data Access Boundary → Backend/Data Source` 是否真有必要分成這些 responsibility areas，尤其 `Feature Runtime` 是否有足夠價值，還是只是多取一個名字。
- 檢查 state ownership、authorization separation、error ownership direction 是否能被施工者一致理解。
- 從「今天真的要實作 Pattern 1」角度指出仍缺哪些 minimum contract，並區分：現在就必須補 vs 可以等 Pattern 2 再決定。
- 明確指出哪些 v0.1 boundary 值得保留，即使其他部分需要修改。
- 最後提供一份 prioritized rework list；若認為不需 rework，也必須說明依據。

## Must Not｜不得做

- 不得修改 architecture 文件、Experiment、Evidence 或 Source Code。
- 不得把 Reviewer preference 寫成 Verified Evidence。
- 不得因為未來「可能」需要，就要求 v0.1 預先加入 CRUD、Master-Detail、Export、Server-side Pagination、generic workflow engine、Design System 或其他 speculative framework。
- 不得假設特定 frontend framework / router / state library 已被選定。
- 不得把 Nook Works business/domain semantics 偷渡成 general platform requirement。
- 不得進行 Formal DB mutation、deployment 或 provider configuration change。

## Suggested Method｜建議方法

1. 先以 architecture reviewer 身分逐節找 claim / evidence mismatch 與 boundary 問題。
2. 再假想收到一張「依 v0.1 實作最簡單 authenticated read-only query feature」的施工單，從 browser entry 一路 trace 到 data contract / result rendering，標出仍需猜測的地方。
3. 對每個問題判斷它是：v0.1 必須修、Pattern 2 才值得研究、或只是 implementation detail。
4. 最後做一次 adversarial pass：如果你想故意把這套 architecture 寫爛，最容易從哪個 boundary 開始長出重複責任或 giant framework？

## Acceptance｜可驗收條件

- [ ] Reviewer 與 Implementer 兩個視角都有獨立 findings。
- [ ] Findings 可 trace 到具體文件內容。
- [ ] 有檢查 Evidence overclaim / generalization risk。
- [ ] 有檢查 `Feature Runtime` 的必要性。
- [ ] 有區分 must-fix-now 與 defer-until-next-pattern。
- [ ] 有指出值得保留的 boundary，不只列缺點。
- [ ] 有 prioritized rework list。
- [ ] 沒有修改 Repository source。

## Executor Judgment｜執行者裁量

Executor 可自行決定 finding 的組織方式、severity vocabulary 與 review technique，也可以提出替代 boundary wording。

Executor 不得自行決定 Architecture v0.1 的正式修訂、Platform Rule 升格或 Pattern 2 scope；這些由 Primary 在 Review 後判斷。

## External Gates｜外部驗證 Gate

- Primary Agent 必須對 Review findings 做 Architecture Judgment，決定 Accept / Reject / Rework。
- Claire 可從 SA / Functional Design 角度挑戰 Review 中涉及 user interaction / requirement semantics 的假設。

## Deliverables｜交付物

- Artifact / Code / Document: `Review report only; no source modification`
- Report: `Structured review in executor response; optional repository report only if dispatch surface requires it`
- Commit: `None required`
- GitHub-visible PR / Commit: `None required`
- Other: `Prioritized rework list`

## Report Contract｜執行後回報

Review Report 至少包含：

- Executive assessment，避免分數 / 星等，直接描述主要 architecture strength / weakness。
- Reviewer perspective findings。
- Implementer perspective findings。
- Must-fix-before-Pattern-2。
- Defer-until-challenged。
- Boundaries worth preserving。
- Prioritized rework list。
- Unknown / assumptions。

Reviewer opinion 必須與 source Evidence 分開。

## Completion Contract｜固定結案準則

### A. Cannot Complete｜無法完成

若 required source snapshot 缺失、文件不可讀或存在矛盾到無法判斷，停止並回報 blocker、已讀 context、缺失內容與需要 Primary / Claire 決定的事項。不要依記憶補 architecture。

### B. Completed｜Executor Completion

完成 `Must`、確認未違反 `Must Not`，提交完整 Review Report 後停止。`Completed` 只表示 Review 工作完成，不等於 Primary 接受 findings，也不等於 Architecture v0.1 已通過驗證。