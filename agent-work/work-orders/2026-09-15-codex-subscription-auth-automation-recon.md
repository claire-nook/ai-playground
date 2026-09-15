# P-CODEX-PHONE Phase 2.7｜ChatGPT Subscription-Funded Codex Automation Reconnaissance

- Date: 2026-09-15
- Owner: Primary Agent / Architecture Lead（墨衡）
- Executor: Codex / independent runtime researcher
- Scope: research / reconnaissance only
- Source baseline: `main` latest
- Related research: P-CODEX-PHONE
- Implementation status: **DO NOT IMPLEMENT**

## 1. Research question

目前 P-CODEX-PHONE 的 Phase 3 原先考慮以 GitHub Actions + `openai/codex-action` / `codex exec` 執行 Codex。

但 Claire 的核心成本約束已明確：

> 她已支付 ChatGPT Plus，Codex 也已有方案內 usage allowance。若自動化方案必須改用 OpenAI Platform API key、另外依 API pricing 計費，而無法消耗現有 ChatGPT/Codex plan allowance，則這條架構對本專案原則上不成立，不應因技術上容易而硬做。

因此本研究要回答：

> **是否存在 supported、可維護、可接受風險的方式，讓 headless / automated Codex execution 使用 ChatGPT account authentication 與既有 ChatGPT Plus Codex allowance，而不是 OpenAI API key billing？**

特別要區分：

1. Codex CLI / `codex exec` 使用 ChatGPT login；
2. Codex Cloud task / cloud CLI 使用 ChatGPT entitlement；
3. GitHub Actions ephemeral runner；
4. persistent/self-hosted runner；
5. API-key CI path；
6. unsupported credential-copy hacks。

本研究不是要求找「任何能跑的方法」，而是要找**不需要額外 API 計費、又不把 Claire 的個人登入 credential 變成危險長期 secret**的合理自動化邊界。

## 2. Primary 已取得的 current provider evidence

Primary 已先從 current OpenAI 官方 Help / public source 取得以下 evidence，請你獨立核對，不要直接照抄：

1. OpenAI Help 明確表示：**Signing in to Codex with ChatGPT uses the ChatGPT plan's usage and billing; using your own API key uses API pricing.**
2. Codex CLI 支援 ChatGPT sign-in。
3. Codex CLI / SDK 存在 browser login 與 device-code login 路徑；current public Codex SDK documentation 顯示 existing Codex authentication 可被重用。
4. Headless device-code authentication 曾有 workspace-policy / environment caveat；不可假設所有 CI 都能無互動登入。
5. API-key CI 是官方明確支援路徑，但它不符合本研究的成本目標。

這些 evidence 的 implication 尚未確定：

- 「CLI 可以用 ChatGPT login」不等於「GitHub-hosted ephemeral runner 可以安全、無人值守、長期重用 ChatGPT login」。
- 「可以複製 auth cache」不等於「官方支持把個人 OAuth/refresh credential 存成 GitHub Actions secret」。
- 「可以 device auth」不等於「每一次 ephemeral run 不需要 human interaction」。

## 3. Read first

請先讀：

1. `playground.md`（若 task snapshot 可見）
2. `agent-work/README.md`
3. `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md`
4. `agent-work/work-orders/2026-09-15-codex-dispatch-experiment-design.md`
5. `agent-work/work-orders/2026-09-15-p-codex-phone-phase2-5-adversarial-validation.md`
6. `agent-work/work-orders/2026-09-15-codex-github-boundary-recon.md`
7. `agent-work/reports/2026-09-15-p-codex-phone-primary-qc-phase3-implementation-plan.md`
8. 若 GitHub-visible / task snapshot 可達，Phase 2.5 / 2.6 reports。

如果 snapshot 缺文件，不得從記憶補內容，請標記 evidence limitation。

## 4. Hard constraints

- Claire 使用 iPad-first workflow。
- 不假設她有 Mac/PC、Docker、local server、daemon、always-on home machine。
- GitHub-hosted Actions 是可接受 managed runtime。
- 新增 always-on VM / self-hosted runner 屬重大 architecture cost，不可因 auth 困難偷偷引入。
- ChatGPT Plus 已包含 Codex allowance；Primary goal 是使用既有 allowance，而非另走 API billing。
- 不得要求 Claire 把 ChatGPT password、session cookie、OAuth token、refresh token、`auth.json`、API key 或任何 secret 貼進 chat / Work Order / repository。
- 不得為了證明可行而實際匯出、複製、上傳、查看或持久化 Claire 的 Codex credential。
- 本階段禁止建立 GitHub Actions workflow、secret、API key、token、runner 或 infrastructure。

## 5. Required investigation tracks

### Track A｜Billing / entitlement contract

請從 current official OpenAI evidence回答：

1. ChatGPT-authenticated Codex CLI 是否明確消耗 ChatGPT plan allowance？
2. API-key-authenticated Codex 是否明確使用 API pricing？
3. Codex Cloud task / `codex cloud` execution 是否使用 ChatGPT plan allowance、credits、API billing，還是依 auth mode 不同？
4. 「ChatGPT login」的 entitlement 是否適用於 non-interactive `codex exec`？
5. 是否有官方限制，禁止將 ChatGPT personal-plan authentication 用於 CI / unattended automation？若官方 docs 沒說，請標 Unknown，不要自行推法律/ToS 結論。

### Track B｜Codex CLI ChatGPT authentication mechanics

不讀取任何 real credential value，只研究 contract / source：

1. `codex login`、`codex login --device-auth`、SDK login flows 的 current behavior。
2. ChatGPT login state 存在哪一類 credential store（例如 file/keychain），請只描述 storage model，不得讀真內容。
3. Credential 是否包含 refreshable session / access token；token refresh 是否由 CLI 自動處理？
4. 是否有 supported way 將既有 ChatGPT login 提供給 headless process，而不 export raw secret？
5. `CODEX_HOME` / auth store relocation 是否屬 documented feature？
6. 是否存在 supported helper / credential-provider mechanism，可讓 runner 動態取得 ChatGPT auth 而不保存 personal refresh token？
7. Login credential 是 user-bound 還是 machine-bound？可否在 ephemeral runner 重用？若未明確 documented，標 Unknown。

### Track C｜GitHub-hosted ephemeral Actions feasibility

這是本研究最重要的 deployment fit：

1. Fresh GitHub-hosted runner 每次都是 ephemeral；如何取得 ChatGPT-authenticated Codex session？
2. Device-code login 是否每次都需要 Claire 在 browser 完成人工驗證？若是，則不符合 autonomous dispatch acceptance。
3. 能否安全使用 GitHub Actions secret 恢復 Codex auth state？
4. 如果技術上能把 `auth.json` / refresh credential 當 secret restore，這是否是 OpenAI documented / supported CI pattern？
5. 即使可行，請評估：credential lifetime、rotation、revocation、runner exposure、fork/PR workflow exposure、logs、third-party Action exposure、account blast radius。
6. 如果唯一 subscription-funded方法是把 personal OAuth credential 長期存 GitHub Secret，請不要因為「能跑」就判 GO；必須評估是否 architecture-worthy。

### Track D｜Persistent/self-hosted authenticated runner

研究但不要推薦得太快：

1. 一台已 `codex login` 的 persistent runner 是否可持續吃 ChatGPT allowance？
2. 這是否能避免每次 device login？
3. 代價是否等同引入 always-on host / credential-bearing machine？
4. 對 iPad-first / managed-infrastructure 原則而言，是否反而比 API billing更糟？
5. 有沒有 managed persistent workspace 服務能保留 ChatGPT login，但不需要 Claire 自己養 machine？若有，只列 candidate 與 evidence，不要建立。

### Track E｜Codex Cloud as subscription-funded execution host

重新檢查我們早先看到的 experimental `codex cloud` surface：

1. `codex cloud exec --env ...` 是否在 ChatGPT-authenticated CLI session 下可提交 Cloud task？
2. 它的 usage 是否可確認走 ChatGPT Codex allowance？
3. 若能由某個 authenticated caller 執行，caller 本身是否仍需 persistent ChatGPT auth？
4. 是否存在 stable external webhook/API/tool，可以直接建立 Codex Cloud Task，而不經 API-key model billing？
5. ChatGPT / Plugin / GitHub connector 目前有沒有 supported capability 直接觸發 Cloud Task？
6. `codex cloud` 若仍標 Experimental，請把 support/stability risk單獨列出。

### Track F｜Other supported subscription-auth automation paths

請主動尋找但不要幻想：

- Codex SDK using existing ChatGPT session
- device authorization flow designed for remote/headless use
- supported access-token helper
- workspace agent / ChatGPT automation surfaces that can invoke Codex
- official GitHub/Codex integration that consumes ChatGPT entitlement rather than API key

每一條都要回答：

- 誰持有 credential？
- 是否需要 per-run human action？
- usage 記在哪個 billing/allowance bucket？
- 是否 support unattended automation？
- 是否符合 iPad-first？

## 6. Architecture candidates to compare

至少比較：

### A. GitHub Actions + OpenAI API key

- Technical feasibility
- Cost model
- 判斷是否因額外 API billing而不符合 Claire requirement

### B. GitHub Actions + restored ChatGPT/Codex user credential

- Technical feasibility
- Official support status
- Security / credential custody
- 是否值得採用

### C. Persistent authenticated Codex runner

- 是否使用 Plus allowance
- Human/infra burden
- iPad-first fit

### D. ChatGPT-authenticated caller → Codex Cloud task

- dispatch feasibility
- usage bucket
- stability
- whether it truly removes human relay

### E. No-go / manual Codex Cloud UI remains cheapest supported path

如果 provider boundary 目前真的不允許安全的 subscription-funded unattended automation，請直接接受這個答案，不要為了「一定要自動化」創造脆弱 workaround。

## 7. Evidence classification

每個核心 claim 使用：

- **Confirmed**：current official docs/source 或 runtime contract 可直接支持。
- **Plausible**：技術機制合理，但至少一個 auth/provider boundary 未證實。
- **Unsupported**：現有 evidence 不支持。
- **Unknown**：缺 evidence。

Provider billing/auth claim 優先 official OpenAI docs / official source；GitHub Discussion / issue 只能作 field evidence，不能覆蓋 official contract。

## 8. Security boundary

本研究 **禁止**：

- 讀、列印、cat、base64、copy、upload、commit 真實 `auth.json` 或 token store；
- 從 environment / process / keychain / memory 抽取 credential；
- 建立 personal access token / API key / OAuth token；
- 將 personal ChatGPT session credential 模擬成 CI secret作 live test；
- 修改 Claire 的 ChatGPT security settings；
- 啟用 device-code auth setting；
- 建立 workflow 或 runner；
- 發起付費 API call 作比較。

可以讀 public source code，描述 auth file/schema/storage behavior，但不要輸出任何真 credential example 值。

## 9. Required report

建立：

`agent-work/reports/2026-09-15-codex-subscription-auth-automation-recon.md`

必須包含：

1. Executive verdict
2. Confirmed billing/allowance facts
3. ChatGPT auth mechanics
4. Ephemeral GitHub Actions feasibility
5. Persistent runner feasibility
6. Codex Cloud / cloud CLI path
7. Candidate matrix
8. Security / credential custody analysis
9. iPad-first architecture implication
10. Exact blockers / live probes if any
11. Final recommendation

## 10. Mandatory direct answers

報告末尾逐題回答：

1. **`codex exec` 用 ChatGPT login 時，是否 Confirmed 消耗 ChatGPT Plus Codex allowance而非 API billing？**
2. **GitHub-hosted ephemeral runner 能否以 supported方式無人值守使用 ChatGPT login？**
3. **是否必須每次 device/browser login？**
4. **把 Codex auth cache存在 GitHub Secret 是否 official supported、只是 technically possible、還是應判為不合適？**
5. **是否有官方 credential-helper / headless auth pattern，可避免保存 personal refresh credential？**
6. **persistent authenticated runner 是否能解決問題？代價是什麼？**
7. **`codex cloud exec` 能否在 ChatGPT-auth session 下成為 subscription-funded dispatch primitive？它是否仍 Experimental？**
8. **有沒有 stable external Cloud Task API / tool 可直接吃 Plus allowance？**
9. **若禁止 API額外付費，目前 P-CODEX-PHONE 最可行 architecture 是什麼？**
10. **Final verdict 必須是 `GO / CONDITIONAL / NO-GO`：對「無額外 API 計費的 autonomous Codex dispatch」而言，目前是否值得進 Phase 3？**

## 11. Deliverable / publication

只新增 research report，不修改 implementation code。

完成後：

- commit report
- 透過正常 Codex / GitHub task flow建立 PR
- 回報 Report path、commit SHA、PR、Final verdict，以及三個最重要的發現

Primary 會獨立核對 provider evidence；Codex report 不因寫了 Confirmed 就自動成為 Verified Evidence。
