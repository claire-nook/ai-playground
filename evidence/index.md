# Playground Evidence Index

Evidence 代表特定時間、環境與條件下實際觀察到的結果，不等於 Production Architecture 或永久 Technical Decision。

---

## Supabase Database-centric Custom API Integration

- Experiment: C-DB-1
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`
- API Source: `supabase/functions/test-place-country/index.ts`
- Browser Artifact: `public/custom-api/index.html`
- Topics: Supabase Edge Functions, Custom API, JWT, CORS, RPC, PostgreSQL Function, Native Data API, RLS, Netlify Browser

### Result

**YES.** 已實測：

```text
Netlify Browser
→ Supabase Auth JWT
→ Supabase Edge Function
→ RPC / PostgreSQL Function
→ Native Data API SELECT
→ application-side mapping
→ Browser result
```

Claire active Application Identity：HTTP 200，RPC 2 rows，Country 2 rows，final 2 rows（札幌 / 日本 / Japan；雪梨 / 澳洲 / Australia）。

TU01 與 TU02 均 Authentication Success，但 API 回 HTTP 200、RPC 0 rows、Country 0 rows、`rows=[]`。

### Reusable Evidence

- Netlify-hosted Browser → Supabase Edge Function authenticated cross-origin call / CORS：Verified。
- Supabase Auth JWT 可作為 Custom API caller identity：Verified。
- Edge Function → RPC → PostgreSQL Function：Verified。
- Edge Function → Native Data API `SELECT`：Verified。
- Edge Function application-side mapping / response shaping：Verified。
- Caller-scoped RLS / Application Access behavior 在 tested chain 中被保留：Verified。
- RLS empty rows 不等於 explicit Business Authorization semantics；`No Data` 與 `No Application Access` 仍可能需要 API layer 額外區分。

### Scope limit

本 Probe 沒有驗證 Custom API 內的 Native INSERT / UPDATE / DELETE；那些 CRUD operations 只在 Experiment B 的 Browser → Native Data API path 驗證過。External API orchestration、long-running compute、runtime limits、cost 與 explicit business error contract 仍未完成。

---

## Supabase Edge Function / iPad-first Deployment Lifecycle

- Experiment: C-0
- Date: 2026-09-12
- Status: Completed / Verified
- Record: `experiments/custom-api/README.md`

GitHub Actions + Supabase CLI 已完成 deploy / invoke / delete；Supabase Connector 已完成 direct deployment，Connector-deployed function 亦由 Actions 成功 delete。iPad-first lifecycle 不要求本地 Desktop / Mac。當時 Actions route 使用 temporary Classic PAT，權限 blast radius 是重要 credential trade-off。

---

## Netlify Functions Deployment Lifecycle

- Experiment: C-NF-0
- Date: 2026-09-13
- Status: Completed / Verified
- Record: `experiments/custom-api/netlify-functions-lifecycle.md`

Git source → Deploy Preview → HTTP invoke / logs → Production → source delete / Production function absent 已驗證。Netlify Functions 因此是 credible secondary Custom API runtime candidate，但尚未取代 Supabase-first direction。

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

Active Application User 可由 Browser 完成 SELECT / INSERT / UPDATE / DELETE。TU01 / TU02 證明 Authentication Success 不會自動取得 Application Data Access。`error=null` / empty rows / affected-row semantics 不等於 Business Operation Success。

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