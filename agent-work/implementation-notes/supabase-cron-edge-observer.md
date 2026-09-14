# Supabase Cron Edge Worker + Authenticated Observer｜Implementation Note

## Artifact identity

- Edge Function：`test-cron-edge-worker`
- Observer route：`/cron-edge-observer/`
- Worker route pattern：`https://<project-ref>.supabase.co/functions/v1/test-cron-edge-worker`

## Invocation contract

Send `POST` with an `apikey` header containing the server-side Supabase Secret Key.
The function compares that value with its `SB_SECRET_KEY` runtime secret before any
database access. It does not accept an ordinary authenticated-user JWT as worker
authorization.

Deploy this function with gateway JWT verification disabled (`--no-verify-jwt`):
current Supabase Secret Keys are not JWTs, and the function-level `apikey` check is
the authorization boundary. The deployment workflow encodes that flag. Before
deployment, configure `SB_SECRET_KEY` as a Supabase Edge Function secret; its value
must never be committed, logged, returned, or placed in the Observer. The future
Cron B caller and its Vault/configuration remain outside this implementation scope.

The worker reads its project URL from Supabase-managed `SUPABASE_URL` and uses the
same `SB_SECRET_KEY` with `supabase-js` for server-side Native Data API access. All
`test_b8c3q1` and `place` SELECT/UPDATE operations use `.from(...)`; the worker
contains no SQL connection, `.rpc(...)`, or database function call.

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
