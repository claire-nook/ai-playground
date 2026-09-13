# Work Order｜Netlify Trigger Boundary Observability Probe

## Metadata

- Work Order: `2026-09-13-netlify-trigger-boundary-observability-probe`
- Status: `Ready`
- Work Type: `Experiment / Investigation`
- Requested By: Primary Agent
- Intended Executor: `Codex`
- Target Repository / Branch: `claire-nook/ai-playground` / Product UI source branch `main`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`
- Related PR: `#5`
- Related Agent Experience: `agent-work/experience/codex-cloud-workspace.md`, `agent-work/experience/codex-review-investigation.md`

## Objective｜目標

取得 Netlify Deploy Preview 執行 custom `ignore` command 時真正使用的 Git comparison context，回答：

> **`$CACHED_COMMIT_REF`、`$COMMIT_REF`、Workspace HEAD、merge-base 與 changed-path output 實際是什麼？**

本次不是修正 Trigger Boundary，也不是證明 docs-only change 應該 skip。

成功條件是：下一次 Deploy Preview Log 能提供足夠 Observability，讓 Primary Agent 不再靠 cache / ref semantics 猜測 comparison boundary。

## Context / Read First｜先讀這些

執行前閱讀：

- `experiments/netlify-trigger-boundary/README.md`
- `netlify.toml`
- `agent-work/reports/README.md`
- `agent-work/experience/codex-review-investigation.md`

已知 Evidence：

1. PR #5 的 GitHub-visible diff 只有 `experiments/netlify-trigger-boundary/README.md`。
2. Retry 後 Netlify 成功取得 `pull/5/head`。
3. Netlify 執行目前 custom ignore command 後沒有停止，而是完成 publish / deploy。
4. 因此目前 rule 的 comparison model 與「本次 PR 自己改了什麼」至少存在 Boundary Mismatch 的強烈 Evidence。
5. `$CACHED_COMMIT_REF` / `$COMMIT_REF` 的實際 SHA、可用性、merge-base 與 `git diff --name-only` 當次輸出仍未直接觀察。

## Execution Context Preflight｜執行環境確認

Claire 會在 Codex Product UI 選：

- Repository: `ai-playground`
- Branch: `main`

Codex Runtime 的 local branch 名稱可能是 `work`，這不是 Failure。

修改前確認：

- 本 Work Order 存在。
- `netlify.toml` 存在。
- `experiments/netlify-trigger-boundary/README.md` 存在。
- working tree clean。

不要要求 Git remote、local `main`、remote-tracking `main` 或 `gh auth` 作為必要條件。

若必要 Context 不存在，停止修改並回報。

## Scope｜範圍

可以修改：

- `netlify.toml`
- `experiments/netlify-trigger-boundary/README.md`

可以新增：

- `agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`

其中 Report 只記錄本次施工設計、預期要觀察的欄位與 Runtime-side validation；**不要預寫 Provider 結果**。Provider Evidence 必須等 Deploy Preview Log 真正產生後再由 Primary Agent Review。

## Out of Scope｜不要順手修 Trigger Rule

本次不要：

- 嘗試設計最終 production-ready ignore comparison strategy。
- 把 `$CACHED_COMMIT_REF` 改成自行猜測的 PR base。
- 呼叫 GitHub API / Netlify API 去補 ref。
- 新增 package dependency。
- 修改 `public/`。
- 修改 `netlify/functions/` 或 `netlify/edge-functions/`。
- Merge PR #5。
- 把 Case B 標成 Verified / Passed。

若發現 Candidate Fix，只寫在 Report 的 Candidate / Follow-up，不要實作。

## Constraints｜限制與必守規則

### 1. Probe 必須 fail-safe toward deploy

這次 instrumentation 的目的不是 skip build。

custom `ignore` command 最終必須讓 Netlify **繼續 build / deploy**，即使：

- ref 缺失
- merge-base 算不到
- diff 失敗
- diagnostic command 其中一段失敗

Observability Probe 不可以因診斷錯誤把真正 Deploy 吞掉。

### 2. 不輸出 secrets

只列印明確允許的 non-secret context / Git metadata。

不要 dump 全部 `env`，不要輸出 token、credential、cookie、authorization header 或 provider secret。

允許觀察的環境欄位：

- `CONTEXT`
- `BRANCH`
- `HEAD`
- `COMMIT_REF`
- `CACHED_COMMIT_REF`
- `REVIEW_ID`

欄位不存在時應明確印出 `<unset>` 或等價表示，不要讓空值與 script bug 混在一起。

### 3. Diagnostic failure 不得被隱藏

每個重要 Git operation 應讓 Log 看得出：

- command 想做什麼
- 成功 / 失敗
- 成功時的結果

但 failure 不應讓整個 `ignore` command 提前退出。

## Tasks / Suggested Method｜工作內容

### Task A｜把 current ignore rule 暫時改成 Observability Probe

修改 `netlify.toml` 的 `[build].ignore`。

Probe 應至少輸出：

1. 固定 marker，例如：
   - `NETLIFY_TRIGGER_OBSERVABILITY_PROBE_BEGIN`
   - `NETLIFY_TRIGGER_OBSERVABILITY_PROBE_END`
2. 上述允許的 environment values。
3. `git rev-parse HEAD`。
4. `git show -s` 或等價方式，輸出目前 HEAD commit identity / parents，讓 Log 能判斷是否為 PR head / merge-shaped commit。
5. 檢查 `$COMMIT_REF` 是否能 resolve 成 commit。
6. 檢查 `$CACHED_COMMIT_REF` 是否能 resolve 成 commit。
7. 若兩者都可 resolve：
   - 印出 `git merge-base "$CACHED_COMMIT_REF" "$COMMIT_REF"` 結果或明確 failure marker。
   - 印出 `git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF"` 的完整 pathname output。
8. 若 merge-base 可取得，再額外印出：
   - `git diff --name-only <merge-base> "$COMMIT_REF"`
   這只做 Observability，不代表它已被選為 final comparison strategy。
9. 最終明確以 Netlify semantics 所需的 non-zero exit 結束，讓 build / deploy 繼續。

Shell 必須避免 `set -e` 類行為造成中途退出。對可能失敗的 Git command 使用明確 guard / conditional，並把 failure 印成 marker。

### Task B｜更新 Experiment Record

在 `experiments/netlify-trigger-boundary/README.md` 新增本次 Observability Probe 的設計紀錄：

- 為什麼 Case B v2 暴露 comparison boundary mismatch。
- 本次 Probe 要觀察什麼。
- 明確標示 Provider Result 尚未取得。

不要重寫歷史 Case B / Case B v2 原始 Evidence。

### Task C｜建立 Agent Report Stub

新增：

`agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`

內容至少包括：

- Context
- Probe Design
- Runtime-side Validation
- Expected Provider Evidence fields
- Unknown
- Candidate follow-up（可留空或保守描述）

不要填寫尚未看到的 Netlify Deploy Log 結果。

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

Codex 完成前至少確認：

- [ ] `git diff --name-only` 只包含本 Work Order 允許的檔案。
- [ ] `netlify.toml` 可被合理解析，沒有破壞 TOML quoting / syntax。
- [ ] ignore command 明確包含 begin/end marker。
- [ ] 不存在 `env` 全量 dump。
- [ ] Probe 最終路徑會讓 Netlify 繼續 deploy，而不是 safe-to-skip。
- [ ] 對可能缺失 / invalid ref 有 guard，不會因單一 diagnostic failure 中止 script。
- [ ] Experiment Record 沒有預寫 Provider Result。
- [ ] Report 沒有把 Candidate 升格為 Verified。
- [ ] working tree 在 local commit 後 clean。

若可在 Workspace 中對 shell fragment 做不依賴 Netlify secret / remote 的 syntax check，可以做；不要為了模擬 Netlify 建立大型 fake environment。

## Deliverables｜交付物

- Modified: `netlify.toml`
- Modified: `experiments/netlify-trigger-boundary/README.md`
- Added: `agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`
- Local commit: required
- GitHub-visible PR: 由 Claire 在 Codex Product UI 使用 **Create PR** 發布

Codex 不需要自行 `git push`，也不要把無法直接建立 GitHub PR 視為 Failure。

## Decision Boundary｜決策邊界

Codex 可以自行決定：

- 安全、可讀、可在 TOML string 中使用的 shell formatting。
- diagnostic marker 的具體文字。
- Git metadata 顯示格式。

Codex 不得自行決定：

- final Trigger Boundary comparison strategy。
- 是否改用 merge-base / PR base / GitHub API 作正式 rule。
- Case B 是否通過。
- 是否 Merge PR #5。
- 是否把本 Probe configuration 留作長期 production config。

## Completion Report｜完成後回報

請回報：

### Result

- 修改了哪些檔案。
- Probe 會輸出哪些欄位。
- local commit SHA。

### Validation

- TOML / shell syntax 如何檢查。
- diff scope。
- working tree status。

### Unknown

- 哪些只能等 Netlify Deploy Preview Provider Log 才能確認。

### Important

完成 local commit 後正常結束 Task。

**不要自行 Create PR。**

Claire 會在 Codex Product UI 按 Create PR，Primary Agent 再從 GitHub Review PR 與後續 Provider Log。
