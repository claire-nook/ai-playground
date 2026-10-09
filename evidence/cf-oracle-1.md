# CF-ORACLE-1 — Evidence: AI direct Cloudflare control

- Recorded: 2026-10-09
- Status: Phase 1–3 functional verification; later phases pending
- Experiment: [Cloud Oracle](../experiments/cloudflare-oracle/README.md)
- Live: https://cf-lab-oracle.claire-nook.workers.dev/

## Evidence tiers

**Connector / Cloudflare API observations** and **Claire's iPad Safari observations** are distinct. Tool success is not silently upgraded to browser or security verification.

### Phase 1 — Worker without database

- AI created and deployed `cf-lab-oracle` through Cloudflare Connector; `/health` and `/oracle` were public JSON routes.
- Eight hard-coded fortunes were selected by the Worker.
- Claire opened the URLs in Safari, saw JSON, and observed varying draws.

### Phase 2 — Same-origin UI

- AI updated the Worker to serve the browser UI and same-origin API.
- Claire's Safari screenshots showed the dark terminal, draw button, result and project attribution.
- Scope proven: public Worker frontend → Worker JSON API → browser DOM. D1 was not involved yet.

### Phase 3 — D1 creation, consolidation and integration

**AI tool observations:**

- Created a temporary D1 database, built `oracle_fortunes` / `oracle_draws`, inserted four records, and queried them.
- After Claire clarified the shared-test-DB rule, created the same tables and indexes inside existing `lab-smoke-db` without removing its `lab_smoke_items` table.
- Verified the four records in the shared database and zero draw records, deleted the redundant temporary database, then confirmed D1 listing contained only `lab-smoke-db`.
- Added 20 and then 176 fortunes. Final SELECT: 200 total, 50 per category, 50 distinct titles per category. Draw count before browser testing: zero.
- Uploaded Worker v1.2.0 using Cloudflare API; API response HTTP 200. Code included D1 binding, category selection, SELECT fortune, INSERT draw, Taiwan-time statistics and frontend ritual progress.
- A later programmatic Worker settings check was blocked by tool safety screening; therefore the upload response alone does not establish independent post-deployment binding inspection.

**Claire human-environment observation:**

- Claire shared iPad Safari screenshot of the running Oracle page, a fortune, and statistics reading **今日 6 / 本月 6 / 累計 6** after she drew six times while trying to read the progress messages.
- This supports functional D1-backed draw and count behavior from the real browser, not a formal guarantee of exactly-once write under retries or failure.
- The animated messages were so brief that Claire repeated draws to read them; animation duration is a UX observation, not a D1 latency measurement.

## What the evidence supports

Within the authorized Cloudflare account and tested APIs, AI directly handled Worker deployment, D1 creation and deletion, schema setup, data inserts, Worker integration and frontend updates. Claire performed human browser verification, not manual source deployment.

The final experimental architecture uses one shared `lab-smoke-db`; no per-experiment D1 is needed for ordinary small tests. Public worker domain was sufficient; custom domain changes were not tested.

## Boundaries

- Authentication / authorization not implemented.
- Netlify-hosted shell / browser CORS not tested.
- No comprehensive security, load, concurrency, retry-idempotency, rollback or automated regression verification.
- Schema stores no IP; draw counts are events, not unique visitors.
- 200-row dataset is test content; not archived as INSERT scripts. Some new text uses repeated templates.
- Keep `schema.sql` for CREATE TABLE / INDEX. No obligation to preserve seed or history data.
- This is research evidence, not production-readiness certification.
