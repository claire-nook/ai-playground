# P-CODEX-PHONE Phase 2.6｜Codex GitHub / Repository Boundary Reconnaissance

- Date: 2026-09-15
- Owner: Primary Agent / Architecture Lead（墨衡）
- Executor: Codex / Implementation Agent
- Scope: research / reconnaissance only
- Source baseline: `main` latest
- Related research: P-CODEX-PHONE
- Implementation status: **DO NOT IMPLEMENT**

## 1. Research question

在目前可觀察的 Codex Cloud Task、Codex runtime、Git / GitHub capability 與 `codex exec` execution model 中，Codex 的 **repository / branch / GitHub authority boundary 到底在哪裡**？

本研究不是詢問「理論上 Git 可以 clone 多個 repo」，而是要回答：

> 當 Codex 從一個指定 repository / branch 啟動之後，它是否能依 Work Order 自主讀取、clone、fetch、checkout、修改或發布到其他 repository / branch？如果可以，能力來自哪一層？需要什麼 credential / authorization？如果不可以，限制在哪一層？

這個答案會直接決定 P-CODEX-PHONE 未來應採：

1. **Per-repository dispatch**：每個 target repository 自己有入口 / workflow / runner；或
2. **Central dispatcher / agent hub**：Codex 從一個 dispatcher/sandbox 接受工作後，再依授權前往其他 target repository。

## 2. Read first

請先讀：

1. `playground.md`（若 task snapshot 可見）
2. `agent-work/README.md`
3. `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md`
4. `agent-work/work-orders/2026-09-15-codex-dispatch-experiment-design.md`
5. `agent-work/work-orders/2026-09-15-p-codex-phone-phase2-5-adversarial-validation.md`
6. `agent-work/reports/2026-09-15-p-codex-phone-primary-qc-phase3-implementation-plan.md`
7. 若 GitHub-visible / snapshot 可達，相關 Phase 1 / 2 / 2.5 reports。

如果某份文件不存在於 task snapshot，不得從記憶補內容；請記錄為 evidence limitation。

## 3. Current environment / hard constraints

現況：

- Claire 使用 iPad-first workflow。
- Primary Agent（ChatGPT）可透過 GitHub connector 存取 repository；目前已確認可看見 private repo `claire-nook/codex-dispatch-sandbox`。
- `claire-nook/codex-dispatch-sandbox` 是一次性 private sandbox，用於 P-CODEX-PHONE 實驗。
- `claire-nook/ai-playground` 是 public AI Playground / durable research boundary。
- 不假設 Claire 有 Desktop、Docker、local server、daemon 或 always-on host。
- 本研究不得建立 credential、不得 clone private repo 進未授權環境、不得新增 GitHub App/PAT、不得部署 workflow、不得建立新 infrastructure。

## 4. Required investigation tracks

### Track A｜Codex Cloud Task workspace boundary

請調查目前 Codex Cloud Task 的 repository / branch model：

1. 建立 Task 時選定 repo / branch，是否只是初始 workspace selector，還是 runtime hard boundary？
2. Task workspace 中可以看到哪些 Git remote / credential？
3. 是否能從 task runtime 執行一般 `git clone` / `git fetch` / `git remote add`？
4. 如果目標是第二個 **public repo**，是否可直接讀取？
5. 如果目標是第二個 **private repo**，需要什麼額外 authorization / credential？
6. 是否能同時保有多個 repo checkout？
7. 是否能在第二個 repo 修改、commit、push、開 PR？若不能，卡在哪一層？
8. Branch 是否為 task-level immutable binding，還是 workspace 中可自行 checkout/fetch 其他 branch / commit？
9. Codex Cloud Task UI 的 repo/branch selector 與 runtime Git capability 是否有明確 documented distinction？

不要因為一般 Git 可做到就推定 Codex Cloud Task 也可做到。

### Track B｜Codex runtime / native task tools

請從可觀察的 Codex runtime / host-native capability 判斷：

1. Native task / collaboration primitives 是否帶有 repository identity / workspace identity？
2. Spawned subtask 是否與 parent 共用同一 checkout / worktree / branch？
3. 是否存在能指定另一個 repository 的 native task creation primitive？
4. 如果沒有直接 evidence，請標記 Unknown，不要讀 private task database / transcript / install cache。

### Track C｜`codex exec` boundary

請確認 `codex exec` 在 runner / CI 環境中的 repository boundary：

1. `-C / --cd` 是否只是 initial working directory？
2. 同一 runner 中若預先 checkout 多個 repo，Codex 是否可依 filesystem permission 操作多個 repo？
3. 如果 runner credential 允許，Codex 是否可自己執行 `git clone` / `fetch` 第二個 repo？
4. Codex process 的 GitHub authority 是 inherited process authority、Git credential helper、environment token，還是別的 provider mechanism？
5. 什麼設計可以讓 Codex **讀 repo A、寫 repo B**？什麼 credential segregation 才安全？
6. `openai/codex-action` 是否對 cross-repo working directory / checkout 有額外限制？

### Track D｜GitHub authorization boundary

請把「workspace access」和「GitHub authority」分開回答：

1. repository 已 checkout 到 filesystem ≠ 能 push，請清楚區分。
2. GitHub Actions 的 default `GITHUB_TOKEN` 是否通常只對 current repository 生效？
3. cross-private-repo checkout / push 若要成立，通常需要 GitHub App installation token、fine-grained token 或其他 explicit credential 嗎？
4. 是否存在 GitHub-native least-privilege pattern，讓 central dispatcher 可針對 allow-listed target repo 臨時取得權限？
5. 若需要額外 long-lived broad token，請明確判為 architecture cost / risk。

### Track E｜Architecture implication

請比較兩個 future patterns：

#### Pattern 1：Per-repository phone

```text
Primary → target repo Issue / trigger → target repo Actions → Codex → same repo PR
```

評估：

- 權限最小化
- setup cost
- multi-repo maintenance cost
- target repo onboarding
- evidence locality
- future bidirectional escalation

#### Pattern 2：Central dispatcher / agent hub

```text
Primary → dispatcher repo / service → route target repo → Codex → target repo PR
```

評估：

- required cross-repo credentials
- routing / allow-list
- blast radius
- credential custody
- per-job isolation
- scalability
- iPad-first fit

最後請回答：

> 以目前已驗證能力而言，哪一種模式最適合作為 Phase 3 / Phase 4 演進方向？

## 5. Evidence standard

每個重要 claim 都要標：

- **Confirmed**：runtime / repository / current official documentation 可直接證實。
- **Plausible**：架構上合理但至少一個 provider boundary 未實測。
- **Unsupported**：現有 evidence 不支持。
- **Unknown**：缺證據。

優先 evidence：

1. runtime-observed CLI/help / workspace behavior；
2. current official OpenAI docs / source；
3. current official GitHub docs；
4. repository-visible configuration / code；
5. 最後才是推論。

如果 provider documentation / network 不可達，記錄失敗，不得以記憶升格為 Confirmed。

## 6. Safety boundary

本階段 **禁止**：

- 建立 / 輸入 / 取得任何新 API key、PAT、GitHub App private key 或 secret；
- 實際 clone 第二個 private repo 來證明 capability；
- 變更 GitHub authorization scope；
- 建立 workflow / runner / bridge / infrastructure；
- push / PR 到 `codex-dispatch-sandbox` 或其他 target repo；
- 使用 private host database / transcript / credential cache 作為捷徑。

可以：

- 讀 current runtime help；
- 讀 public official source / docs；
- 檢查目前 task workspace 中非敏感 Git metadata；
- 對 public repo 做不涉及 mutation 的 read-only reasoning/probe（若環境允許且符合 provider policy）；
- 提供 illustrative commands / diagrams / pseudocode，但不要執行會跨 private repo 或改動 authority 的 probe。

## 7. Required report

建立：

`agent-work/reports/2026-09-15-codex-github-boundary-recon.md`

至少包含：

1. Executive verdict
2. Codex Cloud Task repo/branch boundary
3. Native task / subtask workspace boundary
4. `codex exec` filesystem/repo boundary
5. GitHub credential/authorization boundary
6. Public repo vs private repo distinction
7. Read vs write/push/PR distinction
8. Can Codex autonomously select / open another repo?
9. Central dispatcher feasibility
10. Per-repo dispatch feasibility
11. Security / least-privilege implications
12. Recommended architecture direction
13. Exact unknowns / blockers requiring authorized live probe
14. Suggested next experiment, if any

## 8. Mandatory direct answers

報告結尾請逐題直接回答，不要藏在長文裡：

1. **Codex Cloud Task 是否實質上是 single-repo / single-branch workspace？**
2. **Codex Cloud Task 啟動後能否自行讀第二個 public repo？**
3. **能否自行讀第二個 private repo？若可以，credential 從哪裡來？**
4. **能否自行修改 / push / PR 到第二個 repo？**
5. **同一 Task 能否 checkout / operate another branch / commit？**
6. **`codex exec` 是否能在同一 runner 操作多個已 checkout repo？**
7. **若 runner 有適當 GitHub credential，`codex exec` 是否可自行 clone target repo？**
8. **目前最小權限、最符合 iPad-first 的架構，是 per-repo phone 還是 central dispatcher？**
9. **如果未來要做 central dispatcher，最小新增 credential / infrastructure 是什麼？**
10. **哪些結論需要 live authorized probe 才能升級為 Confirmed？**

## 9. Completion contract

完成後：

- commit research report；
- 透過正常 Codex / GitHub task publication flow 發 PR；
- 回報 report path、commit SHA、PR、總體 verdict；
- 不進入 implementation。
