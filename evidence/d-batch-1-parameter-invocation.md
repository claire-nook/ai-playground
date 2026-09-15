# D-BATCH-1 — Cron Parameterized Invocation Evidence

- Date: 2026-09-15
- Experiment: `D-BATCH-1`
- Status: `Verified`
- Scope: Supabase Cron command management、static parameter、execution-time SQL expression、PostgreSQL Function return value

## What was verified

### 1. Cron job lifecycle can be managed by SQL

A synthetic Cron job was created with `cron.schedule(...)`, read back from `cron.job`, modified with `cron.alter_job(...)`, then re-read to confirm the new schedule / command / active state.

Verified lifecycle primitives:

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

`cron.job` is useful for inspection, but mutation should use the pg_cron functions rather than direct DML against the managed schema.

### 2. Static parameter in HTTP request body — Verified

A Cron HTTP command invoked `test-cron-parameter-probe` with a fixed string in a JSON body. The Edge Function persisted the received value to synthetic table `public.test_p7k2m4`.

### 3. Execution-time dynamic date / time — Verified

The Cron command was updated to build the request body with PostgreSQL expressions evaluated at job execution time:

```sql
body := jsonb_build_object(
  'fixed_value', 'test-cron-parameter-probe',
  'runtime_date', to_char(current_date - 1, 'YYYY-MM-DD'),
  'runtime_time', to_char(current_timestamp, 'HH24:MI:SS.MS')
)
```

The receiving Edge Function was changed so it no longer generated date/time values itself. All three fields had to arrive in the HTTP body.

Observed persisted row:

```text
fixed_value  = test-cron-parameter-probe
runtime_date = 2026-09-14
runtime_time = 05:35:00.063+00
```

The corresponding Cron run started at approximately the same execution timestamp, establishing that the runtime values were produced by the Cron SQL command rather than the API.

### 4. PostgreSQL Function return value as API parameter — Verified

A synthetic function was created:

```text
public.test_cron_parameter_value()
```

It returns a distinguishable random value with a fixed prefix such as:

```text
DBFUNC-45E482DA
DBFUNC-7FFE2326
```

The Cron command used the function directly inside `jsonb_build_object(...)`:

```sql
'fixed_value', public.test_cron_parameter_value()
```

The Edge Function still performed no transformation. Consecutive scheduled invocations persisted different `DBFUNC-*` values, proving the parameter source was the PostgreSQL Function evaluated by the Cron command.

## Parameter Source Capability Ladder

Directly verified by D-BATCH-1:

```text
1. Static Literal                                  Verified
2. Simple SQL Runtime Expression                  Verified
3. PostgreSQL Function Return Value               Verified
```

Architecture pattern considered credible but not separately re-probed:

```text
4. Cron → Launcher / Preparation API → Core API
```

The fourth pattern is supported by already-verified Custom API composition / outbound HTTP / Native Data API capabilities. It remains a placement / architecture choice rather than a missing Cron mechanism.

## Responsibility Guidance

Capability does not imply preferred platform pattern.

The platform should choose the smallest set of preferred patterns appropriate to its current maturity, while preserving known-but-not-yet-standardized patterns as future expansion candidates.

Useful distinction:

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

As parameter preparation grows more complex, responsibility should move outward from Cron / SQL toward application-layer preparation or orchestration rather than accumulating hidden business logic inside the scheduler command.

Representative ladder:

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

## Observability Note

During verification, `pg_net` could report a timeout at a short client timeout even though the Edge Function completed the insert. This reinforces an existing D-BATCH-1 rule:

```text
Scheduler Success ≠ HTTP Response Success ≠ Business/Data Success
```

Evidence must be checked at the appropriate layer.

## Conclusion

Parameterized Cron invocation is verified for static values, execution-time SQL expressions, and PostgreSQL Function return values. This closes the remaining D-BATCH-1 Cron capability gate.
