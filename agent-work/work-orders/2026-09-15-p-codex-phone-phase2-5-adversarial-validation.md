# P-CODEX-PHONE Phase 2.5｜Adversarial Validation of Primary Draft Architecture

- Date: 2026-09-15
- Owner: Primary Agent / Architecture & Technical QC
- Execution Agent: Codex
- Scope: research / adversarial architecture review only
- Source baseline: `main` latest
- Implementation status: **DO NOT IMPLEMENT**

## 1. Purpose

This phase exists to challenge the Primary Agent's post-Phase-2 architecture before any Phase 3 implementation begins.

Do **not** treat the Primary draft as an approved design. Your job is to find where it is wrong, incomplete, unnecessarily complex, unsafe, or based on unsupported assumptions.

The value of this phase is disagreement when disagreement is justified.

> **Review target ≠ required answer.**
>
> If the proposed design is wrong, say so clearly and explain the better alternative.

## 2. Read First

Read these repository files before forming conclusions:

1. `agent-work/README.md`
2. `agent-work/work-orders/2026-09-15-codex-external-dispatch-recon.md`
3. `agent-work/work-orders/2026-09-15-codex-dispatch-experiment-design.md`
4. `agent-work/reports/2026-09-15-p-codex-phone-primary-qc-phase3-implementation-plan.md`
5. Any GitHub-visible Phase 1 / Phase 2 report that is actually present in your task snapshot or reachable through supported repository access.

If any required file is unavailable, record the limitation explicitly and continue only with evidence you can actually inspect.

Do not silently reconstruct missing content from memory or prior task context.

## 3. Primary Draft Under Review

The Primary Agent currently proposes replacing the Phase 2 App/MCP admission bridge with a thinner GitHub-native dispatch path:

```text
ChatGPT Primary
  ↓ create a tightly constrained GitHub Issue
Disposable Private GitHub Repo
  ↓ issue-open event
GitHub Actions
  ↓
Job A: Codex execution
  - no GitHub publication credential
  - dedicated capped OpenAI/Codex credential
  - produces patch/evidence only
  ↓ artifact handoff
Job B: independent validation + publication
  - no OpenAI/Codex credential
  - validates expected diff and test
  - publishes commit / branch / PR only after policy passes
  ↓
GitHub evidence
  ↓
Primary independently verifies run / diff / commit / PR
```

The current draft assumes this may eliminate the need for a separate Netlify/Supabase/App admission bridge in the first PoC.

The draft also assumes a one-time Claire setup/authorization boundary and no per-dispatch human relay.

## 4. Hard Environment Constraints

Your review must respect the real environment:

- Claire is iPad-first.
- Primary local tooling assumptions: no desktop, no Docker host, no always-on machine, no local daemon.
- Existing durable collaboration boundary: GitHub.
- Existing cloud platforms: Netlify and Supabase `Nook Core`.
- ChatGPT Primary currently has GitHub-connected capabilities, including creating repository Issues, but no confirmed direct `workflow_dispatch` action.
- The public `ai-playground` repository must never contain secrets.
- A disposable private repository may be introduced only if Phase 3 is later approved.
- Do not assume a persistent Linux VM unless you prove it is necessary.
- Do not design around Claire manually operating shell/CLI as part of the measured happy path.

## 5. Your Role in This Phase

Act as an independent adversarial reviewer, not as an implementation subordinate.

For every major claim in the Primary draft:

- attempt to falsify it;
- distinguish provider-supported capability from architectural inference;
- identify hidden trust, lifecycle, timing, credential, correlation, or race assumptions;
- propose a simpler or safer alternative where one exists;
- preserve uncertainty rather than smoothing it over.

Use these classifications:

- **Confirmed** — directly supported by current repository/runtime/provider evidence.
- **Plausible** — reasonable architecture inference with at least one unverified boundary.
- **Unsupported** — current evidence does not justify the claim or the mechanism does not satisfy the stated requirement.
- **Unknown** — evidence is missing.

## 6. Required Review Questions

### A. GitHub Issue as Dispatch Primitive

Determine whether `Issue opened → GitHub Actions` is genuinely a better first PoC dispatch boundary than `ChatGPT App/MCP bridge → workflow_dispatch`.

Review at least:

1. Can an Issue-open workflow be safely limited to the exact private repository and exact dispatcher identity we expect?
2. Can arbitrary issue content or issue edits create command / prompt injection risk?
3. Should dispatch data live in issue title/body, labels, a fixed template, repository file, or some combination?
4. Can replay / duplicate / accidental Issue creation be handled deterministically?
5. Does Issue creation provide enough correlation metadata to prove that one Primary request caused one Actions run?
6. Are `issues: opened`, repository event permissions, actor identity, and branch/workflow source semantics reliable enough for a security-sensitive trigger?
7. Is there a materially simpler GitHub-native trigger available to Primary that we have overlooked?
8. Does this route make future bidirectional question/escalation harder than a dedicated App/MCP control plane?

Give a verdict:

- **Keep Issue trigger**
- **Return to dedicated bridge**
- **Use a different GitHub-native mechanism**
- **Unknown pending specific evidence**

and explain why.

### B. Official Codex GitHub Action / Codex CLI Assumptions

Independently verify, as far as your current runtime and supported documentation access allow:

1. Whether an official OpenAI Codex GitHub Action exists and what responsibility it actually owns.
2. Whether it is suitable for non-interactive CI execution on GitHub-hosted runners.
3. Supported authentication modes for that Action / `codex exec` in CI.
4. Whether an OpenAI Platform API key is actually the correct supported credential for the intended path.
5. Whether Codex execution can be constrained to workspace writes without providing GitHub publication authority.
6. Exact outputs available for downstream validation: patch/diff, JSONL/events, final message, exit code, artifacts, or equivalent.
7. Any documented limits, approval behavior, sandbox requirements, or action-specific caveats that would break the Primary design.

If current documentation cannot be reached, say exactly what remains Unknown. Do not infer stability from package names or examples alone.

### C. Two-Job Credential Isolation

Attempt to break this design:

- Job A: Codex execution, OpenAI/Codex credential, GitHub read-only.
- Job B: validation/publication, GitHub write authority, no OpenAI/Codex credential.

Review:

1. Can artifacts safely transfer the exact intended patch/evidence between jobs without transferring secrets or hidden filesystem state?
2. Can a malicious or mistaken patch influence Job B's validation scripts or workflow execution?
3. Should Job B apply a raw patch, copy one allow-listed file, or reconstruct expected output another way?
4. Can Job A truly avoid receiving a usable GitHub write token, including implicit `GITHUB_TOKEN`, checkout credentials, credential helpers, or environment inheritance?
5. Can Job B truly avoid access to the Codex/OpenAI secret at job scope?
6. What permissions must be explicit at workflow and job level?
7. Would GitHub Environments, separate workflows, reusable workflows, OIDC, or another isolation boundary materially improve security?
8. Is two-job separation sufficient for the synthetic PoC, or is it security theater under GitHub Actions' actual secret/permission model?

Provide a concrete recommended isolation pattern.

### D. GitHub Publication Boundary

Review whether the harness should own commit / push / PR rather than Codex.

Determine:

- minimum GitHub permissions required;
- whether default `GITHUB_TOKEN` is sufficient or a repository-scoped GitHub App token is necessary;
- whether PR creation from Actions is enabled by default / configurable and what repository setting may block it;
- whether a separate GitHub App is needless complexity for the first disposable PoC;
- whether publication should happen only after deterministic diff validation.

Prefer the smallest authority that still produces hard evidence.

### E. Claire One-Time Setup Boundary

Review the proposed human gate and identify what Claire actually must do versus what Primary / Codex can own.

Current draft expectation:

- approve disposable private repo;
- grant ChatGPT GitHub connector access to it;
- create or authorize a dedicated capped OpenAI/Codex API credential;
- store the secret through GitHub/provider UI without revealing its value in chat;
- approve workflow/harness before live enablement;
- perform final functional acceptance and cleanup authorization.

Challenge every item. Remove anything unnecessary. Add anything missing.

Specifically call out any step that requires:

- browser login / MFA;
- billing/project creation;
- GitHub repository settings;
- Actions permissions;
- secret creation;
- ChatGPT connector authorization;
- provider consent that an Agent cannot perform.

### F. First PoC Scope

Evaluate the proposed synthetic task:

```text
dispatch-target.txt

before: dispatch-pending
after:  dispatch-complete:<NONCE>
```

The first measured PoC should prove all of these, not merely file editing:

1. Primary initiated dispatch without Claire relaying.
2. GitHub automatically started managed execution.
3. Codex genuinely executed.
4. Only the expected synthetic change was produced.
5. An independent policy boundary validated the result.
6. Publication occurred without Claire clicking Create PR.
7. Primary independently observed and correlated the evidence.

Tell us if the synthetic task is too weak, too strong, or appropriate.

## 7. Failure-Oriented Review

Do not only review the happy path.

Construct at least these failure cases and state expected safe behavior:

- unauthorized user opens a syntactically valid dispatch Issue;
- duplicate/replayed Issue;
- malformed nonce/source SHA/work-order path;
- Codex credential invalid or revoked;
- Codex changes a second file;
- Codex emits a patch that modifies validation/publishing code;
- artifact is missing or tampered with;
- publication permission is unavailable;
- PR creation is blocked by repository policy;
- runner timeout;
- secret-like content appears in Codex output/logs;
- Primary creates Issue successfully but Actions never starts;
- Actions starts but no trustworthy evidence proves Codex actually ran.

Identify which failures should be Phase 3 test cases and which are unnecessary for the first live proof.

## 8. Bidirectional Collaboration Implication

Phase 3 is intentionally dispatch-only, but review the architectural consequence for the future requirement:

```text
Codex → Decision Required / Question → Primary → Clarification → Resume
```

Do not design Phase 4 now.

Only answer:

- Does the proposed Issue-based control plane create a dead-end?
- Could GitHub Issues/comments/status safely serve as a later escalation channel?
- Would choosing a dedicated App/MCP bridge now materially reduce future migration cost?

This is a future-evolution judgment, not a requirement to add bidirectional messaging to Phase 3.

## 9. Implementation Sketches Allowed, Execution Forbidden

You may include realistic, non-executed sketches where they help expose flaws:

- GitHub Actions event filters;
- permissions blocks;
- artifact boundaries;
- validation flow;
- issue payload schema/template;
- security checks;
- state/correlation model.

Mark all such code as illustrative.

Do **not**:

- create a private repo;
- create/store/read any secret;
- execute Codex from Actions;
- deploy workflows;
- install Apps;
- create API keys;
- alter billing/project settings;
- trigger any real dispatch;
- provision infrastructure.

## 10. Required Report

Create:

`agent-work/reports/2026-09-15-p-codex-phone-phase2-5-adversarial-validation.md`

The report must contain:

1. **Executive verdict**
2. **What the Primary got right**
3. **What the Primary got wrong / overstated / left unknown**
4. **Capability evidence table** using Confirmed / Plausible / Unsupported / Unknown
5. **Issue-trigger verdict**
6. **Codex GitHub Action / auth verdict**
7. **Two-job isolation verdict**
8. **Publication credential recommendation**
9. **Revised Claire one-time setup checklist**
10. **Failure-mode review**
11. **Bidirectional-evolution implication**
12. **Recommended Phase 3 architecture**
13. **Exact blockers before implementation**
14. **Go / Revise / No-Go decision**

If your recommended architecture differs from the Primary draft, provide the revised topology and explain the difference explicitly.

## 11. Completion Contract

Your final response / PR description must report:

- report path;
- commit SHA;
- overall decision: `GO`, `REVISE`, or `NO-GO`;
- the three most important flaws or confirmations;
- whether GitHub Issue should remain the first dispatch primitive;
- whether the two-job isolation pattern should remain;
- exactly what Claire would need to do before implementation can begin;
- unresolved evidence gaps.

Do not implement Phase 3 in this task.

## 12. Review Standard

The goal is not consensus.

A good result may conclude that the Primary architecture is substantially correct, partially wrong, or should be discarded.

> **Finding a flaw before implementation is a successful outcome.**

Do not optimize for politeness toward the author of the draft. Optimize for evidence, least privilege, environment fit, reversibility, and a PoC whose success would actually prove the research claim.