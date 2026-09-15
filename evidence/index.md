# Playground Evidence Index

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久 Technical Decision。

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

Re-run this research if OpenAI exposes a stable Cloud Task API/tool, subscription workload identity, GitHub OIDC federation, short-lived CI credential helper, direct ChatGPT→Codex task tool, or equivalent GitHub integration that avoids exporting user session credentials.

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

Parameterized HTTP invocation 已直接驗證：

```text
Static Literal                                  Verified
Execution-time SQL Expression                   Verified
PostgreSQL Function Return Value                Verified
```

Receiver 最終不再自行產生 date/time；request body 中的 runtime values 由 Cron command 在 execution time 求值。DB Function probe 連續產生不同 `DBFUNC-*` 值並經 Cron → Edge Function 原樣持久化，建立清楚 parameter provenance。

### Cron lifecycle SQL evidence

Synthetic job 已實測：

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

`cron.job` 可用於 inspection；managed schema mutation 應走 pg_cron functions，不直接 DML。

### Reusable parameter responsibility evidence

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層直接 Verified。Launcher pattern 不另重做專用 Cron probe，因 Custom API → Custom API、Custom API → Native Data API、Custom API → External API 等 building blocks 已在其他 experiments runtime verified。

重要治理原則：

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

平台可以在初期只選少量 Preferred Pattern；已知但未標準化的能力應保留為 Deferred / Future Expansion Candidate，隨需求與平台成熟度再 Promote。

### Dashboard / SQL boundary

Dashboard HTTP Request Body 適合 static JSON，但當 `cron.job.command` 使用 SQL expression / `jsonb_build_object(...)` / DB Function return value 時，Dashboard 表單未必能還原顯示完整 dynamic command。

因此 SQL command 才是完整 runtime representation；正式系統若需要 canonical definition，應保存在 repository / migration source-of-truth。

### Observability evidence

D-BATCH-1 多次直接證明：

```text
Scheduler Success ≠ HTTP Success ≠ Business/Data Success
```

曾觀察 scheduler command succeeded 但 downstream HTTP 403；也曾在 `pg_net` client timeout 時，Edge Function 實際已完成 DB insert。因此 troubleshooting 必須依層次檢查 Scheduler、HTTP、Runtime、DB 與 application-visible state。

### Scope / related issue

Formal `place` read 曾因 current service identity 缺少 table privilege 而失敗。這不是 Cron limitation；Backend Service Access 已抽離為 C-BSA-1。

Playground Evidence is not a Production Architecture Decision。

---

## Supabase Custom API Composition / External API Orchestration

- Experiment: C-EXT-1
- Date: 2026-09-13
- Status: Completed / Runtime Verified
- Record: `experiments/custom-api/README.md`
- Weather API: `supabase/functions/test-weather-orchestrator/index.ts`
- Internal API: `supabase/functions/test-place-country/index.ts`
- Browser Artifact: `public/custom-api-orchestration/index.html`
- Deployment Workflow: `.github/workflows/deploy-test-weather-orchestrator.yml`
- Topics: Supabase Edge Functions, API Composition, JWT Forwarding, RLS, Open-Meteo, Netlify Browser, GitHub Actions

### Result

**YES.** 已實測完整鏈：

```text
Netlify Browser
→ Supabase Auth JWT
→ Weather Custom API
→ same caller Authorization
→ Valid Place Custom API
→ PostgreSQL / RLS
→ Weather Custom API
→ Open-Meteo
→ normalization
→ Browser
```

### Reusable Evidence

- Edge Function → Edge Function server-side HTTP composition：Verified。
- Same caller Authorization forwarding through tested internal API chain：Verified。
- Caller-scoped RLS visibility behavior through composition：Verified。
- Edge Function outbound HTTP → Open-Meteo：Verified。
- Per-Place external response normalization：Verified。
- Zero-visible-place short-circuit before provider calls：Verified。
- GitHub Actions `workflow_dispatch` → Supabase CLI deployment：Verified。

---

## Supabase Database-centric Custom API Integration

- Experiment: C-DB-1
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`
- API Source: `supabase/functions/test-place-country/index.ts`
- Browser Artifact: `public/custom-api/index.html`

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → application-side mapping → Browser result` 已實測。caller-scoped user path 不等同 backend service identity 對正式 table 的完整 CRUD / authorization model；後者由 C-BSA-1 接手。

---

## Supabase Edge Function / iPad-first Deployment Lifecycle

- Experiment: C-0
- Date: 2026-09-12
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`

GitHub Actions + Supabase CLI 已完成 deploy / invoke / delete；Supabase Connector 已完成 direct deployment，Connector-deployed function 亦由 Actions 成功 delete。iPad-first lifecycle 不要求本地 Desktop / Mac。

---

## Netlify Functions Deployment Lifecycle

- Experiment: C-NF-0
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/netlify-functions-lifecycle.md`

Git source → Deploy Preview → HTTP invoke / logs → Production → source delete / Production function absent 已驗證。Netlify Functions 因此是 credible secondary Custom API runtime candidate。

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

具有效 Application Access 的 User 可由 Browser 完成 SELECT / INSERT / UPDATE / DELETE。TU01 / TU02 證明 Authentication Success 不會自動取得 Application Data Access。`error=null` / empty rows / affected-row semantics 不等於 Business Operation Success。

---

## Supabase Native Data API / View Read / Security

- Experiment: B-1
- Status: Completed / Verified
- Record: `experiments/data-api-view/README.md`

`security_invoker=true` PostgreSQL View 可透過 Native Data API SELECT，並在 tested conditions 下保留 invoking identity 的 underlying privilege / RLS behavior。View 可作為 Read Model。

---

## GitHub Actions Remote Execution Environment

- Status: Completed / Verified
- Record: `experiments/github-actions/README.md`

GitHub-hosted Runner 已驗證可作為 iPad-first / AI Playground 的 remote execution surface；Manual Approval 與 controlled push-triggered autonomous mode均有 runtime Evidence。

---

## Netlify Deployment Boundaries

- Publish Boundary Record: `experiments/netlify-deployment-boundary/README.md`
- Trigger Boundary Record: `experiments/netlify-trigger-boundary/README.md`
- Related: `evidence/provider-boundary-pitfalls.md`

`public/` 已驗證為 Static Public Artifact boundary；Trigger Boundary 已驗證可依 relevant paths 決定 deploy / skip，避免 docs-only changes 無意義地叫醒 Netlify。
