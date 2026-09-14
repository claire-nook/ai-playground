# Supabase Cron Edge Worker + Authenticated Observer｜Implementation Note

## Artifact identity

- Edge Function：`test-cron-edge-worker`
- Observer route：`/cron-edge-observer/`
- Worker route pattern：`https://<project-ref>.supabase.co/functions/v1/test-cron-edge-worker`

## Invocation contract

Send `POST` with a valid `Authorization: Bearer <JWT>` accepted by the deployed
Supabase Edge Function. Keep the Supabase CLI default JWT verification enabled.
The future Cron B caller and its token storage/configuration are intentionally not
implemented here.

The worker reads its project URL and server credential from Supabase-managed
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. It uses
`supabase-js` `.from(...)` calls for every `test_b8c3q1` and `place` SELECT/UPDATE;
it contains no SQL connection, `.rpc(...)`, or database function call.

## Manual verification after deployment

1. Record an existing `PENDING` row and invoke the function once with `POST`.
2. Confirm the JSON response identifies that row as `SUCCESS` or `FAILED`.
3. Confirm `SUCCESS` stores `t04`, and both terminal statuses store `t07` and
   `t08 = test-cron-edge-worker`.
4. Open `/cron-edge-observer/`. Before login, confirm the table is unavailable
   and no table SELECT is made. Log in, confirm rows/counts appear, then log out
   and confirm refresh stops.

This workspace has no provider credential or deployed-preview URL, so deployment,
live table mutation, authenticated/unauthenticated RLS results, and iPad Safari
behavior remain runtime checks for the later deployment/QC gate.
