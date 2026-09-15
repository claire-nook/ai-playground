# Work Order: Codex Dispatch Experiment Design

Date: 2026-09-15

Phase: P-CODEX-PHONE / Phase 2

Type: Research / architecture / test design only

## Objective

Based on the Phase 1 reconnaissance evidence, design the smallest credible experiments for allowing ChatGPT Primary to dispatch a GitHub Work Order to Codex without Claire acting as the human relay.

This phase must produce implementation/test designs and illustrative code only. Do not execute the proposed dispatch paths, authenticate new services, create Codex Cloud tasks, provision infrastructure, create private repositories, install daemons, deploy runners, or handle real credentials.

The purpose is to expose the real implementation shape, trust boundaries, infrastructure requirements, and evidence plan before Claire authorizes any PoC.

## Read First

1. `agent-work/README.md`
2. `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md`
3. Phase 1 report from PR #29: `agent-work/reports/2026-09-15-codex-external-dispatch-recon.md`
4. `agent-work/experience/codex-cloud-workspace.md`
5. `agent-work/dispatch-handoff.md`
6. Repository root `README.md`

Note: `playground.md` is Project-level context and may not exist inside the Codex repository workspace. Do not treat its absence as a repository defect.

## Known Phase 1 Evidence

Treat these as the current research baseline, but re-check details when needed:

- Runtime observed `codex-cli 0.144.0-alpha.4`.
- `codex cloud exec --env <ENV_ID> [QUERY]` and related cloud task commands exist, but the cloud surface is marked `[EXPERIMENTAL]` and has not been authenticated/submitted end-to-end.
- `codex exec` provides a non-interactive local CLI execution primitive with workspace selection and machine-readable/result-oriented options.
- `codex mcp-server` exists; end-to-end remote ChatGPT App/Plugin applicability is unverified.
- Experimental app-server / exec-server / remote-control surfaces exist but are not established stable production boundaries.
- ChatGPT currently has no direct Codex dispatch tool exposed in its tool surface.

## Current Environment / Hard Constraints

Design for the environment we actually have, not an imaginary workstation hidden under Claire's desk.

### Human / local environment

- Primary human device: iPad Pro M5 + Magic Keyboard.
- Local editor/test: Textastic.
- Git client: Working Copy.
- Do NOT assume Claire has or will maintain a Mac/PC, Docker host, local server, always-on workstation, shell daemon, or full local development environment.
- Claire should remain a Business Intent / Functional Acceptance / explicit authorization gate, not become operational middleware between agents.

### Existing durable/cloud infrastructure

- GitHub is the durable collaboration boundary and source of Work Orders, code, commits, PRs, and evidence.
- Public experimental repository: `claire-nook/ai-playground`.
- Netlify project: `ai-playground-lab`.
- Supabase project: `Nook Core`.
- ChatGPT Primary currently has connected capabilities for GitHub, Netlify, and Supabase.
- A DigitalOcean ChatGPT Plugin has been observed in the Plugin Directory with the description that it can provision a DigitalOcean droplet as a remote Codex workspace. It is NOT currently installed or verified. Treat this only as a feasibility clue, not an available capability.

### Security constraints

- `ai-playground` is public. No secrets, tokens, auth state, private identifiers, or credential-bearing configuration may be committed there.
- A future private repository or provider secret store MAY be recommended if justified, but must not be created in this phase.
- Do not request real API keys or credentials in this phase.
- Do not assume one universal API key should cross multiple trust boundaries.
- Distinguish at minimum: ChatGPT-to-bridge authentication, Codex authentication, and GitHub publication authority.
- Prefer narrow credentials, least privilege, revocability, synthetic targets, and disposable environments for the first live PoC.

## Required Design Tracks

Design the strongest credible candidates independently. Do not force them into one architecture merely because all paths eventually invoke Codex.

At minimum evaluate:

### Track A: Native Codex Cloud dispatch

Design the minimum experiment that could answer whether an external trusted bridge can use the observed `codex cloud exec` surface to create a real Codex Cloud task suitable for this workflow.

Explicitly identify what is known versus unknown about:

- authentication / entitlement;
- environment ID acquisition and lifecycle;
- repository/environment binding;
- task creation response / task ID extraction;
- machine-readable status and polling;
- diff/result retrieval;
- completion signaling;
- GitHub publication behavior;
- stability/support risk caused by `[EXPERIMENTAL]` status.

### Track B: Self-hosted / managed `codex exec` runner

Design the minimum experiment using `codex exec` as the execution primitive.

Explicitly identify:

- execution host requirements;
- workspace checkout/isolation lifecycle;
- Codex auth placement;
- GitHub credential placement and minimum permissions;
- job admission and validation;
- timeout/cancellation/status behavior;
- JSONL / structured-result handling;
- test, commit, push/PR evidence;
- sandbox and process authority;
- cleanup and credential leakage risks;
- whether an always-on host is actually required or whether an on-demand managed execution environment is sufficient.

### Track C: MCP / server surface, only if it can materially simplify the bridge

Evaluate `codex mcp-server` and relevant experimental server surfaces only enough to determine whether they could reduce the bridge/runner complexity.

Do not recommend them merely because MCP or server commands exist. Identify transport, hosting, authentication, lifecycle, and ChatGPT reachability gaps.

## Architecture Evaluation Requirement

For every viable candidate, provide TWO judgments:

1. **Technical Best**: what would be preferred if existing Claire infrastructure were ignored.
2. **Environment Fit**: what best fits the actual iPad-first + GitHub + Netlify + Supabase + ChatGPT Plugin/App environment.

These judgments may differ. Do not distort technical conclusions to force existing infrastructure to fit.

If a persistent Linux VM, container host, queue, database, managed runner, or other new infrastructure is required, label it clearly as **New Infrastructure Requirement** and explain:

- why it is necessary;
- whether it must be persistent or can be on-demand;
- operational/maintenance burden;
- credential/security responsibility;
- expected failure modes;
- whether Netlify/Supabase can reasonably own any part of the role;
- whether a managed alternative exists.

Do not casually prescribe a 24/7 server as though Claire keeps one behind the iPad.

## Illustrative Implementation Sketches

For each serious candidate, include enough illustrative code/configuration to reveal the implementation shape.

Allowed examples include:

- TypeScript/JavaScript runner skeleton;
- shell command sequence;
- pseudo-code;
- HTTP/App/MCP tool schema;
- job payload and structured result schema;
- polling/status state machine;
- GitHub checkout/publication flow;
- proposed secret/config names.

The sketches should be realistic enough for Primary Agent architecture review, but MUST NOT be executed or deployed in this phase.

Use explicit placeholders for unknown or secret-bearing values, for example:

```text
<CREDENTIAL_SOURCE_UNKNOWN>
<CODEX_ENV_ID>
<CODEX_AUTH_BOUNDARY>
<GITHUB_AUTH_BOUNDARY>
<CHATGPT_TO_BRIDGE_AUTH>
<COMPLETION_SIGNAL_TBD>
```

Do not silently fill evidence gaps with convenient API-key assumptions.

## First Live PoC Design

Recommend exactly one first live PoC, but DO NOT execute it.

The first PoC must be intentionally synthetic and low-impact. It should prove dispatch and evidence flow, not application functionality. A suitable shape would be a disposable/private repository containing a trivial Work Order that asks Codex to make a harmless deterministic text/code change, run a tiny test/check, create a commit, and expose a result that ChatGPT Primary can independently verify through GitHub.

Specify:

- whether a private repo is actually required and why;
- exact minimum infrastructure needed;
- exact human setup/authorization Claire would need to perform;
- exact credentials/permissions required, without requesting their values;
- success criteria;
- negative/failure cases worth testing;
- rollback/cleanup;
- what evidence would allow Primary Agent to distinguish 'dispatch worked' from 'Codex merely ran somewhere'.

## Evidence / Confidence Standard

Classify material claims as one of:

- **Confirmed**: directly observed/reproducible evidence.
- **Plausible**: supported architecture inference, not yet executed.
- **Unsupported**: available evidence does not justify the claim or the surface is unsuitable for the proposed boundary.
- **Unknown**: evidence gap remains.

Keep product concepts separate:

- Codex product native Cloud task;
- Responses API/model request;
- Codex CLI session;
- SDK/library wrapper;
- MCP/server process;
- ChatGPT App/Plugin tool call.

## Safety Boundary

This is design-only research.

Do NOT:

- submit a real `codex cloud exec` task;
- perform new login/authentication;
- inspect private credential/session stores;
- create or rotate secrets;
- create a private repo;
- provision a VM/container/runner;
- install or configure a daemon;
- deploy a bridge;
- push experimental executable infrastructure;
- modify Supabase or Netlify configuration;
- use `--dangerously-bypass-approvals-and-sandbox`;
- treat undocumented/private/internal endpoints as production interfaces.

Public documentation, CLI `--help`/version output, repository evidence, and non-mutating inspection are allowed.

## Required Report

Create:

`agent-work/reports/2026-09-15-codex-dispatch-experiment-design.md`

The report must contain:

1. Executive recommendation.
2. Assumptions and evidence gaps.
3. Candidate architecture diagrams/topologies.
4. Track A design.
5. Track B design.
6. Track C assessment, if viable/relevant.
7. Infrastructure and environment-fit matrix.
8. Credential / trust-boundary matrix.
9. Illustrative implementation sketches for each serious candidate.
10. Recommended first live PoC, including synthetic task design.
11. Exact Claire setup/authorization checklist for that PoC.
12. Success/failure evidence contract.
13. Security and cleanup plan.
14. Technical Best vs Environment Fit judgment.
15. Open questions that must be answered before Phase 3 execution.

## Final Question

Answer explicitly:

> Given the actual iPad-first environment and currently available GitHub / Netlify / Supabase / ChatGPT capabilities, what is the smallest, safest Phase 3 experiment that can produce hard evidence that ChatGPT Primary can dispatch work to Codex without Claire acting as the message relay?

## Completion Contract

- Research/design only.
- Add only the required report unless a tiny supporting evidence note is strictly necessary.
- No executable PoC or infrastructure changes.
- Commit locally and publish through the normal Codex/GitHub task flow.
- Return commit SHA, report path, recommended Phase 3 candidate, required new infrastructure, required human authorization, and unresolved blockers.
