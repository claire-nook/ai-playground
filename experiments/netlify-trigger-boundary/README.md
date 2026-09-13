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
- `netlify/`：Netlify runtime / deployment helper source，包括未來 Functions / Edge Functions。
- `netlify.toml`：Netlify deployment configuration 本身。
- Root package manifests / lockfiles：保留未來 Netlify runtime dependency / build dependency 的 trigger semantics。

使用 `netlify.toml` 的 `[build].ignore`，先取得 `$CACHED_COMMIT_REF` 與 `$COMMIT_REF` 之間的 changed filenames，再判斷是否命中上述 Trigger Surface。

Netlify `ignore` command 的 exit semantics：

- exit `0`：沒有 relevant change，停止 build。
- exit `1`：有 relevant change，繼續 build。

目前設定：

```toml
[build]
  publish = "public"
  ignore = "sh -c 'git diff --name-only \"$CACHED_COMMIT_REF\" \"$COMMIT_REF\" | grep -Eq \"^(public/|netlify/|netlify\\.toml$|package\\.json$|package-lock\\.json$|yarn\\.lock$|pnpm-lock\\.yaml$)\" && exit 1 || exit 0'"

[functions]
  directory = "netlify/functions"
```

## Planned Validation

### Case A — Configuration change should deploy

加入或修改 `netlify.toml` 本身屬於 Deploy Trigger Surface，因此設定變更應繼續 Netlify build / deploy。

### Case B — Repository-only documentation change should skip

在 Trigger Boundary 生效後，只修改 `agent-work/`、`evidence/`、`experiments/`、`knowledge/` 或 `notes/` 等非 Deploy Trigger Surface，預期 Netlify 在 ignore check 提前停止，不建立新的有效 Deploy artifact。

### Case C — Static public artifact change should deploy

只修改 `public/`，預期 ignore check 回報 relevant change，Netlify 繼續 deploy。

### Case D — Netlify runtime source should remain trigger-capable

整個 `netlify/` 已納入 Trigger Surface。是否另外建立 harmless runtime probe，待 Functions / Edge Functions Experiment 需要時再取得直接 runtime Evidence；本次不為了測門鈴先蓋一間廚房。

## Failed Probe — Case B v1

第一次 docs-only Probe 確實只修改這份 `experiments/` 下的 Experiment Record，但 Netlify Deploy Log 顯示 custom ignore command 雖有被偵測，卻在執行時失敗：

```text
Custom ignore command detected.
fatal: netlify/functions: no such path in the working tree.
```

原因不是 Netlify 忽略 `netlify.toml`，而是原本把尚不存在的 `netlify/functions` / `netlify/edge-functions` 直接當成 `git diff` pathspec。Git command 發生 fatal error，沒有得到原本預期的「無 relevant change → exit 0」，因此 Netlify 繼續 Deploy。

這個 Failure 是有效 Evidence：Trigger 判斷不能要求尚未建立的未來 runtime path 必須先存在。

## Probe Input — Case B v2

本次重新建立乾淨控制組，刻意只修改這份 `experiments/` Experiment Record；不修改 `public/`、`netlify/`、`netlify.toml` 或 package manifests / lockfiles。

預期：GitHub / Netlify integration 可以看見 Pull Request，但 custom `ignore` command 應判定 Deploy Trigger Surface 無變更並提前停止 build。

此段文件修改本身就是 Case B v2 的 controlled input；結果必須等 Provider direct evidence 後再填，不用文字預言冒充測試通過。

## Constraint / Unknown

- 本次不改 Base directory；Repository root 仍保留為 Netlify build context。
- 本次不建立無需求的 Build command。
- 本次不建立假的 Function 只為製造 path change。
- Build Hook 不受 `ignore` command 阻止，不屬於本次 Git-trigger boundary。
- Netlify Product behavior 可能變更；結論以本次直接 Evidence 為準。

## Current Judgment

`Candidate`，等待 Case B v2 與 Case C 的 Netlify direct evidence 後再升格。
