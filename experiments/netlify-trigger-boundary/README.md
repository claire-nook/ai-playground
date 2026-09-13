# Netlify Trigger Boundary

- Date: 2026-09-13
- Status: In Progress
- Topics: Netlify, Git Deployment, Trigger Boundary, Ignore Builds
- Tags: `nook-platform`, `ipad-first`, `deployment`, `netlify`

## Question

當 `ai-playground` Repository 直接連接 Netlify Continuous Deployment，如何只讓真正影響 Netlify deployable surface 的 Git change 觸發 build / deploy，而讓 Knowledge、Evidence、Experiment Record、Agent Work 等 Repository-only change 提前停止？

## Existing Evidence

Publish Boundary 已驗證為 `public/`，但 Trigger Boundary 尚未建立。

2026-09-13 已至少兩次直接觀察到與 deployable static artifact 無關的 Pull Request 仍產生 Netlify Deploy Preview：

1. PR #1 只加入 `agent-work/reports/` 的 Audit Report。
2. PR #2 只修改 `experiments/` 與 `evidence/` 的文件路徑。

因此 `Publish Boundary = public/` 不能單獨回答「哪些 Repository changes 值得讓 Netlify 起床」。

## Design

採 whitelist / fail-closed 的 Deploy Trigger Surface，而不是維護「哪些目錄不要 deploy」的 blacklist。

目前視為會影響 Netlify deployment 的 paths：

- `public/`：Static Browser Artifact。
- `netlify/functions/`：Netlify Functions source。
- `netlify/edge-functions/`：保留未來 Edge Functions runtime source。
- `netlify.toml`：Netlify deployment configuration 本身。
- Root package manifests / lockfiles：保留未來 Netlify runtime dependency / build dependency 的 trigger semantics。

使用 `netlify.toml` 的 `[build].ignore`，比較 `$CACHED_COMMIT_REF` 與 `$COMMIT_REF` 在上述 paths 的差異。

Netlify `ignore` command 的 exit semantics：

- exit `0`：沒有 relevant change，停止 build。
- exit `1`：有 relevant change，繼續 build。

目前設定：

```toml
[build]
  publish = "public"
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF public netlify/functions netlify/edge-functions netlify.toml package.json package-lock.json yarn.lock pnpm-lock.yaml"

[functions]
  directory = "netlify/functions"
```

## Planned Validation

### Case A — Configuration change should deploy

加入 `netlify.toml` 本身屬於 Deploy Trigger Surface，因此首次導入設定應繼續 Netlify build / deploy。

### Case B — Repository-only documentation change should skip

在 Trigger Boundary 生效後，只修改 `agent-work/`、`evidence/`、`experiments/`、`knowledge/` 或 `notes/` 等非 Deploy Trigger Surface，預期 Netlify 在 ignore check 提前停止，不建立新的有效 Deploy artifact。

### Case C — Static public artifact change should deploy

只修改 `public/`，預期 ignore check 回報 relevant change，Netlify 繼續 deploy。

### Case D — Netlify runtime source should remain trigger-capable

`netlify/functions/` / `netlify/edge-functions/` 已納入 Trigger Surface。是否另外建立 harmless runtime probe，待 Functions / Edge Functions Experiment 需要時再取得直接 runtime Evidence；本次不為了測門鈴先蓋一間廚房。

## Constraint / Unknown

- 本次不改 Base directory；Repository root 仍保留為 Netlify build context。
- 本次不建立無需求的 Build command。
- 本次不建立假的 Function 只為製造 path change。
- Build Hook 不受 `ignore` command 阻止，不屬於本次 Git-trigger boundary。
- Netlify Product behavior 可能變更；結論以本次直接 Evidence 為準。

## Current Judgment

`Candidate`，等待 Case A / B / C 的 Netlify direct evidence 後再升格。
