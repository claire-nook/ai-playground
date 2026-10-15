# AI Playground

Public technical playground for experiments, proofs of concept, integration spikes, and ideas that are not ready to become production decisions.

This repository is intentionally **not** a Development, Test, UAT, or Production environment. Its durable output is Experience / Evidence / Knowledge, not production-ready code.

## Environment Identity｜AI Playground 公開研究工廠

本 Repository 是公開技術研究空間，不代表任何私人工作空間，也不等於任何單一正式產品專案。

`ai-playground` 是**公開研究工廠（Public Research Factory）**：保存 Research、Experiment、Evidence、公開 Knowledge、研究成果與可公開的 Agent collaboration records。它**不是** AI 助理的跨 Conversation 身分恢復入口、私人能力手冊或全域操作規範的權威來源。私人身分恢復、跨對話操作規範與能力管理不屬於本公開 Repository 的職責；歷史文件不得作為現行啟動或權限依據。

但 `ai-playground` **不是所有技術工作的 scope boundary**。當問題屬於其他正式作品、知識庫或 Repository，Primary 可以依當前任務需要進入相應 Repo 讀取、分析或在既有 authorization boundary 內工作。例如 Nook Works 的正式 Specification / Architecture / Database / Production-oriented implementation 應回到 `nook-works`，而不是為了方便全部複製進 Playground。

未來若出現新的 durable responsibility，且不適合放在既有 Repository，Claire 與 Primary 可以共同決定建立新的 Repo。Repository 是 responsibility / durable state 的邊界，不是 Primary Agent 能力或管轄範圍的圍牆。

### Cross-repository Routing｜Apple Native

實驗室目前已有 private Apple-native execution repository：`claire-nook/apple-lab`。

當前問題涉及 **Swift / Swift Playgrounds / PhotoKit / iPadOS native framework / Apple-device-specific execution** 時，不要預設所有 context 都在 `ai-playground`，也不要先重新發明 iPad Native workflow。若當前 GitHub authorization 可存取 `apple-lab`：

```text
Apple-native task
→ claire-nook/apple-lab
→ read repository root README.md
→ follow its Knowledge startup routing
→ load only the relevant project / experiment
```

`apple-lab` 是「實驗室」的一部分，不是另一個 Primary Agent 的領地。其 private operational knowledge 以該 Repo 為 canonical source；`ai-playground` 只保存需要跨研究檢索的 routing、sanitized Evidence 與 public reusable findings，避免複製 private operational documentation。

```text
實驗室 / 研究協調者
│
├─ ai-playground
│  └─ Public Research Factory：Research / Experiment / Evidence / public knowledge
│
├─ nook-works
│  └─ Formal System：Specification / Architecture / Database / Platform / Business Features
│
├─ other repositories
│  └─ 各自保存其正式作品、source 或 knowledge
│
└─ future repositories
   └─ 依新的 durable responsibility 共同建立
```

因此，某條研究線從 Playground 形成足夠 Evidence 後，可以把 Technical Decision / Formal Implementation 帶回相應正式 Repo；這叫 **research output graduation**，不是 Playground 退役。日後正式系統遇到新的 Technical Unknown，也可以把問題抽回 Playground 驗證，再將 Evidence 帶回正式系統。

```text
Formal Repository Requirement
→ Technical Unknown / Platform Gap
→ AI Playground Research / Experiment
→ Evidence / Current Judgment
→ Formal Repository Technical Decision
→ Platform / Feature Implementation
```

Playground 是公開技術撞牆場，不是墨衡的私人知識基地，也不是世界邊界。

**Playground-local delegation gate（歷史入口，第二階段待審查）:** Before dispatching Codex via either GitHub Work Order or Notion Agent Mailbox, Primary **must read [agent-work/delivery-contract.md](agent-work/delivery-contract.md)** and explicitly assign delivery type(s). The same publication/QC rules apply regardless of dispatch channel: DOC_DELIVERY = branch/commit/push/review/merge; CODE_DELIVERY = branch/commit/push/**PR mandatory**/QC/merge; NOTION_REPORT = write/read-back. Historical optional-PR guidance is superseded.

> **2026-10-11 研究與派工導航：** 新增實驗、理解研究站台的 Web 架構、Catalog 建置或部署觸發時，先讀 [實驗成立與站台發布規範](knowledge/research-catalog-publication.md) 的「現行 Web 架構與自助檢查」，自行查閱對應原始碼，不必每次例行派工 Review。實驗主 Record 應保存目的、失敗經驗、證據與候選／已驗證界線；Findings 和 Pattern 依職責分開。日常委派預設 Notion，正式 GitHub Work Order 按施工需求與風險選用（不限程式），詳見 [Agent Work](agent-work/README.md)；Playground 公開執行者暫仍可讀 [Delivery Contract](agent-work/delivery-contract.md) 取得本地交付資訊；公開契約與模板仍待逐項審查，不應將歷史版本誤認為跨環境通用規範。繁體中文是否升為全 Repo 強制規範尚待 Claire 決定。

## Repository Orientation｜研究任務按需導覽

**本 README 僅提供公開研究工廠的導覽，不是 AI 助理的私人啟動手冊。** `knowledge/agent-capability-inventory.md` 為待審查的歷史研究文件，不再是現行能力或權限的權威來源。其路徑暫時保留供歷史引用及逐檔清理；研究導航與舊連結將在反向引用修復後逐步更新。

## Repository Map｜需要什麼再往下讀

| 需要知道什麼 | 入口 |
| --- | --- |
| 歷史能力／啟動紀錄（待清理，非現行規範） | [`knowledge/agent-capability-inventory.md`](knowledge/agent-capability-inventory.md) |
| Wall 寫過哪些公開文章、回想作品與定位 source / asset | [`knowledge/wall/README.md`](knowledge/wall/README.md) |
| Knowledge Model / Research navigation | [`knowledge/README.md`](knowledge/README.md) |
| Research Topic / Branch | [`knowledge/maps/`](knowledge/maps/) |
| 做過哪些 Experiment、為什麼做 | [`knowledge/experiments.md`](knowledge/experiments.md) |
| **成立 Experiment / Wall 研究輸出、更新站台 Catalog / Status** | **[`knowledge/research-catalog-publication.md`](knowledge/research-catalog-publication.md)**（必讀，包含 `.catalog.json` 與 build contract） |
| 已驗證什麼 | [`evidence/index.md`](evidence/index.md) |
| 某個 Experiment 怎麼測 | relevant `experiments/<topic>/README.md` |
| 已驗證 pattern 如何重建 | [`knowledge/implementation/`](knowledge/implementation/) |
| 委派 Implementation Agent / Codex | [`agent-work/README.md`](agent-work/README.md) |
| 近期正在忙什麼 | [`notes/short-term-work.md`](notes/short-term-work.md)，按需讀取 |
| Browser demo / human-observable artifact | `public/` |
| Provider-deployable experiment source | `supabase/` / `netlify/` |
| Remote execution / deployment workflow | `.github/workflows/` |

閱讀原則：**Progressive Loading**。進入 Playground 後依研究任務載入相關 Knowledge 或其他公開、已授權的 Repository。不要一進門掃整棟樓，這裡是實驗室，不是新進員工耐力測驗。

## Core Knowledge Model

```text
Research Context / Question
        ↓
Candidate Branch
        ↓
Experiment
        ↓
Evidence
        ↓
Current Judgment
        ↓
Technical Decision Candidate
```

Experiment 成功不會自動升格成 Production Decision。需要正式採用時，回正式 Repository 依 Specification / Architecture 重新實作。

Repository 中各層責任：

- `knowledge/`：Research Context、公開 Knowledge navigation、Implementation Knowledge，以及待退役的歷史能力紀錄（非現行 Primary capability 權威）。
- `experiments/`：Experiment Record，保存條件、方法、結果與限制。
- `evidence/`：集中檢索已形成的 Evidence。
- `agent-work/`：Work Order、Handoff、Implementation Agent collaboration。
- `public/`：Browser Experiment / Demo Artifact，可退休，不是 Knowledge Source of Truth。
- `supabase/` / `netlify/`：Provider-compatible Experiment Source，可退休 / 刪除。
- `notes/`：短期 working state，不承擔長期記憶。
- `.github/`：remote execution / deployment mechanism。

詳細 Knowledge Capture / Research Map / Tags / Links 規則以 [`knowledge/README.md`](knowledge/README.md) 為準。

## Agent Collaboration

角色與派工 governance 以 [`agent-work/README.md`](agent-work/README.md) 為準。最小原則：

- **Experiment Ownership ≠ Experiment Execution.**
- **Agent Report ≠ Verified Evidence.**
- Claire 負責 Business Intent / Functional Acceptance / Human Judgment / necessary Authorization Gate。
- 研究協調者負責 Research / Architecture / Technical QC / Evidence Judgment。
- Implementation Agent 依 Work Order 施工、測試與留下 traceable handoff，不因施工自動取得 Architecture Decision authority。

本 Repository 保存可公開的研究證據與協作歷史；私人操作知識與跨 Conversation 能力恢復不在此公開 Repository 管理。不要把歷史文件當作今天的權限或授權。

## Artifact Lifetime / Deployment Boundary

```text
experiments/**/README.md  = durable Experiment Record
public/                   = Browser / Demo Artifact boundary
netlify/                  = Netlify-compatible Experiment Source
supabase/                 = Supabase-compatible Experiment Source
.github/workflows/        = remote execution / deployment mechanism
```

Demo、test object、Edge Function、Netlify Function 等實驗器材可以在 Evidence capture 後退休。刪除 runtime artifact 不等於刪除已形成的 Knowledge。

## Public by Default

Treat everything in this repository as public.

不要放 Password、Access Token、API Key、Private Key、Supabase `service_role`、真實 Personal / Confidential Data 或 private production configuration。若 Experiment 真正需要 sensitive context，停止並改用獨立 private environment。

> People may watch us hit the wall. Do not tape the house keys to it.

## Autonomy

Playground 允許在**Claire 明確授權的任務範圍內**進行研究與必要的 Directory、branch、commit、experiment code、notes、TODO、temporary artifact 變更。討論、唯讀盤點或歷史上描述的 autonomy 均不構成當前修改、刪除、部署或 Merge 的授權。

這個 autonomy 描述的是 `ai-playground` 內部治理，不代表 Primary Agent 只能待在這個 Repo。其他 Repository 仍依各自的 formal ownership、authorization 與 governance boundary 工作。

硬邊界包括 legality、ethics、safety、public/private data boundary，以及任何超出授權範圍的 Repo 修改、刪除或對外系統操作。

**Formal Specification exists and implementation is starting** → use the relevant formal repository.  
**Only an idea exists and we need to know whether it actually works** → AI Playground is the default experiment base.
