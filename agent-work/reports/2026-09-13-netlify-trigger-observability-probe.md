# Netlify Trigger Observability Probe Report

- Date: 2026-09-13
- Status: Provider Evidence captured
- Related Work Order: `2026-09-13-netlify-trigger-boundary-observability-probe`
- Related Experiment: `experiments/netlify-trigger-boundary/README.md`
- Related PR: `#6`
- Deploy Preview: `deploy-preview-6`

## Context

Case B v2 的 GitHub-visible change 只有 Experiment Record，但 Netlify 執行既有 custom `ignore` command 後仍繼續 deploy。先前只能推論 comparison boundary 與「本次 PR 自己改了什麼」不一致。

PR #6 因此只建立 Observability Probe，不修正 Trigger Boundary，也不選擇 final comparison strategy。Probe 固定以 non-zero 結束，確保診斷本身不會 suppress build / deploy。

## Direct Provider Evidence

Netlify Deploy Preview #6 log 直接觀察到：

```text
ENV_CONTEXT=deploy-preview
ENV_BRANCH=pull/6/head
ENV_HEAD=codex/-observability-probe-work-order
ENV_COMMIT_REF=8a2527cab3930cb24ed1b9eabffec642d831edfd
ENV_CACHED_COMMIT_REF=a1ff93b720fe6b066ac0bddcfbb638f859ea5be1
ENV_REVIEW_ID=6
```

Workspace Git state：

```text
git rev-parse HEAD
8a2527cab3930cb24ed1b9eabffec642d831edfd

HEAD parent
302a0b3be5866ee38c81344cc6466dee774deea0
```

因此本次 Deploy Preview 中：

- `COMMIT_REF` 與 Workspace `HEAD` 相同，為 PR #6 GitHub-visible head commit。
- `CACHED_COMMIT_REF` 為 `a1ff93b720fe6b066ac0bddcfbb638f859ea5be1`。
- `CACHED_COMMIT_REF` 不是 PR #6 base commit `302a0b3be5866ee38c81344cc6466dee774deea0`。
- 兩個 refs 都能在 Netlify clone 中成功 resolve。

`git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF"` 實際輸出：

```text
agent-work/experience/codex-review-investigation.md
agent-work/reports/2026-09-13-netlify-trigger-observability-probe.md
agent-work/reports/README.md
agent-work/work-orders/2026-09-13-netlify-trigger-boundary-case-b-v2.md
agent-work/work-orders/2026-09-13-netlify-trigger-boundary-observability-probe.md
experiments/netlify-trigger-boundary/README.md
netlify.toml
```

其中 `netlify.toml` 命中現有 Deploy Trigger Surface regex，因此既有 ignore rule 在這種 baseline 下會判定 relevant change 存在並繼續 deploy。

`git merge-base "$CACHED_COMMIT_REF" "$COMMIT_REF"` 也直接回傳：

```text
a1ff93b720fe6b066ac0bddcfbb638f859ea5be1
```

因此本次 merge-base 與 `CACHED_COMMIT_REF` 相同，merge-base-to-commit changed paths 也與 cached-to-commit 相同。單純改用這兩個 refs 的 merge-base 並不能修正 boundary mismatch。

Probe 最後固定 `exit 1`，Netlify 隨後繼續 dependency install / publish，符合 fail-safe-toward-deploy 的 Probe 設計。

## Judgment

本次 Evidence 已把先前推論升格為直接觀察：

> 在 Deploy Preview #6，`CACHED_COMMIT_REF` 代表的是 Netlify cache / previous-build lifecycle 中的一個較舊 commit，而不是目前 PR 的 base commit。

因此目前 rule：

```text
git diff $CACHED_COMMIT_REF $COMMIT_REF
```

回答的是：

> 從 Netlify 的 cached comparison point 到本次 PR head 之間，Deploy Trigger Surface 是否曾改變？

而不是：

> 本次 PR 自己是否改變 Deploy Trigger Surface？

這就是 Case B v2 的 Trigger Boundary mismatch。

## What This Does Not Yet Prove

本次仍沒有直接證明：

- Netlify 在所有 Deploy Preview 首次 build 都會把 `CACHED_COMMIT_REF` 指向 production / 某一特定 branch lifecycle。
- 同一 PR 第二次 build / retry 時 `CACHED_COMMIT_REF` 是否固定或更新。
- Netlify 是否提供可直接使用的 immutable PR base SHA 環境變數。
- 最終 Trigger Boundary 應使用 PR base/head、GitHub event before/after、provider metadata，或其他 strategy。

## Candidate Follow-up

下一步應先確認 Netlify Deploy Preview 可用的 PR base / event boundary metadata，再選最小且可重現的 comparison strategy。

不建議再用同一個 `$CACHED_COMMIT_REF` 透過 merge-base 包裝，因為本次 Evidence 已證明兩者 merge-base 就是同一個較舊 cached ref。
