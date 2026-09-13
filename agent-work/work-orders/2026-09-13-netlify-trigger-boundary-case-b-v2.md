# Work Order｜Netlify Trigger Boundary Case B v2

## Metadata

- Work Order: Netlify Trigger Boundary Case B v2
- Status: `Ready`
- Work Type: `Experiment`
- Requested By: Primary Agent
- Intended Executor: `Codex`
- Target Repository: `claire-nook/ai-playground`
- Product-level Source Branch: `main`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`

## Objective｜目標

建立一個純 Repository-only documentation change，驗證目前 `netlify.toml` 的 custom `build.ignore` 是否能讓 Netlify 對不影響 deployable surface 的 Pull Request 提前停止 build / deploy。

成功條件不是「一定要 Skip」。本輪真正要取得的是可重新檢查的 Provider Evidence：

> docs-only change 在目前 Trigger Boundary rule 下，Netlify 實際會 Skip 還是仍然 Deploy？

## Human Relay / Product Setup｜由 Claire 在送出 Task 前完成

這一段屬於 Codex Product UI responsibility，不是 Codex Runtime responsibility。

在建立這次 Codex Task 時：

- Repository 選擇：`ai-playground`
- Branch 選擇：`main`

不要要求 Codex Runtime 透過 local branch name、Git remote 或 `gh auth` 證明 Product UI 選擇是否正確。

Codex Workspace 內 local branch 可能仍然叫 `work`，這本身不是 mismatch。

## Context / Read First｜先讀這些

- `agent-work/README.md`
- `agent-work/experience/codex-cloud-workspace.md`
- `experiments/netlify-trigger-boundary/README.md`
- `netlify.toml`

已知背景：

1. `public/` Publish Boundary 已驗證。
2. 第一版 Trigger Boundary 曾因 `git diff` 直接引用尚不存在的 `netlify/functions` pathspec 而失敗。
3. 目前 `netlify.toml` 已改成 changed-filename 判斷。
4. 本輪只驗 Case B，不驗 `public/` change，也不驗 Functions / Edge Functions runtime change。

## Execution Context Preflight｜執行環境確認

在任何修改前，確認：

1. `netlify.toml` 存在。
2. `experiments/netlify-trigger-boundary/README.md` 存在。
3. `agent-work/work-orders/2026-09-13-netlify-trigger-boundary-case-b-v2.md` 存在。
4. working tree clean。
5. `netlify.toml` 的 current ignore rule 是以 changed filenames 判斷 relevant trigger surface，而不是第一版直接把不存在的 runtime paths 當 `git diff` pathspec。

不要把以下項目列為必要 Preflight：

- local branch name 必須叫 `main`
- Git remote 必須存在
- local / remote-tracking `main` 必須存在
- `gh auth` 必須存在

若真正必要的 Context mismatch，停止修改並回報 Evidence。

## Scope｜允許修改

只允許修改：

- `experiments/netlify-trigger-boundary/README.md`

在該文件加入一小段新的 **Case B v2 controlled probe marker**，內容應清楚表達：

- 本次 change 只屬 Repository-only documentation。
- 不修改 `public/`。
- 不修改 `netlify/`。
- 不修改 `netlify.toml`。
- 不修改 root package manifest / lockfile。
- 預期 current Netlify custom ignore rule 應將 deployable surface 判定為無變更並停止 build；真正結果等待 Provider Evidence，不預寫成成功。

## Out of Scope｜不要順手裝修隔壁

不要修改：

- `public/**`
- `netlify/**`
- `netlify.toml`
- `package.json`
- `package-lock.json`
- `yarn.lock`
- `pnpm-lock.yaml`
- 其他任何 Repository file

不要：

- 重構 Trigger Boundary rule。
- 建立假 Function / Edge Function。
- 清理舊 branch。
- 修改 Historical Evidence。
- Merge Pull Request。

若發現其他問題，只在 Result 回報，不擴張 Scope。

## Tasks｜工作內容

1. 完成 Preflight。
2. 只修改 `experiments/netlify-trigger-boundary/README.md`，加入 Case B v2 controlled probe marker。
3. 檢查 final diff，必須只有這一個 file。
4. 建立 local commit。
5. 正常完成 Codex Task。

## Important Product Boundary｜不要自己建立 PR

Codex Runtime **不需要也不應嘗試自行建立 GitHub Pull Request**。

本輪 Codex 的完成點是：

```text
modify one allowed file
→ validate diff
→ local commit
→ task completes successfully
```

Task 成功完成後，由 Claire 在 Codex Product UI 按 **Create PR**，把 Workspace 成果發布成 GitHub-visible PR。

因此：

- 不要因為沒有 Git remote / `gh auth` 而把 Task 判定失敗。
- 不要嘗試 `git push` / `gh pr create`。
- 不要因為 local branch 叫 `work` 而停止。

## Required Evidence / Acceptance｜必要 Evidence

Codex 完成前至少確認：

- [ ] Preflight context 成立。
- [ ] `git diff` / staged diff 只包含 `experiments/netlify-trigger-boundary/README.md`。
- [ ] `public/**` 沒有變更。
- [ ] `netlify/**` 沒有變更。
- [ ] `netlify.toml` 沒有變更。
- [ ] package manifest / lockfile 沒有變更。
- [ ] local commit 已建立。

## Deliverables｜交付物

- Modified file: `experiments/netlify-trigger-boundary/README.md`
- Local commit: required
- GitHub PR: **not created by Codex Runtime**
- Product publication: Claire 使用 Codex UI 的 Create PR

建議 PR title：

`experiment: probe Netlify docs-only trigger v2`

## Decision Boundary｜決策邊界

Codex 可以自行決定：

- Controlled probe marker 的最小文字位置與表達，只要符合 Scope 與 Evidence 要求。
- local commit message。

Codex 不得自行決定：

- 修改 Trigger Surface。
- 更改 Netlify configuration。
- 擴張 Experiment Scope。
- Merge PR。
- 將結果標示為 `Verified`。

## Completion Report｜完成時回報

只需要簡潔回報：

- Preflight：PASS / FAIL
- Changed files
- Validation result
- Local commit SHA
- Task 是否正常完成

不要把「無法自行建立 PR」回報為 Failure，因為 Create PR 本來就是 Product-level Human Relay step。
