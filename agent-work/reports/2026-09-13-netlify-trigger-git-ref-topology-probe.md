# Netlify Trigger Git Ref Topology Probe Report

- Date: 2026-09-13
- Status: Prepared / Provider Result Pending
- Related Work Order: `2026-09-13-netlify-trigger-boundary-git-ref-topology-probe`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Context

PR #6 的 Provider Evidence 顯示 `COMMIT_REF` 等於 PR head，但 `CACHED_COMMIT_REF` 是較早的 Netlify build commit，不是該 PR base。用這一對 refs 計算 merge-base 仍得到同一個 cached commit，因此無法回答「本次 PR 自己引入哪些 changes」。

本次只準備 Git Ref Topology Observability Probe，目標是觀察 Netlify Deploy Preview checkout 是否具有可解析的 base-branch / remote-tracking refs，以及這些 refs 是否能與 `COMMIT_REF` 計算 merge-base 和 changed paths。本次不修正 final Trigger Boundary，也不選定正式 comparison strategy。

## Probe Design

`netlify.toml` 的 temporary `ignore` probe：

1. 以固定 begin / end markers 框住完整 probe。
2. 只輸出 allowlisted `CONTEXT`、`BRANCH`、`HEAD`、`COMMIT_REF`、`REVIEW_ID`，以及 HEAD / commit identity；不 dump environment。
3. 執行 `git remote -v`，但在寫入 log 前將 URL 全部替換為 `[URL_REDACTED]`；同時區分 remote none 與 command failure。
4. 記錄 `git branch -a`、`git show-ref`，並以 `git for-each-ref` 補充 heads / remotes / pull refs。
5. 分別解析 `refs/remotes/origin/main`、`origin/main`、`refs/heads/main`、`main`。每個 candidate 都有 resolve success / failure marker；成功時記錄 SHA 與 commit identity。
6. `COMMIT_REF` 與 candidate 都可解析時，記錄 merge-base，並以 begin / end markers 框住 `git diff --name-only <merge-base> <commit>` output。
7. 所有 Git command failure 都被局部處理；probe 在 end marker 後固定 `exit 1`，依 Netlify `ignore` semantics 繼續 build / deploy。

## Runtime-side Validation

Status: `Prepared`（以下只屬 local validation，不是 Netlify Provider Evidence）。

- Python `tomllib` 可解析 `netlify.toml`，並可取得 `[build].ignore` 字串。
- `sh -n` 可解析抽出的 probe command。
- Controlled temporary Git repositories 分別模擬 candidate refs 存在與不存在。兩種情境都輸出 begin / end markers，且 probe 最終 status 都是 `1`。
- Candidate 存在時，local output 包含 resolved SHA、merge-base 與 changed-path markers；candidate 不存在時，local output 包含明確 resolve-failed markers。
- Remote URL 只以 `[URL_REDACTED]` 出現在 probe output；validation 未 dump environment。

## Expected Provider Evidence

Provider Deploy Preview Log 應能回答：

- checkout 是否具有 Git remote；probe log 不會揭露 remote URL。
- 哪些 local / remote-tracking / pull-related refs 實際存在。
- 四個 `main` candidates 是否 resolve 成 commit，以及各自 commit identity。
- 可解析 candidate 是否能與 `COMMIT_REF` 取得 merge-base。
- merge-base-to-`COMMIT_REF` changed paths 是否更接近 GitHub-visible PR diff。
- 即使 refs 缺失或 Git command 失敗，是否仍到達 end marker並繼續 deploy。

## Unknown

- 尚未取得本次 Netlify Deploy Preview Provider Log，因此不能確認 provider checkout 是否有 remote、`origin/main`、local `main` 或 pull-related refs。
- 尚不能確認任何 candidate 的 SHA、merge-base 或 changed paths。
- 尚不能判斷 merge-base-to-commit output 是否符合 GitHub-visible PR diff。
- Local simulation 只驗證 probe control flow 與 marker，不代表 Netlify runtime topology。

## Candidate Follow-up

Primary Agent 取得 Deploy Preview Log 後，應先核對固定 markers、resolved commit identities、merge-base 與完整 changed-path section，再判斷 local refs 是否提供足夠 Evidence。

若 provider refs 足夠，可將觀察結果作為後續 final strategy 評估輸入；若 refs 不足，保留 failure markers 作為評估 provider event metadata 或 GitHub API 等候選方向的 Evidence。本 Report 不自行呼叫 GitHub API，也不推薦或決定 final Trigger Boundary。
