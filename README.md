# AI Playground

Public technical playground for experiments, proofs of concept, integration spikes, and ideas that are not ready to become production decisions.

This repository is intentionally not a Development, Test, UAT, or Production environment.

## Start Here｜第一次進來先看這裡

這個 Repository 的目的不是保存 Production Code，而是讓技術問題可以透過實驗取得 **Experience / Evidence**，再把可重用的結果帶回正式系統做 Architecture / Technical Decision。

如果你是第一次進入這個 Repository 的 AI / Collaborator，不需要先把所有文件從頭讀完。先建立這張地圖：

```text
ai-playground/
├─ knowledge/       Research Context：為什麼研究、目前研究到哪、下一題是什麼
├─ experiments/     Experiment Record：實際做過什麼、條件、方法與結果
├─ evidence/        Evidence Index：哪些能力 / 行為已被實際觀察與驗證
├─ agent-work/      Agent delegation：Work Order、Handoff Rule、協作 Experience
├─ public/          Netlify Browser Experiment / Demo Artifacts
├─ supabase/        Supabase runtime source / experimental functions
├─ netlify/         Netlify runtime source / experimental functions
├─ notes/           Short-lived working notes，不是長期 Source of Truth
└─ .github/         GitHub Actions：remote execution / deployment workflows
```

### Reading Route｜依你現在要做的事選入口

| 你現在需要知道什麼 | 先讀哪裡 |
| --- | --- |
| 目前整體研究到哪、有哪些 Research Branch | [`knowledge/README.md`](knowledge/README.md) → relevant [`knowledge/maps/`](knowledge/maps/) |
| 做過哪些 Experiment、為什麼做 | [`knowledge/experiments.md`](knowledge/experiments.md) |
| 哪些技術能力真的有 Evidence | [`evidence/index.md`](evidence/index.md) |
| 某個 Experiment 到底怎麼測、限制是什麼 | relevant `experiments/<topic>/README.md` |
| 要委派 Codex / Implementation Agent 工作 | [`agent-work/README.md`](agent-work/README.md) |
| 要找 Browser 可操作 Artifact | `public/<experiment>/`；但先確認 Experiment backend 是否仍保留 |
| 要找實際 runtime / deployment source | `supabase/`、`netlify/`、`.github/workflows/`，再回頭對照 Experiment Record |
| 只是想知道近期正在忙什麼 | [`notes/short-term-work.md`](notes/short-term-work.md)，但不要把它當長期知識 |

### Current Research Orientation｜不要一進門就掃整棟樓

目前主要 Research Context 應以 [`knowledge/maps/nook-technical-platform.md`](knowledge/maps/nook-technical-platform.md) 為準；已完成 Experiment 的短目錄看 [`knowledge/experiments.md`](knowledge/experiments.md)，需要確認「真的驗證過什麼」再進 [`evidence/index.md`](evidence/index.md)。

閱讀順序的原則是：

```text
Research Context
→ relevant Experiment / Evidence
→ only then inspect implementation artifacts when needed
```

不要為了回答一個已經有 Evidence 的問題，先把整個 Repository 掃一遍重新考古。這裡是實驗室，不是新進員工的耐力測驗。

### Artifact Lifetime｜Browser Demo 不等於永久服務

`public/` 下的 Browser Artifact 是 Experiment Demo / Human-observable Evidence surface，不保證永久可操作。Experiment 使用的 `test_*` table / view / function / API 可能在研究完成後刪除；保留 HTML 不代表必須永久保留實驗 backend。

未來若建立 Experiment Gallery / Index，應能區分 `Live Demo`、`Historical / Retired` 等狀態。**Live Demo 是 Evidence / Teaching 的附件，不是 Experiment Knowledge 的 Source of Truth。** 真正的長期紀錄仍在 Experiment Record / Evidence / Research Map。

---

## Purpose

Use this repository when a question is better answered by trying it than by arguing about it.

Typical experiments include:

- Supabase / Netlify capability checks
- Browser, API, Authentication, Session, CORS, Redirect, Deployment experiments
- Competing implementation approaches
- Integration spikes
- Small proofs of concept
- Technical ideas that do not yet have a formal Specification

The goal is not polished code. The goal is evidence.

Useful outputs include Observation, Experience, Evidence, Constraint, Pitfall, Trade-off, and Recommendation.

A successful experiment does not become Production Code automatically. If an idea is adopted by a formal system, it should be implemented again in the formal repository according to its Specification and Technical Architecture.

## Knowledge Base

Playground 不只保存 Experiment Result，也保存 Research Context：為什麼當時會問這個問題、Experiment 如何沿著某個 Research Intent 出生，以及同一份 Evidence 還能支援哪些其他問題。

Knowledge entry point：[`knowledge/README.md`](knowledge/README.md)

目前知識結構：

- `knowledge/maps/`：有明確 Research Topic 的 Research Map，保存 Context、Question、Candidate Branch 與 Research Coverage。
- `knowledge/open-exploration.md`：尚未形成獨立 Research Map 的自由探索與 Potential Cluster。
- `experiments/**/README.md`：Experiment Record，保存實際做法與驗證過程。
- `evidence/index.md`：集中檢索已形成的 Evidence。
- `notes/short-term-work.md`：只負責近期工作狀態，不承擔長期知識保存。
- `agent-work/`：需要交給其他 Engineering Agent 執行的 Work Order Protocol / Template；Experiment Ownership 與 Experiment Execution 可以分離。

同一個 Experiment / Evidence 可以透過 Links / Tags 支援多張 Research Map，不需要複製內容。新的 AI 在開始相關 Experiment 前，應先閱讀 `knowledge/README.md`、相關 Research Map、Evidence Index 與既有 Experiment Record。

Language convention：Research reasoning / explanation 以繁體中文為主；Standard IT terminology 保留英文。對陌生 Concept 用中文解釋，不為了 Localization 硬造中文術語。`clone` 就是 `clone`，不需要讓 Git 突然變成碑帖拓印課。

## Agent Handoff

Primary Agent 不必親自執行每一個 Experiment 或大量 Implementation。

當工作需要大量 Interactive Workspace、Shell、Runtime、Build / Test Loop，而現有 Execution Surface 成本不合理時，可以建立 Work Order，把已界定的工程工作委派給 Codex 或其他 Implementation Agent，再透過 Git Commit、Diff、Test Result、Log、Artifact 與 Report 做獨立 Technical QC。

入口：[`agent-work/README.md`](agent-work/README.md)

核心原則：

- **Experiment Ownership ≠ Experiment Execution.**
- **Agent Report ≠ Verified Evidence.**
- Implementation Agent 可以施工與提出 Candidate Conclusion，但不因施工角色自動取得 Architecture / Platform Decision Authority。
- Git Repository 是 Agent 之間的 observable handoff surface；盡量交付可重新檢查的狀態，不靠「我測過了」四個字建立信仰。

目前 Codex Cloud Workspace / PR / deployment handoff 的實際觀察已記錄於 [`agent-work/experience/codex-cloud-workspace.md`](agent-work/experience/codex-cloud-workspace.md)。

## Playground capabilities

Playground is not only a persistent repository. Verified experiments may add reusable execution capabilities that future AI collaborators should inspect before assuming their current sandbox or Claire's local device is the only available environment.

Current verified capabilities include：

- **GitHub Actions Remote Execution Environment** — GitHub-hosted Runner 可作為 iPad-first / AI 的 remote execution surface；manual `workflow_dispatch` 可保留 Human Gate。
- **Supabase Edge Function iPad-first Deployment Lifecycle** — GitHub Actions + Supabase CLI 已實際 deploy / delete Edge Function；本地 Desktop / Mac 不是已驗證 lifecycle 的必要條件。
- **Supabase Custom API Workloads** — Database-centric processing 與 Custom API composition / External API orchestration 已留下 runtime Evidence。
- **Netlify Static Publish / Trigger Boundary** — `public/` 是 static Publish boundary，且 relevant-path deploy / docs-only skip 已有實驗 Evidence。
- **Netlify Functions Lifecycle** — Git source → Deploy Preview / invoke / logs → Production → source delete / function absent 已驗證。

完整狀態不要依這份摘要猜測，請以 [`knowledge/experiments.md`](knowledge/experiments.md) 與 [`evidence/index.md`](evidence/index.md) 為準。

Historical capability evidence 不代表永久 Provider guarantee；高影響決策或 Evidence 已過時時應重新驗證。

## Deployment boundary

The Git repository is the Laboratory. Netlify is a deployment surface, not a repository mirror.

```text
experiments/**/README.md  = Experiment Record / Research Context
public/                   = Netlify static Public Artifact boundary
netlify/functions/        = Netlify server runtime source, when used
supabase/functions/       = Supabase Edge Function experimental source
.github/workflows/        = Remote execution / deployment mechanism
```

Browser Experiment HTML lives under `public/<experiment>/`, while Result / Evidence remains under `experiments/<experiment>/README.md` and the Knowledge / Evidence layers.

`Publish Boundary` and `Trigger Boundary` are separate concerns。相關 Evidence 請從 [`knowledge/experiments.md`](knowledge/experiments.md) 路由到對應 Experiment Record，不在 root README 重養完整實驗報告。

## Autonomy

This Playground is intentionally AI-managed. Directory structure, branches, commit history, experiment code, notes, TODOs, and temporary files may be created, rewritten, reorganized, or deleted as needed.

Failed experiments may remain for reference or disappear completely. The objective is effective exploration, not ceremonial repository cleanliness.

The only hard boundaries are legality, ethics, safety, and protection of external/formal systems.

## Public by default

Treat everything in this repository as public, even if repository visibility or deployment settings change temporarily.

Do not put secrets or sensitive information here, including passwords, Access Tokens, API Keys, Private Keys, Supabase `service_role`, provider secrets, personal / confidential real-world data, or private production configuration.

If an experiment genuinely requires secret or sensitive context, stop and use a separate private playground instead.

> People may watch us hit the wall. Do not tape the house keys to it.

## Database experiments

This Playground may share managed infrastructure with formal applications when the risk is low and the experiment remains clearly identifiable.

For experimental database objects, prefer names such as `test_auth_flow`, `test_rls_case`, `test_batch_runtime`.

Experimental work should not silently alter formal tables, functions, policies, data structures, or production semantics. If an experiment must affect formal database objects, the impact and risk must be explicitly confirmed first.

## Collaboration

This repository is public so ideas can be challenged. External contributors may use Issues, Discussions, commit comments, and Pull Requests to suggest alternatives or competing evidence. Direct write access is not implied by public visibility.

A useful disagreement is more valuable than polite consensus.

## Knowledge transfer

New experiments should read relevant existing notes and evidence before repeating old work. Existing Evidence means "verified under these conditions at this time", not "true forever".

For execution or provider capability questions, check the relevant Research Map, `evidence/index.md`, and Experiment Record before returning to provider documentation or rebuilding a proof from zero. If work is better delegated, also read `agent-work/README.md` and create a lightweight Work Order rather than silently transferring an underspecified prompt.

Existing conclusions are not sacred. Re-run, contradict, or replace them when better Evidence appears. When new Evidence changes an old Judgment, preserve the historical condition rather than pretending the old conclusion never existed.

> Leave enough context and evidence that the next AI understands not only which wall we hit, but why we walked toward that wall in the first place.

## Boundary with formal development

**Formal Specification exists and implementation is starting**  
→ use the formal repository.

**Only an idea exists and we need to know whether it actually works**  
→ use AI Playground.

Playground can be free. Formal systems do not become free just because the Playground is.