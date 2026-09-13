# AI Playground

Public technical playground for experiments, proofs of concept, integration spikes, and ideas that are not ready to become production decisions.

This repository is intentionally not a Development, Test, UAT, or Production environment.

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

Useful outputs include:

- Observation
- Experience
- Evidence
- Constraint
- Pitfall
- Trade-off
- Recommendation

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
- 這套 Handoff Model 本身目前仍是 Candidate。先用真實 Work Order 撞幾次，再依 Evidence 調整規則，不預先養出 Agent PMO。

## Playground capabilities

Playground is not only a persistent repository. Verified experiments may add reusable execution capabilities that future AI collaborators should inspect before assuming their current sandbox or Claire's local device is the only available environment.

Current verified capabilities:

- **GitHub Actions Remote Execution Environment** — AI can use controlled push-triggered workflows to start a GitHub-hosted Runner and independently retrieve Run / Job / Log results. A separate manual `workflow_dispatch` mode allows Claire to retain a Human Approval Gate while AI handles result retrieval and analysis.
- **Supabase Edge Function iPad-first Deployment Lifecycle** — GitHub Actions + Supabase CLI has been used from Claire's iPad-first workflow to deploy and delete a real Nook Core Edge Function; the ChatGPT Supabase Connector has independently deployed the same GitHub source, and an Actions workflow successfully deleted the Connector-deployed function. A local Desktop / Mac was not required for the verified lifecycle.
- **Netlify Static Publish Boundary** — Netlify Continuous Deployment has been verified with `public/` as the static Publish directory. Repository research material remains in GitHub while only intentional Browser Artifacts under `public/` enter the Site Deploy.

Evidence:

- `experiments/github-actions/README.md`
- `experiments/custom-api/README.md`
- `experiments/netlify-deployment-boundary/README.md`
- `evidence/provider-boundary-pitfalls.md`
- `evidence/index.md`

Important deployment caveat: the GitHub Actions Supabase experiment required a PAT. At experiment time Claire did not have a usable Scoped PAT in the Supabase UI, so the test used a short-lived Classic PAT stored only in GitHub Actions Secrets. Classic PAT authority is broad; repository privacy and Secret masking reduce exposure probability but do not reduce the credential's blast radius. The Supabase Connector deployment avoided this user-managed PAT path, but its available Edge Function lifecycle was less complete because delete was not exposed by the Connector.

This is historical capability evidence, not a permanent guarantee or Production deployment decision. Provider, Connector, security, authorization, credential, and runtime behavior may change; re-verify when the decision is high-impact or the evidence is stale.

## Deployment boundary

The Git repository is the Laboratory. Netlify is a deployment surface, not a repository mirror.

Current static Browser deployment ownership:

```text
experiments/**/README.md  = Experiment Record / Research Context
public/                   = Netlify static Public Artifact boundary
netlify/functions/        = Netlify server runtime source, when used
```

Current Netlify Build settings keep the Repository root as Base directory and use `public` as Publish directory. Browser Experiment HTML therefore lives under `public/<experiment>/`, while its Result / Evidence remains under `experiments/<experiment>/README.md`.

`Publish Boundary` and `Trigger Boundary` are separate concerns. The current `public/` boundary controls what can enter the Site Deploy; reducing unnecessary Netlify deploy triggers for unrelated `main` changes remains a separate research item.

Verified record: [`experiments/netlify-deployment-boundary/README.md`](experiments/netlify-deployment-boundary/README.md)

Cross-provider boundary pitfall: [`evidence/provider-boundary-pitfalls.md`](evidence/provider-boundary-pitfalls.md)

## Autonomy

This Playground is intentionally AI-managed.

Directory structure, branches, commit history, experiment code, notes, TODOs, and temporary files may be created, rewritten, reorganized, or deleted as needed.

Failed experiments may remain for reference or disappear completely. Commit history is allowed to be messy. Notes may be informal and may be written directly to future AI collaborators.

The objective is effective exploration, not ceremonial repository cleanliness.

The only hard boundaries are legality, ethics, safety, and protection of external/formal systems.

## Public by default

Treat everything in this repository as public, even if repository visibility or deployment settings change temporarily.

Do not put secrets or sensitive information here, including:

- Passwords
- Access Tokens
- API Keys
- Private Keys
- Supabase `service_role` or other privileged credentials
- GitHub, Netlify, Supabase, or other provider secrets
- Personal or confidential real-world data
- Private production configuration
- Any information that is safe only because a repository happens to be private

If an experiment genuinely requires secret or sensitive context, stop and use a separate private playground instead.

> People may watch us hit the wall. Do not tape the house keys to it.

## Database experiments

This Playground may share managed infrastructure with formal applications when the risk is low and the experiment remains clearly identifiable.

For experimental database objects, prefer names such as:

- `test_auth_flow`
- `test_rls_case`
- `test_batch_runtime`

Experimental work should not silently alter formal tables, functions, policies, data structures, or production semantics.

If an experiment must affect formal database objects, the impact and risk must be explicitly confirmed first.

## Collaboration

This repository is public so ideas can be challenged.

External contributors may use Issues, Discussions, commit comments, and Pull Requests to suggest alternative approaches, point out mistakes, or provide competing evidence.

Direct write access is not implied by public visibility.

A useful disagreement is more valuable than polite consensus.

## Knowledge transfer

New experiments should read relevant existing notes and evidence before repeating old work.

For execution or provider capability questions, check `knowledge/README.md`, the relevant Research Map, `evidence/index.md`, and the relevant Experiment Record before returning to provider documentation or rebuilding a proof from zero. Existing Evidence means "verified under these conditions at this time", not "true forever".

If the work is better delegated to another Engineering Agent, also read `agent-work/README.md` and create a lightweight Work Order rather than silently transferring an underspecified prompt.

Existing conclusions are not sacred. Re-run, contradict, or replace them when better evidence appears. When new Evidence changes an old Judgment, preserve the historical condition and relationship rather than silently pretending the old conclusion never existed.

The point is simple:

> Leave enough context and evidence that the next AI understands not only which wall we hit, but why we walked toward that wall in the first place.

## Boundary with formal development

A simple routing rule:

**Formal Specification exists and implementation is starting**  
→ use the formal repository.

**Only an idea exists and we need to know whether it actually works**  
→ use AI Playground.

Playground can be free.

Formal systems do not become free just because the Playground is.