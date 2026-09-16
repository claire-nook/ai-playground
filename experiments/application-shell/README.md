# S-SHELL-1 — Nook Works Application Shell Integration Probe

- Date: 2026-09-16
- Status: Verified / Completed
- Type: Application Shell / Integration / Composition
- Primary Target: Nook Works browser application shell
- Environment Priority: iPad-first + iPhone narrow viewport + desktop sanity
- Consolidated Findings: `evidence/s-shell-1-application-shell-findings.md`
- Auth Lifecycle Evidence: `evidence/2026-09-16-safari-auth-session-lifecycle.md`
- Existing Capability Baseline: Experiment A / B / B-1 / C-DB-1 / C-EXT-1

## Research Question

已驗證的 Auth、Application Access、Native Data API、Custom API 與 External API integration 能力，能否被組合成一個具有明確 lifecycle、Application User Context、metadata-driven Navigation、Route、Feature Entry 與 responsive behavior 的 Nook Works Application Shell？

**Result: Yes / Verified.** 這是 Integration / Composition Evidence，不是 Production Architecture Decision。

```text
Browser Entry / Deep Link
→ Login / Session Restore
→ Supabase Auth Identity
→ app_user resolution
→ Application Eligibility
→ Application User Context
→ metadata / Route Resolution
→ Shell Ready
→ Feature
→ Native / Custom / External integration
→ Rendered Result
→ Sign-out / Invalidation
```

## Supporting Contracts

- [Feature Integration Contract](./feature-integration-contract.md) — browser/runtime、三個 Feature、Native / Custom / External API contract 與 bounded read boundary。
- [Synthetic Platform Metadata Design](./synthetic-platform-metadata.md) — Feature Registry、Navigation、`user_type` mapping 與 Browser Access Contract。
- [Synthetic Platform Metadata SQL](./synthetic-platform-metadata.sql) — reproducible DDL、three-Feature fixture 與 inspection query。
- [Consolidated Findings](../../evidence/s-shell-1-application-shell-findings.md) — implementation/QC、Claire Environment Evidence、route/session lifecycle 與 formal Platform input。

這些 `test_*` objects 與 disposable browser artifact 都只屬於 Playground Experiment，不是 Production Platform schema / implementation。

## Identity / Eligibility Boundary

```text
Authentication Identity
≠ Application Identity / Eligibility
≠ Navigation Visibility
≠ Route Handling / Feature Entry
≠ Feature Data Access
≠ Authoritative Backend Authorization
```

`app_user.user_type` 目前只作 coarse Application User classification，不是 Role / Permission / RBAC。`private.can_access_application()` 只判斷 authenticated identity 是否對應 active `app_user`，不檢查 `user_type`。

Verified fixture：

| Application User | user_type | Shell | Business Features | Common Feature |
| --- | --- | :---: | :---: | :---: |
| Claire | `admin` | Ready | 2 | 1 |
| TU01 | `user` | Ready | 2 | 0 |
| TU02 | `guest` | Ready / Home only | 0 | 0 |

active guest 可進 Shell 但沒有 Feature Entry，證明 `Application Eligibility ≠ Feature Eligibility`。

## Live Demo Shape

Login Page 是 Authentication Entry，不是 authenticated Shell。只有 Auth + Application User bootstrap 成功後才 Shell Ready。

```text
Shell
├─ Home                          /home
├─ Business
│  ├─ Place Native              /business/places
│  └─ Place Weather             /business/weather
└─ Common
   └─ Place-Country Custom API  /common/place-country
```

三個 Feature 已在 deployed Shell 完成 real retrieval/render：Place Native 使用 Native Data API；Place Weather 組合 Native Place + browser direct Open-Meteo；Place-Country 使用 authenticated Custom API。Feature classification 與 integration mechanism / data-source domain 是不同維度。

## Route / Feature Entry Matrix

| Route | admin | user | guest |
| --- | :---: | :---: | :---: |
| `/home` | enter | enter | enter |
| `/business/places` | enter | enter | reject |
| `/business/weather` | enter | enter | reject |
| `/common/place-country` | enter | reject | reject |

Known-but-disallowed Feature route 使用 deterministic Shell rejection；unknown route 使用 recoverable Shell-safe not-found。Navigation hidden 不等於 Backend Authorization。

## Verified Browser Lifecycle

Claire Environment Evidence 已完成：

```text
Authenticated Feature → Reload → same Feature
Same Safari profile → new-tab deep link → Application Context + requested Feature
Different browser without Session → deep link → Login
Home → Place Native → Weather → Back → Place Native → Forward → Weather
Explicit Logout → re-entry → Login
Leave Application without Logout → re-entry → persisted Session restores Context
```

因此 Session lifecycle、Browser Navigation lifecycle 與 Feature Route lifecycle 應保持分離。Historical explicit-logout Session restoration anomaly 仍是 intermittent / root cause Unknown，詳見 Auth lifecycle Evidence；不得反向改寫成已證實的 Shell defect 或已修復 provider defect。

## Responsive Evidence

Claire 已在 iPad Safari / iPhone Safari 驗證 Login、Shell、drawer Navigation、admin/user/guest Feature Entry 與 Feature cards。結果足以支持 iPad-first Shell lifecycle feasibility，但不形成 Production Design System Rule。

## Bounded Data Rule

S-SHELL-1 Feature read 只為證明 real integration + rendering，保持 fixed/small bounded read。Pagination、Search、Sort、Filter、Reusable Data Grid / Table 與 large dataset navigation 明確 deferred 到 Platform UI research。

## Shell Responsibility Candidate

Evidence 支持 Shell 承擔 Auth/session lifecycle、Application User bootstrap/context、route resolution、metadata-derived Navigation / Feature Entry、Shell UI state、Shell-level loading/error、sign-out/invalidation、browser-safe runtime config boundary。

Feature data、Feature-specific API state、CRUD/form state、query state、server result cache 與 Business Authorization 不因被 Shell 包住就自動升格 global state。

## Implementation Knowledge

本次 implementation/QC 留下的主要 lifecycle traps：

- `onAuthStateChange` 必須處理 Session invalidation。
- token refresh 後，Custom API Authorization 必須使用 current refreshed Session。
- bootstrap 不應以 stale Session 覆寫 auth listener 已同步的新 Session。
- Application Context query 只投影必要欄位。
- Logout UI completion 必須建立在 provider sign-out success。
- Browser Navigation 不等於 Logout，也不等於 Business Action。

正式 Nook Works 不直接複製 disposable monolithic `app.js`；應把 verified contracts / portable logic / lifecycle traps 帶回 formal Platform Shell design，再依正式 repository structure 重構。

## Explicitly Out of Scope / Deferred

- production framework/router/state library selection
- Dashboard
- CRUD / Form maintenance pattern
- Save / Cancel / unsaved-change Browser Back lifecycle
- Query state restoration
- Pagination / Search / Sort / Filter / reusable Data Grid
- Design System / component library
- production Dynamic Menu / Menu Maintenance
- Role / Permission / RBAC
- production Business Authorization / 401 / 403 / 404 contract
- PWA / offline / multi-tab synchronization
- production Session Policy

## Stop Condition / Final Judgment

Stop condition 已滿足：real login → Application Context → Shell Ready；admin/user/guest Feature Entry deterministic；三種 Feature integration real retrieval/render；deep link/refresh/history coherent；explicit sign-out 無 stale Application Context；iPad/iPhone narrow usable；Navigation Visibility 未冒充 Backend Authorization。

**S-SHELL-1 Verified / Completed. Application Shell lifecycle 不再是 Nook Technical Platform 的 technical blocking gap。**

```text
Playground Vertical Slice
→ Verified Contract / Evidence
→ Formal Platform Shell Design
→ Reuse / Refactor portable logic
→ Production Implementation
```

## Live Demo

Disposable Live Demo 保留於 `/application-shell/` 作 verified reference artifact。`demoStatus=live` 不代表 Production implementation；它只是讓後續 Architecture / UI research 可以直接看到已驗證的 composition behavior。
