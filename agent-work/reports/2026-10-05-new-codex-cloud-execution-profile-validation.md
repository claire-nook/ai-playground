# Investigation Report｜New Codex Cloud Execution Profile Validation

- Work Order: `2026-10-05-new-codex-cloud-execution-profile-validation`
- Observation date: `2026-10-05` (task-provided UTC context)
- Execution profile under observation: `New Codex Cloud (under investigation)`
- Executor result: `Completed`（僅代表 Executor Completion；仍待 Primary Technical QC 與 UI external gates）

## Executive Summary

本次 task 直接提供了一個可寫入的單一 repository workspace：`/workspace/ai-playground`，其 local branch 為 `work`，起始 `HEAD` 為 `eef4795051644f39877dd049354819fcce93a5a0`。`.git/FETCH_HEAD` 把同一 SHA 記為由 `https://github.com/claire-nook/ai-playground` 的 `main` 取得，因此 workspace 內容具有可檢查的 baseline lineage；但 local config 沒有 remote，且 GitHub CLI 未登入，所以 executor 無法獨立向 GitHub 查詢「目前 remote main」再證明它仍等於該 snapshot。

目前 runtime 相較 repository 保存的舊 Codex Product UI evidence，最明確的新 direct observation 是：executor 看得到一般 shell、可寫 Git workspace、完整 local commit 能力，以及一個名為 `make_pr`、只接受 PR title/body 並「record pull request metadata」的 completion tool。後者不是舊 evidence 所述、由 Claire 點擊的 `Create PR` / `Update Branch` control；但也沒有證據顯示它會 push branch 或直接建立 GitHub PR，因此不能把 tool availability 誇大為 GitHub publication。

Published Cloud Environment 的名稱、版本、被選取的 environment、setup definition 與 repository association 都沒有透過 executor-visible metadata 暴露。可直接證明的只有已配置 runtime 結果（OS、toolchain、proxy/certificate-related environment variable names、workspace filesystem），不能由此反推是哪個 Published Environment 或哪些項目由 setup 安裝。Task 建立 UI、task repository/branch selector、completion 後 Web UI controls 仍是 External Gate。

Repository 的既有 Node tests 可以直接執行，證明 runtime validation loop 可用；結果為 12 tests 中 9 passed、3 failed。失敗均發生於本 report 修改前：兩項因 `public/experiment-catalog.json` 不存在，一項因目前 `public/index.html` 的 navigation wording 與舊 assertion 不符。本 Investigation 不修改 application 或 generated artifact，故將它們保留為 baseline limitation，而非為求綠燈擴張 scope。

## Current Runtime Direct Evidence

以下 claim 只描述本 task 內實際可重現的 observation，不宣稱為 provider-wide contract。

| 面向 | Direct evidence | Output summary / boundary |
| --- | --- | --- |
| Workspace identity | `pwd`; `git rev-parse --show-toplevel` | 兩者皆為 `/workspace/ai-playground`。 |
| Starting change state | `git status --short --branch`; `git rev-parse HEAD` | 起始 working tree clean；branch `work`；HEAD `eef4795051644f39877dd049354819fcce93a5a0`。 |
| Baseline provenance held locally | `cat .git/FETCH_HEAD`; `git log -5 --oneline --decorate` | `FETCH_HEAD` 將 `eef4795...` 記為 `branch 'main' of https://github.com/claire-nook/ai-playground`；HEAD summary 為 `Catalog new Codex Cloud execution profile investigation`。這是 local clone metadata，不是即時 remote query。 |
| Git topology | `git branch -vv`; `git show-ref`; `git config --local --list --show-origin` | 僅見 local `work` ref；沒有 tracking annotation，也沒有 configured remote。Local branch name 因此不等於 requested baseline branch name。 |
| Required context | `cat` / `nl -ba` 讀取 Work Order、`agent-work/README.md`、`agent-work/dispatch-handoff.md`、`agent-work/experience/codex-implementation-agent-self-introduction.md`、root `README.md` | 所有 Read First 均存在且可讀；preflight 沒有因缺 context fail closed。 |
| Writable execution surface | 建立本 report；後續 `git add` / `git commit` | Repository workspace 可寫，Git index 與 local commit surface 可用。Commit identity 見本文末尾 handoff；commit 後的 SHA 不預先寫死在 report。 |
| Runtime | `uname -a`; `sed -n '1,8p' /etc/os-release`; `df -T /workspace/ai-playground` | Linux x86_64、Ubuntu 24.04.4 LTS；workspace 位於可寫 overlay filesystem。 |
| Toolchain | `command -v ...` 與各 tool `--version` | Git 2.43.0、Node v24.15.0、npm 11.4.2、Python 3.14.4、ripgrep 15.1.0、jq 1.7、GitHub CLI 2.96.0 與 `make` 可用。工具存在不等於外部服務 credential 可用。 |
| Dependency/generated state | `find . -maxdepth 3` 搜尋 common manifests；`find . -maxdepth 2` 搜尋 `node_modules`, `.venv`, `dist`, `build` | 未找到 package / Python manifest，也未找到上述 dependency/build directories。Node tests只使用 repository source 與 built-in modules，可直接跑。 |
| Managed-runtime signals | `env | cut -d= -f1 | sort`（只記錄 variable names，不讀出 credential-like values） | 看得到 `CODEX_*`、`CAAS_*`、proxy 與 certificate-related names，可支持「此 shell 已有 managed runtime configuration」；不能識別 Published Environment provenance。 |
| GitHub credential | `gh auth status`; `gh repo view claire-nook/ai-playground --json nameWithOwner,defaultBranchRef,url` | `gh auth status` exit 1：未登入任何 GitHub host；repo lookup exit 4，要求 login/token。故 GitHub CLI 不能用於 remote verification、push 或 PR publication。 |
| Completion tool surface | task tool discovery 中的 `make_pr` schema | 可用 tool 描述為以 `title` / `body` 記錄 PR metadata。Schema 沒有 base/head、push、repository 或 URL output guarantee；需把它和 GitHub publication 分開。 |

## Historical Baseline Used

歷史基線來自本 repository，而非本 task 對舊 UI 的重新觀察：

1. `agent-work/dispatch-handoff.md` 第 46–53 行記錄 Codex Product UI adapter：New Task 為 local commit/report 後由 Claire `Create PR`；continuation 由 Claire `Update Branch`；local SHA 不保證等於 PR head；PR comment 不保證同步回 workspace。
2. 同文件第 98–120 行把 Existing Task 視為建立時 snapshot，並記錄 2026-09-14 Batch Scheduling PR #23 的 `Create PR / Update Branch` direct evidence。
3. `agent-work/README.md` 將 GitHub-visible state 保留為 Primary Technical QC surface，同時明確區分 governance contract 與 execution adapter。
4. `agent-work/experience/codex-implementation-agent-self-introduction.md` 是 2026-09-16 interactive workspace 的 self-reported operating model；文件自身明示不是永久 provider specification。

因此，下文的「historical」表示 repository 保存的 dated evidence，並不表示本 task 再次看見同一 UI。

## Environment Observation

### Evidence

- Shell 中可見已配置的 OS、language runtimes、Git/GitHub CLI、proxy/certificate-related variable names 與 writable overlay filesystem。
- Work Order 及 Read First 已包含在 task 起始 snapshot，沒有另行下載或由 chat 補寫。
- workspace 起始沒有常見 dependency directory；repository 亦無 package/Python manifest。這只能描述 task 開始時的 filesystem state。

### Unknown

- Published Environment 的 display name、ID、revision、publication timestamp 與 setup instructions。
- 本 task 是否由 Claire 明確選取某一 Published Environment，或由 provider 套用 default。
- 每項 tool 是 base image、Published Environment setup、repository bootstrap 或其他 provider layer 所提供。
- Environment 是否可同時關聯多個 repositories，以及它如何約束 task 的 repository selector。

### Inference

`CODEX_*` / `CAAS_*` 和 proxy/certificate-related variable names，加上預裝 toolchain，合理支持這是 provider-managed execution image；但沒有 provenance metadata，不能將任一 tool 或設定歸因於 Claire 發布的 Environment。這是 inference，不是 Environment identity evidence。

## Repository / Workspace / Branch Observation

本 task 的 filesystem scope 實際落在一個 Git working tree，未見第二個 repository 被掛載於 workspace root。requested repository identity 可由 Work Order、path、commit history 與 `FETCH_HEAD` 交叉支持。起始 local branch 固定顯示為 `work`，而 requested source baseline 是 `main`；這直接支持既有規則「workspace branch name 不等於 repository baseline identity」。

`FETCH_HEAD` 對起始 HEAD 的 provenance 記錄足以證明 clone/fetch 過程曾把該 commit 當成指定 URL 的 `main`。但因 `.git/config` 無 remote 且 `gh` 未授權，本 task 不能做即時 GitHub comparison。故「從 dispatch 時 GitHub-visible main 建立」得到 local metadata 支持；「現在 GitHub main 仍為同一 SHA」則是 Unknown。

此 task 只證明單一 repository 是本次主要 scope。它不能證明 New Codex Cloud provider 永遠限制每個 task 只能有一個 repository，也不能驗證 Environment 與 repository selection 的一般 cardinality。依 Work Order，本 Investigation 沒有嘗試跨 repo 或繞過 boundary。

## Runtime / Tool / Validation Observation

### Minimal validation probe

執行：

```text
node --test tests/*.test.mjs
```

結果：exit 1；12 tests，9 passed、3 failed。成功的 9 項涵蓋 application-shell metadata/routing、credential marker、auth invalidation、logout paths、Mermaid fixture 及 Netlify trigger checks。失敗摘要：

- `catalog carries validated Reader metadata and newest-first order`：`public/experiment-catalog.json` 為 `ENOENT`。
- `Batch scheduling metadata resolves its canonical record and live demo`：同一 catalog file 為 `ENOENT`。
- `Human View routes canonical Markdown without copying articles`：目前 `public/index.html` 不符合舊 `Experiments` label assertion。

這些 failure 在 report 建立前即重現，且本 work order 禁止修改 application/source 來製造結果。它們證明 validation command 能啟動並讀取 repository，也暴露 baseline test/generated-state drift；不表示本 report 導致 regression。

沒有部署、provider runtime invocation、credential probe 或 external system mutation。npm 在讀取版本時另警告 `http-proxy` env config 將在下一 major 停止支援；這是 image/tool configuration observation，不是 repository defect。

## Commit / Publication Observation

### Commit

Git binary、local `.git`、index 與 writable working tree 均可用。本 report 將以一個只包含 report path 的 local commit 結案。最終 SHA 應以 executor handoff 與 `git log -1 --oneline` 為準；避免 report 為了嵌入自身 commit SHA 形成自我參照 amend loop。

### Publication

本 task 暴露 `make_pr` completion tool，與歷史 Codex Product UI 的 human-click `Create PR / Update Branch` 名稱和 invocation model 不同。可觀察的 tool contract 只承諾記錄 title/body metadata，沒有證據承諾它會：

- 建立或 push remote branch；
- 選擇 GitHub base/head；
- 建立可由 Primary 開啟的 GitHub PR；
- 更新既有 PR；
- 回傳 GitHub URL 或 PR number。

此外 Git repository 沒有 remote，GitHub CLI 也未登入。故本 task 的安全 handoff point 是：建立 local commit、final diff/status check、呼叫 runtime 要求的 `make_pr` metadata surface，然後如實回報其結果；任何 Web UI control 與真正 GitHub-visible publication 仍待外部確認。不能因看不到舊按鈕就推論舊功能不存在，也不能因 tool 名為 `make_pr` 就宣稱 GitHub PR 已發布。

## Historical Assumption Classification

分類單位採用 `dispatch-handoff.md` 中 execution-specific assumptions；穩定 governance 不在本次重寫範圍。

| Historical assumption | Classification | Current basis |
| --- | --- | --- |
| New Task 提供 repository snapshot / workspace，可讀 repo-local Work Order | **Still Observed** | Work Order 與全部 Read First 起始即可讀；`FETCH_HEAD` 保存 requested URL/main → starting HEAD lineage。即時 remote equality 仍未驗。 |
| Workspace branch name 不必等於 source baseline branch | **Still Observed** | Requested baseline `main`，local branch 為 `work`。 |
| Workspace 支援 source inspection、validation、diff 與 local commit loop | **Still Observed** | Shell/toolchain、Node tests、writable Git tree 與 commit surface均直接可用。 |
| New Task publication 固定是「Codex stop → Claire 點 Create PR」 | **Changed**（executor-visible surface） | 現在 executor 直接有 `make_pr` metadata tool；不再只有舊描述的 human button handoff。真正 GitHub effect 未證明。 |
| Existing Task continuation 需由 Claire 點 `Update Branch` 才更新既有 PR | **Not Observable In This Task** | 本次是 New Task，沒有 existing PR / continuation lineage 可測。不可由 New Task tool surface外推。 |
| Codex local SHA 不保證等於 GitHub-visible PR head SHA | **Still Observed as a conservative boundary** | Current local commit 與 GitHub publication 是分離 surfaces，且無 remote/auth；但本 task 尚無 PR head 可做等值比較。此處「仍觀察」限於分離性，不是一次 SHA mismatch reproduction。 |
| GitHub PR comment 不保證自動進入既有 workspace | **Not Observable In This Task** | 沒有 continuation 或 PR comment injection probe。 |
| Existing Task repository context 應保守視為 task-creation snapshot | **Not Observable In This Task** | 本次沒有 task continuation，也未在 task 執行期間比較 upstream change visibility。 |
| `Create PR` / `Update Branch` 的實際 Web UI controls 與 completion 後行為 | **Needs External Gate** | Executor 看不到 Claire 的 Web/iPad UI；需由 Claire/Primary 觀察。 |
| Task 建立時選定的 Published Environment、repository、branch UI state | **Needs External Gate** | Prompt 提供 selection intent，但 executor沒有 UI state或 Environment metadata。 |

「Changed」只表示這個 task 的 executor-visible completion capability 已不同，不宣告舊 UI adapter被 provider-wide 移除。

## Inference

1. 新 runtime 似乎把更多 completion orchestration 暴露給 agent（至少可提交 PR metadata），而非只要求 agent停下等待舊 UI button；但其 backing service 是否真正 publication 不可由 schema 名稱判定。
2. Clone/bootstrap 很可能由 provider 在 task 開始前完成，因為 workspace 一開始已有 shallow-capable Git metadata、clean tree 與 `FETCH_HEAD`；實際 bootstrap sequence 未暴露。
3. Published Environment 可能負責 runtime/tool configuration的一部分；目前無 attribution metadata，所以不應更新成「Environment 必然提供某版本 Node/Python」之類規則。
4. 現有 governance 的 adapter separation 有效：repository-local contract、local commit、GitHub-visible QC 可以保留，只有 publication adapter 需要在取得 UI/publication evidence 後新增 dated profile。

## Unknown / Limitations

- Executor 無法看見 task creation 或 completion Web UI。
- 無 Environment identity/provenance API、file 或 environment variable 被明確提供。
- 無 configured Git remote，`gh` 無 credential；未能即時驗證 GitHub main、push branch 或查詢 PR。
- 沒有測試 continuation、workspace refresh、PR comment synchronization 或 `Update Branch`。
- 沒有測試多 repository environment/task；依 Must Not 未嘗試跨 repo。
- `make_pr` 的 durable external effect 只能在 commit 後呼叫，再由回傳與 GitHub/UI external observation確認。本 report只記錄事前可見 contract，最終 handoff記錄 invocation result。
- Tool/image版本是 2026-10-05 此 task snapshot，不是長期保證。
- Repository test suite起始已有 3 failures；本 Investigation沒有修正或生成缺少的 catalog。
- 本 report 是 executor observation，尚非 Verified Evidence；Primary需以 committed diff、tool result與外部 UI/GitHub state QC。

## External Gates Remaining

1. Claire 確認 task creation UI 中實際選取的 Published Environment、repository與branch，以及 Environment是否有可見 revision/provenance。
2. Claire/Primary觀察 completion 後 Web UI 是否仍有 `Create PR`、`Update Branch`，或改為其他 Publish/PR control，並記錄精確名稱與效果。
3. Primary 在 GitHub-visible surface確認 local commit是否被發布、GitHub commit identity是否改寫，以及是否存在可 review PR URL/head。
4. 若日後要驗 continuation semantics，以同一 task lineage做受控 upstream change / PR comment / subsequent commit probe；本 New Task 不足以回答。
5. Primary Technical QC 本 report、diff與 claims，再決定是否把 observation升格成 dated Experience/profile update。

## Candidate Recommendation for Primary

先不要修改 collaboration governance，也不要覆寫 2026-09-14 historical evidence。建議在 External Gates完成後，新增一段**有日期、surface-specific** 的 New Codex Cloud adapter，最少分開描述：

- Environment selection 是 UI evidence，runtime只記 observable configured result；
- source baseline identity、local workspace branch、remote publication ref 是三個不同 identity；
- local commit、`make_pr` metadata submission與 GitHub-visible PR 是三個不同 completion checkpoints；
- 若 `make_pr` 只記錄 metadata，保留 human publication gate；若外部確認它建立GitHub PR，才將其列為新的 direct publication mechanism；
- continuation / Update behavior在專門 probe前保持 Unknown，不由 New Task結果類推。

此更新應只替換/新增 execution adapter evidence，不改寫 Work Order、fail-closed、Primary QC與 GitHub-visible handoff等穩定 contract。

## Reproduction Checklist

```bash
pwd
git rev-parse --show-toplevel
git rev-parse HEAD
git status --short --branch
git branch -vv
git show-ref
git config --local --list --show-origin
cat .git/FETCH_HEAD
uname -a
sed -n '1,8p' /etc/os-release
command -v git node npm python3 rg jq gh make
git --version && node --version && npm --version && python3 --version
env | cut -d= -f1 | sort
find . -maxdepth 3 -type f \( -name package.json -o -name package-lock.json -o -name 'requirements*.txt' -o -name pyproject.toml -o -name Makefile \) -print
node --test tests/*.test.mjs
gh auth status
gh repo view claire-nook/ai-playground --json nameWithOwner,defaultBranchRef,url
git diff --check
git status --short
```

Reproduction 時不得輸出 credential-like environment variable values；variable names已足以描述 runtime signal。
