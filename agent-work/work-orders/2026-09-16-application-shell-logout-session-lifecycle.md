# Work Order — S-SHELL-1 Logout Session Lifecycle

## Metadata

- Work Order ID: `2026-09-16-application-shell-logout-session-lifecycle`
- Date: `2026-09-16`
- Type: `Implementation`
- Primary Objective: `修正 S-SHELL-1 logout lifecycle，使 current browser/device Session 明確失效，且 signOut failure 不得被 UI 偽裝成成功。`
- Requested By: `Primary Agent / Claire`
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Source Baseline: `main @ dc7c902f39e35c657d846a442c222c3978ce36a8`
- Related Phase: `S-SHELL-1 Claire Environment Evidence / corrective implementation`
- Related Experiment / Research: `experiments/application-shell/README.md`
- Related Specification: `agent-work/work-orders/2026-09-16-application-shell-vertical-slice.md`
- Related Evidence / Report: `Claire Environment Evidence — 2026-09-16 Safari logout/session restoration reproduction`
- Related PR / Issue: `PR #39 (merged implementation baseline; this Work Order is a new corrective task)`
- Supersedes: `None`

## Objective｜目標

修正 Application Shell 的 manual logout lifecycle。Logout 的 application contract 定義為：**結束目前 browser/device Session**，不應因單一裝置登出而主動終止同一帳號在其他裝置的 Session。

Manual logout 只有在 Supabase Auth 確認 current Session sign-out 成功後，才可呈現完成的 signed-out state。若 provider sign-out 失敗，不得只清 client application state 後顯示 Login，造成「UI 已登出、persistent Auth Session 仍可恢復」的假象。

## Context / Background｜背景

PR #39 已 merge，S-SHELL-1 已進入 Claire Environment Evidence。

Claire 在 iPad Safari 實際觀察到：

1. 一般 Safari 登入 Claire/admin。
2. 按 Shell Logout，畫面進入 Login Page。
3. 關閉所有 `ai-playground-lab.netlify.app` 分頁。
4. 同一一般 Safari profile 開新分頁，直接進入 `/business/places`。
5. Shell 顯示「正在恢復 Session」，隨後恢復 Claire/admin Application Context，Place Native 可正常讀取資料。

對照組：

- Safari Private Browsing 無既存 Session，direct Feature route 會停在 Login Page。
- Safari Private Browsing 登入後執行 Logout，再於同一 Private Browsing context 開新分頁，direct Feature route 仍正常停在 Login Page。

因此目前可區分：Unauthenticated Direct Route boundary 有效；異常集中在一般 Safari profile 的 persisted Auth Session / logout lifecycle。

Primary Agent review 現行 `public/application-shell/app.js` 發現 manual logout handler 目前會 `await supabase.auth.signOut()`，但沒有檢查回傳 `error`，之後無條件執行 `enterSignedOutState()`。這會讓 provider sign-out failure 與成功在 UI 上呈現相同結果。

現行 Supabase client 使用 `persistSession:true`, `autoRefreshToken:true`, `detectSessionInUrl:true`。本 Work Order 不要求改變這些既有設定。

## Read First｜先讀這些

1. `playground.md`
2. `agent-work/README.md`
3. `agent-work/work-orders/2026-09-16-application-shell-vertical-slice.md`
4. `experiments/application-shell/README.md`
5. `public/application-shell/app.js`
6. `public/application-shell/shell-core.mjs`
7. Application Shell 現有 tests（先定位實際 test files，不要猜 path）

Provider contract：Supabase JS Auth `signOut` current documentation，尤其 `scope: local` 與 sign-out error semantics。若 execution environment 無法存取 provider docs，依本 Work Order 已定義的 application contract 實作，不自行改變 scope decision。

## Execution Context Preflight｜執行環境確認

- 確認本 Work Order 存在於 workspace。
- 確認 `public/application-shell/app.js` 存在，且 manual logout implementation 與本 Work Order Context 描述相符；若 baseline 已變更導致描述不再成立，停止並回報。
- 確認施工前 working tree clean。
- 本工作是 **New Task**，不是 PR #39 Existing Task continuation。Claire 應在 Codex Product UI 以目前 GitHub-visible `main` 作 source baseline。

## Scope｜範圍

可以做：

- 修正 manual logout handler 與必要的小型 auth lifecycle helper。
- 明確使用 current-session/local logout semantics。
- 正確處理 Supabase `signOut` success / failure。
- 維持或加強 fail-closed Application Context clearing。
- 補充或調整 Application Shell lifecycle tests，覆蓋本 Work Order 的 contract。
- 必要時做極小量 UI message 調整，讓 logout failure 不被描述為成功。

## Out of Scope｜不要順手裝修隔壁

不要做：

- 不重構 Login architecture、bootstrap architecture 或 routing architecture。
- 不修改 `app_user`、Feature Registry、Navigation、user_type mapping。
- 不修改 Supabase DB / RLS / grants / Edge Functions / Auth project configuration。
- 不修改 Place Native、Weather、Place-Country Feature behavior。
- 不加入 RBAC、Role/Permission、dynamic menu framework。
- 不把 S-SHELL-1 verificationStatus 改為 `verified`；Environment Evidence 尚需 Claire 重測。
- 不把 logout 改成 global all-device sign-out。

## Constraints｜限制與必守規則

- Application logout contract：**current browser/device Session only**。使用 Supabase Auth local/current-session semantics，不主動 revoke 同一帳號其他裝置 Session。
- Provider sign-out failure 不得被 UI 偽裝為 logout success。
- 不得把 Secret Key / service_role / token / private credential 寫入 repository、log 或 UI。
- 保留 `persistSession:true` 與 `autoRefreshToken:true`；本問題不是以關閉 session persistence 迴避。
- Auth invalidation 必須 fail closed：失去有效 Session 後不可保留舊 Application User Context、Navigation 或 Feature DOM。
- 不以清 localStorage / storage key 的 undocumented workaround 取代 Supabase Auth API，除非能提出 provider-backed necessity，並停止等待 Primary Agent 決定。
- 不因本修正擴張 Architecture。

## Tasks / Suggested Method｜工作內容

1. Trace 現行 manual logout、`onAuthStateChange`、`enterSignedOutState`、`clearApplicationState` 與 startup `getSession()` lifecycle。
2. 將 manual logout 改為明確 current-session sign-out，例如使用 provider-supported `scope: "local"` contract。
3. 取得並檢查 `signOut` result；只有成功路徑可進入正常 signed-out completion state。
4. 對 sign-out failure 建立 deterministic failure handling：不得讓使用者看到一個等價於「已成功登出」的 Login transition；同時不得保留可操作的 stale Application Context / Feature DOM。
5. 確認 `SIGNED_OUT` / null-session auth event 與 manual logout 不會造成有害 race、double transition 或 stale bootstrap resurrection。
6. 補 tests，至少驗證：
   - local/current-session scope 被使用；
   - successful logout 清除 Application Context 並進入 signed-out state；
   - signOut error 不被當作成功；
   - null-session auth invalidation 仍 fail closed；
   - non-null token refresh Session synchronization 不被本修正破壞。
7. 執行可用的 Application Shell tests/static validation，檢查 final diff 僅包含本 Work Order scope。

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

- [ ] Source diff 顯示 manual logout 明確採 current-session/local semantics。
- [ ] Source diff 顯示 `signOut` error 有被檢查與處理，不再無條件宣告 signed-out completion。
- [ ] Auth invalidation 仍會清除 Application User Context、Navigation、Feature DOM。
- [ ] Token refresh non-null Session sync 行為仍保留。
- [ ] Automated test/static validation 覆蓋 success、failure、auth invalidation 與 refresh regression boundary；無法執行者明確列 limitation。
- [ ] 不修改 DB / RLS / grants / Edge Function / Supabase Auth project configuration。
- [ ] 不修改 S-SHELL-1 verificationStatus。
- [ ] Final diff 無 Out-of-Scope 裝修。

Claire Environment Acceptance（不由 Codex 宣告通過）：

- 一般 Safari：登入 → Logout → Login → 關閉 Playground tabs → 新分頁 direct `/business/places` → 必須維持 Login，不得恢復 Claire Session。
- Private Browsing 對照仍維持 Login。
- iPad current-session logout 不應主動讓 iPhone 上同一帳號的既存 Session 登出；此項由 Claire Environment Evidence 驗證。

## Deliverables｜交付物

- Artifact / Code / Document: `Application Shell logout lifecycle implementation + relevant tests`
- Report: `Codex final report per Report Contract`
- Local Commit: `Required`
- GitHub-visible PR / Commit: `Claire Create PR after Codex Completed handoff`
- Other: `None`

## Decision Boundary｜決策邊界

執行者可以自行決定：

- logout helper/function naming、低風險 UI error presentation、test organization 等 implementation detail。

執行者不得自行拍板：

- 把 logout scope 改成 global/all-device。
- 改 Supabase Auth project settings、session timeout、single-session policy。
- 關閉 `persistSession` / `autoRefreshToken` 作為修正。
- 手動操作 undocumented storage keys 作為主要解法。
- 改 Login / Shell / Application User / Authorization architecture。
- 將 Environment Evidence 或 Experiment 自動升格為 Verified。

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