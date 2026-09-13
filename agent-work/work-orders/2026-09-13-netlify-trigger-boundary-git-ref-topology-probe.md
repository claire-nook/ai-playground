# Work Order｜Netlify Trigger Boundary Git Ref Topology Probe

## Metadata

- Work Order: `2026-09-13-netlify-trigger-boundary-git-ref-topology-probe`
- Status: Ready
- Work Type: Investigation / Experiment
- Requested By: Primary Agent
- Intended Executor: Codex
- Target Repository / Branch: `claire-nook/ai-playground` / Product UI selects `main`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`
- Related Reports:
  - `agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`

## Objective｜目標

確認 Netlify Deploy Preview 的 Git checkout / clone 中，是否存在足夠且可解析的 base-branch / remote-tracking refs，可直接在 provider build environment 內計算「本次 PR 自己引入的 Git change boundary」，避免再依賴 `$CACHED_COMMIT_REF`。

成功後至少應回答：

1. Deploy Preview build environment 是否存在 Git remote。
2. 是否存在 `origin/main` 或其他可代表 PR base branch 的 ref。
3. 該 ref 是否能與 `COMMIT_REF` / `HEAD` 計算 merge-base。
4. `merge-base(base-ref, COMMIT_REF) -> COMMIT_REF` 的 changed-path output 是否更接近 GitHub-visible PR diff。
5. 若 local Git refs 不足，明確留下 Evidence，讓下一步可以合理評估 GitHub API / provider event metadata，而不是繼續猜。

本 Work Order **只做 Observability / Investigation，不選定 final Trigger Boundary strategy**。

## Context / Read First｜先讀這些

執行前請讀：

- `agent-work/README.md`
- `agent-work/reports/README.md`
- `agent-work/experience/codex-cloud-workspace.md`
- `agent-work/experience/codex-review-investigation.md`
- `agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md`
- `experiments/netlify-trigger-boundary/README.md`
- `netlify.toml`

重要已知 Evidence：

- PR #6 Deploy Preview：`COMMIT_REF` = PR head。
- 同次 `CACHED_COMMIT_REF` 指向較早的 Netlify build commit，而非 PR base。
- `git diff CACHED_COMMIT_REF COMMIT_REF` 因包含先前 `netlify.toml` change，無法回答「本次 PR 自己改了什麼」。
- `merge-base(CACHED_COMMIT_REF, COMMIT_REF)` 在該次仍等於 `CACHED_COMMIT_REF`，無法修正 comparison semantics。

因此本次要觀察的是 **Git ref topology**，不是再驗證 cached ref。

## Execution Context Preflight｜執行環境確認

在修改前確認：

- 本 Work Order 存在。
- `netlify.toml` 存在。
- `experiments/netlify-trigger-boundary/README.md` 存在。
- `agent-work/reports/` 可使用。
- working tree clean。

Codex Cloud local branch 名稱即使為 `work` 也不是 Failure。

除非任務本身需要，不要求：

- local branch == `main`
- Git remote 存在於 Codex Cloud Workspace
- local / remote-tracking `main`
- `gh auth`

這些是 Netlify runtime probe 的觀察對象，不是 Codex Preflight 的必要條件。

## Scope｜範圍

可以修改：

- `netlify.toml`
- `experiments/netlify-trigger-boundary/README.md`
- 新增一份 `agent-work/reports/2026-09-13-netlify-trigger-git-ref-topology-probe.md`

可以進行：

- local syntax validation
- controlled local shell simulation
- 針對 probe command 的 fail-safe behavior 驗證

## Out of Scope｜不要順手裝修隔壁

不要：

- 修改 `public/`。
- 建立或修改 Netlify Functions / Edge Functions。
- 修改 package manifests / lockfiles。
- 使用 GitHub API 作為正式方案。
- 引入新 dependency。
- 修改 production / formal DB。
- 宣告 final Trigger Boundary strategy。
- 把 local simulation 當成 Netlify Provider Evidence。

若觀察到其他問題，寫入 Report 的 `Unknown / Candidate Follow-up`，不要自行擴張。

## Constraints｜限制與必守規則

### 1. Probe 必須 fail-safe toward deploy

本次 `ignore` 仍屬診斷用途。無論任何 Git topology / ref lookup / merge-base command 成功或失敗，最終都必須讓 Netlify **繼續 build / deploy**。

不要因為診斷 command 失敗就誤判成 safe-to-skip。

### 2. 不輸出 secret

只輸出與 Git topology / commit identity 有關的資訊。

不得 dump 全部 environment，也不得輸出 token、credential、cookie、authorization header 或 provider secret。

### 3. Evidence 優先於推論

若某個 ref 不存在，輸出明確 marker，例如：

```text
ORIGIN_MAIN_RESOLVE_FAILED
```

不要把缺少 Evidence 的情況補成「Netlify 一定沒有 base branch」。

### 4. 不把 ref 名稱當真相

若 `origin/main` 存在，仍需驗證：

- 是否能 resolve 成 commit。
- commit identity / subject / date。
- 與 `COMMIT_REF` 的 merge-base。
- merge-base-to-commit changed-path output。

單純看見 ref 名稱不等於它可作 comparison baseline。

## Tasks / Suggested Method｜工作內容

### A. 將 `netlify.toml` 暫時換成 Git Ref Topology Probe

Probe 至少輸出以下固定 marker：

```text
NETLIFY_TRIGGER_GIT_REF_TOPOLOGY_PROBE_BEGIN
...
NETLIFY_TRIGGER_GIT_REF_TOPOLOGY_PROBE_END
```

建議觀察項目如下。

#### A1. 基本 commit identity

輸出：

- `CONTEXT`
- `BRANCH`
- `HEAD`
- `COMMIT_REF`
- `REVIEW_ID`
- `git rev-parse HEAD`
- `git show -s` 的 HEAD commit / parents / subject

只輸出 allowlist，不 dump 全部 env。

#### A2. Git remote

執行並保留 marker：

```text
git remote -v
```

若沒有 remote，明確輸出 none / failed marker。

#### A3. Git refs topology

輸出可安全 review 的 refs，例如：

```text
git branch -a
git show-ref
```

若 output 過長，可保留 heads / remotes / pull-related refs 等與本實驗直接相關的 subset，但不要因為想縮短 log 而漏掉可能的 base branch ref。

#### A4. Candidate base refs resolve

至少嘗試並分別記錄：

- `refs/remotes/origin/main`
- `origin/main`
- `refs/heads/main`
- `main`

若 repository default branch / base branch 有其他 Evidence，可額外觀察，但不要憑空猜名稱。

每個 candidate 需輸出：

- resolve success / failure
- resolved SHA（若成功）
- `git show -s` identity（若成功）

#### A5. Merge-base 與 changed paths

若任一可信 candidate base ref 可解析，對該 ref 與 `COMMIT_REF`：

1. `git merge-base <base> <commit>`
2. 記錄 merge-base SHA。
3. `git diff --name-only <merge-base> <commit>`
4. 明確框住 changed-path output。

若多個 candidate refs resolve 到相同 SHA，可以在 Report 中合併判讀，但 Provider Log 仍應保留各自 resolve Evidence。

#### A6. 可選但有價值的 ref metadata

若不造成過度複雜，可觀察：

- `git for-each-ref --format=... refs/heads refs/remotes`
- 是否存在 `refs/pull/*` / provider checkout ref

這些屬補充 Evidence，不是必做 final strategy。

### B. Probe final behavior

最後固定 non-zero exit，使 Netlify 繼續 build / deploy。

不要讓任何中途 command 的 exit code 提前終止整個 probe。

### C. Experiment Record

更新 `experiments/netlify-trigger-boundary/README.md`，只記錄：

- 為什麼需要 Git Ref Topology Probe。
- 要觀察什麼。
- Provider Result 尚未取得。

不要預寫成功結論。

### D. Agent Report

新增：

`agent-work/reports/2026-09-13-netlify-trigger-git-ref-topology-probe.md`

至少包含：

- Context
- Probe Design
- Runtime-side Validation
- Expected Provider Evidence
- Unknown
- Candidate Follow-up

Provider Log 尚未產生前，Status 必須維持 Pending / Prepared 類型，不得寫 Verified。

## Required Evidence / Acceptance｜必要 Evidence / 驗收條件

Codex Task 完成時應確認：

- [ ] `netlify.toml` 可解析。
- [ ] probe shell syntax valid。
- [ ] probe 在 candidate refs 存在 / 不存在情境下都能走到 end marker。
- [ ] final exit behavior 讓 Netlify 繼續 build / deploy。
- [ ] 沒有 secret dump。
- [ ] 修改只限 Scope 允許的檔案。
- [ ] Report 明確區分 local validation 與 Provider Evidence。
- [ ] working tree 在 local commit 後 clean。

## Deliverables｜交付物

- 修改：`netlify.toml`
- 更新：`experiments/netlify-trigger-boundary/README.md`
- 新增：`agent-work/reports/2026-09-13-netlify-trigger-git-ref-topology-probe.md`
- Local Commit
- Codex Task 正常成功完成
- Claire 後續以 Codex Product UI Create PR

不要自行 `git push`。
不要自行 Create PR。
不要把無法自行發布 PR 當成 Failure。

## Decision Boundary｜決策邊界

Codex 可以自行決定：

- probe command 的低風險 shell implementation detail。
- marker 命名的細節，只要可辨識、完整且不含 secret。
- 為避免 log 過度冗長所需的安全格式化方式。

Codex 不得自行決定：

- final Trigger Boundary 使用 `origin/main`、merge-base、GitHub API 或其他 strategy。
- PR #5 / #6 是否 merge / close。
- Technical Platform Rule 升格。

若 local Git refs 明顯不足，只回報 Evidence 與 Candidate，不要偷偷接 GitHub API 把實驗問題改掉。

## Report｜執行後填寫

### Result

記錄 probe 是否成功準備與 local validation 結果。

### Evidence

列出修改檔案、syntax validation、controlled simulation 結果。

### Failure / Unknown

列出任何在 Provider Deploy Preview 前無法確認的事項。

### Observation

可提出對 Git ref topology 的 Candidate hypothesis，但需標明為推論。

### Candidate Conclusion

只可提出 Candidate，不可自行標記 final Trigger Boundary。

### Follow-up / Decision Needed

等待 Primary Agent 取得 Netlify Deploy Preview Log 後 Review。