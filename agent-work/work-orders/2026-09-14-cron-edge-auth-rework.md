# Work Order — Cron Edge Auth Rework

- Date: 2026-09-14
- Execution Type: Runtime Auth Rework / Experiment Continuation
- Repository: `claire-nook/ai-playground`
- Baseline: current `main`
- Owner: Primary Agent
- Implementation Agent: Codex

## Objective

Repair the Batch Scheduling Cron B authorization boundary so the scheduled Edge Function uses Supabase's current service-to-service authentication pattern instead of the worker's existing duplicated custom-secret string comparison.

Preserve all existing batch-processing behavior and keep this change focused on authentication.

## Observed Evidence

Runtime evidence shows:

- Cron B runs on the expected five-minute cadence.
- the Edge Function is invoked on the same cadence;
- the invocation reaches `test-cron-edge-worker` but returns HTTP 403;
- the caller is `pg_net`;
- the deployed function is the current version-4 worker with JWT verification disabled.

Current repository code performs its own equality check between the incoming API-key header and a custom runtime environment variable. That manual equality contract is the suspected failing boundary.

Do not copy any credential values, hashes, prefixes, or log credential material into the repository, PR, tests, comments, or implementation report.

## Provider Pattern

Use current Supabase service-to-service Edge Function guidance:

- scheduled/backend callers authenticate through the API-key header;
- keep platform JWT verification disabled for this service-to-service path;
- use `@supabase/server` and `withSupabase({ auth: 'secret' })` for server-side caller validation;
- use the SDK-provided privileged client for Native Data API operations instead of constructing a client from a duplicated custom secret.

If repository-safe evidence clearly identifies a dedicated named server key, Codex may use the provider-supported named-key mode. Otherwise use generic server-key validation for this Playground probe and report that scope explicitly. Do not guess names or request credential values.

## Read First

Read:

- `playground.md`
- `agent-work/README.md`
- `agent-work/dispatch-handoff.md`
- `supabase/functions/test-cron-edge-worker/index.ts`
- `.github/workflows/deploy-test-cron-edge-worker.yml`
- `experiments/batch-scheduling/README.md`
- relevant tests and function configuration.

## Scope

Primary expected change:

- `supabase/functions/test-cron-edge-worker/index.ts`

Allowed supporting changes only when required by repository conventions:

- targeted tests;
- minimal function/deployment configuration needed to preserve the current service-to-service auth mode;
- a minimal experiment note describing the superseded manual auth boundary.

## Required Behavior

1. POST remains the only accepted method.
2. Service-to-service caller authentication is handled by the Supabase server helper rather than manual custom-secret equality.
3. Failed authentication must not reach processing.
4. Valid authentication supplies the privileged Supabase client used by the worker.
5. Existing processing semantics remain unchanged:
   - select synthetic PENDING rows from `test_b8c3q1`;
   - read `place` through Native Data API;
   - call Open-Meteo;
   - update the synthetic row to SUCCESS or FAILED;
   - preserve `test-cron-edge-worker` as the worker identity.
6. Do not introduce direct SQL, RPC, or database functions into the consumer worker.
7. The old custom runtime environment variable must no longer be required by active worker authentication code.

## Out of Scope

Do not change Cron schedules, recreate jobs, modify database objects, alter Observer behavior, implement retry/concurrency features, touch formal business writes, rotate credentials, or perform provider-side secret cleanup.

## Validation

At minimum verify:

1. worker source passes the repository's closest type/compile validation;
2. the old custom-secret equality path is removed from active worker authentication;
3. no credential material appears in the diff;
4. the method guard remains intact;
5. processing still uses Native Data API rather than SQL/RPC;
6. deployment remains compatible with JWT verification disabled;
7. relevant tests/static checks pass.

Do not mark Cron B end-to-end Verified from code alone. Final verification requires a deployed scheduled invocation that no longer returns 403 and an observed PENDING → SUCCESS or FAILED state transition.

## Deliverables

- focused worker auth rework;
- minimal supporting tests/config/docs as required;
- implementation report with exact changed files and validation results;
- Pull Request against `main`.

## Decision Boundary

Keep the patch minimal. If current repository evidence conflicts with this Work Order, preserve the repository-supported fact and report the conflict instead of expanding scope.
