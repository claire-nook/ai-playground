# Work Order｜Supabase Cron Edge Worker Auth Rework

- Date: 2026-09-14
- Type: New Task from current `main`
- Repository: `claire-nook/ai-playground`
- Source baseline: GitHub default branch `main`
- Related implementation: merged PR #23
- Failed continuation evidence: PR #24
- Status: Ready for implementation

## Objective
修正已 merge 的 `test-cron-edge-worker` service-to-service authorization contract，讓後續 Supabase Cron B 可使用目前 Supabase 適合 server-side caller 的 Secret Key / `apikey` pattern 安全呼叫 Edge Function。

這是 Playground Experiment 的 auth rework，不改變原 Batch Runtime / Scheduling experiment scope。

## Why this is a New Task
PR #23 已 merge。原 Codex Task continuation 雖成功產生 auth rework，但 follow-up PR #24 的 branch ancestry 沒有乾淨接到 merge 後的 `main`，GitHub 將原已 merge artifacts 再次視為新增內容，且 PR 顯示不可直接 merge。

因此本次不得延用舊 workspace / branch。請從 GitHub-visible current `main` 建立全新 workspace，僅實作本 Work Order 定義的 auth delta。

## Read First / Preflight
先讀：

- Repository `README.md`
- Repository `agent-work/README.md`
- `agent-work/work-orders/2026-09-14-supabase-cron-edge-observer.md`
- current `main` 的 `supabase/functions/test-cron-edge-worker/index.ts`
- current `main` 的 `agent-work/implementation-notes/supabase-cron-edge-observer.md`

開始修改前確認：

1. workspace baseline 是 current GitHub `main`，不是 PR #24 branch。
2. current `main` 已包含 PR #23 的 worker / observer implementation。
3. working tree clean，沒有其他未完成變更。

若 baseline 不符合，停止並回報，不自行 rebase 舊 workspace。

## Scope
只處理下列 auth / deployment delta：

1. `test-cron-edge-worker` 改為 server-side Secret Key / `apikey` invocation contract。
2. Worker 在任何 database access 前驗證 caller 提供的 `apikey`。
3. Secret value 只從 Edge Function runtime secret 取得，例如 `SB_SECRET_KEY`；不得 hardcode、commit、log 或回傳。
4. Edge Function deployment contract 關閉 gateway JWT verification，因 Secret Key 不是 JWT；worker 自己的 `apikey` check 是本實驗的 authorization boundary。
5. Worker 內部對 `test_b8c3q1` 與 `place` 的 SELECT / UPDATE 仍必須使用 Supabase Native Data API / Supabase client `.from(...)`。
6. 不得改成 direct SQL、RPC 或 Database Function。
7. 補上必要的 deployment workflow / implementation note，使 repo 能清楚描述 `--no-verify-jwt` 與 runtime secret 前置條件。

## Observer
Observer 已在 PR #23 完成。本次原則上不要修改 `public/cron-edge-observer/index.html`。只有在 current `main` 的 observer 與本 auth rework 存在直接且必要的 contract conflict 時才可改，並需在報告中說明原因。

## Out of Scope
不要處理：

- Cron B job 建立
- `pg_net` / Vault 設定
- Secret Key value 建立或傳遞
- Supabase Dashboard 操作
- 正式 Nook Works objects
- `daily_weather` / `batch_log` / `comm_code`
- retry / queue / locking / concurrency framework
- Observer UX 擴充
- Research Map / Evidence Index / Experiment Catalog 更新

Primary Agent 會在 merge 與部署後處理 Cron B、Vault、runtime verification 與 knowledge capture。

## Security Contract
- Caller：future Cron B / `pg_net` server-side request。
- Required header：`apikey: <server-side Supabase Secret Key>`。
- Worker runtime：以 managed Edge Function secret 取得對應 Secret Key。
- Ordinary authenticated-user JWT 不得成為 worker authorization substitute。
- Secret 不得出現在 repository、frontend、PR comment、implementation note 或 test output。

## Required Evidence / Acceptance
完成後至少提供：

1. changed files。
2. auth contract 修改摘要。
3. 證明 authorization check 發生於任何 Native Data API access 之前。
4. 證明 `test_b8c3q1` / `place` 仍使用 `.from(...)`，且沒有 `.rpc(...)` / direct SQL。
5. deployment contract 明確使用 `--no-verify-jwt` 或等價設定。
6. static / syntax / contract tests 與 limitations。
7. local commit SHA。
8. 明確回報 workspace / branch baseline 是 current `main`，不是 PR #24 branch。

沒有 provider credential 時，不需要偽造 live deployment evidence；Primary Agent 會在 merge 後做 provider runtime QC。

## Deliverable / PR Contract
完成後建立新的 follow-up PR：

- base：current `main`
- head：本 New Task 的新 branch
- diff 應只包含本 auth rework 必要 delta
- 不得延用 PR #24 branch ancestry
- 不要自行 merge

PR #24 保留作為 collaboration / branch-lineage evidence，不作為 merge candidate。
