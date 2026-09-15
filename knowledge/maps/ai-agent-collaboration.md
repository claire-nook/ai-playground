# AI Agent Collaboration Research Map

這張 Map 研究的不是「哪個 AI 比較聰明」，而是：

> 當多個 AI Agent 擁有不同 Runtime、Tool Access、Workspace 與 Provider Boundary 時，如何建立可驗證、可維護、可恢復 Context 的協作系統？

目前第一個具體研究主題是 P-CODEX-PHONE：讓 ChatGPT Primary 與 Codex 不再依賴 Claire 作為人工訊息轉送層。

---

## Research Context

目前已形成的 collaboration model：

```text
Claire
  ├─ Business Intent / Functional Acceptance / Human Gate
  ↓
Primary Agent（墨衡）
  ├─ Research Question
  ├─ Architecture / Responsibility Boundary
  ├─ Work Order
  └─ Technical QC
  ↓ GitHub durable state
Implementation Agent（Codex）
  ├─ Runtime / Workspace work
  ├─ Test / Probe
  └─ Report / PR / Evidence
```

核心原則：

> **Experiment Ownership ≠ Experiment Execution.**

> **Agent Report ≠ Verified Evidence.**

> **Prompt Access ≠ Tool Access ≠ Workspace Access ≠ Authorization.**

---

## Q1｜GitHub 能否成為 Agent 間 durable collaboration boundary？

Status: `Verified`

Evidence：

- Work Order 可以保存 intent、scope、source baseline 與 acceptance boundary。
- Codex 可從 repository context 工作並透過 PR / report 發布成果。
- Primary 可獨立讀取 GitHub-visible diff / report / evidence 做 Technical QC。
- 不要求兩個 Agent 共用完整 conversation context。

Implication：

Repository 可以承擔 shared durable state，降低對 model memory / conversation continuity 的依賴。

Related：

- `agent-work/README.md`
- `agent-work/experience/codex-cloud-workspace.md`
- `experiments/codex-dispatch/README.md`

---

## Q2｜Primary 能否自主 dispatch Codex，而不需要 Claire 作 Human Relay？

Status: `Partial / Deferred`

已確認：

- `codex exec` 可作 non-interactive execution primitive。
- `codex cloud exec` 存在，但目前 observed CLI 仍標示 Experimental。
- ChatGPT App / MCP / GitHub 可以構成 caller / durable-state / trigger 的部分鏈條。
- 技術上可用 API-key-backed runner 建立 autonomous dispatch。

目前 blocker：

- API key 路線改走 OpenAI API pricing，不符合「使用既有 ChatGPT Plus Codex allowance」的成本要求。
- ephemeral hosted runner 沒有 supported subscription-backed unattended workload identity。
- device auth 仍需人類授權。
- restore personal ChatGPT auth store 到 CI 不符合 credential custody / blast-radius boundary。
- persistent authenticated runner 的維運與安全成本高於要消除的一次人工 dispatch。

Current judgment：`WAIT / Deferred by Provider Gap`

Re-open trigger：provider 提供 stable Cloud Task API / subscription workload identity / OIDC federation / short-lived CI credential helper / direct ChatGPT→Codex task tool。

Experiment：`experiments/codex-dispatch/README.md`

---

## Q3｜Codex 的 Repository / Workspace Boundary 到底在哪？

Status: `Partial`

### Codex Cloud Task

Verified / observed：

- selected repository/source snapshot 是 operational boundary。
- workspace 可有 local Git object / commit，但沒有證據支持 ambient cross-repository GitHub authority。
- product Create PR boundary 與 shell-visible Git credential 是不同層。

Current rule：

> 不把 Cloud Task repo selector 推論成 kernel hard boundary，也不把一般 Git 能力推論成 Cloud provider guarantee。

### `codex exec`

Verified at CLI contract level：

- `--cd` 選 working root。
- `--add-dir` 可增加 writable filesystem roots。

因此 multi-repo execution 的能力主要由 runner checkout、filesystem sandbox、network 與 GitHub credential 決定。

Open branches：

- Cloud Task second-public-repo read behavior。
- Cloud Task multi-checkout / alternate branch publication mapping。
- authorized private cross-repo execution only if future architecture actually needs it。

Report：`agent-work/reports/2026-09-15-codex-github-boundary-recon.md`

---

## Q4｜多 Agent 應共享推理，還是共享 Evidence？

Status: `Partial / Working Principle`

目前研究經驗支持：

- 共享 Facts / Repository / Work Order / Evidence 有利於 coordination。
- 不要求兩個 Agent 共用完整內部 reasoning。
- Primary 先形成 Architecture Draft，再讓 Codex 進行 adversarial validation，成功暴露 caller identity、publication authority、idempotency、raw patch trust 等 blind spots。

Current working principle：

> **Shared durable facts; independent judgment; explicit evidence comparison.**

目的不是兩個 Agent 各做 50%，而是讓不同 Agent 在自己的責任域做到完整工作，再互相 QC。

Future branch：

- 更正式的 adversarial review protocol。
- conflicting conclusions / evidence arbitration。
- confidence / evidence-strength handoff format。

---

## Q5｜Codex 遇到 Requirement / Architecture ambiguity 時，如何停止並問 Primary？

Status: `Candidate`

目前只研究了 Primary → Codex dispatch，尚未完成 bidirectional escalation。

Desired flow：

```text
Primary → Dispatch
Codex → Decision Required / Question
Primary → Decision / Clarification
Codex → Resume
Codex → Completion
```

Boundary：

- Implementation uncertainty（How）可由 Codex 自主處理。
- Requirement / Architecture / Authorization ambiguity（What / May I）應 fail-fast escalation。

此題等 autonomous dispatch 或 provider-native collaboration surface 更成熟後再研究，不先蓋 custom state machine。

---

## Q6｜Public / Private Repository 的 Agent Dispatch Pattern 是否應相同？

Status: `Candidate`

Current judgment：

- Private repo 可較自然使用 repo-local Issue / Actions 作 admission surface。
- Public repo 不應因 Issues 對外開放，就直接讓昂貴 execution trigger 掛在 public ingress。
- 若 future demand 成立，可使用 private control-plane routing → target-owned workflow。
- Central dispatcher 優先只做 routing；只有真實 cross-repo publication demand 才引入 GitHub App / short-lived installation token boundary。

目前不實作，因 P-CODEX-PHONE 已在 authentication/provider layer Deferred。

---

## Current Research Coverage

| Question | Status | Current result |
| --- | --- | --- |
| GitHub durable collaboration state | Verified | 可支援 Work Order → Codex → PR → Primary QC |
| Autonomous Primary → Codex dispatch | Partial / Deferred | provider subscription unattended identity 缺口 |
| Cloud Task vs `codex exec` repo boundary | Partial | execution model 已分離；部分 provider behavior仍需 live probe |
| Independent Agent adversarial review | Partial | 已證明可暴露 Primary Draft blind spots |
| Bidirectional escalation | Candidate | 未研究 implementation |
| Public/private repo dispatch topology | Candidate | pattern 已辨識，未值得 implementation |

---

## Research posture

這條 Research Map 特別強調 Negative Evidence：

「目前沒有 supported primitive」不是空白結果，而是 provider capability map 的一部分。

當 provider capability 快速演進時，正確策略可能是：

```text
Explore
→ identify exact missing primitive
→ preserve Evidence
→ defer workaround
→ re-open when provider changes
```

不要因為 AI Agent 題目很潮，就把每個缺口都拿自建 infrastructure 填滿。系統最後還是要有人養，而那個倒楣的人通常不是畫 Architecture Diagram 的那一位。