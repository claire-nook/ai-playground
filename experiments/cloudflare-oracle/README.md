# CF-ORACLE-1 — Cloudflare Connector × Worker × D1

- Updated: 2026-10-09
- Status: Phase 1–3 functional evidence captured; Netlify / Authentication pending
- Demo: https://cf-lab-oracle.claire-nook.workers.dev/
- Database: shared experimental D1 `lab-smoke-db` (not a dedicated production database)

## Research intent

Can the AI, once Cloudflare Connector authorization is in place, independently create and update a small public Worker website, establish D1 tables, seed data, bind the database, and implement a working browser-to-database read/write path, without Claire operating a desktop CLI or manually copying source?

This is a curiosity-driven capability experiment, **not** a product, formal deployment pattern, or security-certified application.

## Phase 1 — Direct Worker API (verified)

Connector created/deployed `cf-lab-oracle`, public workers.dev route, `/health` and `/oracle`. Initially eight hard-coded fortunes; Claire opened API responses in iPad Safari. This did not exercise D1.

## Phase 2 — Worker-hosted UI (verified)

Connector updated the same Worker to serve an HTML/CSS/JS frontend at `/`, fetching same-origin `/oracle`. Claire verified page and draw result in iPad Safari. No GitHub-based deployment or local CLI was required.

## Phase 3 — D1 and browser write path (functional evidence)

1. AI created `cf-lab-oracle-db`, made two tables, seeded four sample fortunes, and verified SQL responses. Claire clarified that small experiments must share one test DB rather than allocate one database per toy.
2. AI confirmed existing `lab-smoke-db` contained `lab_smoke_items`, created `oracle_fortunes` and `oracle_draws` plus indexes in that shared database, verified four fortunes and zero draws, **then deleted** the redundant `cf-lab-oracle-db`. Cloudflare D1 listing subsequently returned only `lab-smoke-db`.
3. AI added 20 more fortunes, then 176 more, reaching **200 fortunes**, exactly **50 per category** (`system`, `career`, `love`, `health`); D1 SQL checked counts and 50 distinct titles per category. Some new poems, interpretations and advice use templates: record-count evidence does not establish 200 individually polished literary works.
4. AI uploaded Worker v1.2.0 with D1 binding `DB`, category selection, `GET /oracle?category=...`, `GET /stats`, a simulated progress ritual, and insert into `oracle_draws` after a successful fortune SELECT. Cloudflare upload API returned HTTP 200. Browser screenshot from Claire showed a D1-backed fortune and **今日 6 / 本月 6 / 累計 6** after six user-triggered draws, supporting the integrated browser read/write path.
5. Statistics count **draw events**, not unique visitors. Today/month use Taiwan local calendar boundaries (UTC+8), not raw UTC dates. Opening the page or viewing stats should not insert draws.

### Architecture

```text
iPad Safari
  → Worker-hosted HTML / JS
  → Cloudflare Worker /oracle, /stats
  → D1 binding DB → lab-smoke-db
       oracle_fortunes (SELECT)
       oracle_draws    (INSERT / COUNT)
```

## Data persistence policy

- [schema.sql](schema.sql) is the retained **CREATE TABLE / CREATE INDEX** definition. Existing shared database tables are not to be deleted or reset.
- Test content INSERT scripts are **not** a durable deliverable. Historical `seed.sql` has been retired. No requirement to archive all 200 fortune rows or six draw records.
- [queries.sql](queries.sql) is historical query exploration, **not** a verified production migration or timezone-correct source of truth.
- Current schema does **not** store IP addresses. A prior coarse-IP idea was not implemented and is not part of this verified phase.

## Observed constraints / what is not proven

- The Worker upload returned success and Claire's browser screenshot shows functional integration; automated full regression, write-failure behavior, concurrency, retry idempotency, browser security, and exhaustive network diagnostics were **not** tested.
- Each successful API call is intended to write once, but exactly-once behavior across network retries is **not** established.
- Ritual progress is simulated client-side, not actual D1 processing progress; the approximately 1.8-second animation was too fast for Claire to read its comic status lines.
- Authentication is absent; endpoints are public. No unique-user counting.
- A custom domain was not configured. workers.dev sufficed for the test.
- Netlify frontend / cross-origin browser integration and authentication are future independent research phases.
- AI can operate the verified surfaces **after authorization**; this does not prove universal Cloudflare permissions or that all custom-domain/identity steps can be automated.

## Next research

**First:** preserve the existing Worker-hosted UI as comparison, create a Netlify-hosted frontend calling the same Worker API, verify CORS and D1 write path from iPad Safari.

**Then:** independently evaluate identity/authentication and server-side authorization. A login screen alone is not API protection; compare Cloudflare Access versus a token-based identity provider for the intended cross-host design.

## Evidence

- [CF-ORACLE-1 Evidence](../../evidence/cf-oracle-1.md)
- [Canonical CF-CONNECTOR-1 Research](../cloudflare-direct-control/README.md)
