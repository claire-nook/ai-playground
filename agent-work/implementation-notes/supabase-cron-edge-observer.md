# Supabase Cron Edge Worker + Authenticated Observer｜Implementation Note

## Artifact identity

- Edge Function：`test-cron-edge-worker`
- Observer route：`/cron-edge-observer/`
- Worker route pattern：`https://<project-ref>.supabase.co/functions/v1/test-cron-edge-worker`

## Invocation contract

Send `POST` with `apikey: <server-side Supabase Secret Key>`. The function uses
`@supabase/server` with generic server-key validation before its handler can
perform any database access. Valid authentication supplies the SDK-managed
privileged Supabase client. An ordinary
authenticated-user JWT is not an authorization substitute for this privileged
batch worker. The future Cron B caller and its token storage/configuration are
intentionally not implemented here; never place the Secret Key in the Observer,
another browser artifact, logs, responses, or repository content.

The worker uses the Supabase server helper's generic `auth: "secret"` mode because
repository-safe evidence does not identify a dedicated named server key. It uses
the helper-provided client and `.from(...)` calls for every `test_b8c3q1` and
`place` SELECT/UPDATE;
it contains no SQL connection, `.rpc(...)`, or database function call.

Deploy with the manual **Deploy Test Cron Edge Worker** workflow. Its CLI command
uses `--no-verify-jwt` because the Secret Key is not a JWT. With gateway JWT
verification disabled, the server helper's Secret Key validation is the
authorization boundary.

## Manual verification after deployment

1. Record an existing `PENDING` row and invoke the function once with `POST` and
   the server-side `apikey` header.
2. Confirm the JSON response identifies that row as `SUCCESS` or `FAILED`.
3. Confirm `SUCCESS` stores `t04`, and both terminal statuses store `t07` and
   `t08 = test-cron-edge-worker`.
4. Open `/cron-edge-observer/`. Before login, confirm the table is unavailable
   and no table SELECT is made. Log in, confirm rows/counts appear, then log out
   and confirm refresh stops.

This workspace has no provider credential or deployed-preview URL, so deployment,
live table mutation, authenticated/unauthenticated RLS results, and iPad Safari
behavior remain runtime checks for the later deployment/QC gate.
