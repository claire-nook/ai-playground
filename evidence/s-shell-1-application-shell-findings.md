# S-SHELL-1 — Application Shell Consolidated Findings

- Date: 2026-09-16
- Experiment: `S-SHELL-1`
- Record: `experiments/application-shell/README.md`
- Environment: Netlify Production Live Demo / iPad Safari / iPhone Safari; Chrome cross-browser control
- Evidence Types: Primary Agent Technical QC + Claire Environment Evidence
- Related PRs: `#39`, `#40`
- Related Auth Investigation: `A-SAFARI-LIFECYCLE` / PR `#41`

## Research Question

已驗證的 Auth、Application Access、Native Data API、Custom API 與 External API integration 能力，能否被組合成具有明確 lifecycle、Application User Context、metadata-driven Navigation、Route、Feature Entry 與 responsive behavior 的 Nook Works Application Shell？

## Result

**Verified / Completed.**

S-SHELL-1 已在 deployed browser environment 完成 vertical slice 與 bounded runtime validation。實驗證明既有 capability 可以組合成 coherent Application Shell，且 Shell responsibility 可以與 Feature UI、Backend Authorization、CRUD interaction 清楚分離。

## Verified Runtime Chain

```text
Browser Entry / Deep Link
→ Session Restore or Login
→ Supabase Auth Identity
→ app_user resolution
→ Application Eligibility
→ Application User Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Rendered Result
→ explicit Logout / Session invalidation
```

## Application Context / Feature Entry

Claire Environment Evidence 驗證 current fixture：

- `admin`：Shell Ready；Home + 2 Business + 1 Common Feature。
- `user`：Shell Ready；Home + 2 Business；Common hidden / direct route rejected。
- `guest`：Shell Ready / Home only；無 Feature Entry。

因此 current Evidence 支持：

```text
Authentication Identity
≠ Application Eligibility
≠ Navigation Visibility
≠ Route / Feature Entry
≠ Feature Data Access
≠ Backend Authorization
```

`app_user.user_type` 在本實驗只承擔 coarse Application User classification，不形成 Role / Permission / RBAC architecture。

## Feature Composition

同一 deployed Shell 內已實際執行三種 integration shape：

1. **Place Native**：Browser → Supabase Native Data API → bounded `place` read → render。
2. **Place Weather**：Browser → Native Place sample → direct Open-Meteo External API → composed render；provider result 可 partial success/failure。
3. **Place-Country Custom API**：Browser → authenticated Supabase Edge Function → bounded response → render。

Feature classification 與 integration mechanism / data-source domain 是不同維度，不應由 Menu classification 推導 backend architecture。

## Route / Browser Lifecycle Evidence

### Deep Link / Reload

Claire 在 Production Live Demo 的 iPad Ordinary Safari 驗證：

```text
Authenticated /business/places
→ Reload
→ Application bootstrap
→ remains Place Native
```

同一 Safari profile 開新分頁直接進 `/business/places`，persisted Session 可重新 bootstrap Application Context 並停留 requested Feature。

Chrome cross-browser control 在沒有 Safari Session 的情況直接貼 `/business/places`，結果為 Login Page。這支持 Session storage/browser context 與 requested route 是分離 responsibility；URL 本身不攜帶 authenticated Application Context。

### Browser Back / Forward

Claire 驗證：

```text
Home
→ Place Native
→ Place Weather
→ Safari Back
→ Place Native
→ Safari Forward
→ Place Weather
```

URL / route content / Shell navigation lifecycle 符合預期，Browser History 不需要被轉成 Business Action mechanism。

## Session / Logout Lifecycle Evidence

PR #39 Technical QC 修正並驗證 auth lifecycle：

- auth invalidation/null Session fail closed；
- refreshed non-null Session 同步 current caller JWT；
- bootstrap 不以 stale Session 覆寫 listener 已同步的新 Session。

PR #40 將 explicit Logout 固定為 current-session/local logout semantics，provider returned error 不再被 UI 偽裝成 successful Logout。Primary Agent Technical QC PASS。

PR #40 deployed 後 Claire 驗證：

```text
Explicit Logout
→ Login
→ leave/re-enter Live Demo
→ remains Login
```

另一路徑：

```text
Authenticated Shell
→ Safari Back / leave Application（未 Logout）
→ re-enter Live Demo
→ persisted Session restores Application Context
```

兩者都符合預期，因此建立 lifecycle boundary：

```text
Explicit Logout terminates current Session.
Browser Navigation / leaving Application does not imply Logout.
```

Historical explicit-logout Session restoration anomaly 仍保存於 `evidence/2026-09-16-safari-auth-session-lifecycle.md`。它是 directly observed but intermittent；root cause Unknown。S-SHELL-1 completion 不把該 anomaly 改寫成 Shell bug、Safari bug 或已修復 provider bug。

## Responsive / Device Evidence

Claire 在 iPad Safari 與 iPhone Safari 驗證 Shell / Login / Navigation / Feature rendering。Narrow viewport drawer、Feature cards、admin/user/guest navigation composition 可使用，沒有發現阻止 Shell lifecycle adoption 的 responsive blocker。

這只驗證 iPad-first Shell usability，不形成 Production Design System / component styling decision。

## Technical Corrections Learned During Implementation

Implementation/QC 過程留下幾個值得正式平台避免重踩的 lifecycle trap：

- `onAuthStateChange` 必須處理 invalidation，不能只在 initial bootstrap 讀 Session。
- `autoRefreshToken` 開啟時，手工組 Authorization header 的 Custom API call 必須使用 current refreshed Session，而不是 bootstrap 時的 stale access token。
- Application User bootstrap query 應只投影 Application Context 需要的欄位；filter identity 不代表必須把 identity 欄位暴露到 UI state。
- bounded experiment read 必須在 implementation 保持 bounded，不能因畫面方便偷偷擴張。
- Logout UI completion 必須建立在 provider sign-out success，而不是按鈕點下去就假裝完成。
- Browser Navigation lifecycle、Session lifecycle 與 Business Action lifecycle 應分離。

## Shell Responsibility Candidate

Evidence 支持將下列 responsibility 視為正式 Nook Works Application Shell design input：

- Auth / Session lifecycle；
- Authentication Identity → active Application User Context bootstrap；
- metadata-derived Navigation / Feature Entry；
- Route resolution / deep-link / refresh / browser history；
- Shell-level loading/error / sign-out/invalidation；
- browser-safe runtime configuration boundary。

以下不應因為「畫面在 Shell 裡」就升格為 Shell global responsibility：Feature data state、CRUD/Form state、query/filter/pagination state、server result cache、Business Authorization。

## Deferred to Platform UI / Formal Design

S-SHELL-1 不回答：

- CRUD / Form maintenance lifecycle；
- Save / Cancel / Browser Back with unsaved changes；
- Query state restoration；
- Pagination / Search / Sort / Filter；
- reusable Table / Data Grid；
- Design System / component library；
- production Dynamic Menu maintenance；
- Role / Permission / RBAC；
- production Business Authorization / HTTP error contract；
- production framework/router/state-library selection。

這些是 deliberate deferred branches，不是 Shell experiment 漏測。

## Current Judgment

S-SHELL-1 stop condition 已滿足。Application Shell lifecycle 不再是 Nook Technical Platform 的 technical blocking gap。

Formal Nook Works 不應直接複製 disposable `app.js` 作 Production architecture；應以本 Experiment 的 verified contracts、Evidence 與 lifecycle traps 作 Platform Shell design input，再依正式 repository structure 重構 portable logic。

```text
Playground Vertical Slice
→ Verified Contract / Evidence
→ Formal Platform Shell Design
→ Reuse / Refactor portable logic
→ Production Implementation
```

**Experiment Verified ≠ Production Architecture Decision.**
