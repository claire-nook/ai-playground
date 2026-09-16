# Work Order — S-SHELL-1 Application Shell Vertical Slice

## Metadata

- **Work Order ID:** 2026-09-16-application-shell-vertical-slice
- **Date:** 2026-09-16
- **Type:** Implementation
- **Primary Objective:** Implement a disposable browser vertical slice for S-SHELL-1 covering Auth/bootstrap, metadata-driven Navigation, three Feature integration shapes, routing, responsive Shell behavior, and observable failure/loading states.
- **Requested By:** Primary Agent / Claire
- **Intended Executor:** Codex Implementation Agent
- **Target Repository:** `claire-nook/ai-playground`
- **Source Baseline:** GitHub-visible `main` checkpoint prepared by Primary Agent; use the exact baseline SHA supplied in the Dispatch Handoff when the Task is created.
- **Related Phase:** S-SHELL-1 Phase A / B / C
- **Related Experiment / Research:** `experiments/application-shell/README.md`
- **Related Specification:** `experiments/application-shell/feature-integration-contract.md`; `experiments/application-shell/synthetic-platform-metadata.md`; `experiments/application-shell/synthetic-platform-metadata.sql`
- **Related Evidence / Report:** `agent-work/work-orders/2026-09-16-application-shell-implementation-readiness-review.md`
- **Related PR / Issue:** None
- **Supersedes:** None

## Objective

建立一個 disposable-but-realistic Application Shell Live Demo，讓 Claire 能在實際 iPad Safari 驗證：real login → Application User Context → metadata-driven Navigation / Route → Feature Entry → real data retrieval / render → sign-out。

本 Work Order 的重點是 implementation composition，不是重新設計 Platform Architecture，也不是把 Playground Demo 養成 Production Application。

## Context / Background

前置 Review 已判定 Codex 在沒有 Supabase management access 的條件下仍可實作 browser Shell，但 Primary Agent 必須先提供 stable browser/runtime/data contracts。

Primary Agent 已完成 provider-side reconnaissance：

- `app_user` fixture：Claire=admin active；TU01=user active；TU02=guest active。
- `private.can_access_application()` 只處理 authenticated + matching active app_user，不檢查 user_type。
- synthetic metadata tables 已存在並以 Application Access gate 提供 authenticated SELECT。
- `place` 是可安全展示的 Basic Data。
- `test-place-country` Edge Function ACTIVE 且 `verify_jwt=true`。
- External Weather provider contract 已在 Feature Integration Contract 收斂。

Feature classification 與 data source 不綁定。Business/Common 定義的是 Feature Entry classification，不是 table domain。

## Read First

依序完整閱讀：

1. `agent-work/README.md`
2. `agent-work/work-orders/index.md`
3. `agent-work/templates/work-order.md`
4. `agent-work/dispatch-handoff.md`
5. `experiments/application-shell/README.md`
6. `experiments/application-shell/feature-integration-contract.md`
7. `experiments/application-shell/synthetic-platform-metadata.md`
8. `agent-work/work-orders/2026-09-16-application-shell-implementation-readiness-review.md`

只有在需要確認既有 implementation pattern 時，再讀：

- `supabase/functions/test-place-country/index.ts`
- `supabase/functions/test-weather-orchestrator/index.ts`
- repository 內既有 browser observer / login patterns

## Execution Context Preflight

開始修改前必須：

1. 確認 workspace 來自本 Work Order Metadata 指定的 GitHub-visible source baseline 或其明確 descendant。
2. 確認上述 Read First files 全部存在且可讀。
3. 確認 repository 內沒有另一份正在施工、會與本 Work Order 衝突的 Application Shell implementation。
4. 若必要 contract 缺失、路徑不存在、baseline 明顯不符，停止並回報 `Cannot Complete`；不要靠猜測補 Requirement。
5. 不要求 Supabase management access。Provider-side schema/policy/runtime diagnosis 不屬於 Codex responsibility；若 browser implementation 遇到疑似 provider blocker，保存可重現 evidence 後停止交回 Primary Agent。

## Scope

實作範圍：

- Supabase browser client / browser-safe runtime config。
- Login / session restore / sign-out。
- current authenticated user → `app_user` bootstrap → Application Eligibility / Application User Context。
- active `admin` / `user` / `guest` behavior。
- metadata-driven Navigation / Feature Entry。
- `/home` Shell-owned landing content。
- 三個 Feature：
  - Business / Place Native。
  - Business / Place Weather direct External API composition。
  - Common / Place-Country existing Custom API。
- direct route / deep link / refresh / Back / Forward / unknown route deterministic behavior。
- loading / empty / Feature error / Shell bootstrap error states。
- iPad-first responsive Shell interaction，兼顧 iPhone narrow 與 desktop sanity。
- 保留清楚、可讀、具功能意圖的 Traditional Chinese comments；standard IT terms 保留英文。

## Out of Scope

- Production framework migration / redesign。
- Dashboard。
- CRUD。
- Role / Permission / RBAC。
- Production authorization redesign。
- 新增正式 Business tables。
- `app_user` 作為 Feature display data source。
- Pagination / Search / Sort / Filter / reusable Data Grid。
- Design System 建設。
- 修改既有 `test-place-country` 或其他 Edge Function architecture，除非 Primary Agent 另行核准 REWORK。
- 為 External API 再建立 proxy / Edge Function。

## Constraints

- iPad-first；不要假設 Desktop-only development/runtime behavior。
- Browser 不得包含 service_role、Secret Key、Supabase access token 或其他 privileged credential。
- Authenticated caller 必須維持自己的 session/JWT boundary。
- Feature data read 必須 bounded。
- Hidden Navigation 不得被描述成 Backend Authorization。
- active guest 可以進 Shell，但本輪沒有 Business/Common Feature Entry。
- 不要把 disposable implementation 的 file structure / UI choice 宣稱為 Platform Rule。

## Tasks / Suggested Method

1. 先完成 Shell bootstrap lifecycle 與 Application User Context，再建立 Feature UI；不要先畫三個孤兒頁面再倒著接 Auth。
2. 從 synthetic metadata derivation Navigation / allowed Feature set，不要把 admin/user Feature menu 全部 hard-code 成第二套 truth。
3. `/home` 永遠是 Shell-owned landing route，不需要 metadata Feature row。
4. 依 `feature-integration-contract.md` 實作三種 integration shape。
5. 每個 Feature 保有自己的 loading / error state；Feature failure 不應把整個 authenticated Shell 打死。
6. direct disallowed known Feature route 必須回到 deterministic Shell rejection state，不可因 Navigation hidden 就偷偷 render。
7. unknown route 必須有 deterministic not-found / Shell-safe outcome；不要 redirect loop。
8. narrow viewport Navigation 可採 disposable、清楚可操作的 pattern；不要求建立 reusable Design System。若選擇 drawer/overlay，需處理關閉、overflow 與 orientation state。
9. 保持 implementation small enough to inspect and discard after experiment。

## Required Evidence / Acceptance

Implementation Agent 必須能在其可用環境完成至少 static / local validation；Provider truth 與實際 iPad Safari Human Evidence 由 Primary Agent + Claire 接手。

最低 acceptance：

- 未登入時不進 Shell privileged state。
- valid active admin：Home + 2 Business + 1 Common。
- valid active user：Home + 2 Business；Common hidden，direct Common route deterministic rejected。
- valid active guest：Home only；Business/Common direct routes deterministic rejected。
- Shell bootstrap failure / missing application context 有明確 outcome，不留下 stale prior-user Navigation。
- Business Place Native 確實 render real `place` data。
- Business Place Weather 確實由 browser direct call Open-Meteo，並能處理 partial provider failure。
- Common Place-Country 確實以 current caller session/JWT 呼叫 `test-place-country` 並 render response。
- refresh / deep link / Back / Forward 不造成 route/context loop。
- sign-out 清除 privileged UI/context。
- iPad landscape / portrait 與 narrow viewport layout 沒有明顯 unusable overflow / unreachable navigation。
- 沒有 service_role / secret credential 被寫進 browser artifact 或 repo。

## Deliverables

- Application Shell browser implementation under repository-appropriate public/browser artifact path。
- 必要的 browser-safe configuration / dependency declaration。
- 若需要，最小更新相關 README，說明如何開啟 Live Demo 與觀察三個 Feature；不要重寫 Experiment judgment。
- Implementation report，依 Report Contract 回報 changed files、validation、known limitations、local commit SHA。

## Decision Boundary

Implementation Agent 可以自行決定 disposable implementation details，例如 component/file split、CSS layout、narrow navigation interaction、Feature presentation style，只要符合 contracts 與 acceptance。

Implementation Agent 不得自行決定或修改：

- user_type semantics / Feature Entry matrix。
- Supabase schema / RLS / grants / policies。
- `app_user` fixture。
- External API provider / endpoint contract。
- Custom API architecture。
- Production Platform Rules。
- Out-of-Scope items。

遇到上述 contract blocker，停止並交回 Primary Agent，不要用 workaround 偷渡 Architecture decision。

## Report Contract

結案回報至少包含：

- `Result: Completed` 或 `Result: Cannot Complete`
- source baseline / workspace HEAD
- changed files
- implementation summary
- validation performed + result
- acceptance items not locally verifiable
- provider/runtime blockers or assumptions（如有）
- local commit SHA（Completed 時必須）
- 明確聲明未加入 privileged credential

## Completion Contract

### Cannot Complete

若 Preflight / required contract / workspace / provider dependency 造成無法安全施工：

- 停止修改或只保留必要診斷 evidence。
- 不猜 Requirement、不製造看似完成的 fallback。
- 回報 blocker、已確認 evidence、需要 Primary Agent 補什麼。

### Completed

只有在：

1. Scope implementation 完成；
2. 可執行的 validation 已完成；
3. final diff 已自行 review；
4. 無 secret / unrelated change；
5. 已建立 local commit；
6. Report 回報 local commit SHA；

才可宣告 `Completed`。完成後停止，等待 Claire 建立 PR。不要自行擴張下一輪工作。
