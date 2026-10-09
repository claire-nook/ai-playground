# CF-CONNECTOR-1 — Cloudflare Direct Control × Workers × D1 × Cross-host UI

- Date: 2026-10-09
- Status: Candidate / Planning
- Primary Intent: Cloudflare Connector capability verification; iPad + AI-first cloud development
- Tags: `ipad-first`, `ai-engineering`, `cloudflare`, `deployment`, `custom-api`, `data-api`, `cors`, `remote-execution`
- Discussion source: Notion「Cloudflare 初探｜Direct Control × Workers × D1 小實驗計畫」(earlier planning snapshot)
- Note: This record reflects the later five-phase design agreed in conversation, not necessarily the older Notion snapshot.

## Why this experiment exists｜為什麼做

驗證 Primary AI 是否能不經 GitHub，直接透過 Cloudflare Connector 建立、修改及驗證 Worker / D1 integration；並比較 Cloudflare 與 Netlify UI shell 對同一組 API 的呼叫差異。這也是 iPad + AI-first 工作流程中，降低「AI 寫完但無法自行執行驗證」摩擦的 capability research。Playground 不是正式 Dev / SIT / UAT 環境。

## Questions

1. Connector 能否直接部署、修改、呼叫 Cloudflare Worker API，並提供可追溯執行證據？
2. Cloudflare-hosted UI 與 Netlify-hosted UI 呼叫同一 API 時，部署及 CORS 邊界有何差異？
3. D1 binding / CRUD 能否在 Worker API 路徑被實際驗證？
4. 哪些操作可以由 AI 直接完成，哪些仍需要 Claire 在 Dashboard / Browser 手動操作？

## Scope / Isolation

只建立 **兩支 API**：API A（無 DB）、API B（有 D1 binding）。只比較 **兩種 UI shell**：Cloudflare 與 Netlify。按順序逐步引入變因；不混入 Zero Trust / Access / Authentication（另案研究）。不把 Playground source 視為 Production-ready。

## Five phases｜五階段計畫

1. **Cloudflare Connector → API A**：無 UI、無 DB、無 Git，直接部署與測試 Worker API。
2. **Cloudflare UI shell → API A**：Cloudflare 端 UI 呼叫既有 API A；不引入 DB / Git。
3. **Cloudflare UI shell → API B + D1**：建立 API B 並綁定 D1；驗證資料讀寫及 UI 呼叫。
4. **Netlify UI shell → same API A**：GitHub `ai-playground/public/` 提供 Netlify 靜態頁，呼叫 Phase 1 的同一 API A。
5. **Same Netlify UI shell → same API B**：沿用 Phase 3 API B，驗證跨站呼叫與 D1 路徑。

同源 / 跨源必須依實際 hostname 與部署方式判斷；「同在 Cloudflare」不保證同源。跨源瀏覽器呼叫須驗證 CORS，不能只靠 curl / API tool 成功推論 Browser 成功。

## Environment / Prior observations

- Cloudflare Free account created 2026-10-05.
- Account `workers.dev` namespace: `claire-nook.workers.dev`.
- Existing test D1: `lab-smoke-db` (database ID `b8cfc676-a3d3-4b76-b11f-0ebc35303084`).
- Earlier Connector direct D1 SQL CRUD smoke tests reportedly succeeded after OAuth Full access; earlier read-only OAuth encountered error 10000.
- **These are conversation handoff observations, not freshly reproduced evidence in this record.** Reconfirm live permissions and baseline before deployment.
- No Worker creation or new phase test is claimed here.

## Evidence / Unknown

- **Verified in this experiment:** none yet; phases 1–5 are Pending.
- **Prior reported observation:** D1 CRUD via Connector, with changed OAuth scope.
- **Unknown:** Connector Worker deployment surface and limits; direct API invocation; browser-visible Worker behavior; D1 binding lifecycle; CORS; Netlify integration.
- **Do not infer:** a Worker API works because direct D1 SQL works.

## Test evidence to capture

For each phase, preserve: timestamp; endpoint / deployment route (no secrets); source commit or direct-Connector deployment method; exact input; HTTP status / response; Browser Console or tool error; DB before/after state where relevant; actor (AI direct vs Claire iPad); observed limitation and next phase gate.

## Constraints / Security

Public repository: no access tokens, service tokens, private keys, credentials, personal data, or production secrets in code or notes. Never embed Cloudflare service tokens in public HTML/JS. D1 writes only against dedicated test objects with verified target. Preserve negative evidence. Cloudflare Access / Zero Trust belongs to a separate later experiment.

## Current Judgment

The five-phase plan isolates deployment, UI, DB and cross-origin variables with only two APIs and two UI shells. Feasibility of actual Worker deployment via Connector remains **unverified**. Do not promote planning into Evidence.

## Next checkpoint

Confirm current Connector permissions and Cloudflare Worker deployment capability, then execute Phase 1 before adding UI, D1 binding, or Git-hosted Netlify shell. Update Experiment Catalog and Evidence Index as observations emerge.

## Knowledge Links

- [Experiment Catalog](../../knowledge/experiments.md)
- [Experiment Template](../../knowledge/experiment-template.md)
- [Knowledge Capture Rules](../../knowledge/README.md)
- [Netlify Deployment Boundary](../netlify-deployment-boundary/README.md)
