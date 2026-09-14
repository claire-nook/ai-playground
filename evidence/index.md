# Playground Evidence Index

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久 Technical Decision。

---

## Supabase Batch Runtime / Scheduling

- Experiment: D-BATCH-1
- Date: 2026-09-14
- Status: Partial（Cron A tested path Verified; Cron B scheduled invocation Verified, processing blocked at authorization）
- Record: `experiments/batch-scheduling/README.md`
- Worker: `supabase/functions/test-cron-edge-worker/index.ts`
- Browser Artifact: `public/cron-edge-observer/index.html`
- Deployment Workflow: `.github/workflows/deploy-test-cron-edge-worker.yml`
- Topics: Supabase Cron, PostgreSQL Function, Edge Function, Native Data API, Open-Meteo, Observability

### Direct Evidence

**Cron A Verified for the tested path.** Primary runtime observation 已確認：

```text
Supabase Cron → PostgreSQL Database Function → synthetic test-table INSERT PENDING
```

後續 Observer 亦看到 producer 持續依 3-minute cadence 建立 `PENDING` rows。

**Cron B scheduled invocation Verified for the tested path.** Claire Environment Evidence 已確認：

```text
Supabase Cron → pg_net → HTTP POST → test-cron-edge-worker
```

Cron Dashboard、5-minute runtime lifecycle cadence 與 Edge Function Invocation 可互相對應。Invocation 顯示 caller user agent 為 `pg_net/0.20.4`，request 到達目前 deployment，並回 HTTP `403`。

Repository source inspection 將該 403 定位於 worker 自己的 authorization equality check，發生在 Native Data API access 前。因此這次 Evidence 驗證 scheduled dispatch / runtime invocation，但沒有驗證後續 Data API、Open-Meteo 或 row transition。

### Human Evidence Surface

Claire 已在 iPad Safari 實際登入 `/cron-edge-observer/`，authenticated Native Data API read 可顯示 synthetic rows。觀察時 producer 持續建立 `PENDING`，consumer 尚未造成 `SUCCESS` / `FAILED` transition。

### Reusable Observability Evidence

本次失敗直接證明以下 status 不可混為同一件事：

```text
Scheduler History → Runtime Lifecycle → HTTP Invocation → Business/Data State
```

- Cron Dashboard `Succeeded`：job command 已被 scheduler 執行。
- Edge runtime `Boot` / `Shutdown`：runtime lifecycle evidence，不代表 HTTP/business success。
- Edge Function Invocation：可確認 request HTTP status；本次為 403。
- Observer / Data State：最終 business processing evidence；本次 rows 仍為 PENDING。

因此 **Scheduler Success ≠ Batch Process Success**。對 HTTP Cron job，尤其 `pg_net` asynchronous dispatch，未來 monitoring 不應只依賴 scheduler 的綠色狀態。

### Reusable Boundary

- Experiment 寫入限於 synthetic `test_b8c3q1`；formal `place` data 僅 read。
- Server-side invocation credential 不進入 Browser / repository；Evidence 不保存 credential value、prefix 或 hash。
- Dashboard `Add secret key` 的 request 已被觀察到帶 `apikey` 抵達 Edge Function；provider 如何持久化該 credential 仍未知。
- Current duplicated runtime-secret equality design 已暴露 credential synchronization weakness；auth REWORK 尚待新的 runtime Evidence。
- Retry、concurrency / idempotency、quota / cost 與 Dashboard-vs-Git configuration policy尚未驗證。
- Playground Evidence is not a Production Architecture Decision。

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

具有效 Application Access 的 Claire 測試帳號：HTTP 200、Valid Place API 200、2 places、2 weather success、0 failure；兩個 Open-Meteo calls 均 provider HTTP 200。

TU01 / TU02：Authentication Success，但 0 visible places、0 weather calls、HTTP 200 + `rows=[]`。直接開 endpoint 不帶 Authorization 則得到 `UNAUTHORIZED_NO_AUTH_HEADER`。

### Reusable Evidence

- Edge Function → Edge Function server-side HTTP composition：Verified。
- Same caller Authorization forwarding through tested internal API chain：Verified。
- Caller-scoped RLS visibility behavior through composition：Verified。
- Edge Function outbound HTTP → Open-Meteo：Verified。
- Per-Place external response normalization：Verified。
- Zero-visible-place short-circuit before provider calls：Verified。
- GitHub Actions `workflow_dispatch` → Supabase CLI deployment：Verified。
- D-1 在本 workload 應以 each Place local timezone 的 previous local calendar date 定義。

### Scope limit

這不驗證 explicit 403 Business Authorization、external provider credential management、retry / queue / scheduling、long-running limits 或 DB writes。Open-Meteo 本 Probe 不需要 API key。

---

## Supabase Database-centric Custom API Integration

- Experiment: C-DB-1
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`
- API Source: `supabase/functions/test-place-country/index.ts`
- Browser Artifact: `public/custom-api/index.html`

`Netlify Browser → Supabase Auth JWT → Edge Function → RPC / PostgreSQL Function → Native Data API SELECT → application-side mapping → Browser result` 已實測。具有效 Application Access 的 Claire 測試帳號取得 2 rows；TU01 / TU02 均 Authentication Success 但 HTTP 200 + empty rows。RLS row visibility 不等於 explicit Business Authorization semantics。

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

GitHub-hosted Runner 已驗證可作為 iPad-first / AI Playground 的 remote execution surface；Manual Approval 與 controlled push-triggered autonomous mode 均有 runtime Evidence。

---

## Netlify Deployment Boundaries

- Publish Boundary Record: `experiments/netlify-deployment-boundary/README.md`
- Trigger Boundary Record: `experiments/netlify-trigger-boundary/README.md`
- Related: `evidence/provider-boundary-pitfalls.md`

`public/` 已驗證為 Static Public Artifact boundary；Trigger Boundary 已驗證可依 relevant paths 決定 deploy / skip，避免 docs-only changes 無意義地叫醒 Netlify。
