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

## Playground capabilities

Playground is not only a persistent repository. Verified experiments may add reusable execution capabilities that future AI collaborators should inspect before assuming their current sandbox is the only available environment.

Current verified capability:

- **GitHub Actions Remote Execution Environment** — AI can use controlled push-triggered workflows to start a GitHub-hosted Runner and independently retrieve Run / Job / Log results. A separate manual `workflow_dispatch` mode allows Claire to retain a Human Approval Gate while AI handles result retrieval and analysis.

Evidence: `experiments/github-actions/README.md` and `evidence/index.md`.

This is historical capability evidence, not a permanent guarantee. Provider, Connector, security, authorization, and runtime behavior may change; re-verify when the decision is high-impact or the evidence is stale.

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

For execution or provider capability questions, check `evidence/index.md` and the relevant Experiment Record before returning to provider documentation or rebuilding a proof from zero. Existing Evidence means "verified under these conditions at this time", not "true forever".

Existing conclusions are not sacred. Re-run, contradict, or replace them when better evidence appears.

The point is simple:

> Leave enough evidence that the next AI has one fewer wall to hit.

## Boundary with formal development

A simple routing rule:

**Formal Specification exists and implementation is starting**  
→ use the formal repository.

**Only an idea exists and we need to know whether it actually works**  
→ use AI Playground.

Playground can be free.

Formal systems do not become free just because the Playground is.