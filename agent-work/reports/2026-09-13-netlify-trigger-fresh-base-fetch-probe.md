# Netlify Trigger Fresh Base Fetch Probe Report

- Date: 2026-09-13
- Status: Prepared / Provider Result Pending
- Related Work Order: `agent-work/work-orders/2026-09-13-netlify-trigger-boundary-fresh-base-fetch-probe.md`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Context

PR #7 已證明 Netlify Deploy Preview checkout 內既有的 `origin/main` 與 local `main` 可能落後 current base，且 stale `origin/main` 到 PR head 的 changed paths 不等於 GitHub-visible PR diff。因此本輪只加入一個新變數：在 `ignore` stage fresh-fetch `main` 到隔離 probe ref，再觀察 fresh base 與 `COMMIT_REF` 的 merge-base-to-head changed paths。

本輪僅準備 Deploy Preview observability probe，不處理 production push boundary、不 suppress deploy，也不決定 final Trigger Boundary architecture。明確使用 `main` 是此 repository 當前實驗假設，不是未來通用 implementation rule。

## Probe Design

`netlify.toml` 的 temporary `ignore` command：

1. 以 `NETLIFY_TRIGGER_FRESH_BASE_FETCH_PROBE_BEGIN` / `END` 包住 probe，並只記錄 allowlisted `CONTEXT`、`HEAD`、`COMMIT_REF`、`REVIEW_ID`。
2. 僅在 `CONTEXT=deploy-preview` 且 `COMMIT_REF` 能 resolve 成 commit 時進入 fetch；其他情況輸出明確 skipped / failed marker。
3. 以 bounded shallow fetch 將 `origin` 的 `main` 寫入 `refs/netlify-probe/base`。不更新 checkout 既有的 `origin/main`、local `main` 或其他 provider refs。
4. 初次 fetch 使用 depth 64。若 history 不足而無法取得 merge-base，僅再以 depth 256 retry 一次，並記錄 reason、fetch outcome 與 merge-base outcome；不做無限制 full-history fetch。
5. fetch stdout / stderr 均不寫入 log，避免 Git diagnostic 意外帶出 remote URL 或 credential material；只輸出固定的 success / failure marker。Probe 不 dump environment、不執行 remote URL inspection。
6. 成功時記錄 fresh base SHA、resolved `COMMIT_REF` SHA、merge-base SHA，以及由 begin / end markers 包住的完整 `git diff --name-only <merge-base> <COMMIT_REF>` output。
7. 所有路徑最後固定 `exit 1`。依此 experiment 採用的 Netlify ignore semantics，probe success、failure 或 skip 都繼續 build / deploy，不會因觀測失敗漏掉 deployment。

## Runtime-side Validation

Status: `Passed locally`。以下只是 Codex workspace validation，不是 Netlify Provider Evidence。

- Python `tomllib` 成功解析 `netlify.toml`，且能取得 `[build].ignore` command。
- 將 command 抽出後，`sh -n` syntax validation 通過。
- Controlled temporary Git repository 的 success simulation 建立 bare `origin`、`main` 與一個 feature commit。Probe fresh-fetch 成功、取得 merge-base，並在 changed-path markers 中完整列出 feature path。
- Controlled fetch-failure simulation 將 `origin` 指向不存在的 repository；probe 輸出 `FRESH_FETCH_FAILURE` 與 end marker。
- 另驗證 non-Deploy Preview context 會輸出 `PROBE_SKIPPED_CONTEXT_NOT_DEPLOY_PREVIEW`。
- 上述 success、fetch failure 與 context skip 三條路徑的 process status 都固定為 `1`。
- Simulation 在 environment 放入 sentinel secret，並檢查 success / failure logs 均不包含 sentinel 或 temporary remote URL。這只驗證目前 command 的 local output behavior，不保證 provider 自身在 probe 外的 logging behavior。
- `git diff --check` 通過。

本輪未刻意製造超過 depth 64 才找到 merge-base 的大型 history；bounded retry control flow 已通過 shell syntax inspection，但 retry 的實際 provider necessity 與 outcome仍待 Provider Evidence。

## Expected Provider Evidence

下一次 Netlify Deploy Preview log 預期能回答：

- `ignore` stage 是否允許對既有 `origin` 執行 outbound fresh fetch。
- fetch 後 `refs/netlify-probe/base` 的 SHA，以及 resolved `COMMIT_REF` SHA。
- depth 64 是否已有足夠 history；若無，bounded depth 256 retry 是否成功取得 merge-base。
- merge-base SHA 與完整 merge-base-to-head changed paths。
- changed paths 是否精確等於該次 GitHub-visible PR cumulative diff。
- 無論成功、失敗或 skip，是否到達 end marker並繼續 Deploy Preview。

## Unknown / Limitations

- 尚未取得 Netlify log；不能確認 ignore stage 的 outbound network、remote authentication、fetch protocol或寫入隔離 ref能力。
- 尚不能確認 provider checkout 的 shallow boundary 是否在 64 或 256 commits 內涵蓋 merge-base。
- Fresh-fetch 取得的是執行當下的 `main` tip，不必然等於 PR 建立時的 base SHA；base 在 event、queue 與 fetch 之間前進時的 retry semantics 尚未決定。
- 尚不能確認 fresh-base merge-base-to-head diff 是否等於 GitHub-visible PR diff。
- 本 probe 明確假設 base branch 為 `main`，未實作通用 base-branch discovery。
- 本輪不處理 production push、GitHub API、GitHub Actions ownership、真正 skip-build behavior 或 final architecture。

## Provider Result

**Pending.** 等 Claire 建立 PR 並提供該 PR 的 Netlify Deploy Preview log 後，由 Primary Agent review。Local simulation 不構成 Netlify Provider Evidence，也不把上述任何 provider-side unknown 標記為 Verified。
