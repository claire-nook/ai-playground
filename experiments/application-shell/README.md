# Application Shell Probe

- 狀態：Candidate / Ready for Implementation Planning
- 研究軌道：Application Shell
- Evidence 狀態：尚未實作，目前沒有新的 Runtime Evidence
- 主要目標：Nook Works browser Application Shell
- 體驗優先順序：iPad-first，並觀察 iPhone narrow viewport 與 desktop sanity
- Review input：`agent-work/reviews/application-shell-experiment-review-v2.md`
- 既有能力基線：Experiment A、B、B-1、C-DB-1、C-EXT-1

## 為什麼要做這個實驗

Nook Works 需要的不只是一個 responsive menu。Application Shell 是 browser-side 的組合層，負責把已經驗證過的 Auth、Data API、Custom API 等能力，組合成一個有一致 lifecycle 的 Application Runtime。

因此這是一個 **integration / composition experiment**，不是把前面已完成的 provider capability probe 再做一次。

Live Demo 應該刻意保持很小，但必須是一個真的可以運作的小型 application：有真正的 Login page、真正的 Supabase Auth、真正的 `app_user` resolution、可見的 Shell、兩個最小 Feature page、真正的 data retrieval、routing、sign-out 與 responsive behavior。Feature 本身故意做得很薄，因為這次研究的是 Shell，不是 Feature UI design。

```text
Browser Entry
→ Login / Session Restore
→ Supabase Auth Identity
→ app_user resolution
→ Application Eligibility
→ Application User Context
→ Route Resolution
→ Shell Ready
→ Feature
→ Data Access
→ Rendered Result
```

## Research Questions

1. Shell 能不能明確區分 Authentication Identity、Application User eligibility 與 Application User Context，而不是登入成功後全部揉成一團？
2. 正常流程能不能使用真正的 Supabase Auth + `app_user` integration，而不是用 synthetic identity selector 假裝登入？
3. 已驗證的 Native Data API / Custom API 能力，能不能被組合到 Feature 後方，而不變成 Shell 自己的責任？
4. `user_type` 能不能只負責 coarse Feature Entry visibility，而不被誤用成 Role / Permission / backend authorization？
5. Route、deep link、refresh 與 browser history semantics，在 bootstrap、sign-out / invalidation 前後能不能保持一致？
6. 同一個 Shell 在 iPad landscape / portrait 與 iPhone narrow viewport 是否仍然可用？
7. 哪些觀察可以成為 Runtime Evidence，哪些仍然只是後續 Platform Rule / Authorization design 的待決問題？

## 已確認的 Architecture Inputs

### Identity layers

實驗刻意把三個 identity layer 分開：

1. **Authentication Identity**：Supabase Auth 回答「是誰完成 authentication」。
2. **Application User / Eligibility**：`app_user` 把 Auth Identity 對應到 Nook Works，`is_active` 決定這個 Application User 目前是否具有進入 application 的資格。
3. **Application User Context**：bootstrap 成功後，保存 application-level identity，例如 `app_user_oid`、display identity 與 `user_type`。

Authentication success 本身不代表 Application Ready。Experiment B 已經驗證：已 authentication 但沒有 `app_user` mapping，或 `app_user` inactive 的 identity，不會取得當時測試的 Application Access。這次 Shell experiment 直接沿用這個已成立的模型，不重新證明 RLS mechanism。

### `user_type` 的範圍

Formal schema 目前預留：

- `admin`
- `user`
- `guest`

本實驗只處理：

- `admin`：In Scope
- `user`：In Scope
- `guest`：**Reserved / Out of Scope**

目前沒有具體的 `guest` Business Use Case。不能只因為 schema 預留了這個值，就順手發明 guest login、navigation、route access、authorization 或 responsive acceptance。預留未來的語意空間，不代表現在就要替不存在的需求繳維護費。

`user_type` 只是 coarse Application User classification，不是 Role / RBAC / Permission architecture。

## Live Demo 的形狀

實驗產物是一個小型、但真的可以登入的 Nook Works-style application。

```text
Login
  ↓
Supabase Auth
  ↓
Application User bootstrap
  ↓
Shell
  ├─ Home
  ├─ Business Function
  └─ Common Function
  ↓
Logout
```

### Login 與 Shell 的界線

Login surface 是 Authentication Entry，不是 authenticated Shell 本身。只有 Auth 與 Application User bootstrap 都成功後，Shell 才能進入 Ready。

正常 transition：

```text
SIGNED OUT
→ AUTHENTICATING
→ LOAD APP USER
→ CHECK ELIGIBILITY
→ BUILD APP CONTEXT
→ RESOLVE ROUTE
→ SHELL READY
```

代表性的 failure outcome 應包含：沒有／無效 session、沒有 `app_user`、inactive `app_user`、Application Context load failure，以及 malformed / unknown context。難以安全製造的 provider failure 可以使用 bounded synthetic control，但不能拿 synthetic flow 取代正常真實流程。

## User Fixture

正常流程使用兩個真正的 experiment user：

| Application User | `user_type` | Business Function | Common Function |
| --- | --- | :---: | :---: |
| Claire | `admin` | 可見 / 可使用 | 可見 / 可使用 |
| Test User | `user` | 可見 / 可使用 | Navigation 隱藏 |

不需要建立 guest account。

## Routes 與 Features

使用三個穩定 content route：

- `/home`：只有 Shell landing content，顯示足夠的 Application User Context，讓成功 bootstrap 可以被觀察。
- `/business`：最小 Business Function。
- `/common`：最小 Common / Control Function。

只有 `/business` 與 `/common` 算 Feature page。`/home` 不要因為畫面有空白就開始長成 dashboard，人類看到空白就想塞東西的本能這次先忍住。

### Business Function

`admin` 與 `user` 都可以進入。

Feature 必須透過已驗證的 application data mechanism 做一次真正的 read。優先考慮對適合且安全的 Business-domain source 使用 Native Data API SELECT，再用刻意簡單的方式把資料 render 出來。

目的：

```text
Authenticated Application
→ Shell
→ Business Feature
→ Native Data API
→ Database
→ Rendered Result
```

這不是重新測 Native CRUD。Experiment B 已經在 iPad Safari 驗證 Browser → Auth Session → Native Data API → Grant / RLS → Application Access → CRUD。

### Common Function

`admin` 看得到也能進入 Common Feature；`user` 不取得這個 Navigation entry。

這個 Feature 也必須讀取真正資料。如果有安全、既存而且不會擴張 scope 的 Custom API 可以直接重用，讓 Common Feature 使用不同的既有 data-access mechanism 會很有價值，因為它能證明 Shell 不應依賴 Feature 底下究竟採用哪種 data-access implementation：

```text
Business Feature → Native Data API
Common Feature   → Custom API（只有安全且可直接重用時才優先）
```

如果為了 Custom API symmetry 反而需要新增一堆 backend work，就不要做。C-DB-1 / C-EXT-1 已經驗證 Custom API capability，沒必要為了儀式感再證明一次。

## Visibility、Route Handling 與 Authorization Boundary

實驗必須明確區分：

```text
Navigation Visibility
≠ Route Handling / Feature Entry
≠ Feature Data Access
≠ Authoritative Backend Authorization
```

Test User 的 `/common` 不顯示在 Navigation，但仍要直接輸入 `/common` URL，觀察 Shell 對 route responsibility 的 deterministic outcome。

實驗**不能**因此發明 production authorization mechanism、假裝 backend 回了 `403`，也不能把「Navigation 看不到」寫成 Common data 已經受到保護。如果正式 backend authorization 尚未 enforce `user_type=user → Common data denied`，這仍屬於後續 Authorization / Error Contract design queue。

## Evidence Phases

只做一個 disposable Shell artifact，分三個 Evidence Phase 觀察，不要做三套程式。

### Phase A：Bootstrap / Application Context

驗證真正 Auth 與 Application User integration 周圍的 application lifecycle。

Evidence 應涵蓋：

- Signed-out entry。
- 真正 login。
- Auth Identity → `app_user` mapping。
- `is_active` eligibility。
- `user_type` / Application User Context establishment。
- Claire / `admin` Ready state。
- Test User / `user` Ready state。
- authenticated 但沒有 `app_user` 的 outcome。
- inactive `app_user` outcome。
- 代表性的 invalid-session / context-load failure outcome。
- sign-out / invalidation 後，identity-derived state 與 privileged Shell UI 必須被清掉。
- 不得產生 redirect / retry loop。

只有難以安全製造的 failure state 可以使用 synthetic control；正常流程必須是真的。

### Phase B：Feature Composition / Navigation / Route

驗證已建立的 Application Context 能不能驅動 coarse Feature Entry，並讓 Feature 完成真正的 data retrieval。

Evidence 應涵蓋：

- `admin`：Business 可見且可用；Common 可見且可用。
- `user`：Business 可見且可用；Common Navigation entry 隱藏。
- Business Feature 取得並 render 真正資料。
- Common Feature 在 in-scope admin path 取得並 render 真正資料。
- `user` 直接輸入 `/common` 時有 deterministic Shell outcome。
- direct / deep link 經過 bootstrap 後仍保留 requested route。
- refresh 後仍保有合理 route semantics。
- Back / Forward 應表現成 browser route history，而不是製造壞掉的 bootstrap instance。
- unknown route 有可恢復、可預期的 outcome。
- Feature data / error state 仍由 Feature 自己負責，不外洩成 global Shell state。

### Phase C：iPad-first Responsive / Browser Interaction

沿用同一個已穩定的 application，不在這一階段增加 Business behavior。

主要觀察：

- iPad landscape。
- iPad portrait。
- iPhone narrow viewport。
- desktop width sanity check。
- iPad Split View 只做 exploratory observation，除非真的暴露 blocker。

Human-visible check 應包含 touch navigation、menu open / close、orientation transition、refresh、Back / Forward、sign-out、loading / error presentation、沒有必要的 horizontal page overflow、沒有 trapped overlay，也不能殘留 stale privileged content。

使用 `admin` 作為最大 Navigation Set，`user` 作為縮減後的 Navigation Set。不要為了湊第三列 responsive matrix 去發明 guest scenario。

Real-device 與 emulated evidence 必須誠實標示，不能拿模擬器冒充 Claire 手上的 iPad。

## Shell Responsibility Candidate

Shell 的 global responsibility 刻意維持很小：

- Auth / session lifecycle。
- Application User bootstrap 與 Application User Context。
- current route / route resolution。
- Navigation / Feature Entry visibility。
- Shell navigation UI state。
- bootstrap / Shell-level loading 與 unexpected error state。
- sign-out 與 identity-derived state invalidation。
- browser-safe runtime configuration boundary。

Feature data、CRUD / form state、server result cache、Feature validation、Feature-specific API error，不應只因為 Feature 被 Shell 包住，就全部塞進 Shell global state。

## 重用既有 Evidence，不重新考古

Shell experiment 要做的是 composition，不是重複既有 capability evidence：

- Experiment A：Supabase Auth。
- Experiment B：Native Data API CRUD / Application Access。
- Experiment B-1：Native View Read Model。
- C-DB-1：authenticated Browser → Custom API → database-centric path。
- C-EXT-1：authenticated Custom API composition / External API orchestration。

這些 baseline 已經降低這次需要重新 probe backend 的範圍。新的 Shell Evidence 應聚焦 integrated Application Runtime 與 responsibility boundary。

## Stop Condition

當同一個 Live Demo 已經有足夠 Evidence 回答以下問題，就停止實驗：

1. 真正 login 能完成 Auth Identity → `app_user` → eligibility → Application User Context → Shell Ready。
2. Signed-out、ineligible、failure 與 sign-out / invalidation outcome 都 deterministic，不留下 stale privileged state，也不形成 loop。
3. `admin` / `user` 的 coarse Feature Entry visibility 行為明確，而且沒有順手長成 Role / Permission architecture。
4. Business 與 Common Feature 都能真正取得資料並 render，證明的是完整 Application vertical slice，而不是只有漂亮 Shell 外殼。
5. Direct route、deep link、refresh、unknown route 與 Back / Forward semantics 保持 coherent。
6. Hidden Navigation 不被描述成 Backend Authorization；缺少的 backend `user_type` authorization 必須明確保留為 open issue。
7. 同一個 Shell 在主要 iPad landscape / portrait 與 iPhone narrow target 可用，並留下 desktop sanity evidence。
8. Runtime Evidence 與仍未決的 Platform Design choice 有清楚界線。

達成以上條件就停。不要因為 disposable artifact 已經能跑，就突然開始把它裝修成 production application。

## Explicitly Out of Scope

- production framework selection
- production router library selection
- global state-management library selection
- component library / Design System selection
- Dynamic Menu / Menu Maintenance
- Role / Permission / RBAC
- `guest` behavior implementation
- production Business Authorization / 401 / 403 / 404 contract
- Feature CRUD / Form / Table / Dialog maintenance patterns
- dashboard design
- PWA / offline behavior
- multi-tab / session synchronization
- OAuth / passkey expansion
- exhaustive Safari / device certification
- full accessibility certification
- production Session Policy
- 只為了讓 Demo 看起來更完整而新增 backend mechanism

## 尚待 Implementation Planning 決定的項目

真正開始 implementation 前，只決定足以執行 probe 的最小細節：

- `/business` 要使用哪個安全的 Business-domain data source。
- `/common` 要使用哪個安全的 Common-domain data source。
- 是否有既存 Custom API 可以讓其中一個 Feature 直接重用，而且不擴張 scope。
- `user` 直接輸入 `/common` 時，Shell 應採用哪個 deterministic route outcome。
- iPad portrait 與 iPhone narrow 的實際 visual navigation behavior。
- Evidence capture format 與 experiment catalog metadata。

除非其中某項暴露出 Business / Platform decision，否則這些都只是 implementation-planning choice，不需要偷偷升格成架構憲法。

## Current Judgment

目前偏好的實驗形式是：**一個 disposable-but-realistic 的 Nook Works Shell Live Demo，搭配三個 Evidence Phase**。

正常路徑全部是真的：Supabase Auth、`app_user`、Application Context、Shell、Feature Entry、data retrieval、rendered result。Synthetic control 只保留給難以安全製造的 failure state。

這個實驗要驗證的是 composition 與 responsibility boundary。不能只因為 Demo 跑得動，就把其中採用的 router、CSS、state mechanism、menu implementation 或 data-access choice 自動升格成 Platform Rule。