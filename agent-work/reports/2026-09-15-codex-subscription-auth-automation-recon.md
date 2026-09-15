# P-CODEX-PHONE Phase 2.7｜ChatGPT Subscription-Funded Codex Automation Reconnaissance

- Research date: 2026-09-15
- Scope: research / reconnaissance only; no implementation or live authentication
- Baseline: repository snapshot at `f5cf307`
- Runtime inspected: bundled `codex-cli 0.144.0-alpha.4`
- Final verdict: **NO-GO**

## 1. Executive verdict

**NO-GO：目前不要進入「不增加 OpenAI API 費用的 autonomous Codex dispatch」Phase 3 implementation。**

OpenAI 現行產品契約清楚支持一半命題：使用 ChatGPT 登入 Codex，usage 計入 ChatGPT plan；使用 API key，則按 API pricing 計費。`codex exec` 會沿用 CLI 的登入狀態，沒有證據顯示 non-interactive 子命令會把 ChatGPT login 悄悄轉成 API-key billing。

缺少的是另一半：官方沒有提供一個同時滿足以下條件的 GitHub-hosted runner pattern：

1. unattended；
2. 每次 fresh runner 都能取得 ChatGPT user authentication；
3. 不保存或搬運 Claire 的可刷新個人 credential；
4. 明確受支持並可維護；
5. usage 仍進 ChatGPT Plus allowance。

Device authorization 解決「遠端機器沒有 browser」而不是「完全沒有人」。新機器仍需使用者在另一台裝置開頁、登入並輸入一次性 code。把登入後的 auth store 封裝成 GitHub Secret 再於每次 run 還原，機制上可能跑得動，但本次未找到 OpenAI 把它列為 supported CI deployment pattern 的文件；它還把一個可刷新、代表個人 ChatGPT account 的 credential 變成長期 automation secret。這不符合本專案的 credential-custody boundary。

因此，禁止額外 API 支出時，最合理架構是保留目前的 **ChatGPT/Codex Cloud product UI + Claire 一次 per-task dispatch gate + GitHub PR evidence + Primary QC**。它不是 autonomous dispatch，但它使用 provider 管理的 ChatGPT session、符合 iPad-first、沒有新增常駐主機，也沒有複製個人 OAuth material。若未來 OpenAI 發布明確的 subscription-entitled workload identity、CI credential broker，或 stable Cloud Task API/tool，再重開此 decision。

## 2. Evidence method and limitations

### 2.1 Evidence hierarchy

- **Confirmed**：current official OpenAI documentation，或本 snapshot 可直接觀察的 CLI command contract。
- **Plausible**：機制合理且有部分 contract，但仍缺 provider auth、billing 或 support 邊界。
- **Unsupported**：官方支持面沒有該 deployment pattern，或它違反本 Work Order 的安全/成本條件。
- **Unknown**：沒有足夠證據；不從一般 OAuth 行為推成 OpenAI 保證。

### 2.2 Consulted public/provider surfaces

以下為本研究使用或交叉核對的官方入口（provider 頁面會變動，結論以本報告日期為準）：

- OpenAI Help, [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)
- OpenAI Developers, [Codex authentication](https://developers.openai.com/codex/auth/)
- OpenAI Developers, [Codex CLI reference](https://developers.openai.com/codex/cli/reference/)
- OpenAI Developers, [Codex GitHub Action](https://developers.openai.com/codex/github-action/)
- OpenAI Developers, [Codex cloud](https://developers.openai.com/codex/cloud/)
- OpenAI Developers, [Codex SDK](https://developers.openai.com/codex/sdk/)
- OpenAI public source, [`openai/codex`](https://github.com/openai/codex)
- GitHub Docs, [GitHub-hosted runners](https://docs.github.com/en/actions/concepts/runners/github-hosted-runners)
- GitHub Docs, [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)

The official Codex manual fetch and web-search tool were unavailable in this runtime (DNS/proxy failure and search authorization failure). Therefore this report does **not** claim a fresh byte-for-byte archival fetch of every page. It independently inspected the installed public CLI contract but did not inspect any login status, environment secret, keychain, token, or real auth file. Claims not established by the available official contract are deliberately `Unknown` rather than filled from memory.

### 2.3 Safe local observations

No authentication was initiated. Help/version output only established that:

- `codex login` exposes browser login, `--device-auth`, `--with-api-key`, and `--with-access-token`;
- API key and access-token modes read their value from stdin;
- CLI configuration normally resolves under `~/.codex/config.toml`, and `CODEX_HOME` exists as a runtime storage/config root;
- `codex cloud` is labelled `[EXPERIMENTAL]` and includes `exec`, `status`, `list`, `apply`, and `diff`;
- `codex cloud exec --env <ENV_ID> [QUERY]` submits a Cloud task without opening the TUI.

Binary diagnostic strings, used only to confirm the storage *model*, show a keyring path with fallback to file storage, an `auth.json` filename, and automatic token-refresh code paths. No credential-bearing file was located, opened, copied, printed, hashed, or modified.

## 3. Confirmed billing and allowance facts

| Claim | Classification | Finding |
|---|---|---|
| ChatGPT sign-in uses plan usage | **Confirmed** | OpenAI Help describes Codex as included with eligible ChatGPT plans and distinguishes ChatGPT sign-in from API-key usage. For Claire's eligible Plus account, this is the existing Codex allowance/credits boundary. |
| API-key sign-in uses API pricing | **Confirmed** | The same official distinction and the CLI onboarding contract describe supplying one's own API key as usage-based billing. This fails Claire's no-extra-API-cost constraint. |
| `codex exec` can use the existing CLI login | **Confirmed** | `exec` is a CLI execution mode, not a separately documented authentication product. The auth mode is selected at CLI login/config scope. No separate API key is inherently required by `exec`. |
| `codex exec` under ChatGPT login consumes the ChatGPT bucket | **Confirmed (product/auth-mode level)** | Combining the official ChatGPT-login billing contract with CLI-wide authentication supports “yes.” No official evidence found of an `exec` exception. This does not predict the exact number of messages/credits a particular run consumes. |
| Cloud tasks are a Codex capability included for eligible ChatGPT plans | **Confirmed (product level)** | Official Codex plan material covers local and cloud use under ChatGPT access. Exact limits can vary by plan and task characteristics. |
| `codex cloud exec` specifically records every submitted task in the same Plus meter | **Plausible** | It uses the current CLI authentication and targets Codex Cloud, but the inspected experimental command help does not state its billing meter. A live account usage-before/after probe or explicit provider confirmation is still required. |
| Personal-plan auth is allowed for unattended CI | **Unknown** | No official page located in the available evidence explicitly authorizes or prohibits this use. This report makes no Terms-of-Use inference. |

The important distinction is **billing eligibility is not deployment eligibility**. Confirming that ChatGPT auth spends plan allowance does not create a supported way to inject that auth into a fresh CI machine.

## 4. ChatGPT authentication mechanics

### 4.1 Browser and device flows

Normal `codex login` is an interactive ChatGPT sign-in through a browser callback. The CLI itself recommends `codex login --device-auth` for remote/headless machines. Device auth displays a URL and one-time code; the user completes sign-in on another browser. The observed UI contract says the code expires after 15 minutes.

This is **remote-friendly interactive auth**, not service authentication. It eliminates the need for a browser *on the runner* but not the user authorization step. Workspace/admin policy can also disable a login mode, so availability must not be assumed across accounts.

### 4.2 Storage and refresh model

The current client supports an OS credential store/keyring and file fallback under the Codex home. The file fallback is commonly named `auth.json`. The client has access-token expiry and refresh paths, which means a durable ChatGPT login may include enough material to refresh a session automatically.

Security consequence: treating the whole auth store as an opaque blob does not make it harmless. A blob capable of keeping unattended jobs signed in is functionally a bearer credential with Claire-account blast radius, even if GitHub masks its literal value.

Open questions that remain **Unknown** without violating the Security Boundary:

- whether every platform defaults to keyring or file for the relevant release;
- exact token lifetimes for Claire's account;
- whether a restored store is machine-bound, device-bound, or accepted cross-machine;
- exact rotation/revocation behavior when the account password, MFA, workspace policy, or session state changes.

### 4.3 `CODEX_HOME`

`CODEX_HOME` is recognized by the current CLI and relocates Codex state/config resolution. That makes isolated homes and controlled cleanup useful operationally. It is **not evidence that exporting the auth subtree is an approved CI credential-distribution mechanism**. Relocatable storage and portable identity are separate contracts.

### 4.4 API key and access-token inputs

`--with-api-key` is a documented non-interactive input pattern but selects API billing, so it is out.

`--with-access-token` proves the CLI can accept an access token over stdin. It does **not** by itself provide an official issuer/helper that mints short-lived ChatGPT-entitled tokens for GitHub Actions. Supplying a manually extracted access token would still violate this Work Order and would expire. No supported credential helper, OIDC exchange, workload identity, GitHub trust federation, or access-token broker for a personal ChatGPT subscription was established.

The Codex SDK's ability to reuse existing Codex authentication means a process sharing a properly authenticated Codex environment can reuse that state. It does not turn the SDK into an OAuth broker or remove custody of the underlying user credential.

## 5. Ephemeral GitHub Actions feasibility

GitHub-hosted jobs start on fresh managed VMs and are discarded after a job. They do not inherit Claire's iPad/ChatGPT browser session or a previous runner's keyring. Each run therefore needs one of four bootstrap paths:

1. **API key** — supported for automation, unattended, but separately billed: reject on cost constraint.
2. **Fresh browser/device login** — subscription-funded, but requires Claire to authorize each fresh runner: reject as autonomous dispatch.
3. **Restore a ChatGPT/Codex auth store from a GitHub Secret/cache** — possibly technically workable, but not established as an OpenAI-supported CI pattern and carries unacceptable personal-credential custody: reject.
4. **Short-lived ChatGPT workload token from a helper/federation service** — desired design, but no supported provider surface found: unavailable.

### 5.1 Does device auth require Claire every run?

On a truly fresh runner with no restored login state, **yes**. A device authorization grant is initiated by that runner, and Claire (or another authorized user) must approve its one-time code. It need not be repeated during the same surviving session, but an ephemeral runner has nothing to carry forward.

### 5.2 Why not restore `auth.json` as a secret?

“GitHub Secrets encrypts it” addresses only storage at rest. It does not answer:

- the secret must be reconstructed in a runner process/filesystem;
- any compromised dependency or untrusted code in that job may attempt exfiltration;
- masking is pattern-based and does not prevent transformed/exfiltrated values;
- fork/PR/event configuration mistakes can broaden exposure;
- third-party Actions and mutable tags expand the supply chain;
- refresh/revocation/rotation behavior is not a documented CI lifecycle;
- the credential represents Claire's personal ChatGPT identity, not a narrow project workload identity;
- compromise could affect Codex/ChatGPT account resources beyond one disposable repository.

GitHub security controls could reduce exposure—protected environments, no untrusted PR triggers, pinned actions, isolated execution/publication jobs, minimal permissions, egress controls, rotation—but cannot transform an unsupported personal OAuth credential into a least-privilege service principal.

**Classification: technically possible in principle, official support Unknown, architecture suitability Unsupported.** It must not be implemented for P-CODEX-PHONE.

## 6. Persistent authenticated runner feasibility

A persistent machine logged in once with ChatGPT can plausibly continue to run `codex exec` against the plan while the CLI refreshes its session. It would normally avoid per-run device login until revocation, expiry requiring re-authorization, or policy changes. This is the closest technical fit, but not the product fit.

It creates a new credential-bearing trust anchor that needs:

- always-on or on-demand host lifecycle;
- patching and hardening;
- protected disk/keyring and backup policy;
- repository checkout isolation and untrusted-code controls;
- egress/log monitoring;
- process supervision, cleanup, availability, and incident response;
- a re-login path that Claire can perform when refresh fails.

A hosted persistent development workspace (for example, a managed VM/dev workspace with a durable home volume) merely outsources hardware. Unless OpenAI documents a service/workload auth boundary, the workspace still holds Claire's personal refreshable identity. No candidate was found that turns this into a provider-supported subscription service principal.

Therefore a persistent runner is **Plausible technically but rejected architecturally**. It violates the iPad-first/managed-runtime intent by introducing a machine Claire or the project must own operationally. It is disproportionate compared with retaining one human dispatch action.

## 7. Codex Cloud and cloud CLI

### 7.1 What exists

The inspected CLI exposes:

```text
codex cloud exec --env <ENV_ID> [QUERY]
```

and calls the whole `codex cloud` command group `[EXPERIMENTAL]`. A logged-in CLI caller can plausibly submit, list, inspect and apply Cloud tasks. The command is attractive because OpenAI owns the task execution environment rather than P-CODEX-PHONE maintaining a runner.

### 7.2 What it does not solve

`codex cloud exec` moves **execution**, not **caller authentication**. An automated caller still needs a valid ChatGPT-authenticated CLI session. On GitHub-hosted runners this returns to the same device-login versus copied-refresh-credential dilemma.

The installed command contract does not confirm its exact allowance ledger, stability guarantee, webhook semantics, service authentication, or public automation SLA. Consequently:

- ChatGPT-authenticated CLI → Cloud task submission: **Plausible**, needs authorized live probe;
- task consumes Plus Codex allowance: **Plausible at command-specific level**, despite confirmed general ChatGPT Codex entitlement;
- useful autonomous primitive from a persistent already-authenticated caller: **Plausible**;
- safe primitive from a fresh hosted runner without personal credential persistence: **Unsupported by current evidence**;
- production architecture dependency while labelled Experimental: **Unsupported for Phase 3**.

### 7.3 External Cloud Task API/tool

No stable public webhook, REST API, GitHub Action mode, ChatGPT tool, connector action, or workload-identity interface was established that can create a Codex Cloud task and debit a user's Plus allowance without carrying that user's ChatGPT session. The public OpenAI API is a different billing/auth boundary.

The ChatGPT GitHub connector authorizes repository access inside supported ChatGPT/Codex product flows; it is not evidence of an external Cloud Task creation API. Likewise, a custom Plugin/App/MCP server could call GitHub or another service, but cannot mint OpenAI subscription entitlement that OpenAI has not exposed.

**Classification: Unknown whether private/internal surfaces exist; Unsupported as a stable public architecture contract.**

## 8. Candidate matrix

| Candidate | Credential holder | Per-run human? | Usage bucket | Unattended support | iPad-first fit | Decision |
|---|---|---:|---|---|---|---|
| A. GitHub Actions + OpenAI API key | GitHub Secret / execution job | No | API pricing | **Confirmed** automation path | Good operationally | **Reject:** violates cost requirement |
| B1. Hosted runner + device login | Fresh runner, after Claire approves | **Yes** | ChatGPT plan | Device flow supported; autonomy absent | Poor | **Reject** |
| B2. Hosted runner + restored personal auth store | GitHub Secret then runner | No until rotation/re-auth | Probably ChatGPT plan | **Not established** as supported CI pattern | Superficially good | **Reject:** custody/blast radius |
| B3. Hosted runner + short-lived helper/federation | Hypothetical broker | No | Desired: ChatGPT plan | No such supported helper found | Excellent | **Unavailable** |
| C. Persistent authenticated runner | Durable machine/keyring | Usually no; re-auth sometimes | ChatGPT plan (CLI auth contract) | General CLI works; unattended personal-session policy Unknown | Poor | **Reject for project** |
| D. Authenticated caller → `codex cloud exec` | Caller retains ChatGPT auth | No while auth remains valid | Plausibly ChatGPT allowance | CLI surface is Experimental | Depends on caller | **Conditional research only** |
| E. Manual Codex Cloud/UI task | OpenAI-managed product session | **Yes, one dispatch** | ChatGPT plan | Supported interactive product path | **Good** | **Recommend now** |

## 9. Security and credential custody analysis

The desired identity should be project-scoped, short-lived, revocable without signing Claire out everywhere, auditable, restricted to task submission, and exchangeable from GitHub OIDC. The discovered ChatGPT login state has none of those documented properties. It is a user session optimized for interactive clients.

Threat boundaries:

1. **At rest:** GitHub Secret or persistent disk becomes another copy of personal account authority.
2. **Materialization:** Codex must read the credential, so malicious repository instructions/dependencies share a trust zone unless strongly isolated.
3. **Network:** a compromised job may exfiltrate rather than print; log masking is not data-loss prevention.
4. **Scope:** a personal token has a wider account blast radius than a project-specific API key.
5. **Lifecycle:** undocumented expiry/rotation makes autonomous recovery brittle and can silently reintroduce Claire as emergency operator.
6. **Governance:** “works after copying a file” cannot be treated as provider support, even if the file format is public source.

No report, command output, commit, or PR produced by this reconnaissance contains a real credential or credential-derived value.

## 10. iPad-first architecture implication

Under the no-additional-API-payment rule, the architecture should optimize the human gate rather than disguise it:

```text
Primary prepares bounded Work Order
→ Claire starts a Codex Cloud task from the authenticated product UI on iPad
→ Codex runs in OpenAI-managed environment using plan allowance
→ Codex creates PR
→ Primary independently reviews GitHub-visible evidence
→ Claire retains only authorization/acceptance gates
```

This preserves the existing supported product session and managed execution. Claire remains a one-step dispatch relay, but is not asked to run a CLI, maintain a daemon, copy secrets, or translate requirements. Automating Work Order preparation, evidence correlation, and review around that human gate can still reduce friction without crossing the auth boundary.

Do **not** proceed with the prior API-key Phase 3 architecture while cost is a hard rejection criterion. Do **not** substitute auth-cache restoration or an always-on VM merely to preserve the word “autonomous.”

Reconsider the verdict if OpenAI ships at least one of:

- a stable Cloud Task API/tool explicitly charged to ChatGPT allowance;
- GitHub/OIDC workload federation for ChatGPT/Codex entitlement;
- an official CI credential helper issuing short-lived, narrowly scoped tokens;
- an official GitHub integration that submits Codex Cloud tasks under the connected user's plan without exporting session state.

## 11. Exact blockers and authorized live probes

No live probe was run in this phase. The following probes require Claire's explicit authorization and should occur only in a disposable repository/environment, without exposing credential values.

### Probe 1 — allowance attribution for `codex exec`

- Record only safe before/after Codex usage counters in ChatGPT product UI.
- From an already authenticated, Claire-controlled Codex environment, run one tiny deterministic `codex exec` task.
- Confirm no API key is configured without printing environment or auth state.
- Compare plan counter and confirm no Platform API charge appeared.
- Purpose: runtime confirmation of the already documented auth-mode billing contract.

### Probe 2 — device auth persistence boundaries

- On a disposable remote environment, Claire deliberately authorizes device login once.
- Restart the CLI/process on the *same* durable environment and check only login status/ability, never file contents.
- Destroy the environment and revoke the session afterward.
- Purpose: measure session persistence and reauthorization behavior, **not** test cross-machine auth copying.

### Probe 3 — ChatGPT-authenticated `codex cloud exec`

- From an already authenticated controlled environment, submit one no-impact task to a disposable Cloud environment.
- Record command version, safe task ID/status, and ChatGPT usage counters; confirm Platform billing remains unchanged.
- Purpose: validate submission and exact usage bucket for the Experimental command.

### Provider confirmation rather than probe

Ask OpenAI Support/product documentation for written answers on:

1. whether personal ChatGPT-plan OAuth is allowed for unattended CI;
2. whether moving/restoring the Codex auth store between machines is supported;
3. whether `--with-access-token` has a supported external short-lived token issuer for CI;
4. whether `codex cloud exec` is covered by Plus allowance and has an automation stability commitment;
5. whether a public Cloud Task API/tool or GitHub entitlement integration is planned/available.

Even successful Probes 1–3 would not make auth-cache copying acceptable. A GO requires a supported credential-custody contract, not only proof that a token works.

## 12. Mandatory direct answers

1. **`codex exec` 用 ChatGPT login 時，是否 Confirmed 消耗 ChatGPT Plus Codex allowance而非 API billing？**  
   **是，Confirmed at the documented product/auth-mode level。** ChatGPT sign-in uses eligible ChatGPT-plan usage; API-key sign-in uses API pricing。沒有 `exec` 例外的 evidence。實際 counter attribution仍建議 authorized live probe。

2. **GitHub-hosted ephemeral runner 能否以 supported方式無人值守使用 ChatGPT login？**  
   **目前不能成立。** 沒有找到官方 subscription workload identity/helper；fresh runner 不是互動登入，就是需要搬運個人 auth state。

3. **是否必須每次 device/browser login？**  
   **Fresh runner 沒有恢復 auth state 時，是。** Persistent session 可避免每 run 登入，但失效/撤銷時仍需人類重新授權。

4. **把 Codex auth cache存在 GitHub Secret 是否 official supported、只是 technically possible、還是應判為不合適？**  
   **Technically possible in principle；official support Unknown；對本案判不合適。** 它把 Claire 的可刷新個人身份變成 CI 長期 secret。

5. **是否有官方 credential-helper / headless auth pattern，可避免保存 personal refresh credential？**  
   **沒有找到。** Device auth 是 headless-machine interactive login；`--with-access-token` 是輸入口，不是可用的 issuer/federation contract。

6. **persistent authenticated runner 是否能解決問題？代價是什麼？**  
   **技術上 Plausible，可避免大部分 per-run login；架構上不接受。** 代價是 always-on/on-demand credential-bearing host、維運、安全、availability、incident response 和偶發 Claire re-auth，違反 iPad-first managed-runtime目標。

7. **`codex cloud exec` 能否在 ChatGPT-auth session 下成為 subscription-funded dispatch primitive？它是否仍 Experimental？**  
   **Plausible，未達 Confirmed；是，inspected CLI 仍明確標示 Experimental。** 它也沒有消除 caller 必須持有 ChatGPT auth 的問題。

8. **有沒有 stable external Cloud Task API / tool 可直接吃 Plus allowance？**  
   **沒有找到 supported public surface。** 對 architecture 判 Unsupported；未知 internal/private surface 不算答案。

9. **若禁止 API額外付費，目前 P-CODEX-PHONE 最可行 architecture 是什麼？**  
   **保留 OpenAI-managed ChatGPT/Codex Cloud UI 的一次人工 dispatch gate，外圍自動化 Work Order、GitHub PR evidence 與 Primary QC。** 不保存個人 credential、不養 runner。

10. **Final verdict：對「無額外 API 計費的 autonomous Codex dispatch」而言，目前是否值得進 Phase 3？**  
    **NO-GO。** 等待 provider-supported subscription automation identity/Cloud Task API；若成本限制改變，API-key hosted-runner architecture 才可重新成為候選。

## 13. Final recommendation

1. Stop the API-key Phase 3 implementation under the current cost requirement.
2. Continue the existing manual Codex Cloud/UI dispatch as the cheapest supported subscription-funded path.
3. Do not copy, serialize, or escrow Claire's Codex auth store in GitHub.
4. Do not introduce a persistent runner only to preserve subscription billing.
5. Optionally execute the three narrowly scoped authorized probes for evidence quality, not as permission to deploy the workaround.
6. Re-run reconnaissance when OpenAI changes Codex auth, Cloud Task API, GitHub integration, or plan billing documentation.

