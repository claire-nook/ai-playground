# Work Order — Supabase Auth Safari Session Persistence Investigation

## Metadata

- Work Order ID: `2026-09-16-supabase-auth-safari-session-persistence-investigation`
- Date: `2026-09-16`
- Type: `Investigation`
- Primary Objective: `釐清一般 Safari logout 後 Supabase Session 可再次恢復、但 Private Browsing 不會的 root cause 與可觀察 lifecycle。`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main @ 5ada529e01d9dc165395b5d6bfaaba254dc3b45e`
- Related Phase: `S-SHELL-1 Claire Environment Evidence / Auth lifecycle investigation`
- Related Experiment / Research: `experiments/auth/README.md; experiments/application-shell/README.md`
- Related Specification: `agent-work/work-orders/2026-09-16-application-shell-logout-session-lifecycle.md`
- Related Evidence / Report: `Claire Environment Evidence — ordinary Safari session restoration vs Private Browsing control, 2026-09-16`
- Related PR / Issue: `PR #40 open; do not assume it resolves root cause`
- Supersedes: `None`

## Objective｜目標

建立一個最小、可在 iPad Safari 直接觀察的 Auth lifecycle diagnostic probe，回答以下問題：

1. `signOut({ scope:"local" })` 在一般 Safari 與 Private Browsing 是否 resolve / reject / return error？
2. signOut 前後 `getSession()` 是否仍能讀到 Session？
3. `onAuthStateChange` 實際收到哪些 event，尤其 `INITIAL_SESSION`、`SIGNED_IN`、`SIGNED_OUT`、`TOKEN_REFRESHED`？
4. Page reload、離開 probe 再返回後，Session presence 是否改變？
5. 現象是否能在既有 Experiment A 的最小 Auth surface 重現，從而與 Application Shell lifecycle 分離？

本 Work Order 是 Investigation，不預設 PR #40 的 implementation hypothesis 正確，也不直接修改正式 Shell logout behavior。

## Context / Background｜背景

Claire 已確認一般 Safari 可重現：login → logout 顯示 Login → 返回 Playground 主頁 → 再進 Live Demo → Supabase Session 自動恢復並重新進入 authenticated UI。Private Browsing 執行相同步驟則維持 Login。

此現象並非 S-SHELL-1 首次出現。Claire 回報在早期只有小型 Auth experiments 時就曾觀察到相同行為，當時誤認為 Safari convenience feature。

Repository inspection 顯示既有 `public/auth/index.html`（Experiment A）早已使用：

- `persistSession:true`
- `autoRefreshToken:true`
- `signOut({ scope:"local" })`
- signOut result 的 `error` handling
- Page Load `getSession()` restoration

因此「Shell 忘記指定 local scope / 忘記檢查 error」不足以單獨解釋歷史現象。PR #40 的 defensive lifecycle improvement 可以是合理 change，但目前不得視為 root-cause fix。

Supabase current official contract states browser `signOut()` 應清除 active session/storage，`local` 僅終止 current session；`getSession()` 直接從 attached storage 載入 session。Provider ecosystem 另存在 iOS Safari / persisted-session / auth lock 與 signOut cleanup 類 issues，因此本次需要 direct browser evidence，不以 issue report 代替本環境驗證。

## Read First｜先讀這些

1. `playground.md`
2. `agent-work/README.md`
3. `experiments/auth/README.md`
4. `public/auth/index.html`
5. `experiments/application-shell/README.md`
6. `public/application-shell/app.js`
7. `agent-work/work-orders/2026-09-16-application-shell-logout-session-lifecycle.md`
8. PR #40 僅作 comparison context；不要從其 branch 開始施工。

## Execution Context Preflight｜執行環境確認

- 確認本 Work Order 存在。
- 確認 source baseline 為包含本 Work Order 的最新 GitHub-visible `main`；若 SHA 已前進但只包含本 Work Order checkpoint，可使用最新 main。
- 確認 `public/auth/index.html` 的既有 logout 已使用 `scope:"local"` 並檢查 returned error；若不符，停止回報 baseline mismatch。
- working tree 施工前 clean。
- 本任務是 New Task / Investigation，與 PR #40 branch 分離。

## Scope｜範圍

可以做：

- 新增 disposable/public-safe Auth diagnostic probe，優先放在獨立 `public/` path，避免污染既有 verified Experiment A UI。
- 顯示非敏感 lifecycle evidence：timestamp、Auth event name、session present/null、user identity masked、session_id/JWT 不顯示、token 不顯示。
- 提供明確操作按鈕：login、local signOut、getSession check、clear diagnostic log（如需要）。
- 捕捉 Promise resolve/reject 與 returned error 的安全摘要，不顯示 token/credential。
- 記錄 page-load initial session presence 與 `onAuthStateChange` events。
- 撰寫簡短 investigation notes / reproduction matrix，讓 Claire 可依步驟執行一般 Safari 與 Private Browsing A/B test。

## Out of Scope｜不要順手裝修隔壁

不要做：

- 不修改 Application Shell runtime behavior。
- 不修改 PR #40 branch。
- 不修改 Supabase Auth project settings、DB、RLS、grants、Edge Functions。
- 不手動刪除 Supabase localStorage/session storage key 作為 workaround。
- 不宣告 Safari bug、Supabase bug 或 root cause，除非 direct evidence 足夠。
- 不修改 Experiment A verificationStatus。
- 不把 provider GitHub issue 當作本環境 Evidence。

## Constraints｜限制與必守規則

- Public Playground 不得顯示或 log Access Token、Refresh Token、完整 Session、Password、完整 auth.users UUID 或其他 private credential。
- Email / user ID 如需辨識必須 mask。
- 不讀取、輸出或枚舉 localStorage 的 raw Supabase token value。若需要判斷 storage presence，只能輸出 boolean / key-presence 等不含 value 的資訊，且需在 report 說明理由。
- Diagnostic probe 必須能在 iPad Safari standalone 使用，不依賴 desktop devtools。
- Evidence 明確區分：Provider Contract、Provider Issue/Report、Claire Environment Evidence、Inference。

## Tasks / Suggested Method｜工作內容

1. 建立最小 Auth diagnostic probe，使用與 Experiment A 相同 Supabase project、publishable key 與 `@supabase/supabase-js@2.57.4`，避免版本差異污染 A/B comparison。
2. 在 createClient 後立即註冊 `onAuthStateChange`，把 event name + session presence/null + timestamp 顯示在頁面 log。
3. Page Load 執行 `getSession()`，記錄 resolve/reject、error presence 與 session presence/null。
4. Local logout button 呼叫 `signOut({scope:"local"})`，明確記錄：call start、resolved/rejected、returned error presence/message-safe-summary，完成後再呼叫一次 `getSession()` 並記錄 presence/null。
5. 提供 manual `Check Session`，讓 Claire 在 signOut 後、reload 後與返回頁面後直接取得同樣 evidence。
6. 不使用 localStorage raw value 作為主要判定；若需要 storage presence observation，只記錄 auth storage key 是否存在，不輸出 value。
7. 提供頁面內 Test Matrix / concise steps：
   - Ordinary Safari fresh login → Check → Local Logout → Check → reload → Check → back Playground → re-enter probe → Check。
   - Private Browsing 重複完全相同步驟。
8. 執行 static/syntax validation；若可新增純函式 test，可做，但不要用 mock test 冒充 Safari runtime evidence。
9. Final report 明確列出此 task 只建立 observation surface；root cause 需等待 Claire Environment Evidence。

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

- [ ] Diagnostic probe 不輸出任何 token / refresh token / password /完整 Session。
- [ ] 可觀察 page-load `getSession()` session present/null。
- [ ] 可觀察 `onAuthStateChange` event name 與 session present/null。
- [ ] 可觀察 local signOut resolved/rejected/returned error。
- [ ] signOut 完成後自動再次 `getSession()` 並顯示 session present/null。
- [ ] 有 ordinary Safari / Private Browsing 完全對稱的操作步驟。
- [ ] 不修改 Application Shell runtime、Supabase configuration 或 DB。
- [ ] Final report 不把尚未取得的 Claire runtime result寫成已驗證。

## Deliverables｜交付物

- Artifact / Code / Document: `Public-safe Auth diagnostic probe + concise investigation notes/reproduction matrix`
- Report: `Codex final report per Report Contract`
- Local Commit: `Required`
- GitHub-visible PR / Commit: `Claire Create PR after Codex Completed handoff`
- Other: `None`

## Decision Boundary｜決策邊界

執行者可以自行決定：

- probe path/name、UI layout、safe diagnostic log representation、低風險 helper/test organization。

執行者不得自行拍板：

- root cause、production workaround、manual storage deletion policy、Supabase version upgrade/downgrade、Auth architecture、PR #40 merge/reject decision。

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
3. 最終回報至少包含：Blocker / reason、已完成步驟、changed files、workspace residue、validation/evidence、需要 Primary Agent / Claire 補充或授權事項。
4. 不建立虛假的完成訊號。
5. 回報後停止，等待 Primary Agent / Claire 決定。

### B. Completed｜可以完成

若 Work Order 可以完成：

1. 完成 Scope 內工作，確認沒有 Out of Scope 修改。
2. 執行 required validation / test / static check；不能執行者明確列 limitation。
3. 檢查 final diff / changed files。
4. **建立 local commit。Work Order 未完成 local commit，不視為 Completed handoff。**
5. 最終回報至少包含 completed summary、changed files、validation result、known limitations/unknowns、Local commit SHA。
6. Local commit SHA 不等同未來 GitHub PR head SHA。
7. 回報後停止，等待 Claire 使用 Codex Product UI 的 **Create PR** 建立 GitHub-visible handoff surface，供 Primary Agent Technical QC。

除非特定 Work Order 明確定義不同 delivery mechanism，否則不得省略 `local commit → report SHA → stop → Claire Create PR`。