# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Application Shell

S-SHELL-1：`experiments/application-shell/README.md`

目標是把已驗證的 Auth、Application Access、Native Data API、Custom API、External API integration 組成一個真的可登入、可進 Feature、可取得資料的 disposable Application Shell。

Current shape：

```text
Login / Session Restore
→ Auth Identity
→ app_user / Application Eligibility
→ Application User Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature
→ Data Access
→ Render
→ Sign-out / Invalidation
```

三個 Feature：

- Business / Place Native：Native Data API。
- Business / Place Weather：Native place sample + browser direct External Weather API。
- Common / Place-Country Custom API：existing authenticated Custom API。

User fixture：

- `admin`：Home + 2 Business + 1 Common。
- `user`：Home + 2 Business；Common hidden / direct rejected。
- `guest`：Home only；無 Feature Entry。

Boundary：

```text
Authentication Identity
≠ Application Eligibility
≠ Navigation Visibility
≠ Route / Feature Entry
≠ Feature Data Access
≠ Backend Authorization
```

Implementation preparation 已由 `agent-work/work-orders/2026-09-16-application-shell-vertical-slice.md` 與 `experiments/application-shell/feature-integration-contract.md` 承接。

## Next Major Track — Platform UI / Feature Interaction Pattern

S-SHELL-1 只回答「Feature 怎麼裝進 Application Runtime」。進入 Feature 後的 reusable UI interaction 另開 Research Branch，不混入 Shell。

Platform UI candidate scope：

- List / Table presentation。
- Pagination：page number vs cursor、page size、total count、server/client responsibility。
- Sort。
- Filter / Search。
- Loading / Empty / Error presentation。
- responsive list/table behavior。
- 單檔與主從維護畫面。
- Create / Edit / Delete / Save / Cancel action hierarchy。
- Validation / Dialog / Toolbar pattern。

因此 S-SHELL-1 Feature data read 必須 bounded，只取 small sample / fixed limit。**Pagination / Search / Sort / Filter 不是漏做，而是 deliberate deferred Platform UI research。** 人類最常見的 scope creep 通常就是一句「順便做個分頁」，然後兩週後桌上多了一套 Design System。

## Platform Rule / Design Queue

這些是 Architecture / Rule design，不因看到名詞就立刻養新 Experiment：

- Transaction Pattern Selection。
- Authorization / Error Contract。
- Batch Execution Contract / retry / idempotency ownership。
- Production Identity / Secret / Connection Governance。
- Observability Contract。
- Requirement-to-platform traceability。

## Graduated Baseline

已完成並可作 Architecture input：Supabase Auth、Native Data API / View Read、GitHub Actions execution、Supabase / Netlify Custom API runtime、Database-centric Custom API、External API Orchestration、Backend Service Access / Transaction Ownership、Netlify Trigger Boundary、Supabase Cron / Scheduling。

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

Completed work 的 durable meaning 應留在 `knowledge/`、`evidence/`、Experiment Record；Short-term 不養 Completed 墓碑。

## Deferred / Candidate

- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。