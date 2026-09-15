# Supabase Cron Implementation Guide

- Source Experiment: `D-BATCH-1`
- Status: `Tested implementation guidance`
- Scope: Supabase Cron scheduling、Database Function job、HTTP / Edge Function job、parameterized invocation、server-side auth、deployment / observability
- Not a Production Architecture Decision

## Purpose

這份文件不是 Experiment Record，也不是 runtime Evidence 清單。

它回答的是：

> 未來 Nook Works 真正需要 scheduled / batch responsibility 時，已經實驗過的 Supabase Cron 要怎麼實作，哪些設定是關鍵，哪些坑不要再踩一次？

完整實驗脈絡留在 `experiments/batch-scheduling/README.md`；runtime Evidence 留在 `evidence/`。

---

## Core model

Supabase Dashboard 的 Cron UI 是便利介面；底層真正執行的是 `pg_cron` 儲存在 `cron.job.command` 的 SQL。

```text
Dashboard / SQL
→ pg_cron
→ execute SQL command
→ optional pg_net HTTP
```

因此需要簡單 static request 時可用 Dashboard；需要 execution-time expression、DB Function return value 或其他 SQL capability 時，應使用 SQL-based Cron command。

`cron` schema 為 managed schema。`cron.job` 適合 inspect，不建議直接 DML mutation；建立 / 修改 / 刪除應走 pg_cron 提供的 functions。

---

## Cron lifecycle SQL

### Create

```sql
select cron.schedule(
  'my-job-name',
  '*/5 * * * *',
  $$
    select public.some_function();
  $$
) as jobid;
```

D-BATCH-1 已以 synthetic job 實測 `cron.schedule(...)`，並在 `cron.job` 讀回新 job definition。

### Read / inspect

```sql
select
  jobid,
  jobname,
  schedule,
  command,
  active
from cron.job
order by jobid;
```

### Update

`cron.alter_job(...)` 是 PostgreSQL Function，因此使用 `select` 呼叫，而不是直接 `update cron.job ...`。

```sql
select cron.alter_job(
  job_id := 123,
  schedule := '0 * * * *',
  command := $$select public.some_other_function();$$,
  active := true
);
```

實測可修改：

- `schedule`
- `command`
- `database`
- `username`
- `active`

### Activate / deactivate

```sql
select cron.alter_job(
  job_id := 123,
  active := false
);
```

### Delete

```sql
select cron.unschedule('my-job-name');
```

或使用 `jobid`：

```sql
select cron.unschedule(123);
```

### Lifecycle rule

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

不要把 managed `cron.job` 當一般 application table 直接 CRUD。

---

## Supported scheduling shapes

### 1. Cron → PostgreSQL Database Function

適合：

- 工作主要是 database operation。
- 不需要 application runtime / external HTTP。
- 希望責任留在 PostgreSQL。

受測形態：

```text
Supabase Cron
→ PostgreSQL Database Function
→ table mutation
```

代表 command：

```sql
select public.some_batch_function('scheduled');
```

### 2. Cron → HTTP → Supabase Edge Function

適合：

- 工作需要 application code。
- 需要 Custom API / external API / data transformation。
- 希望 scheduled job 與既有 Edge Function 共用 runtime。

受測形態：

```text
Supabase Cron
→ pg_net HTTP POST
→ Supabase Edge Function
→ application processing
```

代表 command：

```sql
select net.http_post(
  url := 'https://<project-ref>.supabase.co/functions/v1/<function-name>',
  headers := jsonb_build_object(
    'apikey', '<SERVER-SIDE-CREDENTIAL>'
  ),
  body := '{}'::jsonb,
  timeout_milliseconds := 5000
);
```

Credential value 不應保存進 repository / browser / evidence。正式系統應另外定義 credential source-of-truth，例如 Vault 或 provider-supported secret management。

---

## Parameterized HTTP invocation

D-BATCH-1 已直接驗證三種 parameter source。

### Layer 1 — Static literal

```sql
body := jsonb_build_object(
  'executor_oid', -1,
  'process_mode', 'scheduled'
)
```

適合固定 caller context / mode / constant value。

### Layer 2 — Execution-time SQL expression

```sql
body := jsonb_build_object(
  'executor_oid', -1,
  'process_mode', 'scheduled',
  'query_date', to_char(current_date - 1, 'YYYY-MM-DD'),
  'runtime_time', to_char(current_timestamp, 'HH24:MI:SS.MS')
)
```

這些 expression 在 Cron command 真正執行時求值，不是在建立 Job 時先算好。

D-BATCH-1 已由 receiver persistence 與 Cron run timestamp 直接確認 dynamic date / time 來自 scheduled SQL command。

### Layer 3 — PostgreSQL Function return value

Cron command 可以直接把 DB Function 回傳值放進 HTTP body：

```sql
body := jsonb_build_object(
  'fixed_value', public.build_parameter_value(),
  'query_date', to_char(current_date - 1, 'YYYY-MM-DD')
)
```

也可以讓 Function 直接回完整 `jsonb`：

```sql
body := public.build_batch_parameters(current_date)
```

D-BATCH-1 synthetic probe 以固定前綴 + random suffix 的 Function return value，連續 scheduled runs 成功寫入不同 `DBFUNC-*` 值，因此此 path 已直接 Verified。

### Layer 4 — Launcher / Preparation API

當參數準備已超出簡單 SQL / helper function，例如：

- 多次 DB lookup
- 複雜 business rule
- 多段日期 / execution plan
- 啟動前 validation / eligibility decision
- 跨多個服務的 preparation

不要持續把 business logic 塞進 Cron command。建議提升責任：

```text
Cron
→ Launcher / Preparation API
→ Core API
```

此 pattern 沒有在 D-BATCH-1 額外重做一支專用 probe，但其 building blocks 已由 Custom API composition、Native Data API 與 outbound HTTP 實驗分別驗證，因此屬已知可行架構選項，不是 Cron capability gap。

若進一步需要 sequencing / branching / retry / compensation / multi-step coordination，則已進入 Orchestrator responsibility。

### Responsibility ladder

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

Capability 不等於推薦。平台初期可只選 1～2 種作為 Preferred Pattern；其他已知能力保留為 Deferred / Future Candidate，待需求與平台成熟度上升時再 Promote。

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

---

## Dashboard limitation

Dashboard 的 HTTP Request Body 適合 static JSON。當 Cron job command 被改成 SQL expression，例如 `jsonb_build_object(...)`，Dashboard 表單可能無法把完整 command 還原回 Request Body 欄位。

因此：

- Dashboard 可作簡單設定 / status / history surface。
- `cron.job.command` 才是 runtime definition 的真實來源。
- 需要 dynamic parameter 時，以 SQL command 為 canonical representation。

正式平台若需要管理 Cron definition，建議把 canonical SQL / migration 保存在 repository，而不是只依賴 Dashboard state。

---

## Edge Function authentication contract

D-BATCH-1 採 provider-supported server-side contract：

```text
withSupabase({ auth: "secret" })
```

Handler 內使用 helper 提供的 privileged client：

```text
ctx.supabaseAdmin
```

不要自行複製 secret 再做 equality check。早期 probe 曾因此產生 HTTP 403。

Server-side Supabase Secret Key 不是一般 user JWT。受測 Edge Function 使用 gateway JWT verification disabled，由 server helper 處理 Secret Key authentication。

---

## Database access from scheduled Edge Function

Cron 只負責叫醒 Edge Function；它不會改變 Edge Function 對 PostgreSQL 的 authorization identity。

D-BATCH-1 已驗證：

```text
scheduled Edge Function
→ supabaseAdmin / service_role
→ Native Data API SELECT / UPDATE synthetic table
```

可行。

但 `service_role` bypass RLS 不代表自動取得所有 table privilege。Formal `place` 曾因缺少 SELECT privilege 回：

```text
permission denied for table place
```

這屬 Backend Service Access，不是 Cron limitation。

---

## Observability recipe

不要把不同 evidence layer 的綠燈混成同一件事：

```text
Scheduler History
→ HTTP Invocation / pg_net response
→ Edge Runtime
→ Data API / PostgreSQL Result
→ Application / Data State
```

### Important distinction

```text
Scheduler Success ≠ HTTP Success ≠ Business/Data Success
```

D-BATCH-1 直接觀察過：

- Scheduler command succeeded，但 downstream HTTP 403。
- `pg_net` 在很短 timeout 下記錄 timeout，但 Edge Function 實際完成 insert。

因此要依問題選 evidence layer，不能只看 Cron Dashboard 綠燈或 pg_net response。

---

## Common pitfalls proven by D-BATCH-1

1. 不要直接 DML managed `cron.job`；用 `cron.schedule / alter_job / unschedule`。
2. 不要自行複製兩份 secret 再比對。
3. `service_role` bypass RLS 不等於自動取得 table privilege。
4. Dashboard HTTP Body 不代表 Cron command 能力上限；dynamic payload 用 SQL expression。
5. Scheduler `Succeeded` 不等於 downstream success。
6. `pg_net` timeout 不一定代表 business operation 沒完成。
7. 不要把複雜 business logic 長期藏進 Cron SQL；複雜度上升時提升到 Launcher / Orchestrator。
8. Browser Observer 不持有 server credential，只負責 authenticated read-only observation。

---

## Reusable source references

- Experiment Record: `experiments/batch-scheduling/README.md`
- Phase 1 Evidence: `evidence/d-batch-1-phase-1.md`
- Parameter Evidence: `evidence/d-batch-1-parameter-invocation.md`
- Edge worker: `supabase/functions/test-cron-edge-worker/index.ts`
- Parameter probe: `supabase/functions/test-cron-parameter-probe/index.ts`
- Browser Observer: `public/cron-edge-observer/index.html`

---

## Current implementation judgment

D-BATCH-1 已驗證以下可重用 capability：

```text
Database-centric scheduled work
→ Supabase Cron → PostgreSQL Function

Application scheduled work
→ Supabase Cron → pg_net POST → authenticated Edge Function

Simple parameter preparation
→ static literal / SQL runtime expression / DB Function return value
```

正式平台應另外決定哪些 pattern 成為當期 Preferred / Available Pattern，哪些保留為 Deferred / Future Expansion Candidate。實驗結論只提供 capability evidence，不替未來 workload 提前做永久架構決策。
