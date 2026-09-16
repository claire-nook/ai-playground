# Short-term Work Items

> 無交期。這不是正式開發排程；只保存近期 Research Front 與 deliberate deferred branches。

## Current Research Front — Platform UI / Feature Interaction Pattern

S-SHELL-1 已於 2026-09-16 完成，Application Shell lifecycle 不再是 current technical blocking gap。Consolidated Findings：`evidence/s-shell-1-application-shell-findings.md`。

下一個 Research Front 回到 Feature 內部的 reusable interaction，而不是繼續替 Shell 加功能。

Candidate scope：

- List / Table presentation。
- Pagination：page number vs cursor、page size、total count、server/client responsibility。
- Sort。
- Filter / Search。
- Loading / Empty / Error presentation。
- responsive list/table behavior。
- 單檔與主從維護畫面。
- Create / Edit / Delete / Save / Cancel action hierarchy。
- Validation / Dialog / Toolbar pattern。
- Query → Detail/Edit → Save → Return lifecycle。
- Browser Back / Forward 與 unsaved changes / query-state restoration boundary。

S-SHELL-1 已刻意證明 Browser Navigation、Session lifecycle 與 Feature Route lifecycle 可以分離；下一階段才討論 Browser History 與 Business Action / Form Transaction 如何互動。不要把「上一頁」偷偷變成 Save，也不要讓 Save 成功後的 History stack 自由長成民俗信仰。

## Graduated Baseline

已完成並可作 Architecture input：Supabase Auth、Native Data API / View Read、GitHub Actions execution、Supabase / Netlify Custom API runtime、Database-centric Custom API、External API Orchestration、Backend Service Access / Transaction Ownership、Netlify Trigger Boundary、Supabase Cron / Scheduling、**Application Shell lifecycle / composition**。

S-SHELL-1 verified baseline：

```text
Login / Session Restore
→ Auth Identity
→ app_user / Application Eligibility
→ Application User Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Render
→ explicit Logout / Invalidation
```

已驗證 deep link、reload、same-browser persisted Session、cross-browser unauthenticated entry、Back/Forward、explicit Logout、iPad/iPhone responsive behavior。Formal Nook Works 應把這些 Evidence 當 Platform Shell design input，不直接複製 Playground monolithic implementation。

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

Completed work 的 durable meaning 應留在 `knowledge/`、`evidence/`、Experiment Record；Short-term 不養 Completed 墓碑。

## Platform Rule / Design Queue

這些是 Architecture / Rule design，不因看到名詞就立刻養新 Experiment：

- Formal Nook Works Platform Shell design / module boundary extraction。
- Transaction Pattern Selection。
- Authorization / Error Contract。
- Batch Execution Contract / retry / idempotency ownership。
- Production Identity / Secret / Connection Governance。
- Observability Contract。
- Requirement-to-platform traceability。

## Deferred / Candidate

- A-SAFARI-LIFECYCLE intermittent explicit-logout Session restoration：Known Observation / root cause Unknown；只有 anomaly 再出現時帶 diagnostic purpose 重開，不反覆逼 Safari表演靈異現象。
- P-CODEX-PHONE autonomous dispatch：Deferred by Provider Gap。
- Pure Compute / Longer-running Processing：等 representative workload。
- Concurrency / Isolation / Deadlock / Load：等 quantified correctness/load requirement。
- Distributed Transaction / Compensation：等 external side effect + DB consistency requirement。
- Advanced Workflow Orchestration：等 durable waits / branching / human approval requirement。
