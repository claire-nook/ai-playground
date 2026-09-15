# D-BATCH-1 — Supabase Batch Runtime / Scheduling

- Date: 2026-09-14 ～ 2026-09-15
- Status: `Verified / Completed`
- Primary Intent: `Nook Technical Platform / Batch Runtime / Scheduling Feasibility`
- Tags: `nook-platform`, `batch-runtime`, `supabase`, `postgresql`, `data-api`, `external-api`, `parameterized-invocation`, `observability`, `platform-pattern`

## Research Question

Nook Works 常見 scheduled / batch responsibility，能否由 Supabase-managed scheduling 在 iPad-first 環境中，以合理管理成本與 observability 承擔？

這不是 Production Architecture Decision。Experiment 只取得 capability / responsibility placement Evidence，正式平台仍需依需求成熟度選擇 Preferred Pattern。

可重用實作方式與 SQL sample：

- [`../../knowledge/implementation/supabase-cron.md`](../../knowledge/implementation/supabase-cron.md)

Runtime Evidence：

- [`../../evidence/d-batch-1-phase-1.md`](../../evidence/d-batch-1-phase-1.md)
- [`../../evidence/d-batch-1-parameter-invocation.md`](../../evidence/d-batch-1-parameter-invocation.md)

---

## Verified Capability

### Scheduling / runtime chain

```text
Cron → PostgreSQL Database Function → synthetic row                    Verified
Cron → pg_net → Edge Function                                         Verified
Edge Function → Native Data API SELECT / UPDATE synthetic table        Verified
Cron → Edge Function → Open-Meteo → synthetic SUCCESS + temperature    Verified
```

Formal `place` read 曾因 current service identity 缺少 table privilege 失敗；這不是 Cron limitation，已抽離為 C-BSA-1 Backend Service Access research。

### Cron lifecycle via SQL

```text
Create  → cron.schedule(...)
Read    → cron.job
Update  → cron.alter_job(...)
Delete  → cron.unschedule(...)
```

Synthetic job 已實測 `schedule`、`command`、`active` 修改後可從 `cron.job` 讀回確認。

`cron.job` 是 managed schema runtime definition storage；mutation 應使用 pg_cron functions，不直接 DML system table。

### Parameterized invocation

Receiver `test-cron-parameter-probe` 最終只接受 caller 傳入值，不再自行產生日期 / 時間，因此 parameter provenance 可直接判斷。

已驗證三種來源：

```text
Static Literal                                  Verified
Execution-time SQL Expression                   Verified
PostgreSQL Function Return Value                Verified
```

代表 body：

```sql
body := jsonb_build_object(
  'fixed_value', public.test_cron_parameter_value(),
  'runtime_date', to_char(current_date - 1, 'YYYY-MM-DD'),
  'runtime_time', to_char(current_timestamp, 'HH24:MI:SS.MS')
)
```

Observer 實際看到連續不同的 `DBFUNC-*` 值，證明 DB Function return value 可由 Cron command 在 runtime 求值後塞入 API request。

---

## Architecture Insight — Parameter Preparation Responsibility

D-BATCH-1 最重要的產出之一，不只是「Cron 能傳參數」，而是未來 Batch requirement 的 responsibility placement evidence。

```text
Static Literal
→ SQL Runtime Expression
→ DB Helper Function
→ Launcher / Preparation API
→ Orchestrator
```

前三層已直接 runtime verified。

第四層：

```text
Cron → Launcher / Preparation API → Core API
```

不額外重做專用 probe。其 building blocks 已由其他 Experiment 驗證：Custom API → Custom API、Custom API → Native Data API、Custom API → External API 均可行。因此它是 Known / Credible Architecture Pattern，不是未解 Cron capability。

若 Launcher 只負責準備完整 input，Main/Core API 可以維持 caller-independent contract；若進一步需要 sequencing、branching、retry、compensation、multi-step coordination，則責任已進入 Orchestrator。

---

## Platform Pattern Principle

本 Experiment 的 capability 不代表平台初期必須全部採用。

```text
Feasibility Evidence ≠ Preferred Pattern ≠ Platform Rule
```

平台初期可依需求與簡化目標只提供 1～2 個 Preferred Pattern；其餘已驗證但尚未標準化的能力應保留為 Deferred / Future Expansion Candidate，而不是被當成「不需要」。

平台本身會隨需求、規模、維運與治理能力一起成長。

未來「實際開發引用 Pattern 說明」應主要回答：

```text
平台目前提供哪些 Pattern
→ 選擇依據
→ 如何使用
→ 限制 / Sample / Template
```

另保留 known-but-not-yet-standardized capability index，作為平台下一階段演進依據。這樣新需求遇到能力缺口時，先查既有 Evidence / Deferred Pattern，再決定 Promote 或新增 Experiment，不重新從零研究。

---

## Dashboard vs SQL Control Surface

Dashboard 適合：

- 簡單 schedule
- static HTTP body
- active / inactive
- history / status

底層真實 definition 是 `cron.job.command` SQL。

當 command 使用 `jsonb_build_object(...)`、runtime expression 或 DB Function return value 後，Dashboard 的 HTTP Request Body 欄位可能無法還原顯示完整 dynamic command。這不影響 runtime execution，只代表 UI 是 simplified editor，不是完整 SQL representation。

因此正式平台若需管理 Cron definition，canonical SQL / migration 應保存在 repository，不只依賴 Dashboard state。

---

## Observability Lesson

D-BATCH-1 反覆證明：

```text
Scheduler Success ≠ HTTP Success ≠ Business/Data Success
```

Scheduler `Succeeded` 只代表 command 被執行。`pg_net` 很短的 timeout 甚至可能記錄 timeout，但 downstream Edge Function 已完成 DB insert。

Monitoring / troubleshooting 應分層看：

```text
Scheduler History
→ pg_net / HTTP response
→ Edge runtime / invocation
→ Data API / PostgreSQL result
→ Application / Data state
```

---

## Current Judgment

**D-BATCH-1 completed.**

Supabase Cron 是 Nook Works platform scheduler 的 credible candidate，且已留下足以支援未來 Pattern selection 的 runtime evidence 與 implementation recipe。

下一個 Supabase-first research front 是 C-BSA-1 Backend Service Access，不再繼續擴張 Cron scope。

> Playground Evidence is not a Production Architecture Decision.

## Related Records

- Implementation Guide: [`../../knowledge/implementation/supabase-cron.md`](../../knowledge/implementation/supabase-cron.md)
- Phase 1 Evidence: [`../../evidence/d-batch-1-phase-1.md`](../../evidence/d-batch-1-phase-1.md)
- Parameter Evidence: [`../../evidence/d-batch-1-parameter-invocation.md`](../../evidence/d-batch-1-parameter-invocation.md)
- Research Map: [`../../knowledge/maps/nook-technical-platform.md`](../../knowledge/maps/nook-technical-platform.md)
- Evidence Index: [`../../evidence/index.md`](../../evidence/index.md)
