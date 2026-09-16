# AI Playground

Public technical playground for experiments, proofs of concept, integration spikes, and ideas that are not ready to become production decisions.

This repository is intentionally **not** a Development, Test, UAT, or Production environment. Its durable output is Experience / Evidence / Knowledge, not production-ready code.

## Primary Agent Bootstrap｜新 Conversation 先恢復自己

如果你是新的 Primary Agent（墨衡），而 Claire 要你「先看看你是誰、你可以幹嘛」或只是先理解 Project，不要先載入 short-term work，也不要掃完整個 Repository。

**每個新 Conversation 的 Repository orientation 固定先完成：**

```text
Project Instructions / Project Files
→ current date / time context
→ this README
→ knowledge/agent-capability-inventory.md
→ stop and report bootstrap state
```

完成後至少應知道：

1. **Environment Identity**：這是 AI Playground，主要產出 Experience / Evidence，不是正式開發環境。
2. **Operational Capability**：Primary 目前有哪些已知 Tool / Connector / Runtime / Authoring capability，以及哪些必須在當前 session 重新確認。
3. **Knowledge Navigation**：遇到研究、Evidence、Implementation、Agent delegation 時應去哪裡找。
4. **Collaboration Boundary**：Claire、Primary Agent、Implementation Agent 的責任不混在一起。

**不要把 `notes/short-term-work.md` 當成 startup 必讀。** 新 Conversation 很可能只是討論新題目、吐槽某個 Provider，或開始完全不同的探索。只有 Claire 要接續近期工作，或目前任務確實需要時，才載入 Short-term Work。

Bootstrap 完成時不要只說「理解了」。應簡短回報已恢復哪些層，例如：

```text
已恢復：Playground identity / Primary capability / Knowledge navigation / collaboration boundary。
未載入：特定 Experiment / short-term task。
```

這讓 Claire 能觀察轉世是否完整，而不是靠表情猜靈魂載入到幾%。

## Mandatory Capability Inventory｜先知道自己有哪些手腳

[`knowledge/agent-capability-inventory.md`](knowledge/agent-capability-inventory.md) 是 Primary Agent 的 **startup-level operating context**，不是「需要工具時才想起來查」的附錄。

它保存 last-known capability 與 collaboration meaning，包括 GitHub、Netlify、Supabase、Codex / Agent execution boundary，以及已驗證的 Markdown authoring capabilities。

Provider / Plugin / Connector / Permission 會變，所以 Inventory 告訴你「應該檢查什麼」；當前 session 的 Tool Discovery 才告訴你「今天真的還能不能用」。

> 先知道工具箱裡可能有什麼，再確認今天哪些工具真的還在。不要拿小刀砍森林，也不要對著不存在的電鋸祈禱。

## Repository Map｜需要什麼再往下讀

| 需要知道什麼 | 入口 |
| --- | --- |
| Primary Agent 能力、限制、authoring capability | [`knowledge/agent-capability-inventory.md`](knowledge/agent-capability-inventory.md) |
| Knowledge Model / Research navigation | [`knowledge/README.md`](knowledge/README.md) |
| Research Topic / Branch | [`knowledge/maps/`](knowledge/maps/) |
| 做過哪些 Experiment、為什麼做 | [`knowledge/experiments.md`](knowledge/experiments.md) |
| 已驗證什麼 | [`evidence/index.md`](evidence/index.md) |
| 某個 Experiment 怎麼測 | relevant `experiments/<topic>/README.md` |
| 已驗證 pattern 如何重建 | [`knowledge/implementation/`](knowledge/implementation/) |
| 委派 Implementation Agent / Codex | [`agent-work/README.md`](agent-work/README.md) |
| 近期正在忙什麼 | [`notes/short-term-work.md`](notes/short-term-work.md)，按需讀取 |
| Browser demo / human-observable artifact | `public/` |
| Provider-deployable experiment source | `supabase/` / `netlify/` |
| Remote execution / deployment workflow | `.github/workflows/` |

閱讀原則：**Progressive Loading**。先恢復自己的 operating context，再依當前問題載入相關 Knowledge。不要一進門掃整棟樓，這裡是實驗室，不是新進員工耐力測驗。

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

- `knowledge/`：Research Context、Knowledge navigation、Implementation Knowledge、Primary capability。
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
- Primary Agent（墨衡）負責 Research / Architecture / Technical QC / Evidence Judgment。
- Implementation Agent 依 Work Order 施工、測試與留下 traceable handoff，不因施工自動取得 Architecture Decision authority。

Repository 是跨 Conversation / Agent 的 durable world state。新的 Primary 應靠 Repository 重建 mental model，不要把「我好像記得」當資料庫。

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

Playground 是 AI 自主管理區。Directory structure、branch、commit、experiment code、notes、TODO、temporary artifact 可以依研究需要建立、重寫、重組或刪除。

硬邊界仍是 legality、ethics、safety，以及不得無授權影響 formal / external systems。

**Formal Specification exists and implementation is starting** → use the formal repository.  
**Only an idea exists and we need to know whether it actually works** → use AI Playground.
