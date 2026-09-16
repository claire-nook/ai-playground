# S-SHELL-1 — Nook Works Application Shell Integration Probe

- Date: 2026-09-16
- Status: Candidate / Ready for Implementation Planning
- Type: Application Shell / Integration / Composition
- Primary Target: Nook Works browser application shell
- Environment Priority: iPad-first + iPhone narrow viewport + desktop sanity
- Review Input: `agent-work/reviews/application-shell-experiment-review-v2.md`
- Existing Capability Baseline: Experiment A / B / B-1 / C-DB-1 / C-EXT-1

## Research Question

已驗證的 Auth、Application Access、Native Data API、Custom API 能力，能否被組合成一個具有明確 lifecycle、Application User Context、Navigation、Route、Feature Entry 與 responsive behavior 的 Nook Works Application Shell？

這是一個 **Integration / Composition Experiment**，不是重新驗證前面已完成的 provider capability。

Live Demo 應維持很小，但正常流程必須是真的：Login → Supabase Auth → `app_user` → Application Context → Shell → Feature → Data Access → Render。

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

---

## Architecture Inputs

### Identity layers

Experiment 維持三個 identity layer：

1. **Authentication Identity** — Supabase Auth 回答 who authenticated。
2. **Application User / Eligibility** — `app_user` 將 Auth Identity 對應到 Nook Works，`is_active` 決定目前是否可進入 Application。
3. **Application User Context** — bootstrap 成功後提供 `app_user_oid`、display identity、`user_type` 等 application-level identity。

Authentication Success ≠ Application Ready。

Experiment B 已驗證：authenticated identity 若沒有 `app_user` mapping，或 `app_user` inactive，仍不會取得當時測試的 Application Access。本 Experiment 直接重用這個 model，不重新 probe RLS mechanism。

### Authorization model premise

一般企業 Application 若有多個 User、不同職責或交叉權限需求，通常會採用 Role / Permission model，讓 User 與可執行功能之間不必形成固定的一對一分類。這是正常且合理的 enterprise authorization design。

Nook Works 現階段的實際條件不同：預期 Application User 只有約 1～2 人，目前主要使用者實際上就是 Claire，也尚未出現 multi-role、cross-role 或 fine-grained permission 的 Business Requirement。

因此本階段不建立 Role / Permission architecture，不是因為否定這種設計，也不是因為技術上無法實作，而是目前的 requirement complexity 不足以合理化額外的 Role、User-Role mapping、Permission 與 maintenance structure。

Current boundary：

```text
Current Nook Works
→ expected Application Users: 1–2
→ no current multi-role / fine-grained permission requirement
→ use app_user.user_type as coarse Application User classification
→ defer Role / Permission architecture until Business Requirement justifies it
```

這是 deliberate simplification，不是永久的 Platform Rule。未來若出現同一 User 需要多組職責、不同 Feature 需要獨立 Permission，或使用者規模與管理需求明顯增加，再重新評估 Role / Permission model。

### `user_type` scope

Formal schema 目前保留：

```text
admin
user
guest
```

本 Experiment：

```text
admin    In Scope
user     In Scope
guest    Reserved / Out of Scope
```

`guest` 目前沒有 Business Use Case，因此不建立 guest account，也不定義 guest login、Navigation、Route、Authorization 或 RWD behavior。

`user_type` 是 coarse Application User classification，不是 Role / RBAC / Permission architecture。

---

## Live Demo Shape

建立一個小型、但真的可登入的 Nook Works-style application：

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

Login Page 是 Authentication Entry，不是 authenticated Shell。只有 Auth + Application User bootstrap 成功後，Shell 才進入 Ready。

Normal transition：

```text
SIGNED OUT
→ AUTHENTICATING
→ LOAD APP USER
→ CHECK ELIGIBILITY
→ BUILD APP CONTEXT
→ RESOLVE ROUTE
→ SHELL READY
```

Representative failure outcome 應包含 invalid / no session、no `app_user`、inactive `app_user`、Application Context load failure。難以安全製造的 failure state 可以使用 bounded synthetic control，但不能取代 real normal trunk。

---

## User Fixture

| Application User | `user_type` | Business Function | Common Function |
| --- | --- | :---: | :---: |
| Claire | `admin` | Visible / usable | Visible / usable |
| Test User | `user` | Visible / usable | Hidden from Navigation |

No guest account required.

---

## Routes / Features

使用三個 stable route：

- `/home` — Shell landing content，只顯示足夠的 Application User Context，讓 bootstrap success 可觀察；不是 Dashboard。
- `/business` — minimal Business Function。
- `/common` — minimal Common / Control Function。

只有 `/business`、`/common` 算 Feature page。

### Business Function

`admin` / `user` 都可以進入。

Feature 必須做 real data read。Preferred path 是對安全且適合的 Business-domain source 使用已驗證的 Native Data API SELECT，再 render result。

```text
Authenticated Application
→ Shell
→ Business Feature
→ Native Data API
→ Database
→ Rendered Result
```

這不是重新測 Native CRUD。Experiment B 已經取得 Browser → Auth Session → Native Data API → Grant / RLS → Application Access → CRUD 的 iPad Safari Evidence。

### Common Function

`admin` 可以看見並進入 Common Feature；`user` 不顯示 Common Navigation entry。

Common Feature 也必須 real data read。如果有 safe existing Custom API 可以直接 reuse、且不擴張 scope，可讓 Common Feature 使用 Custom API，以觀察 Shell 是否能保持 data-access mechanism neutral：

```text
Business Feature → Native Data API
Common Feature   → Custom API (only if safe / reusable)
```

若 Custom API reuse 需要 substantial new backend work，就改用 simple real read。C-DB-1 / C-EXT-1 已驗證 Custom API capability，不為了 symmetry 重做 probe。

---

## Visibility / Route / Authorization Boundary

本 Experiment 必須明確區分：

```text
Navigation Visibility
≠ Route Handling / Feature Entry
≠ Feature Data Access
≠ Authoritative Backend Authorization
```

Test User 的 `/common` 不出現在 Navigation，但仍要 direct URL `/common`，觀察 Shell 如何處理 route responsibility。

不能 fake backend `403`，也不能把 Hidden Navigation 寫成 Backend Authorization。若正式 backend 尚未 enforce `user_type=user → Common data denied`，保留給後續 Authorization / Error Contract design。

---

## Evidence Phases

同一個 disposable Shell artifact 分三個 phase 驗證，不建立三套 Demo。

### Phase A — Bootstrap / Application Context

驗證 real Auth + Application User integration 的 lifecycle。

Evidence：

- Signed-out entry
- Real login
- Auth Identity → `app_user` mapping
- `is_active` eligibility
- `user_type` / Application User Context establishment
- Claire / `admin` Ready state
- Test User / `user` Ready state
- authenticated + no `app_user`
- inactive `app_user`
- representative invalid-session / context-load failure
- sign-out / invalidation clears identity-derived state and privileged Shell UI
- no redirect / retry loop

Synthetic control 只用於難以安全製造的 failure state；real normal trunk 不可被 synthetic flow 取代。

### Phase B — Feature Composition / Navigation / Route

驗證 Application Context 是否能控制 coarse Feature Entry，並完成 real Feature data retrieval。

Evidence：

- `admin`: Business visible / usable; Common visible / usable
- `user`: Business visible / usable; Common Navigation hidden
- Business Feature real data retrieval + render
- Common Feature real data retrieval + render on admin path
- `user` direct `/common` has deterministic Shell outcome
- deep link preserves requested route through bootstrap
- refresh preserves meaningful route semantics
- Back / Forward behaves as browser route history
- unknown route has recoverable deterministic outcome
- Feature data / error state remains Feature-owned

### Phase C — iPad-first Responsive / Browser Interaction

沿用同一個 stabilized application，不在這個 phase 增加 Business behavior。

Primary observations：

- iPad landscape
- iPad portrait
- iPhone narrow viewport
- desktop width sanity check
- iPad Split View exploratory only, unless it exposes a blocker

Human Environment Evidence 應觀察 touch Navigation、menu open / close、orientation transition、refresh、Back / Forward、sign-out、loading / error presentation，以及是否出現 horizontal overflow、trapped overlay、stale privileged content。

使用 `admin` 作為 maximum Navigation Set、`user` 作為 reduced Navigation Set。不為了 responsive matrix 額外發明 guest scenario。

Real-device / emulated evidence 必須明確標示。

---

## Shell Responsibility Candidate

Global Shell responsibility 先維持最小：

- Auth / session lifecycle
- Application User bootstrap / Application User Context
- current route / route resolution
- Navigation / Feature Entry visibility
- Shell navigation UI state
- bootstrap / Shell-level loading and unexpected error state
- sign-out / identity-derived state invalidation
- browser-safe runtime configuration boundary

Feature data、CRUD / form state、server result cache、Feature validation、Feature-specific API error 不因為 Feature 被 Shell 包住，就自動進入 Shell global state。

---

## Existing Evidence Reused

本 Experiment 做 composition，不重做已完成的 capability probe：

- Experiment A — Supabase Auth
- Experiment B — Native Data API CRUD / Application Access
- Experiment B-1 — Native View Read Model
- C-DB-1 — authenticated Browser → Custom API → database-centric path
- C-EXT-1 — authenticated Custom API composition / External API orchestration

New Evidence 聚焦 integrated Application Runtime 與 responsibility boundary。

---

## Stop Condition

當同一個 Live Demo 已取得足夠 Evidence 回答以下問題，就停止：

1. Real login 可完成 Auth Identity → `app_user` → eligibility → Application User Context → Shell Ready。
2. Signed-out、ineligible、failure、sign-out / invalidation 都有 deterministic outcome，不留下 stale privileged state 或 loop。
3. `admin` / `user` coarse Feature Entry visibility 可預期，而且沒有被擴張成 Role / Permission architecture。
4. Business / Common Feature 都能 real data retrieval + render，證明完整 Application vertical slice，不只是 visual-only shell。
5. Direct route、deep link、refresh、unknown route、Back / Forward semantics coherent。
6. Hidden Navigation 沒有被當成 Backend Authorization；missing backend `user_type` authorization 明確保持 open。
7. Same Shell 在 iPad landscape / portrait、iPhone narrow target 可用，並留下 desktop sanity Evidence。
8. Runtime Evidence 與 open Platform Design choice 有明確界線。

達成以上條件即停止，不把 disposable artifact 繼續裝修成 Production Application。

---

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
- new backend mechanism solely for making the Demo appear more complete

---

## Open Implementation Planning

開始 implementation 前，只決定足以執行 probe 的 minimum details：

- exact safe Business-domain data source for `/business`
- exact safe Common-domain data source for `/common`
- whether existing Custom API can be reused without scope expansion
- deterministic route outcome for `user` direct `/common`
- visual Navigation behavior for iPad portrait / iPhone narrow
- Evidence capture format / Catalog metadata

如果其中某項暴露 Business / Platform decision，再交由 Claire + Primary Agent 判斷；不要由 disposable Demo 偷偷決定 Platform Rule。

---

## Current Judgment

Preferred Experiment 是 **single disposable-but-realistic Nook Works Shell Live Demo + three Evidence Phases**。

Normal path 使用 real Supabase Auth、`app_user`、Application Context、Shell、Feature Entry、data retrieval、rendered result。Synthetic control 只保留給 difficult failure state。

研究目標是驗證 composition 與 responsibility boundary。Demo 使用的 router、CSS、state mechanism、menu implementation、data-access choice，不因為 Demo 成功就自動升格為 Platform Rule。

> Playground Evidence is not a Production Architecture Decision.
