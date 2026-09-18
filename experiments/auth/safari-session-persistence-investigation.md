# Safari Session Persistence Investigation Probe

- Date opened: 2026-09-16
- Status: Candidate / awaiting Claire Environment Evidence
- Probe: [`/auth-lifecycle-probe/`](../../public/auth-lifecycle-probe/index.html)
- Comparison surface: [`/auth/`](../../public/auth/index.html) (Experiment A)

## Research Question

在使用同一個 Supabase project、publishable key 與 `@supabase/supabase-js@2.57.4` 的前提下，Ordinary Safari 與 Private Browsing 執行相同 lifecycle 後，`signOut({ scope: "local" })`、`getSession()` 與 `onAuthStateChange` 會呈現哪些差異？

本 probe 是 observation surface，不是 root-cause fix。既有 Experiment A 已使用 local sign-out 並檢查 returned error，因此目前不能把 PR #40 的 implementation hypothesis 當成已解釋 historical behavior。

## Public-safe Evidence Boundary

頁面只記錄：

- ISO timestamp 與 operation / Auth event name；
- `session=present` 或 `session=null`；
- 遮罩後的 Email / user ID；
- Promise `resolved` / `rejected` 與 error presence、受限 error type、numeric status（若有）。

頁面不顯示、不寫入 Console、也不保存 Access Token、Refresh Token、Password、完整 Session 或完整 Identity。Probe 不枚舉或讀取 raw `localStorage` value，也不手動清除任何 Supabase storage key；diagnostic log 僅存在目前頁面的 memory，reload 後重新開始。

## Symmetric A/B Procedure

在 **Ordinary Safari** 與 **Private Browsing** 各執行一次完全相同的流程：

1. 開啟 probe，保存 `PAGE_LOAD`、`AUTH_EVENT INITIAL_SESSION`、`GET_SESSION page_load`。
2. Login → `Check Session`。
3. `Local Logout`，等待 `SIGN_OUT local resolved/rejected` 與 `GET_SESSION after_sign_out`。
4. 再執行 `Check Session`。
5. Reload → 等待 page-load check → `Check Session`。
6. 返回 Playground 首頁 → 再進 probe → 等待 page-load check → `Check Session`。

每個 reload / re-entry 都會產生新 log。請在切換頁面前用 screenshot 保存該階段 evidence，並分別標示 Ordinary / Private。

## Evidence Classification

- **Provider Contract:** `signOut({ scope: "local" })`、`getSession()` 與 `onAuthStateChange` 是本 probe 觀察的 provider API surface；本紀錄不以 contract 推定 Claire runtime result。
- **Provider Issue / Report:** None recorded as environment evidence。
- **Claire Environment Evidence:** Pending。尚未在部署後以 iPad Safari 完成 A/B matrix。
- **Inference:** Pending direct evidence；目前不宣告 Safari bug、Supabase bug 或 root cause。

## Result Boundary

目前只完成 public-safe diagnostic surface 與 reproducible test matrix。Safari runtime result、root cause、production workaround 及 PR #40 disposition 都仍屬 Unknown，需由 Claire evidence 與 Primary Agent review 決定。
