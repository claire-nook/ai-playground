# Work Order｜Codex External Dispatch Reconnaissance

Date: 2026-09-15
Owner / Primary: 墨衡
Execution Agent: Codex
Type: Research / Reconnaissance only
Implementation: **禁止**

## 1. Research Goal

我們想回答一個非常具體的問題：

> **外部系統（尤其 ChatGPT Plugin / App）能否以受支援、可程式化的方式建立、啟動、喚醒或委派工作給 Codex？如果可以，最小 invocation boundary 是什麼？**

目標不是現在打造 Agent Hub，也不是設計完整 multi-agent framework。先找出「姐姐能不能打電話叫弟弟工作」所需的最小技術介面。

## 2. Context

目前已知：

- ChatGPT Primary 已可直接使用 GitHub、Supabase、Netlify tools。
- GitHub 可作為 durable collaboration state，因此未來 dispatch payload 理論上可以很薄，只需要 repository + work-order pointer，而不需要搬運完整 conversation context。
- 我們測過 Codex Coordinator。其 Skill 明確描述 native Codex tasks、task creation、messages、status、transcripts 與 thread UUID；Coordinator 可以 reuse/create local native tasks，但 native task completion 不會自動 wake Coordinator。
- 我們測過 AgentProof。其描述包含 `Start a new instrumented Codex session`。
- 上述兩個安裝後，ChatGPT Primary 的 tool surface 都沒有出現可直接呼叫 Codex task/session 的新工具。
- 因此目前的 open question 已從「Codex 能不能建立 task」縮小成「這個 capability 是否有任何外部可支援的 invocation surface」。

以上包含 observation 與 inference。請自行重新驗證，不要把它們當成既定結論。

## 3. Read First

先讀：

1. `playground.md`
2. `agent-work/README.md`
3. 本 Work Order

若 Repository 內已有與 Codex workspace / dispatch / agent collaboration 直接相關的 Experience 或 Evidence，再依需要閱讀，不要為了儀式掃完整個 Repository。

## 4. Scope

只做 reconnaissance / evidence gathering。優先調查以下五條：

### A. Native Codex task / thread / session interface

確認是否存在 OpenAI 官方、受支援且可由外部程式呼叫的介面，可建立或啟動與目前 Codex product 中 native task / thread / session 等價的工作。

需要特別區分：

- Codex product native task
- OpenAI API model request / Responses API agentic coding
- Codex CLI process
- Codex SDK / library
- internal/private host capability

不要因名稱都叫 Codex 就把它們視為同一件事。

### B. Codex CLI non-interactive execution

確認 Codex CLI 是否能以 non-interactive / automation-friendly 方式：

- 接收工作指令或 work-order pointer
- 指定 / 使用 repository workspace
- 執行 coding task
- test
- commit / push（若 capability 與 authority 允許）
- 提供 machine-readable status / exit result

本階段只研究 capability，不實際建立 production runner。

### C. Coordinator / AgentProof mechanism

研究 Codex Coordinator 的 `create native task` 與 AgentProof 的 `Start a new instrumented Codex session` 到底依賴什麼：

- Codex host native capability？
- Codex CLI？
- public API / SDK？
- private / experimental interface？
- Plugin executable / hook？
- 純 Skill instructions？

若能讀取公開 source / manifest / installation reference，請追到足以辨識 mechanism boundary；不要逆向或存取未授權 private data。

### D. Plugin / MCP / App bridge

確認 ChatGPT Plugin / App / MCP（Model Context Protocol）是否能合理成為外部 dispatch caller，以及 Codex 端是否存在可接的受支援 endpoint / tool。

這裡要回答的是 capability boundary，不需要設計 UI。

### E. Thin runner fallback

如果 native Codex task 無法由外部程式建立，描述最薄的 fallback：

`ChatGPT → custom Plugin/App → runner → Codex CLI → GitHub`

只列出必要 components、execution environment、credential boundary、workspace lifecycle、status/result retrieval 與主要 security constraints。

不要開始蓋 runner。

## 5. Evidence Standard

每項 finding 必須標記：

- `Confirmed`：有直接官方文件、公開 source、CLI help/runtime observation 或其他可重現 direct evidence。
- `Plausible`：有合理技術證據，但關鍵 invocation 尚未直接驗證。
- `Unsupported`：已有證據顯示目前不支援或不適用。
- `Unknown`：目前證據不足。

並標示 Evidence Source：

- OpenAI official documentation
- Public source / repository
- Codex runtime direct observation
- CLI help / command output
- Third-party documentation
- Inference

**不要把 inference 寫成 verified capability。**

若發現 undocumented/private/experimental interface，只能記錄其存在與風險，不得把它推薦成 production boundary。

## 6. Explicit Non-Goals / Safety Boundary

本 Work Order 明確禁止：

- 不寫 PoC code
- 不建立 Agent Hub
- 不建立 Plugin / MCP server
- 不建立新的 cloud server / VM / runner
- 不建立或修改 Supabase / Netlify resource
- 不建立 secrets / tokens / credentials
- 不修改 GitHub Actions
- 不修改現有 application code
- 不嘗試繞過 OpenAI / Codex product boundary
- 不讀取或提交 private Codex database、credential store、token、session secret 或 transcript
- 不因為找到 internal endpoint 就對它做未授權 invocation

允許的 Repository write 僅限本次研究 Report / Notes，以及必要的 evidence citation / command-output excerpt。不要修改 implementation artifact。

## 7. Required Report

請建立：

`agent-work/reports/2026-09-15-codex-external-dispatch-recon.md`

Report 至少包含：

1. Executive conclusion
2. Capability matrix：Native task API / CLI / SDK / Plugin-App-MCP bridge / thin runner
3. Coordinator mechanism finding
4. AgentProof mechanism finding
5. 最小可行 dispatch architecture 候選
6. Security / credential / execution authority boundary
7. Unknowns / evidence gaps
8. Recommended next experiment，若需要實驗，必須仍停在 proposal，不要自行實作
9. Sources / Evidence

最後請直接回答：

> **如果 ChatGPT Primary 要能從 iPad 上委派一張 GitHub Work Order 給 Codex 執行，依目前可驗證能力，最少還缺哪一層？**

## 8. Delivery

- Research only，沒有 implementation acceptance。
- 將 Report commit 到目前 workspace。
- 不需要為了這份研究建立 PR，除非 workspace / product flow 本身要求。
- 最後回報 commit SHA、Report path、最重要的 3–5 個 findings，以及任何仍不能確認的 boundary。
