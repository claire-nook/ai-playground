# Work Order — Netlify Trigger Boundary Next Investigation

- Date: 2026-09-13
- Type: Technical Investigation
- Status: Ready for Dispatch

## Objective

找出 `ai-playground` Git-connected Netlify workflow 下一個最小、最有判別力的 Trigger Boundary experiment。目標是讓 Repository-only changes 不必每次完成 Netlify build/deploy，同時不能漏掉真正影響 deployable surface 的 changes。

這一輪只做 investigation 與 experiment design，不修改 `netlify.toml`，也不宣布 final architecture。

## Read First

- `playground.md`
- `agent-work/README.md`
- `agent-work/experience/codex-cloud-workspace.md`
- `agent-work/experience/codex-review-investigation.md`
- `experiments/netlify-trigger-boundary/README.md`
- `agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`
- `agent-work/reports/2026-09-13-netlify-trigger-git-ref-topology-probe.md`
- `netlify.toml`

## New PR #7 Provider Evidence

Netlify Deploy Preview #7 已觀察到：

- `COMMIT_REF` = PR #7 head `656ff7aaf5ff6d4256ccfeeb7ef55825101c9739`
- GitHub-visible PR base = `72e4ac393c9e2e5689d340f15224c59f1526a7f0`
- checkout `origin/main` = `a1ff93b720fe6b066ac0bddcfbb638f859ea5be1`
- checkout local `main` = `64b55130098b903117ec1bdb3399b4f2ddd9c660`
- stale `origin/main` 到 PR head 的 diff 有 9 paths，但 GitHub 真正 PR diff 只有 3 files。

因此「checkout 裡存在 `origin/main` 就可以直接拿來當 current PR baseline」已被本次 Evidence 排除。

## Research Question

如何可靠判斷「這一次 Git-triggered change 是否影響 Deploy Trigger Surface」，而不是判斷「從某個 cached historical point 到現在是否曾經有 relevant change」？

Deploy Trigger Surface candidate 維持：`public/`、`netlify/functions/`、`netlify/edge-functions/`、`netlify.toml`、root package manifests / lockfiles。

## Candidate Directions

比較至少以下方向：

1. 在 Netlify ignore 階段取得 fresh current base branch，再以 merge-base 比較 Deploy Preview。
2. 使用 GitHub PR metadata 取得真正 PR base / changed files。
3. Deploy Preview 與 production push 使用不同 comparison model。
4. Netlify 是否有原生 path-trigger capability 可以避免自行重建 Git event semantics。
5. 若 Git-connected Netlify 無法可靠取得 event boundary，是否應把 trigger responsibility 移到 GitHub Actions，再由 Actions 依 paths 決定是否觸發 Netlify。

請考慮：第一次 Deploy Preview、同一 PR 後續 commit、PR 建立前已有多 commits、main merge、一次 push 多 commits、stale refs / cache fallback，以及外部查詢失敗時的安全行為。

## Deliverable

建立：`agent-work/reports/2026-09-13-netlify-trigger-boundary-next-investigation.md`

Report 需分離 Evidence / Inference / Unknown，簡潔比較 candidates，並推薦一個 next minimal experiment，說明它能回答什麼、需要改哪些檔案、仍有哪些未驗證事項。

可以同步更新 `experiments/netlify-trigger-boundary/README.md` 的 PR #7 Provider Result，但不要修改 `netlify.toml`。

## Decision Boundary

可以反駁 Primary Agent、提出新 candidate、使用 repository-local analysis。不要自行宣布 final architecture，不要開始下一個 provider probe。

完成後 commit，讓 Claire 可從 Codex Product UI Create PR。