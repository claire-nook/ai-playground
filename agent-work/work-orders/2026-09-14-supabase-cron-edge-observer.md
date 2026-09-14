# Work Order｜Supabase Cron Edge Worker + Authenticated Observer

- Date: 2026-09-14
- Type: New implementation snapshot
- Repository: `claire-nook/ai-playground`
- Source baseline: GitHub default branch `main`
- Tracking reference: GitHub Issue #21
- Status: Ready for implementation

## Objective
完成 Batch Runtime / Scheduling Playground 實驗的第二段 Artifact：

1. 建立一支 Supabase Edge Function，作為 scheduled batch worker。
2. 建立一個需要 Supabase Auth 登入的 HTML Observer，讓 Claire 可直接觀察 test table 結果。

這是 Playground Experiment，不是 Nook Works 正式功能。保持最小化，不實作正式 `daily-weather` Batch Specification。

## Read First / Preflight
先讀：

- Repository `README.md`
- Repository `agent-work/README.md`
- 與本任務直接相關的既有 Supabase Auth / Native Data API / Edge Function / deployment artifacts

不要尋找 ChatGPT Project-level `playground.md`；它不在 Repository，也不是 execution-surface required file。GitHub Issue #21 只作 tracking reference；本檔案才是施工 contract。

開始修改前確認：workspace snapshot 對應 `ai-playground` `main` baseline；本 Work Order 與 required files 可讀；working tree 沒有與本任務無關的未完成變更。若必要 context 缺失或 contract 與 repo 現況重大衝突，停止並回報，不猜測施工。

## Existing Supabase Baseline
Supabase Project：`Nook Core`

### `public.test_b8c3q1`
Playground synthetic table：

- `t01 bigint`：identity primary key
- `t02 bigint`：source Place oid
- `t03 varchar(20)`：`PENDING | SUCCESS | FAILED`
- `t04 numeric null`：temperature
- `t05 timestamptz`：created timestamp
- `t06 varchar(100)`：created/source identifier
- `t07 timestamptz null`：updated timestamp
- `t08 varchar(100) null`：updated/source identifier

RLS 已啟用。登入使用者只需 read；server-side worker 具有本 test table 的 read/write 權限。不要修改 schema、RLS 或 Policy；若實際權限與此 contract 不一致，停止並回報。

### `public.test_f8c3q1(p_source varchar)` / Cron A
Cron A：

- Job name：`test-cron-db-probe-01`
- Schedule：`*/3 * * * *`
- 已由 Primary Agent 實際驗證 `Cron → Database Function → test_b8c3q1 INSERT` 成功

目前約每 3 分鐘新增一筆 `PENDING` row。

### `public.place`
正式 Business Table，本 Work Order **只允許 SELECT**。至少使用 `oid`, `place_name`, `latitude`, `longitude`。不要依賴或過濾 `is_active`。不得 INSERT / UPDATE / DELETE。

## Scope A｜Supabase Edge Function Worker
建立一支 Playground Edge Function。命名需清楚表達 batch / cron experiment worker，但不要使用正式 Nook Works business batch naming。

每次 invocation：

1. 使用 Supabase Native Data API / Supabase client SELECT `public.test_b8c3q1`，條件 `t03 = 'PENDING'`。
2. 對每筆 PENDING row，以 `t02` 使用 Native Data API / Supabase client SELECT `public.place`，取得 latitude / longitude。不要檢查 `place.is_active`。
3. 若 latitude / longitude 缺失，以 Native Data API UPDATE 該 test row：`t03='FAILED'`, `t07=current timestamp`, `t08=worker identifier`，然後繼續下一筆。
4. 若座標存在，呼叫 Open-Meteo，只取得一個足以證明外部 API orchestration 成功的 temperature 值，request 保持最小化。
5. 成功時，以 Native Data API UPDATE 原 row：`t03='SUCCESS'`, `t04=temperature`, `t07=current timestamp`, `t08=worker identifier`。
6. API / Data error 時，若能定位該 row，更新為 `FAILED` 並寫 `t07 / t08`，然後繼續其他 rows。

### Critical Evidence Requirement
本實驗核心問題之一是：Scheduled Edge Function 是否能透過 Supabase Native Data API 對 table 做 SELECT / UPDATE？

因此 `test_b8c3q1` 與 `place` 的 database interaction **必須**使用 Supabase Native Data API / Supabase client。不得改成 direct SQL / PostgreSQL connection、RPC 或 Database Function。

### Edge Function Auth / Secrets
沿用 Repository 既有 server-side credential / managed environment pattern。不得 hardcode credential、不得 commit credential、不得把 server-side credential 放進 frontend。

Cron B、`pg_net`、Vault、Scheduler 設定不在 Implementation Agent scope，由 Primary Agent後續處理。Implementation Agent 只需讓 Edge Function 可被後續 server-side Cron B 安全 invocation，並回報 invocation contract、function identity / route / auth expectation。

若必須新增 provider credential infrastructure 才能繼續，而現有 pattern 無法安全完成，停止並回報。

## Scope B｜Authenticated HTML Observer
建立最小化、iPad Safari 友善的 HTML Observer，整合到既有 Playground site。

- 必須使用 Supabase Auth。
- 未登入不可讀取 `test_b8c3q1`。
- 登入後透過 Native Data API SELECT `test_b8c3q1`。
- 優先重用既有 Auth pattern，不建立新的 authentication architecture。
- Place 名稱可再 SELECT `public.place` 後 client-side mapping，不建立 View / RPC / 新 DB object。

至少顯示：OID、Place、Status、Temperature、Created By、Created At、Updated By、Updated At。

需要：Refresh、約 30 秒 Auto Refresh、PENDING / SUCCESS / FAILED counts。

Observer 是 read-only，不提供資料修改、Cron management 或 Scheduler management UI。

## Out of Scope
不要實作：正式 Nook Works UI、正式 `daily-weather` Batch Specification、`public.daily_weather` 寫入、`batch_log`、`comm_code`、process mode、weather-code mapping、Cron A / Cron B management、`pg_net` / Vault configuration、production retry / queue / locking / concurrency / job-management framework，以及任何新的或修改過的正式 Business DB object。

## Decision Boundary
Implementation Agent 可自行決定 Edge Function 名稱、Observer route / filename、repo 內檔案結構、小型 helper 拆分、Observer UI 細節、Open-Meteo temperature field 與 worker identifier。

遇到以下情況停止並回報，不自行擴 scope：

1. 需要修改正式 Table / Function / Policy / RLS
2. 需要建立新的 Supabase DB object
3. 需要新的 credential infrastructure
4. Native Data API 權限與 baseline 不一致
5. 需要 Cron B / `pg_net` / Vault 才能繼續
6. 必須改變 `test_b8c3q1` contract
7. Work Order 與 Repository 現況存在重大衝突

## Required Evidence / Acceptance
完成後提供：

1. Edge Function identity / name。
2. Invocation contract：URL / route pattern、method、auth expectation；不要回報 credential value。
3. Manual runtime evidence：至少一筆既有 `PENDING` row 經 worker 後變成 `SUCCESS + temperature`，或有合理原因的 `FAILED`。
4. 證明 `test_b8c3q1` SELECT / UPDATE 使用 Native Data API / Supabase client，而非 direct SQL / RPC。
5. Observer 登入後可讀 test rows 的 evidence。
6. Observer 未登入不可讀 test rows 的 evidence。
7. Observer route / deployed URL（若 execution surface 可取得）。
8. 必要 build / deploy / runtime checks 與 limitations。

Implementation Agent Report 是 Observation Source；是否升格 Verified Evidence 由 Primary Agent QC。

## Deliverables / Report Contract
提交 Edge Function source、Observer HTML / JavaScript / CSS、必要 implementation-specific note，以及 local commit。JavaScript / CSS 需格式化並保留必要功能註解。

不用更新 Research Map、Evidence Index、Experiment Catalog 或 Primary research judgment。

完成後回報：local commit SHA、changed files、tests / runtime checks、Edge Function identity、invocation contract、Observer route、required evidence、known limitations / blockers。不要自行 merge；完成後停止，等待 Claire 建立 PR 與 Primary Agent Technical QC。
