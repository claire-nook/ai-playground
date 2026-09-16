# Work Order — Application Shell Implementation Readiness Review

## Metadata

- Work Order ID: `2026-09-16-application-shell-implementation-readiness-review`
- Date: `2026-09-16`
- Type: `Review`
- Primary Objective: `獨立評估 S-SHELL-1 在 Codex 無 Supabase management access 條件下的 implementation readiness、可施工範圍、runtime contract 與 validation handoff。`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `GitHub-visible main at dispatch time`
- Related Phase: `S-SHELL-1 pre-implementation review`
- Related Experiment / Research: `experiments/application-shell/README.md`
- Related Specification: `experiments/application-shell/synthetic-platform-metadata.md`
- Related Evidence / Report: `agent-work/work-orders/application-shell-experiment-review-v2.md`
- Related PR / Issue: `None`
- Supersedes: `None`

## Objective｜目標

在正式派發 S-SHELL-1 implementation 前，以獨立 Reviewer / Implementation Agent 視角評估目前 Repository context 是否已足以施工，尤其回答：Codex 在無法直接管理或檢查 Supabase project 的條件下，哪些 Application Shell 工作可以可靠完成、哪些工作需要 Primary Agent 提供 runtime contract 或後續 real-environment validation，以及合理的 implementation / validation responsibility boundary 應如何切分。

本 Work Order 只產出 Review Report，不實作 Shell。

## Context / Background｜背景

S-SHELL-1 是 Application Shell Integration / Composition Experiment。既有 Auth、Application Access、Native Data API、Custom API capability 已有先前 Experiment Evidence；本 Experiment 不重新證明 provider capability，而是驗證這些能力能否組合成具有 lifecycle、Application User Context、Navigation、Route、Feature Entry 與 responsive behavior 的 browser application shell。

Primary Agent 已完成部分 Supabase-side experiment infrastructure：

- formal `app_user` 目前具有 `admin` / `user` / `guest` classification。
- Experiment fixture 預期為 Claire=`admin`、TU01=`user`、TU02=`guest`。
- synthetic Platform Metadata probe 已設計三個 `test_*` object，分別代表 Feature Registry、Navigation Definition、`user_type` → Feature Entry mapping。
- Supabase runtime 已建立對應 synthetic tables 與 fixture；這項 runtime 狀態是 Primary Agent 的 Provider/Tool observation，不代表 Codex workspace 能直接檢查或管理該 Supabase project。
- `guest` 是 active Application User，可進入 Shell `/home`，但沒有 Business / Common Feature Entry。

重要 execution limitation：目前不假設 Codex Cloud 擁有 Supabase Dashboard、Supabase connector、database credential、service role、SQL execution surface 或其他 management access。Reviewer 必須把「可以從 repo contract 實作」與「必須在 real Supabase environment 驗證」分開，不得把缺少 provider access 誤寫成 implementation capability 本身不存在。

## Read First｜先讀這些

1. `experiments/application-shell/README.md`
2. `experiments/application-shell/synthetic-platform-metadata.md`
3. `experiments/application-shell/synthetic-platform-metadata.sql`
4. `agent-work/work-orders/application-shell-experiment-review-v2.md`
5. `knowledge/maps/nook-technical-platform.md`
6. `knowledge/experiments.md`
7. `agent-work/README.md`

若上述文件互相矛盾，以較新的 S-SHELL-1 Experiment Record 與 supporting synthetic metadata design 為主要 review input，並在 Report 明確指出 inconsistency，不自行偷偷改寫 requirement。

## Execution Context Preflight｜執行環境確認

開始 Review 前確認：

- 本 Work Order 存在且可完整閱讀。
- `experiments/application-shell/README.md` 存在。
- `experiments/application-shell/synthetic-platform-metadata.md` 與 `.sql` 存在。
- `agent-work/work-orders/application-shell-experiment-review-v2.md` 存在。
- Repository snapshot 可讀，且本 Work Order 要求的是 Review，不是 Implementation。
- 不要求 local branch 名稱必須為 `main`，不要求 Git remote / `gh` authentication。

若必要文件缺失或 snapshot 明顯早於本 Work Order，依 Cannot Complete 結案，不靠 Claire 口述或自行猜測補齊。

## Scope｜範圍

可以做：

- Review S-SHELL-1 current Experiment Design 與 synthetic metadata contract。
- 評估 Codex 在 repo-only context、無 Supabase management access 下的 implementation readiness。
- 列出可以可靠由 Codex 實作的 Shell / frontend / Supabase client integration responsibilities。
- 列出需要 Primary Agent 提供或確認的 runtime contract、configuration、query contract、provider state 或 real-environment Evidence。
- 評估是否適合由單一 Implementation Work Order 完成完整 vertical slice，或是否應切分 implementation / integration work；提供理由，但不得自行建立新 Architecture Rule。
- 找出目前設計中會阻礙 implementation 的 ambiguity、missing contract、unsafe assumption 或 unnecessary coupling。
- 提出 minimum preconditions / handoff contract，使後續 Implementation Agent 不需要 Supabase management access 也能合理施工。
- 評估後續 validation 應由 Codex static/local validation、Primary Agent provider validation、Claire iPad Safari Human Environment Evidence 各自承擔哪些部分。

## Out of Scope｜不要順手裝修隔壁

不要做：

- 不建立或修改 Shell implementation code。
- 不修改 HTML / JS / CSS / runtime artifact。
- 不建立、修改或刪除 Supabase table、policy、function、Auth user、Edge Function 或其他 provider resource。
- 不建立新的 formal Platform Schema。
- 不把 synthetic metadata table name 或 structure 升格為 production naming / architecture decision。
- 不重新設計 Role / Permission / RBAC。
- 不自行選定 production framework、router、state-management library 或 Design System。
- 不重新執行既有 Auth / Native Data API / Custom API capability experiments。
- 不把 Navigation Visibility 當成 Backend Authorization。

若發現 Out of Scope 問題，記入 Report，不自行擴張工程範圍。

## Constraints｜限制與必守規則

- Playground 是 public-safe research environment；不得要求或寫入 secret key、service_role、token、private credential 或 sensitive data。
- Browser implementation 未來只能使用 browser-safe runtime configuration；Review 不得建議把 privileged credential 放進 frontend。
- 不假設 Codex 可以直接存取 Supabase management surface。若某項建議需要此能力，必須明確標示為 Primary Agent / external validation responsibility。
- `Auth Success ≠ Application Eligibility ≠ Feature Eligibility ≠ Backend Authorization`，不得把這些 layer 合併成單一 boolean 概念。
- `guest` 是本 Experiment In Scope：active guest 可 Shell Ready，但沒有 Business / Common Feature Entry。
- `/home` 是 Shell-owned landing，不是 Feature Registry entry。
- synthetic Platform Metadata 是 Experiment Design，不是 production schema。
- Review 可以提出 Candidate / concern，但不得自行修改 Architecture / Platform Rule。

## Tasks / Suggested Method｜工作內容

1. 讀取 S-SHELL-1 Experiment Record，整理 browser runtime 的最小 lifecycle 與責任邊界。
2. 讀取 synthetic Platform Metadata design / SQL，確認 Feature、Navigation、user_type mapping 能提供哪些 runtime information，以及哪些資訊仍需 application-side contract。
3. 以「Codex 只有 Repository snapshot，沒有 Supabase management access」為前提，逐段評估：
   - Auth client / session handling
   - `app_user` bootstrap / Application User Context
   - Application Eligibility
   - metadata query / Navigation derivation
   - Route resolution / direct Feature Entry check
   - `/home`
   - `/business`
   - `/common`
   - loading / error / sign-out behavior
   - responsive Shell behavior
4. 對每一段分類為：
   - `Repo contract sufficient for implementation`
   - `Implementable but requires real-environment validation`
   - `Blocked by missing contract/context`
5. 列出後續 Implementation Work Order 在 dispatch 前應固定提供的 minimum runtime contract，例如 browser-safe configuration source、table/query shape、expected fixture semantics、expected deterministic route outcomes。只列 contract，不要求或暴露 secret。
6. 評估 implementation slicing：完整 vertical slice 交給 Codex 是否合理；若建議拆分，說明真正的 dependency / validation reason，不要只因為「碰到 Supabase」就機械式拆成 frontend/backend。
7. 提出 validation handoff matrix：哪些結果 Codex 可以自己驗證，哪些需要 Primary Agent 用 Supabase/provider surface 驗證，哪些需要 Claire 在 iPad Safari 取得 Human Environment Evidence。
8. 檢查是否仍存在會讓 Implementation Agent 被迫猜測的 ambiguity；依 severity 區分 blocker 與 non-blocking concern。
9. 將 Review 寫入 `agent-work/reviews/application-shell-implementation-readiness-review.md`。

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

- [ ] Report 明確說明 Codex 無 Supabase management access 時仍可/不可可靠實作的範圍。
- [ ] Report 對主要 Shell runtime segment 完成三類 readiness classification，而不是只給整體一句「可做 / 不可做」。
- [ ] Report 列出 minimum runtime contract / preconditions，且不要求 secret 或 privileged frontend credential。
- [ ] Report 評估完整 vertical slice vs split implementation 的 trade-off 與 dependency。
- [ ] Report 提供 Codex / Primary Agent / Claire 三方 validation handoff matrix。
- [ ] Report 明確區分 repository-derived fact、Work Order assumption、runtime unknown，不把無法直接驗證的 Supabase state 寫成自己的 Evidence。
- [ ] Report 指出 blocker 與 non-blocking concern；若沒有 blocker，明確寫 `None`。
- [ ] 除 Review Report 與必要 local commit 外，不修改 runtime implementation 或 provider resource。

## Deliverables｜交付物

- Artifact / Code / Document: `agent-work/reviews/application-shell-implementation-readiness-review.md`
- Report: `agent-work/reviews/application-shell-implementation-readiness-review.md`
- Local Commit: `Required`
- GitHub-visible PR / Commit: `Claire creates PR after Codex reports Completed local commit SHA`
- Other: `None`

若執行者是 Codex Cloud，不要預設 local commit SHA 等於 GitHub PR head SHA。Primary Agent Technical QC 以 GitHub-visible state 為準。

## Decision Boundary｜決策邊界

執行者可以自行決定：

- Review Report 的內部章節編排與低風險分析方法。
- 針對 implementation readiness、missing contract、validation boundary 提出 Candidate recommendation。

執行者不得自行拍板：

- Architecture / Platform Rule 變更。
- 正式 Business Requirement 變更。
- Production framework / router / state library selection。
- Formal DB schema / RLS / authorization model 變更。
- Role / Permission / RBAC 導入。
- 將 synthetic metadata model 升格為 production Platform Schema。
- 將自己的 Report Result 自動視為 Verified Runtime Evidence 或正式 Technical Decision。

## Report Contract｜執行後回報

Report 預設遵守 `agent-work/report-language-guideline.txt`：說明與判斷使用繁體中文，technical terms、code、path、command、field、log marker 與 raw provider output 保留英文。

至少回報：

### Result

實際完成結果。

### Evidence / Validation

Evidence 路徑、Test / Runtime Result、Log / Artifact 摘要。

### Deviations

與 Work Order 原方法或 Scope 的差異及原因；若無：`None`。

### Failure / Unknown

失敗與仍未知事項；若無：`None`。不要把 Unknown 補成推論。

### Observation / Candidate Conclusion

值得 Primary Agent Review 的技術觀察或 Candidate；若無：`None`。不得自行升格成正式 Technical Decision。

### Follow-up / Decision Needed

需要 Primary Agent / Claire 決定或後續驗證的事項；若無：`None`。

## Completion Contract｜固定結案準則

本 Section 是 Primary Agent 與 Implementation Agent 之間的 canonical working protocol。除非實際執行模式出現新的合法終態，建立新 Work Order 時**不要刪除、改名或自由改寫本 Section**。

目前 Work Order 執行只有兩種合法結案方式：`Cannot Complete` 或 `Completed`。

### A. Cannot Complete｜無法完成

若因 Preflight failure、必要 Context 缺失、權限或 execution-surface 限制、需求矛盾、安全邊界、不可接受風險或其他 blocker，導致 Work Order 無法安全完成：

1. 停止工作，不猜測缺失 Context，不用 workaround 繞過明確限制，也不為了交付而擴張 Scope。
2. 保留已取得的真實 observation / failure evidence；不要把部分完成描述成完成。
3. 最終回報至少包含：
   - Blocker / reason。
   - 已完成到哪個步驟。
   - 是否修改任何檔案，以及 changed files。
   - 是否存在未提交修改或其他 workspace residue。
   - 已執行的 validation / evidence，若無則填 `None`。
   - 需要 Primary Agent / Claire 補充、判斷或授權的事項。
4. 不建立虛假的完成訊號；若沒有符合本 Work Order 的可交付結果，不要為了產生 PR 而製造無意義修改。
5. 回報後停止，等待 Primary Agent / Claire 決定後續處理。

### B. Completed｜可以完成

若 Work Order 可以完成：

1. 完成 Scope 內工作，並確認沒有把 Out of Scope 修改混入交付。
2. 執行本 Work Order 要求的 validation / test / static check；不能執行的項目必須明確列為 limitation，不得假裝已驗證。
3. 檢查 final diff / changed files，確認交付內容與 Work Order 一致。
4. **建立 local commit。Work Order 未完成 local commit，不視為 Completed handoff。**
5. 最終回報至少包含：
   - Completed work summary。
   - Changed files / artifact paths。
   - Validation / test result。
   - Known limitations / unknowns；若無則填 `None`。
   - Local commit SHA。
6. Local commit SHA 只代表 Codex Workspace 的完成節點，不等同未來 GitHub PR head SHA。
7. 完成上述回報後停止，不再自行擴張工作；等待 Claire 使用 Codex Product UI 的 **Create PR** 建立 GitHub-visible handoff surface，供 Primary Agent Technical QC。

除非特定 Work Order 明確定義不同的 delivery mechanism，否則不得省略 `local commit → report SHA → stop → Claire Create PR` 這個 Completed handoff sequence。