# Codex External Dispatch Reconnaissance

Date: 2026-09-15

Work Order: `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md`

Type: Research / reconnaissance only（無 PoC、無 execution infrastructure）

## 1. Executive conclusion

截至本次可重現的 evidence，答案不是單純的「有」或「沒有」，而是要分三條 boundary：

1. **Stable / production-supported native Codex Cloud task API：未確認。** 本機 `codex-cli 0.144.0-alpha.4` 確實提供 `codex cloud exec --env <ENV_ID> [QUERY]`，以及 `status`、`list --json`、`diff`、`apply`；這是目前最接近「外部建立 native Codex Cloud task」的 direct evidence。但整個 `cloud` command 明確標成 `[EXPERIMENTAL]`，本次也沒有以 credential 呼叫它。因此可確認介面存在，不能升格成 stable production boundary。
2. **可自管的 automation boundary：已確認。** `codex exec` 是 non-interactive CLI：可由 argument/stdin 接 prompt、用 `-C` 選 workspace、用 JSONL / JSON Schema / output file 回傳結果，並以 process exit status 表示 command outcome。它執行的是 runner 上的 Codex CLI session，不等於 ChatGPT/Codex product 的 hosted native task。
3. **ChatGPT App / MCP 可以當 caller，但不是 execution host。** App 的 server-side tool 可以接收薄 payload；仍要有一個受信任、可執行 Codex CLI 或（未來若成熟）Codex Cloud invocation 的 execution layer。ChatGPT tool surface 沒有因為安裝 instruction-only plugin/Skill 就自然新增 Codex task API。

因此，若目標是可靠地從 iPad 由 ChatGPT Primary 派 GitHub Work Order，**現在最少還缺的是一層有明確 owner、credential 與 sandbox boundary 的 dispatch execution bridge（thin runner）**。它把 App/MCP tool call 轉成 `codex exec` process，準備 repository workspace，監看 status，並把 commit/result 發布到 GitHub。若願意承擔 experimental product risk，候選可縮成 bridge 呼叫 `codex cloud exec`；但在 stable support、authentication、environment provisioning、completion callback 與 end-to-end invocation 尚未驗證前，不建議把它當 production boundary。

## 2. Method、evidence limits 與 baseline

- 已完整讀取 Work Order 與 repository 的 `agent-work/README.md`；Work Order 指定的 `playground.md` 並不存在。依既有 repository experience，這是已知的 Project context / repository context 混淆；本次以 repository root `README.md` 作為可讀的 playground entry point，沒有因此猜造缺失內容。
- 已讀與 Codex workspace / dispatch 直接相關的 `agent-work/experience/codex-cloud-workspace.md` 與 `agent-work/dispatch-handoff.md`，沒有掃描無關 application implementation。
- OpenAI Docs skill 的 Codex manual helper 嘗試取得 `https://developers.openai.com/codex/codex-manual.md`，但 DNS `EAI_AGAIN`；official-domain web search tool 亦回 `401 Unauthorized`。因此，涉及「目前官方是否宣告 stable/support」之判斷，刻意保持 `Unknown`，而不以記憶補齊。
- CLI evidence 來自 workspace runtime 的 `/opt/codex/bin/codex`；只執行 `--version` / `--help` / list metadata，沒有 login、沒有提交 Cloud task、沒有讀 credential/session/transcript/database。
- runtime version 是 `codex-cli 0.144.0-alpha.4`。這個 prerelease runtime observation 證明此環境有命令，不代表所有帳號、版本或平台均可用。

## 3. Capability matrix

| Surface | Finding | Status | Evidence source | Minimal invocation / boundary |
| --- | --- | --- | --- | --- |
| Stable public native task API | 本次未取得官方 REST/API contract，不能確認有 stable API 可直接建立與 Codex product hosted task 等價的工作。Responses API model request 也不能因使用 coding model 就視為 native Codex task。 | **Unknown** | OpenAI official documentation retrieval failed；inference | 未知；不得以 internal endpoint 代替 |
| Codex Cloud CLI | Runtime 有 `[EXPERIMENTAL] codex cloud exec --env <ENV_ID> [QUERY]`，可選 `--branch` / `--attempts`；另有 task `status`、`list --json`、`diff`、`apply`。 | **Confirmed（介面存在）；Unsupported（作 stable production boundary）** | CLI help / command output；Codex runtime direct observation | installed/authenticated CLI + Codex Cloud environment ID + query；是否 entitlement/auth 完整可用尚未呼叫驗證 |
| Codex CLI local execution | `codex exec [PROMPT]` 或 stdin 可 non-interactive 執行；`-C <DIR>` 指 workspace；`--json` 輸出 JSONL events；`--output-schema` 約束 final response；`-o` 寫 last message；`exec resume <SESSION_ID>` 可續接 local recorded session。 | **Confirmed** | CLI help / command output | runner process + installed CLI/auth + checked-out repo + prompt/work-order pointer |
| Test / commit / push | CLI agent能否 test/commit/push 取決於 prompt、sandbox/approval、repo state、installed tools 與 Git credential。CLI 沒有「保證 commit/push」的 dedicated contract；`exec` 可在授權下執行 shell。既有 workspace evidence 顯示 local commit 與 GitHub publication authority 分離。 | **Plausible（test/local commit）；Unknown per environment（push）** | CLI help；repository Experience；inference | runner 的 filesystem/process authority；push 另需 narrow GitHub credential |
| Codex SDK/library | 本次無法取得官方 SDK page/package source；不能以名稱推定它會建立 hosted native task。即使 SDK 封裝 `codex exec`，其 boundary 仍會是 self-hosted CLI process。 | **Unknown** | Official docs unavailable；inference | 必須先驗 SDK transport、auth、thread persistence 與 support status |
| `mcp-server` | CLI 有 `codex mcp-server`（stdio），可把 Codex 暴露成 MCP server；help 未顯示 remote network/auth/status contract。存在不等於 ChatGPT App 能直接連接本機 stdio。 | **Confirmed（command）；Unknown（App end-to-end bridge）** | CLI help / command output | co-located process host + stdio MCP client；production exposure/auth 未確認 |
| `app-server` / `exec-server` / remote control | Runtime 有 app server WebSocket/Unix/stdio transport與 auth options，但明標 `[experimental]`；standalone `exec-server` 與 remote-control 亦為 experimental。 | **Confirmed（介面存在）；Unsupported（推薦為 stable boundary）** | CLI help / command output | 自管 daemon/network/auth；未做 invocation，不能推薦 production |
| ChatGPT App / MCP caller | 一個 App/MCP tool 在架構上可接 repository + work-order pointer，並呼叫下游 execution service；它本身不提供 Codex compute/workspace/Git credential。 | **Plausible** | OpenAI product architecture summary in installed OpenAI Docs skill；inference | HTTPS/MCP tool endpoint + tool auth + downstream runner/cloud adapter |
| Thin runner fallback | 可以用最小 runner 將 validated dispatch 轉成 `codex exec`，以 process/JSONL/Git 回報；這是自管 execution boundary，不是 native Cloud-task equivalence。 | **Plausible（architecture）；Confirmed（所依 CLI primitives）** | CLI help；repository Git handoff Experience；inference | App/MCP → job admission → isolated workspace → CLI → GitHub/status store |

### 名稱不可混用

- **Codex product native Cloud task**：hosted task，有 product environment/task identity；本 runtime 只透過 experimental `codex cloud` command 顯露 submission/status primitives。
- **Responses API coding request**：API model invocation；除非官方 contract 明說，不能推論它會建立 Codex product task、Cloud environment 或 UI-visible thread。
- **Codex CLI session**：在 execution host 上啟動的 process/session；workspace、network、Git 與 secrets 都屬於 host responsibility。
- **SDK**：可能是 library wrapper；在查清 transport 前不能假設它比 CLI 多出 hosted task authority。
- **App server / exec server / internal host tools**：本 runtime 中存在 experimental surface；不是可以偷換成 stable public API 的理由。

## 4. CLI automation finding

本次重現的最低 CLI contract：

```text
codex exec [OPTIONS] [PROMPT]
prompt omitted or "-" → read instructions from stdin
-C, --cd <DIR>          → working root
--json                  → JSONL events on stdout
--output-schema <FILE>  → final response JSON Schema
-o, --output-last-message <FILE>
--ephemeral             → do not persist session files
```

另有 `codex exec resume [SESSION_ID] [PROMPT]`；ID 可為 UUID 或 thread name。這支持「建立 process、收 machine-readable progress/final output、必要時續接」的 automation use case。process exit code可作 runner-level success/failure signal，但 task-level acceptance 仍需檢查 final structured result、Git diff、tests 與 commit。

Important boundary：

- work-order pointer 只是 prompt 資料；runner 必須先把正確 repository/ref 放進 `-C` workspace。
- `--json` 是 event transport，不是 durable queue、scheduler 或 webhook。
- `--output-schema` 約束 agent final message，不證明 tests 或 Git publication 成功；runner 仍須獨立驗證。
- `--dangerously-bypass-approvals-and-sandbox` 的 help 自己標示 `EXTREMELY DANGEROUS`。production runner 不應把它當方便的預設；應由外層 container/VM、Codex sandbox、approval policy 與 credential scope 共同限制。
- push/PR 是 GitHub authority，不是 model capability。既有 repository evidence 已觀察到 Codex product UI 可以 publication，但 workspace 本身可能沒有 `gh` auth。

## 5. Native Cloud task finding

這個 runtime 提供的下列 interface 是本次最重要的新 direct evidence：

```text
codex cloud exec --env <ENV_ID> [--branch <BRANCH>] [--attempts <N>] [QUERY]
codex cloud status <TASK_ID>
codex cloud list [--env <ENV_ID>] [--limit <N>] [--cursor <CURSOR>] [--json]
codex cloud diff <TASK_ID> [--attempt <N>]
codex cloud apply <TASK_ID> [--attempt <N>]
```

它顯示 task creation 最小資料至少為 **environment ID + query**，branch 可選；回傳 task ID 後可以 polling status/list，並讀 diff。這比「沒有任何外部 invocation surface」更精確。

但 boundary 仍有四個缺口：

1. top-level help 把 `cloud` 標成 `[EXPERIMENTAL]`；不能稱 stable supported API。
2. 本次依 Safety Boundary 沒有使用帳號 credential 真的 submit task，因此 entitlement、auth flow、回傳格式、completion semantics 未驗。
3. `status` help 沒有 `--json`，只有 `list` 明示 JSON；完整 machine contract 未確定。
4. 沒有證據顯示 task completion 可以 webhook/callback 喚醒 ChatGPT thread；合理 fallback 仍是 caller polling + durable status store / user notification。

## 6. Coordinator mechanism finding

### 可確認

- 本次 Codex host 確實向 agent 暴露 native collaboration operations：可 spawn bounded subtask、send/follow-up message、interrupt、list status、wait；task 有 canonical path，spawn 可 fork surrounding turns。這是 **Codex host native capability**，不是本 repository 的 code，也不是一般 shell/CLI command。
- Work Order 所述先前觀察（Coordinator 能 reuse/create local native tasks，但 task completion 不自動 wake Coordinator）與「host orchestration」形態相容，但只屬 repository context，不能單獨證明 plugin implementation。

### 不能確認

本 workspace 的 public plugin list / marketplace list 都是空的，也沒有 Coordinator public source、manifest 或 installation reference。為遵守不讀 private host database / transcript 的 boundary，本次沒有從 local state 逆向。因此：

- Coordinator 的 `create native task` 究竟是 plugin-declared tool、first-party host entitlement，或 instruction 對 host collaboration capability 的調用：**Unknown**。
- 沒有 evidence 顯示它透過 Codex CLI、public API 或 SDK：**Unknown**；不得推論。
- 安裝 Coordinator 後 ChatGPT Primary tool surface沒有新增 caller tool（Work Order 的先前 observation）最多支持「install ≠ external tool publication」，不證明底層 capability 不存在。

**Judgment：**把 Coordinator 當 Codex-host-local orchestration UX 是 `Plausible`；把它當外部 production dispatch API 是 `Unsupported`（目前沒有 callable contract evidence）。

## 7. AgentProof mechanism finding

本 workspace 同樣沒有 AgentProof public source、manifest、installation reference 或 executable；`codex plugin list` 與 marketplace list 均無項目。`Start a new instrumented Codex session` 這句描述只能證明宣稱的 user-facing behavior，不能辨識下層是 CLI、hook、MCP、SDK 或 private host API。

- mechanism：**Unknown**。
- 「instrumented session」是否等價 hosted native Codex task：**Unsupported as an inference**。
- 它是否可由 ChatGPT Primary 外部呼叫：**Unknown**；目前沒有新增 tool surface 的 direct invocation evidence。

可安全接受的下一步只應是取得其**公開** marketplace manifest/source URL，檢查 `.codex-plugin/plugin.json`、skills、hooks、MCP config與 executable references；不得讀 private install cache/credential/session state，也不得試 internal endpoint。

## 8. Plugin / App / MCP bridge boundary

合理的責任切分是：

```text
ChatGPT Primary on iPad
  └─ calls an authorized App/MCP tool: dispatch_work_order(repo, ref, path)
       └─ bridge validates allowlist, identity, idempotency, policy
            └─ chooses ONE supported adapter
                 A. Codex Cloud task adapter (currently experimental/unknown support)
                 B. self-hosted runner invoking codex exec (confirmed primitive)
```

App/MCP 解決的是 **tool publication + authenticated request transport**；不自動解決：

- Linux process / workspace compute；
- Codex authentication與 entitlement；
- repository checkout/ref validation；
- GitHub write credential；
- long-running job queue、timeouts、retry/idempotency；
- completion callback / ChatGPT thread wake；
- audit log 與 artifact retention。

`codex mcp-server` 的存在顯示 Codex CLI 可以成為 stdio MCP server，但 ChatGPT App 通常需要可到達且有 authentication 的 server-side endpoint。把 local stdio 直接暴露到 Internet 不是安全 architecture；仍需要 managed host/bridge，而且該 surface 的 public support status本次未確認。

## 9. 最小可行 dispatch architecture 候選

### Candidate 1 — Experimental thin Cloud adapter

```text
ChatGPT App/MCP tool
→ validates repo/ref/work-order + env mapping
→ codex cloud exec --env ENV --branch REF "Read PATH ..."
→ store returned task ID
→ poll list/status; retrieve diff/result
→ publish status back to GitHub/App
```

優點：最接近 product-native hosted task，不需自己維護 execution workspace。

缺點：command 明標 experimental；auth、task response、stable machine status、callback、commit/PR publication 尚未驗。

結論：**只適合下一個 controlled experiment candidate，不是目前 recommendation。**

### Candidate 2 — Thin self-hosted CLI runner（目前 evidence 最完整）

必要 components，且只限這些：

1. **ChatGPT App/MCP dispatch tool**：接收 immutable `repository`, `source_ref`, `work_order_path`, request ID；不接 arbitrary shell。
2. **Admission / job record**：authenticate caller、allowlist repository/path/ref、idempotency、queued/running/succeeded/failed/cancelled state。
3. **Ephemeral isolated execution environment**：每 job 新 workspace/container，clone/fetch pinned SHA，設定 CPU/time/network/filesystem limits。
4. **Codex CLI invocation**：stdin 提示讀 repo-local Work Order；`-C`; conservative sandbox/approval; `--json`; final `--output-schema`。
5. **Validation / publication step**：runner（不是 agent prose）檢查 changed paths、tests、commit；以 GitHub App installation token 建 branch/PR，或只產 patch等待 human gate。
6. **Result retrieval**：job ID polling endpoint + durable summary linked from GitHub commit/PR；optional notification。不要假設完成會喚醒原 ChatGPT thread。

這是 `Plausible` architecture，不是本次已實作或 end-to-end verified system。

## 10. Security / credential / execution authority boundary

| Authority | 建議 owner / scope | 不可混同 |
| --- | --- | --- |
| ChatGPT caller identity | App OAuth / workspace policy；只准 dispatch allowlisted operation | 不等於 Codex auth |
| Codex model/Cloud auth | runner secret store或 supported workload identity；不可回傳給 model/output | 不等於 GitHub write |
| GitHub read | GitHub App，限 allowlisted repos、必要 contents read | 不等於 push/PR/Actions |
| GitHub write | 獨立、短效 installation token；最好只建 branch/PR | 不應給 Actions/admin/secrets authority |
| Execution | disposable unprivileged container/VM；egress allowlist、resource/time limit | 不等於 host/root authority |
| Approval | policy決定允許的 commands/paths；high-risk action保留 human gate | 不以 bypass flag 消除 boundary |

主要 constraints：

- dispatch payload 必須 resolve 到 immutable commit SHA；branch name可能在 queue期間漂移。
- Work Order 是 repository input，仍屬 untrusted content；repo code/AGENTS/plugin/hook也可能 prompt-inject 或執行 code。
- 不把 token 放進 prompt、Git remote URL、log、JSONL event、commit或 report。
- fork/PR 要避免跑未審查 workflow；runner token 不授權修改 Actions/secrets/admin。
- 每個 request 要有 idempotency key，防止 ChatGPT retry 重複啟動昂貴或有 side effect 的 job。
- status 的 `succeeded` 只代表 process/job完成；Acceptance 應分開呈現 tests、policy validation、Git publication與 human review。
- session resume 會擴大持久 state / context risk；預設 ephemeral，只有明確 lineage需要才保存最少 state。
- output/artifact應設定 retention，且不得收集 private Codex transcript作為捷徑。

## 11. Unknowns / evidence gaps

1. OpenAI 是否發布 stable、documented Codex Cloud Tasks REST/API，以及它與 `codex cloud` 的 support/SLA/versioning關係。
2. `codex cloud exec` 實際 auth/entitlement、task ID response、exit behavior、environment-to-repository mapping、status JSON與 rate limits。
3. Cloud task 是否能直接 commit、push、開 PR；需要哪種 repository integration authority。
4. 是否有 webhook/event/callback；task completion能否喚醒指定 ChatGPT conversation。現在只能保守假設 polling/notification。
5. Codex SDK 的正式 package/API、是否只是 local CLI wrapper、是否支援 hosted tasks。
6. `codex mcp-server` 對外 tool schema、support status與適合的 authentication/deployment model。
7. Coordinator 與 AgentProof 的公開 manifest/source與真正 transport；目前不能分辨 instructions、host native tool、hook、MCP、CLI或 private/experimental API。
8. `app-server`、`exec-server`、remote control雖有 direct runtime evidence，仍缺 public stable support/security deployment guidance；其 experimental label足以阻止 production recommendation。
9. Official docs retrieval因本環境 network/tool limitation失敗；所有「未找到官方 contract」均是本次 evidence gap，不是宣稱全球不存在。

## 12. Recommended next experiment（proposal only）

在隔離的 disposable repository / non-production Codex Cloud environment，另開一張受控 Work Order：

1. 先在可正常存取 official docs 的環境保存 Cloud CLI / SDK / MCP 的 official page版本與 support label。
2. 以 test account執行一次 `codex cloud exec --env <test-env> --branch <immutable-test-ref> <read-only task>`；不給 Git write、不建立 secrets、不觸及 production。
3. 記錄 sanitized stdout/stderr/exit code/task ID；驗 `list --json`、`status`、`diff`；測 completion後是否只有 polling，避免測 internal endpoint。
4. 取得 Coordinator / AgentProof 的 public marketplace source URL，只做 manifest/source audit，列出 declared skills/hooks/MCP/executables；沒有 public source就維持 `Unknown`。
5. 根據結果做 go/no-go：只有 official docs明確支持且 machine contract穩定，才考慮 Cloud adapter；否則另案設計 thin CLI runner threat model。不得在 reconnaissance ticket順手實作。

Acceptance evidence 應是 sanitized command transcript + official page snapshot/link + task metadata/diff，不是「UI 看起來有跑」。

## 13. Sources / Evidence

### Repository sources

- `README.md` — repository playground entry point；也說明 public-by-default / secret boundary。
- `agent-work/README.md` — role separation、Work Order / report evidence contract。
- `agent-work/experience/codex-cloud-workspace.md` — snapshot、local commit / PR publication、GitHub authority observations。
- `agent-work/dispatch-handoff.md` — repo-local Work Order、new task / continuation、context boundary。
- `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md` — scope、evidence standard、安全限制。

### Direct command evidence（2026-09-15）

```text
/opt/codex/bin/codex --version
/opt/codex/bin/codex --help
/opt/codex/bin/codex exec --help
/opt/codex/bin/codex exec resume --help
/opt/codex/bin/codex cloud --help
/opt/codex/bin/codex cloud {exec,status,list,diff,apply} --help
/opt/codex/bin/codex mcp-server --help
/opt/codex/bin/codex app-server --help
/opt/codex/bin/codex exec-server --help
/opt/codex/bin/codex remote-control --help
/opt/codex/bin/codex plugin list
/opt/codex/bin/codex plugin marketplace list
```

### Official source retrieval attempts / public entry points

- Codex manual entry point: <https://developers.openai.com/codex/codex-manual.md> — helper fetch failed with `EAI_AGAIN`; no content used as evidence.
- Codex documentation: <https://developers.openai.com/codex/> — public entry point for follow-up verification; unavailable from this run.
- Apps SDK documentation: <https://developers.openai.com/apps-sdk/> — public entry point for follow-up verification; unavailable from this run.
- OpenAI Docs skill local product summary states Apps SDK consists of a web component UI plus an MCP server exposing tools to ChatGPT. This supports only the high-level caller model, not a Codex invocation claim.

## 14. Direct answer

> **如果 ChatGPT Primary 要能從 iPad 上委派一張 GitHub Work Order 給 Codex 執行，依目前可驗證能力，最少還缺哪一層？**

**最少還缺一層受信任的 dispatch execution bridge。** 它必須把 ChatGPT App/MCP tool 的薄 request（repository + immutable ref + work-order path）轉成真正有 compute、Codex auth、isolated workspace與受限 GitHub authority的 execution。今天 evidence 最完整的 backend 是自管 runner呼叫 `codex exec`；`codex cloud exec` 已證實存在且更接近 native task，但仍明標 experimental，且 stable support、auth、machine status與 completion notification均未驗證，所以尚不能取代這一層成為 production contract。
