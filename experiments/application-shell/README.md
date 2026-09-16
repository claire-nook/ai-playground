# S-SHELL-1 — Nook Works Application Shell Integration Probe

- Date: 2026-09-16
- Status: Candidate / Ready for Implementation
- Type: Application Shell / Integration / Composition
- Primary Target: Nook Works browser application shell
- Environment Priority: iPad-first + iPhone narrow viewport + desktop sanity
- Review Input: `agent-work/reviews/application-shell-experiment-review-v2.md`
- Readiness Review: `agent-work/reviews/application-shell-implementation-readiness-review.md`
- Existing Capability Baseline: Experiment A / B / B-1 / C-DB-1 / C-EXT-1

## Research Question

已驗證的 Auth、Application Access、Native Data API、Custom API 與 External API integration 能力，能否被組合成一個具有明確 lifecycle、Application User Context、metadata-driven Navigation、Route、Feature Entry 與 responsive behavior 的 Nook Works Application Shell？

這是 **Integration / Composition Experiment**，不是重新驗證 provider capability。

```text
Browser Entry
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

Current live fixture：

| Application User | user_type | Shell | Business Features | Common Feature |
| --- | --- | :---: | :---: | :---: |
| Claire | `admin` | Ready | 2 | 1 |
| TU01 | `user` | Ready | 2 | 0 |
| TU02 | `guest` | Ready / Home only | 0 | 0 |

active guest 可進 Shell 但沒有 Feature Entry，刻意證明 `Application Eligibility ≠ Feature Eligibility`。

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

### Business / Place Native

`Browser → Supabase Native Data API → place → bounded render`

目的不是重新驗證 CRUD，而是證明 real Native read 能成為 Shell Feature vertical slice。

### Business / Place Weather

`Browser → Native Data API → bounded place sample → direct Open-Meteo External API → composed weather render`

這個 Feature 刻意直接由 browser 呼叫 External API，不另包自家 proxy。觀察 loading、CORS/browser integration 與 partial provider failure。Exact request/response contract 以 `feature-integration-contract.md` 為準。

### Common / Place-Country Custom API

`Browser → existing test-place-country Edge Function → response → render`

以 current authenticated caller session/JWT 呼叫既有 Custom API。Feature 被分類為 Common，不代表它必須讀 Common-domain table。**Feature classification 與 data source domain / integration mechanism 是不同維度。**

## Route / Feature Entry Matrix

| Route | admin | user | guest |
| --- | :---: | :---: | :---: |
| `/home` | enter | enter | enter |
| `/business/places` | enter | enter | reject |
| `/business/weather` | enter | enter | reject |
| `/common/place-country` | enter | reject | reject |

Known-but-disallowed Feature route 顯示 deterministic Feature-unavailable outcome；unknown route 顯示 recoverable Shell-safe not-found outcome。這些是 experiment UI behavior，不冒充 Production HTTP 403/404 contract。Navigation hidden 也不是 Backend Authorization evidence。

## Evidence Phases

### Phase A — Bootstrap / Application Context

觀察 signed-out entry、real login、Auth Identity → `app_user`、`is_active`、`user_type`、Application Context、session restore、sign-out / invalidation，以及 no app_user / inactive / representative context failure outcome。Normal trunk 必須是真的；難以安全製造的 failure 才可 bounded synthetic control。

### Phase B — Feature Composition / Navigation / Route

觀察三種 integration shape 是否能共存在同一 Shell：admin 有 2 Business + 1 Common；user 有 2 Business、Common hidden/direct rejected；guest Home only、所有 Feature direct rejected。Deep link / refresh / Back / Forward 必須 deterministic；Feature loading/error 保持 Feature-owned，不因單一 provider failure把整個 Shell 打死。

### Phase C — iPad-first Responsive / Browser Interaction

Primary target：iPad landscape / portrait、iPhone narrow；desktop sanity；iPad Split View exploratory。觀察 touch Navigation、menu open/close、orientation、refresh、history、sign-out、loading/error、horizontal overflow、overlay trap 與 stale privileged content。

Narrow Navigation 可使用 disposable drawer/overlay pattern，但不因此形成 Production Design System Rule。

## Bounded Data Rule

S-SHELL-1 的 Feature read 只為證明 real integration + rendering，必須 bounded。可使用 fixed order / small limit / small sample，不建立完整資料瀏覽器。

以下明確 **Out of Scope 並 Deferred 到 Platform UI research**：Pagination、Search、Sort interaction、Filter、Reusable Data Grid / Table behavior、Large dataset navigation。

這些問題會連動 page/cursor、total count、page size、server/client responsibility、responsive list/table 等另一整個 UI research branch。不要趁 Shell 實驗偷養第二隻怪獸。

## Shell Responsibility Candidate

Shell 只承擔 Auth/session lifecycle、Application User bootstrap/context、route resolution、metadata-derived Navigation / Feature Entry、Shell UI state、Shell-level loading/error、sign-out/invalidation、browser-safe runtime config boundary。

Feature data、Feature-specific API state、CRUD/form state、server result cache 不因為被 Shell 包住就自動升格 global state。

## Stop Condition

同一 Live Demo 在實際 iPad Safari 留下足夠 Evidence 證明：real login → Application Context → Shell Ready；admin/user/guest Feature Entry deterministic；三個 Feature 都 real data retrieval/render；direct route/deep link/refresh/history/unknown route coherent；sign-out 無 stale privileged state；iPad/iPhone narrow usable；Navigation Visibility 未冒充 Backend Authorization，即停止。

不要把 disposable artifact 順手裝修成 Production Application。

## Explicitly Out of Scope

- production framework/router/state library selection
- Dashboard
- CRUD / Form maintenance pattern
- Pagination / Search / Sort / Filter / reusable Data Grid
- Design System / component library
- production Dynamic Menu / Menu Maintenance
- Role / Permission / RBAC
- production Business Authorization / 401 / 403 / 404 contract
- PWA / offline / multi-tab synchronization
- production Session Policy
- new backend mechanism solely for Demo symmetry

## Current Judgment

S-SHELL-1 已完成 implementation planning。Provider-side fixture、Feature Integration Contract、synthetic metadata target 與 Codex Implementation Work Order 均已固定。下一步是 single disposable vertical slice implementation，再由 Primary Agent + Claire 做 real Supabase / iPad Safari Evidence validation。