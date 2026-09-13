# Work Order — Netlify Trigger Boundary Fresh Base Fetch Probe

- Date: 2026-09-13
- Type: Provider Experiment Implementation
- Status: Ready for Dispatch
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Objective

實作下一個最小 Netlify Deploy Preview observability probe，只回答一個問題：

> 在 Netlify `ignore` stage 中，能否 fresh-fetch current base branch 到隔離 ref，取得足夠 Git history，並讓 `merge-base(fresh base, COMMIT_REF)..COMMIT_REF` 的 changed paths 精確反映目前 PR 的 cumulative change？

本輪只驗證 Deploy Preview。不要解決 production push boundary，也不要宣布 final Trigger Boundary architecture。

## Read First

- `agent-work/README.md`
- `agent-work/experience/codex-cloud-workspace.md`
- `agent-work/experience/codex-review-investigation.md`
- `experiments/netlify-trigger-boundary/README.md`
- `agent-work/reports/2026-09-13-netlify-trigger-git-ref-topology-probe.md`
- `agent-work/reports/2026-09-13-netlify-trigger-boundary-next-investigation.md`
- `netlify.toml`

若某個 Read First path 不存在，請記錄為環境限制並繼續讀其餘可用 context；不要因缺少非必要 context 自行猜測新的研究目標。

## Existing Evidence

PR #7 已直接證明 Netlify Deploy Preview checkout 中：

- `COMMIT_REF` 對應 PR head。
- `origin/main` 與 local `main` 均存在，但都可能 stale。
- stale `origin/main` 到 PR head 的 diff 與 GitHub-visible PR diff 不一致。

因此本輪不可直接信任 checkout 既有 `origin/main` / `main`。唯一新增變數應是：**fresh-fetch current base branch**。

## Scope

允許修改：

- `netlify.toml`
- `agent-work/reports/2026-09-13-netlify-trigger-fresh-base-fetch-probe.md`
- `experiments/netlify-trigger-boundary/README.md`

不要修改其他 application / experiment / knowledge files，除非為了修正本 Work Order 造成的明確引用錯誤，而且必須在 report 說明。

## Probe Design Requirements

### Context guard

Probe 僅在 `CONTEXT=deploy-preview` 且 `COMMIT_REF` 可解析時執行 fresh-fetch test。

若 context 不符、必要值缺失或 ref 無法解析：

- 輸出明確 skipped / failed marker。
- 最後仍以 non-zero 結束，讓 Netlify 繼續 deploy。

不得因 probe failure suppress deploy。

### Fresh fetch

- 不得覆寫或更新既有 `origin/main`、local `main` 或其他 provider checkout refs。
- 將 current base branch fetch 到獨立 probe ref，例如 `refs/netlify-probe/base`。
- 本 repository 目前 base branch 為 `main`；probe 可以本輪明確以 `main` 為 experimental base，但 report 必須指出這是 experiment assumption，不是未來通用 implementation rule。
- 不使用 credential dump、environment dump 或 remote URL output。
- 如果 shallow history 造成 merge-base 不可得，可做最小必要的 history deepen / fetch retry；每一步必須留下明確 marker。不要無限制 fetch 全 repo 歷史。

### Required markers / observations

至少記錄：

- probe begin / end
- allowlisted identity：`CONTEXT`, `HEAD`, `COMMIT_REF`, `REVIEW_ID`
- fresh fetch begin / success / failure
- fresh fetched base SHA
- `COMMIT_REF` resolved SHA
- merge-base success / failure與 SHA
- `git diff --name-only <merge-base> <COMMIT_REF>` 的 begin / end markers 與完整 changed paths
- 若發生 shallow-history retry，記錄 retry reason / outcome

不得輸出 token、credential、cookie、authorization header、完整 environment 或 remote URL。

### Exit behavior

本輪仍是 observability probe。無論 probe 內部成功或失敗，最後固定以 non-zero 結束，使 Netlify 繼續 build / deploy。

不要開始真正 skip build。

## Local / Runtime Validation

在 Codex workspace 可做的 validation 應包含：

- TOML parse。
- 抽取 shell command 後做 shell syntax validation。
- controlled temporary Git repository simulation：至少包含 fresh fetch 成功、fresh fetch / history 不足或 ref failure 之一。
- 確認 probe 最終永遠 non-zero。
- 確認 remote URL / secrets 不會被輸出。
- `git diff --check`。

Local simulation 只能標記為 Runtime-side Validation，不得冒充 Netlify Provider Evidence。

## Deliverables

1. `netlify.toml`：temporary Fresh Base Fetch Probe。
2. `agent-work/reports/2026-09-13-netlify-trigger-fresh-base-fetch-probe.md`：
   - Context
   - Probe Design
   - Runtime-side Validation
   - Expected Provider Evidence
   - Unknown / Limitations
   - Provider Result 保持 Pending，直到 Claire 提供 Netlify log 後由 Primary Agent review。
3. `experiments/netlify-trigger-boundary/README.md`：加入本 probe Prepared / Provider Result Pending 狀態，不預寫成功。
4. Commit 完成並保持 working tree clean，讓 Claire 可從 Codex Product UI Create PR。

## Acceptance Boundary

本輪成功標準不是「Fresh Base Fetch strategy 已可正式採用」，而是 probe 已安全、可觀察、可由下一次 Netlify Deploy Preview 回答研究問題。

Provider Evidence 尚未產生前，不得把以下任何項目寫成 Verified：

- Netlify ignore stage 可以 outbound fetch。
- fresh base SHA 一定等於某個 PR 建立時 base SHA。
- merge-base-to-head diff 一定等於 GitHub-visible PR diff。
- shallow history 一定足夠。
- Fresh Base Fetch 是 final Trigger Boundary architecture。

## Decision Boundary

可以在實作時修正 shell control flow、marker 命名、最小 fetch/deepen 細節，也可以指出 Work Order 的技術假設有問題。

不要：

- 引入 GitHub API token / changed-files API。
- 改成 GitHub Actions ownership。
- 解 production push semantics。
- 實際 suppress Netlify deploy。
- 自行宣布 final architecture。

若 Fresh Base Fetch 在 local reasoning 上即存在不可安全實作的重大問題，請保留 Evidence，停止擴張 scope，並在 report 明確說明。