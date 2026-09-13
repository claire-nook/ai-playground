# Netlify Trigger Fresh Base Fetch Probe Report

- Date: 2026-09-13
- Status: Provider Result Verified
- Related Work Order: `agent-work/work-orders/2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe.md`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`
- Provider Run: PR #10 Deploy Preview

## Question

在 Netlify Deploy Preview 的 ignore 階段，能否重新取得 current `main`，避免依賴 checkout 中可能 stale 的 branch ref，並用 fresh base 與 PR head 重建正確的 PR cumulative changed-path boundary？

## Prior Evidence

PR #7 已證明 checkout 中既有的 `origin/main` 與 local `main` 可能落後 GitHub current base；ref 存在不代表它適合作為 current PR baseline。

## Probe Design

本次只增加一個新變數：把 current `main` fresh-fetch 到隔離 ref，再比較 fresh base 與 `COMMIT_REF` 的 merge-base-to-head changed paths。

Probe 僅用於 Deploy Preview observability，所有路徑都繼續 build / deploy，不處理 production push，也不宣告 final Trigger Boundary architecture。

## Local Validation

Codex 已完成 TOML parse、shell syntax、fresh-fetch success、fetch failure、非 Deploy Preview skip、固定 fail-safe exit 與 log hygiene 等 workspace validation。這些只屬 local validation，不是 Provider Evidence。

## Provider Evidence — PR #10

Netlify Deploy Preview 直接觀察到：

- Context：`deploy-preview`
- PR：`REVIEW_ID=10`
- PR head / `COMMIT_REF`：`038fcb424f5be2161a0763c047d41aadf0cd241d`
- Fresh fetch：成功
- Fresh-fetched base：`dded27fba13060d4461fa4ff62d5d2c1b7e5fdda`
- Merge base：`dded27fba13060d4461fa4ff62d5d2c1b7e5fdda`
- 初始 shallow depth 已足夠，沒有進入 retry。

Provider 計算出的 changed paths 為：

1. `agent-work/reports/2026-09-13-netlify-trigger-fresh-base-fetch-probe.md`
2. `experiments/netlify-trigger-boundary/README.md`
3. `netlify.toml`

這與 GitHub-visible PR #10 cumulative diff 完全一致。

Probe 完成後 Netlify 繼續 dependency install / publish flow，因此 observability failure 不會誤 suppress deploy 的 fail-safe 行為也符合預期。

## Result

**Fresh Base Fetch Probe 在本次 Deploy Preview scenario 驗證成功。**

這次 Evidence 支持：Netlify Deploy Preview 的 ignore stage 可以取得 fresh current base，並透過 fresh-base merge-base-to-head diff 重建正確的 PR cumulative changed-path boundary。

因此，對 Deploy Preview 而言，local-Git strategy 仍然是可行 candidate；PR #7 的問題是 checkout branch ref stale，不是 Netlify ignore stage 完全無法取得 current base。

## Remaining Unknown

- 目前只驗證一個 Deploy Preview scenario。
- 尚未驗證 base 在 queue / retry 期間前進時的 semantics。
- 尚未驗證需要 deeper history retry 的 provider scenario。
- Probe 目前明確假設 base branch 為 `main`，尚未做通用 base discovery。
- 尚未驗證真正 path-filter 後的 skip-build behavior。
- Production push 仍需要不同 event boundary；不能直接套用 Deploy Preview 的 fresh-base model。
- Final Trigger Boundary architecture 尚未決定。

## Decision Boundary

目前可以視為 Verified 的只有：

> 在目前 `ai-playground` 的 Netlify Deploy Preview 中，ignore stage 可取得 fresh current `main`，並以 fresh-base merge-base-to-head diff 重現 GitHub-visible PR cumulative changed paths。

不得擴張成「所有 Netlify context 都已取得正確 event boundary」或「Trigger Boundary 已全面完成」。