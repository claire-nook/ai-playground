# Playground Evidence Index

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久 Technical Decision。

---

## General Master → Detail / Read-only Detail Pattern

- Experiment: F-DETAIL-1
- Date: 2026-09-17
- Status: Completed / Pattern Candidate Established
- Verification: Partial — Functional / Interaction Evidence
- Record: `experiments/feature-detail/README.md`
- Consolidated Findings: `evidence/f-detail-1-findings.md`
- Pattern Synthesis: `knowledge/platform/record-detail-pattern.md`
- Live Demo: `/feature-detail/`
- Topics: Master Detail, Stable Record Identity, Query Context, Audit Pattern, Long Text, Pagination, iPad-first, RWD

### Result

Claire 已在 deployed desktop / iPhone prototype review v2。General Detail 已從 v1 Batch-specific overfit 修正為 Synthetic Business Object，並收斂出：Feature-defined Business Content、Platform-standard Audit、Long Text presentation boundary，以及 Query → Detail → Return 時以 stable record identity 作 work-context anchor。

核心 lifecycle candidate：

```text
Query Context
→ Select Stable Record Identity
→ General Read-only Detail
→ Feature-defined Business Content
+ Platform-standard Audit
→ Return
→ Re-resolve Stable Record against current result ordering
→ Restore work context
```

重要 boundary：`Query Context ≠ Old Page Number`。若 Detail 停留期間 Result Set 改變，返回時應重新定位 selected record，而不是固定回原 page number。

Browser prototype 可掃 synthetic fixture 找 current rank，但這不是 Production Backend strategy；bounded anchor-position / cursor resolution 仍是 Open Contract。

v1 的 Batch `metrics / trace / lifecycle` 內容保留為 negative evidence：Requirement Carrier 可以讓 Pattern 落地，但不可滲漏成 General Pattern responsibility。

---

## Nook Works Application Shell Integration / Lifecycle

- Experiment: S-SHELL-1
- Date: 2026-09-16
- Status: Verified / Completed
- Record: `experiments/application-shell/README.md`
- Consolidated Findings: `evidence/s-shell-1-application-shell-findings.md`
- Related Auth Evidence: `evidence/2026-09-16-safari-auth-session-lifecycle.md`
- Live Demo: `/application-shell/`
- Topics: Application Shell, Supabase Auth, Application User Context, Navigation, Routing, Session Lifecycle, Native Data API, Custom API, External API, iPad-first, RWD

### Result

S-SHELL-1 stop condition 已滿足。Claire Environment Evidence 已在 deployed Live Demo 驗證 real login / persisted Session、active `app_user` Application Context、admin/user/guest Feature Entry、三種 real integration、iPad/iPhone responsive behavior、deep link、reload、same-browser new-tab、cross-browser unauthenticated entry、Back/Forward 與 explicit Logout。

Verified lifecycle：

```text
Browser Entry / Deep Link
→ Login / Session Restore
→ Auth Identity
→ active app_user / Application Context
→ metadata-driven Navigation / Route
→ Shell Ready
→ Feature Entry
→ Native / Custom / External integration
→ Render
→ explicit Logout / Invalidation
```

重要 boundary：

```text
Authentication Identity
≠ Application Eligibility
≠ Navigation Visibility
≠ Route / Feature Entry
≠ Feature Data Access
≠ Backend Authorization

Browser Navigation ≠ Logout ≠ Business Action
```

PR #39 / #40 的 Technical QC 修正了 auth invalidation、refreshed Session synchronization、bounded read、Application Context projection 與 explicit Logout error handling。PR #40 deployed 後 explicit Logout → re-entry remained Login，Claire Environment Acceptance PASS。

Historical explicit-logout Session restoration anomaly 仍獨立保存為 intermittent Known Observation / root cause Unknown，不影響 S-SHELL-1 lifecycle completion，也沒有被宣稱為已修復 root cause。

---

## Safari Auth Session Lifecycle / Intermittent Restoration

- Experiment: A-SAFARI-LIFECYCLE
- Date: 2026-09-16
- Status: Candidate / Controlled Ordinary Safari Run Passed; Historical Anomaly Intermittent
- Evidence: `evidence/2026-09-16-safari-auth-session-lifecycle.md`
- Investigation Record: `experiments/auth/safari-session-persistence-investigation.md` (PR #41 pending merge at this checkpoint)
- Related Shell: S-SHELL-1
- Topics: Supabase Auth, Safari, Session, Local Logout, iPad-first, Browser Persistence

### Current Evidence

Claire 曾在 iPad Ordinary Safari 直接觀察 explicit logout → Login surface → re-entry → Session restore；類似現象在 Application Shell 出現以前的 Auth 小型實驗時期也曾出現。Private Browsing 的歷史對照則維持 signed-out。

PR #41 diagnostic probe 的 controlled Ordinary Safari run 顯示 local sign-out `error=none`，immediate `getSession()`、reload 與 re-entry 都維持 `session=null`。因此 anomaly 是 **directly observed but intermittent**；root cause 仍 Unknown。

PR #40 已 merge/deploy，並完成 Technical QC + Shell Environment Acceptance。它是 logout lifecycle correctness / defensive hardening；目前仍沒有 Evidence 證明它是 historical restoration anomaly 的 root-cause fix。

---

## ChatGPT → Codex Autonomous Dispatch / Agent Collaboration

- Experiment: P-CODEX-PHONE
- Date: 2026-09-15
- Status: Verified Provider Gap / Deferred
- Record: `experiments/codex-dispatch/README.md`
- Research Map: `knowledge/maps/ai-agent-collaboration.md`
- Topics: Codex, Agent Collaboration, GitHub, Remote Execution, Authentication, Credential, GitHub Actions, iPad-first

### Result

**Autonomous dispatch is not recommended under the current project constraints.**

Research across Primary + Codex established that the blocker is not model capability, GitHub durable state, or `codex exec` non-interactive execution. The blocking gap is the absence of a supported, subscription-entitled, unattended workload identity / stable Cloud Task invocation boundary that can be used from an ephemeral managed runner without copying Claire's personal refreshable ChatGPT credential or switching to separately billed API-key usage.

### Current Supported Collaboration Shape

```text
Primary prepares bounded Work Order
→ Claire performs one Codex dispatch action
→ Codex Cloud Task executes under provider-managed ChatGPT session / allowance
→ GitHub PR / Report / Evidence
→ Primary independent Technical QC
```

### Re-open Triggers

Re-run this research if OpenAI exposes a stable Cloud Task API/tool, subscription workload identity, GitHub OIDC federation, short-lived CI credential helper, direct ChatGPT→Codex task tool, or equivalent GitHub integration that avoids exporting user session credentials。

---

## Supabase Batch Runtime / Scheduling

- Experiment: D-BATCH-1
- Date: 2026-09-14 ～ 2026-09-15
- Status: Verified / Completed
- Record: `experiments/batch-scheduling/README.md`
- Phase Evidence: `evidence/d-batch-1-phase-1.md`
- Parameter Evidence: `evidence/d-batch-1-parameter-invocation.md`
- Implementation Guide: `knowledge/implementation/supabase-cron.md`
- Browser Artifact: `public/cron-edge-observer/index.html`
- Topics: Supabase Cron, PostgreSQL Function, Edge Function, Native Data API, External API, Parameterized Invocation, Observability, Platform Pattern

### Direct Evidence

完整 tested chain：

```text
Supabase Cron → PostgreSQL Database Function → synthetic row
Supabase Cron → pg_net → Edge Function
Edge Function → Native Data API SELECT / UPDATE synthetic table
Cron-scheduled Edge Function → Open-Meteo → synthetic SUCCESS + temperature
```

Parameterized HTTP invocation 已直接驗證 Static Literal、Execution-time SQL Expression、PostgreSQL Function Return Value。Cron job lifecycle 亦已實測 `cron.schedule / cron.alter_job / cron.unschedule`。

重要治理原則：`Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule`。

---

## Supabase Custom API Composition / External API Orchestration

- Experiment: C-EXT-1
- Date: 2026-09-13
- Status: Completed / Runtime Verified
- Record: `experiments/custom-api/README.md`

`Netlify Browser → Supabase Auth JWT → Weather Custom API → same caller Authorization → Valid Place Custom API → PostgreSQL/RLS → Open-Meteo → normalization → Browser` 已 runtime verified。

---

## Supabase Database-centric Custom API Integration

- Experiment: C-DB-1
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → mapping → Browser` 已實測。

---

## Supabase Edge Function / iPad-first Deployment Lifecycle

- Experiment: C-0
- Date: 2026-09-12
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`

GitHub Actions + Supabase CLI 已完成 deploy / invoke / delete；iPad-first lifecycle 不要求本地 Desktop / Mac。

---

## Netlify Functions Deployment Lifecycle

- Experiment: C-NF-0
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/netlify-functions-lifecycle.md`

Git source → Deploy Preview → HTTP invoke / logs → Production → source delete / Production function absent 已驗證。

---

## Supabase Auth / Browser Authentication

- Experiment: A
- Status: Verified
- Record: `experiments/auth/README.md`

Netlify Browser → Supabase Auth → Session 已由 iPad Safari 驗證。Authentication Success 不等於 Application Access Granted。

---

## Supabase Native Data API / CRUD / Application Access

- Experiment: B
- Status: Completed / Verified
- Record: `experiments/data-api/README.md`

具有效 Application Access 的 User 可由 Browser 完成 SELECT / INSERT / UPDATE / DELETE。Authentication Success 不會自動取得 Application Data Access。

---

## Supabase Native Data API / View Read / Security

- Experiment: B-1
- Status: Completed / Verified
- Record: `experiments/data-api-view/README.md`

`security_invoker=true` PostgreSQL View 可透過 Native Data API SELECT，並在 tested conditions 下保留 invoking identity 的 underlying privilege / RLS behavior。

---

## GitHub Actions Remote Execution Environment

- Status: Completed / Verified
- Record: `experiments/github-actions/README.md`

GitHub-hosted Runner 已驗證可作為 iPad-first / AI Playground 的 remote execution surface。

---

## Netlify Deployment Boundaries

- Publish Boundary Record: `experiments/netlify-deployment-boundary/README.md`
- Trigger Boundary Record: `experiments/netlify-trigger-boundary/README.md`
- Related: `evidence/provider-boundary-pitfalls.md`

`public/` 已驗證為 Static Public Artifact boundary；Trigger Boundary 已驗證可依 relevant paths 決定 deploy / skip。
