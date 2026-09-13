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

原 Candidate 使用 `netlify.toml` 的 `[build].ignore`，比較 `$CACHED_COMMIT_REF` 與 `$COMMIT_REF` 在上述 paths 的差異。

Netlify `ignore` command 的 exit semantics：

- exit `0`：沒有 relevant change，停止 build。
- exit `1`：有 relevant change，繼續 build。

## Planned Validation

### Case A — Configuration change should deploy

加入 `netlify.toml` 本身屬於 Deploy Trigger Surface，因此首次導入設定應繼續 Netlify build / deploy。

### Case B — Repository-only documentation change should skip

在 Trigger Boundary 生效後，只修改 `agent-work/`、`evidence/`、`experiments/`、`knowledge/` 或 `notes/` 等非 Deploy Trigger Surface，預期 Netlify 在 ignore check 提前停止，不建立新的有效 Deploy artifact。

### Case C — Static public artifact change should deploy

只修改 `public/`，預期 ignore check 回報 relevant change，Netlify 繼續 deploy。

### Case D — Netlify runtime source should remain trigger-capable

`netlify/functions/` / `netlify/edge-functions/` 已納入 Trigger Surface。是否另外建立 harmless runtime probe，待 Functions / Edge Functions Experiment 需要時再取得直接 runtime Evidence；本次不為了測門鈴先蓋一間廚房。

## Case B v2 — Observed Boundary Mismatch

PR #5 的 GitHub-visible diff 只有 `experiments/netlify-trigger-boundary/README.md`，不包含 `public/`、`netlify/`、`netlify.toml` 或 root package manifest / lockfile。

但在 repository preparation 成功的 Deploy Preview 中，既有 custom ignore rule 仍讓 build / deploy 繼續。

第一次 PR #5 Deploy Preview 因 `Host key verification failed` 在 repository preparation 階段失敗，不能算 Trigger Boundary 執行結果。正常 retry 後 Provider 成功取得 repository，custom ignore command 才真正被執行。

這表示：

> Provider Triggered ≠ Experiment Executed。

必須區分 Repository Preparation、Trigger Decision、Build、Deploy 各階段。

## Observability Probe — PR #6

為避免繼續猜測 `$CACHED_COMMIT_REF`，PR #6 暫時把 `ignore` rule 換成只記錄 comparison context、最後固定 `exit 1` 的 Observability Probe。

Netlify Deploy Preview #6 直接觀察到：

```text
CONTEXT=deploy-preview
BRANCH=pull/6/head
HEAD=codex/-observability-probe-work-order
COMMIT_REF=8a2527cab3930cb24ed1b9eabffec642d831edfd
CACHED_COMMIT_REF=a1ff93b720fe6b066ac0bddcfbb638f859ea5be1
REVIEW_ID=6
```

Workspace `git rev-parse HEAD` 同樣為：

```text
8a2527cab3930cb24ed1b9eabffec642d831edfd
```

HEAD parent 為：

```text
302a0b3be5866ee38c81344cc6466dee774deea0
```

因此本次直接 Evidence 證明：

- `COMMIT_REF` = PR #6 GitHub-visible head / Workspace HEAD。
- `CACHED_COMMIT_REF` != PR #6 base commit。
- 兩者都能在 Netlify clone 中成功 resolve。

`git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF"` 實際包含：

```text
agent-work/experience/codex-review-investigation.md
agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md
agent-work/reports/README.md
agent-work/work-orders/2026-09-13-netlify-trigger-boundary-case-b-v2.md
agent-work/work-orders/2026-09-13-netlify-trigger-boundary-observability-probe.md
experiments/netlify-trigger-boundary/README.md
netlify.toml
```

其中 `netlify.toml` 屬於 Deploy Trigger Surface，因此使用 cached-to-current boundary 的 ignore rule 會合理地判定 relevant change 存在並繼續 deploy。

`git merge-base "$CACHED_COMMIT_REF" "$COMMIT_REF"` 直接回傳同一個 `CACHED_COMMIT_REF`：

```text
a1ff93b720fe6b066ac0bddcfbb638f859ea5be1
```

所以單純把同一對 refs 改成 merge-base comparison 不能修正這個 mismatch。

完整 Provider Evidence：`agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`。

## Current Judgment

`Partial / Boundary Mismatch Verified`。

Case B 已不應描述成「ignore rule 理應 skip，但 Provider 不知為何 deploy」。目前直接 Evidence 支持更精確的結論：

> 現有 comparison model 與 Research Question 不一致。

目前：

```text
git diff $CACHED_COMMIT_REF $COMMIT_REF
```

回答的是：

> 從 Netlify cached comparison point 到本次 commit 之間，Deploy Trigger Surface 是否曾改變？

但我們真正想回答的是：

> 本次 Git change / PR 自己是否改變 Deploy Trigger Surface？

兩者只有在 cached ref 恰好等於正確 change baseline 時才等價；PR #6 的 Provider Evidence 已直接證明本次不是如此。

下一步不是再調 regex，而是先確認 Deploy Preview 是否提供穩定可用的 PR base / event change boundary，再設計最小 comparison strategy。

## Constraint / Unknown

- 本次不改 Base directory；Repository root 仍保留為 Netlify build context。
- 本次不建立無需求的 Build command。
- Build Hook 不受 `ignore` command 阻止，不屬於本次 Git-trigger boundary。
- 尚未證明所有 Deploy Preview 都使用相同 `CACHED_COMMIT_REF` lifecycle。
- 尚未確認 Netlify 是否提供可直接使用的 immutable PR base SHA / event-before SHA。
- 尚未決定 final Trigger Boundary strategy。
- Netlify Product behavior 可能變更；結論以本次直接 Evidence 為準。
