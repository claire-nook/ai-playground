# Netlify Trigger Boundary

- Date: 2026-09-13
- Status: Verified for Deploy Preview and Production repository-only skip
- Topics: Netlify, Git Deployment, Trigger Boundary, Ignore Builds
- Tags: `nook-platform`, `ipad-first`, `deployment`, `netlify`

## Question

當 `ai-playground` Repository 直接連接 Netlify Continuous Deployment，如何只讓真正影響 Netlify deployable surface 的 Git change 觸發 build / deploy，而讓 Knowledge、Evidence、Experiment Record、Agent Work 等 Repository-only change 提前停止？

## Verified Design

採 whitelist 的 Deploy Trigger Surface：

- `public/`
- `netlify/functions/`
- `netlify/edge-functions/`
- `netlify.toml`
- Root package manifests / lockfiles：`package.json`、`package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`

Netlify `[build].ignore` 的 decision semantics：

- exit `0`：SKIP build / deploy。
- exit `1`：繼續 build / deploy。

兩種 Context 使用不同 change boundary：

### Deploy Preview

不能信任 checkout 既有的 `origin/main` / local `main`，因為 PR #7 已直接觀察到它們可能 stale。

目前 verified model：

1. fresh-fetch current `main` 到 isolated ref。
2. 取得 `merge-base(fresh main, COMMIT_REF)`。
3. 比較 `merge-base..COMMIT_REF` changed paths。
4. changed paths 命中 Deploy Trigger Surface 則 DEPLOY，否則 SKIP。
5. fetch / ref / diff / history failure 一律 fail-safe DEPLOY。

### Production

Production 不可套用 Deploy Preview 的 fresh-base model，因為 push 完後 current `main` 本身就是 `COMMIT_REF`，會失去 event boundary。

目前 verified model：

1. 使用 `CACHED_COMMIT_REF -> COMMIT_REF` 作為 production change boundary。
2. changed paths 命中 Deploy Trigger Surface 則 DEPLOY，否則 SKIP。
3. `CACHED_COMMIT_REF` missing / unresolved、diff failure，或 `CACHED_COMMIT_REF == COMMIT_REF` 時一律 fail-safe DEPLOY。

## Evidence Trail

### PR #5 — Cached boundary mismatch

Docs-only PR 仍 deploy。後續證明原因不是 path regex，而是 comparison boundary 錯誤。

### PR #6 — Observability Probe

直接觀察到 `CACHED_COMMIT_REF != PR base`，而 cached-to-current diff 包含舊的 `netlify.toml` change，因此 rule 合理地繼續 deploy。

同一對 refs 改用 `merge-base` 也無法修正，因為 merge-base 仍是 cached ref。

### PR #7 — Git Ref Topology Probe

checkout 內 `origin/main` 與 local `main` 都可能 stale；`ref exists` 不等於 `ref trustworthy`。

### PR #10 — Fresh Base Fetch Probe

Netlify Deploy Preview `ignore` stage 可以 fresh-fetch `main` 到 isolated ref。

Provider log：

```text
FRESH_FETCH_SUCCESS
FRESH_FETCHED_BASE_SHA=dded27fba13060d4461fa4ff62d5d2c1b7e5fdda
MERGE_BASE_SUCCESS_SHA=dded27fba13060d4461fa4ff62d5d2c1b7e5fdda
CHANGED_PATHS_BEGIN
agent-work/reports/2026-09-13-netlify-trigger-fresh-base-fetch-probe.md
experiments/netlify-trigger-boundary/README.md
netlify.toml
CHANGED_PATHS_END
```

changed paths 與 GitHub-visible PR diff 一致。

### PR #11 — Deploy Preview positive control

PR 只修改 `netlify.toml`，Provider 判定：

```text
TRIGGER_DECISION=DEPLOY reason=deploy_surface_changed
```

並完成 build / deploy。

### PR #12 — Deploy Preview repository-only skip

PR 只新增：

```text
experiments/netlify-trigger-boundary/case-b-docs-only-probe.md
```

Provider 判定：

```text
TRIGGER_DECISION=SKIP reason=repository_only_change
User-specified ignore command returned exit code 0. Returning early from build.
```

Deploy Preview 顯示 Canceled；Deploying / Cleanup / Post-processing 均 skipped。

### Production repository-only skip — Verified

在 PR #13 merge 後，production-specific rule 已進入 `main`。後續 commit `1ce0fe7e3e4204dffee1cf3b910816155d14d1a6` 只新增：

```text
agent-work/report-language-guideline.txt
```

Netlify Provider 直接觀察：

```text
CONTEXT=production
COMMIT_REF=1ce0fe7e3e4204dffee1cf3b910816155d14d1a6
CACHED_COMMIT_REF=8c6d6edb2e89980bcfe65a2c573948a6ae0b9a23
CHANGE_BOUNDARY=production_cached_to_current
CHANGED_PATHS_BEGIN
agent-work/report-language-guideline.txt
CHANGED_PATHS_END
TRIGGER_DECISION=SKIP reason=repository_only_change
User-specified ignore command returned exit code 0. Returning early from build.
```

Netlify UI 顯示 Production deploy `Canceled`，Deploying / Cleanup / Post-processing 均 skipped。

這直接證明 production `CACHED_COMMIT_REF -> COMMIT_REF` model 在本次 repository-only scenario 能正確阻止無關部署。

## Current Judgment

`Verified`：目前 `ai-playground` 的 Netlify Git Trigger Boundary 已能區分：

- Deploy Preview repository-only change → SKIP。
- Deploy Preview deploy-surface change → DEPLOY。
- Production repository-only change → SKIP。
- Production deploy-surface change → DEPLOY candidate 已由 rule 設計與 PR #13 install path 支持；若未來有自然發生的 `public/` / runtime production change，可再補直接 Provider Evidence，不必為了測試另外製造 production artifact change。

## Remaining Limits / Unknowns

- Build Hook 不受此 Git-trigger `ignore` boundary 控制。
- `main` 是此 repository 當前 production branch 假設；未抽象成多 production branch model。
- `CACHED_COMMIT_REF == COMMIT_REF`（例如 no-cache 情況）目前刻意 fail-safe DEPLOY，尚未另做 provider probe。
- Fresh fetch 的 bounded history 目前使用 depth 64，merge-base unavailable 時 retry depth 256；極深 history scenario 尚未實測。
- Netlify Product behavior 可能變更；上述結論以 2026-09-13 direct Provider Evidence 為準。
