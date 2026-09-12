# GitHub Actions Remote Execution Environment

- Date: 2026-09-12
- Status: Completed / Verified
- Scope: AI Playground execution capability

## Why this experiment matters

這次實驗原本只是為後續 Supabase Edge Function deployment 研究 GitHub Actions，但實際得到更重要的 Playground capability：**GitHub Actions 可作為 AI Playground 的外部 Remote Execution Environment。**

它不是 Production deployment rule，也不是用來繞過 AI / Provider 的 safety、policy 或 authorization boundary。它解決的是 execution environment / toolchain / CI-CD context 的能力問題。

## Verified Capability

已實證以下完整閉環：

```text
AI modifies GitHub repository
→ AI commits to main
→ path-filtered push event matches Workflow
→ GitHub automatically starts GitHub-hosted Runner
→ Runner executes runtime work
→ AI independently finds Workflow Run / Job
→ AI retrieves Job Log
→ AI reads runtime-only result
```

此流程不需要 Claire 手動啟動 Runner。

### Runtime evidence

Push-triggered experiment：

- Workflow: `Push Playground`
- Workflow file: `.github/workflows/push-playground.yml`
- Trigger commit: `db7d6bc1c0b6bba2ff5bc317500d08683bada4d0`
- Run ID: `34697965162`
- Event: `push`
- Branch: `main`
- Result: `success`
- Runtime-only verification code: `811888`
- Runner OS: Linux
- Runner architecture: X64
- Observed runner image: Ubuntu 24.04

`811888` 是 Runner 執行當下隨機產生，AI 事前不知道內容；AI 在 Claire 不提供執行結果的情況下自行由 GitHub Job Log 讀回，因此可作為「AI → trigger → runtime → result retrieval」閉環的 Evidence。

## Manual Mode Evidence

`.github/workflows/hello-action.yml` 使用 `workflow_dispatch`。

Claire 在 iPad Safari 手動按下 Run workflow 後，GitHub-hosted Runner 成功執行；第二次實驗中 Claire 只告知「跑完了」，AI 隨後自行找到 Run / Job / Log 並取得 runtime-only verification code `784094`。

- Run ID: `34697687109`
- Event: `workflow_dispatch`
- Result: `success`
- Runtime-only verification code: `784094`
- Runner OS: Linux
- Runner architecture: X64

這證明 Manual Approval 與 AI Result Retrieval 可以分離。

## Two useful execution modes

### Manual Approval Mode

```text
Claire
→ Run workflow
→ GitHub Runner
→ AI reads Run / Job / Log
```

適合 Deployment、Migration 或其他希望保留 Human Approval Gate 的高影響操作。

### Autonomous Playground Mode

```text
AI
→ commit to controlled path
→ push trigger
→ GitHub Runner
→ AI reads Run / Job / Log
```

適合 Experiment、Build、Test、CLI、PoC、runtime capability verification 等低風險工作。

## Trigger safety pattern

Autonomous Mode 不應預設為「任何 commit 都啟動 Runner」。本次實驗使用 branch + path filter：

```text
main + experiments/action-push/**
```

因此只有特定 Playground execution zone 的變更會叫醒 Runner。未來若建立更多 AI execution zones，應優先使用窄範圍 branch / path trigger，避免普通文件或無關 commit 產生不必要的 execution side effect。

## Current capability boundary

截至 2026-09-12，本次使用的 GitHub Connector 能力已觀察到：

- AI 可建立 / 修改 Repository files，因此可產生 commit。
- AI 可透過會命中 Workflow trigger 的 commit 間接啟動 GitHub-hosted Runner。
- AI 可讀取 Workflow Run、Job、Step 與 Job Log，取得 runtime result。
- Connector 未提供直接建立全新 `workflow_dispatch` Run 的 action；Manual Mode 目前由 Claire 在 GitHub UI 啟動。
- Connector 有針對既有 failed / cancelled job 的 rerun 能力；這不等於可任意重新啟動已成功的 Run。
- Connector 未提供 GitHub Actions repository secrets 管理能力；需要 Secret 的實驗不可把 Secret 寫入 public repository 或 log。

Provider / Connector capability 可能改變，正式使用前應依風險與時間距離決定是否重新驗證。

## Playground meaning

GitHub Actions 與一般短生命週期 AI sandbox 的角色不同：

```text
AI tool / sandbox
→ 快速、臨時、互動式運算

GitHub Actions
→ Repo-aware、event-driven、可重現、可稽核的 Remote Execution Environment
```

GitHub commit 將 source version 與 execution evidence 綁在一起，Run / Job / Log 則留下可追溯的 runtime observation。

因此，未來 AI 在 Playground 遇到自身 sandbox 缺少特定 CLI、runtime、build environment、CI/CD context 或需要由 GitHub event 驅動的工作時，**應主動把 GitHub Actions 視為候選執行環境，而不是每次重新從 Provider documentation 推測是否可行。**

這是「曾經可行」的 Evidence，不是永久保證。需要正式採用時仍應檢查目前 Provider capability、security boundary、cost 與 operational risk。

## Artifacts

- Manual workflow: `.github/workflows/hello-action.yml`
- Push workflow: `.github/workflows/push-playground.yml`
- Push trigger artifact: `experiments/action-push/trigger.txt`

## Knowledge transfer

給未來 AI：如果你需要一台暫時的 Linux 工作站、真實 GitHub CI/CD runtime、特定 CLI / toolchain，或需要把 Repo commit 與 execution result 綁在一起，先看這份 Evidence。Playground 已經證明 GitHub Actions 可以成為你的 Remote Execution Environment；必要時重新驗證，不要無聊地從 Hello World 再撞一次牆。
