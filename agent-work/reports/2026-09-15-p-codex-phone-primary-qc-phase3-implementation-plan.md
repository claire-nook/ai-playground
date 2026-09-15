# P-CODEX-PHONE｜Primary QC & Phase 3 Implementation Plan

- Date: 2026-09-15
- Author role: Primary Agent / Architecture & Technical QC（墨衡）
- Scope: Primary QC of Phase 2 proposal + Phase 3 implementation plan
- Phase 2 source reviewed: PR #30, `agent-work/reports/2026-09-15-codex-dispatch-experiment-design.md`
- Phase 2 head reviewed: `884344524ff174fc402881ad865c3e55642c2c15`
- Safety status: **No private repository, secret, API key, workflow, Codex execution, or live dispatch was created or executed by this plan.**

## 1. Primary decision

Phase 2's core judgment is accepted:

> The first live experiment should use an ephemeral managed execution surface around non-interactive Codex execution, not a persistent Claire-owned server and not the current experimental native Codex Cloud task surface.

However, Primary QC recommends a **simpler Phase 3 admission path than the Phase 2 report proposed**.

### Recommended Phase 3 architecture

```text
ChatGPT Primary
    ↓ existing GitHub connector: create Issue
Disposable private GitHub repository
    ↓ issues event
GitHub Actions
    ├─ Job A: Codex execution, read-only GitHub authority
    │    └─ official OpenAI Codex GitHub Action + dedicated API key
    │         ↓
    │       untrusted patch / safe execution evidence
    ↓
    └─ Job B: fresh checkout + deterministic validation + publication
         └─ scoped GITHUB_TOKEN → branch + commit + PR

ChatGPT Primary
    ↓ existing GitHub connector: read Issue / run / commit / PR
Independent verification
```

For Phase 3, **GitHub Issue itself is the telephone**.

This removes the proposed custom Netlify/MCP admission bridge from the critical path. Netlify and Supabase remain available future components, but neither is required to answer the first research question.

### Why this is a meaningful simplification

The current ChatGPT GitHub connector can already create GitHub Issues in an authorized repository. GitHub Actions can react to repository Issue events. Therefore the existing GitHub boundary can carry both:

1. durable dispatch intent; and
2. execution trigger.

The first PoC does not need ChatGPT to own a new HTTP client credential, does not need a new MCP/App server, does not need Netlify to mint GitHub tokens, and does not need a nonce database.

The admission bridge proposed in Phase 2 remains a valid later pattern if GitHub Issue dispatch proves insufficient for authorization, product ergonomics, cancellation, multi-repository routing, or two-way collaboration. It should not be built merely because an architecture diagram has an empty box available.

---

## 2. Independent evidence that changes the Phase 2 risk picture

Primary QC independently re-checked current provider surfaces after reading the Phase 2 report.

### 2.1 OpenAI provides an official Codex GitHub Action

Current OpenAI documentation provides `openai/codex-action` for running Codex in GitHub Actions. The documented Action installs/runs Codex for the workflow and supports a prompt or prompt file, model/effort controls, sandbox configuration, Codex version selection, output handling, and security controls.

This materially changes the implementation shape. Phase 3 should **not** begin by inventing a custom `install-pinned-codex.sh` unless an evidence-backed need appears.

Implementation policy:

- Use the official Codex GitHub Action as the first candidate.
- Pin the Action to a reviewed immutable commit SHA for the live PoC rather than relying only on a moving major tag.
- Pin or record the Codex CLI version used by the Action.
- Keep the Codex step on the narrowest sandbox compatible with the synthetic write.
- Never use a dangerous sandbox/approval bypass as a shortcut.

Reference starting point:

- OpenAI Codex GitHub Action: `https://developers.openai.com/codex/github-action/`

### 2.2 Non-interactive CI authentication has an official path

Current OpenAI Codex authentication documentation explicitly supports API-key authentication for programmatic Codex CLI workflows such as CI/CD jobs.

For this Phase 3 PoC, that means the default authentication candidate is:

> a **dedicated OpenAI Platform API key for the experiment**, stored only in the private repository/environment secret store and supplied to the official Codex GitHub Action.

This is separate from Claire's ChatGPT subscription/session and must be treated as a separate billing/security boundary.

Do not copy browser session state, ChatGPT login cookies, local Codex auth caches, or any private product session material into GitHub Actions.

Reference starting point:

- OpenAI Codex authentication: `https://developers.openai.com/codex/auth/`
- OpenAI Codex non-interactive mode: `https://developers.openai.com/codex/noninteractive/`

### 2.3 GitHub workflow dispatch is no longer the only viable trigger

Phase 2 spent substantial effort on a custom admission bridge calling GitHub `workflow_dispatch`. That remains technically reasonable, but it is unnecessary for the smallest PoC because Primary already has a GitHub mutation surface: Issue creation.

An `issues`-triggered workflow has useful properties for this experiment:

- the Issue number is a durable dispatch ID;
- the Issue body is a reviewable dispatch envelope;
- the Issue actor and repository are visible evidence;
- duplicate/replay behavior can be tied to Issue number plus nonce;
- no custom HTTP endpoint is needed;
- the entire first transaction remains inside the existing GitHub trust/evidence boundary.

### 2.4 Existing ChatGPT GitHub connector does not expose a fresh workflow-dispatch verb

Primary inspected the currently exposed GitHub connector actions. It can inspect workflow runs/jobs/logs and rerun existing workflow jobs, but no tool for creating a fresh `workflow_dispatch` run is currently exposed to this ChatGPT context.

It **does** expose Issue creation.

This is the decisive environment-fit reason to prefer Issue-triggered admission for Phase 3.

---

## 3. Architecture judgment on Phase 2 candidates

| Candidate | Primary QC | Reason |
| --- | --- | --- |
| Native `codex cloud exec` | Preserve as future research, not Phase 3 | Attractive provider-owned execution model, but current externally automatable Cloud task contract remains experimental/incomplete. |
| Custom App/MCP bridge → workflow dispatch → `codex exec` | Valid fallback, but overbuilt for first PoC | Adds a new server, caller auth, GitHub dispatch credential, replay store, deployment and maintenance before proving they are needed. |
| **GitHub Issue → Actions → official Codex Action → PR** | **Recommended Phase 3** | Uses existing ChatGPT GitHub mutation capability, managed ephemeral compute, official Codex CI integration, and GitHub as the existing durable collaboration boundary. |
| Persistent Linux VM / droplet | Reject for first PoC | Adds maintenance, patching, process lifecycle, storage cleanup and credential custody without answering a problem GitHub-hosted runners can already answer. |
| Codex MCP / experimental server | Reject for first PoC | Does not eliminate execution-host, auth, lifecycle or publication problems. |

---

## 4. Phase 3 research question

> After one-time human authorization and setup, can ChatGPT Primary create a structured GitHub dispatch Issue that automatically causes a fresh GitHub-hosted runner to execute Codex against a synthetic Work Order, validate the result independently, publish a PR, and allow Primary to verify the entire transaction without Claire relaying any per-task message or clicking any per-task execution/publication control?

This is deliberately narrower than "full autonomous agent collaboration".

Phase 3 proves **outbound dispatch + execution + publication + Primary verification**.

It does **not** yet prove a rich Codex → Primary question/escalation channel. Two-way clarification should be treated as a later research phase after the basic telephone rings reliably.

---

## 5. Proposed disposable private repository

A private repository is not technically required merely to change a harmless text file. It is recommended as Phase 3 policy because the experiment introduces Actions secrets, logs, prompt artifacts, security controls and failure evidence.

Suggested semantic purpose:

> Disposable Codex Dispatch Sandbox

The exact repository name is not an architecture requirement.

Minimum content after the preparation Work Order:

```text
README.md

dispatch-target.txt
# initial content: dispatch-pending

agent-work/work-orders/synthetic-dispatch.md

.github/workflows/codex-dispatch.yml

harness/
  parse-dispatch-issue.*
  validate-inputs.*
  validate-patch.*
  publish-result.*

docs/
  phase3-security-boundary.md
  phase3-evidence-contract.md
```

No Nook code, production data, Supabase credential, Netlify credential, personal files, or copied Playground secrets belong in this repository.

---

## 6. Dispatch envelope

Primary should create one Issue with a deliberately closed, boring schema.

Illustrative body:

```yaml
dispatch_version: 1
source_sha: <40_HEX_SOURCE_SHA>
work_order_path: agent-work/work-orders/synthetic-dispatch.md
dispatch_nonce: p3-<RANDOM_NONCE>
```

Illustrative title:

```text
[CODEX-DISPATCH] P3 synthetic dispatch <NONCE>
```

Recommended safeguards:

- repository is a fixed private allow-listed sandbox;
- workflow only runs for `issues: [opened]`;
- workflow gates on exact title prefix and strict body schema;
- source SHA must be exact 40-hex and belong to the same repository;
- Work Order path must equal the single synthetic path;
- no shell command, prompt text, repository URL, branch name or arbitrary path is accepted from the Issue;
- Issue number + nonce form the correlation key;
- unexpected fields cause fail-closed behavior before Codex executes.

The Issue is a dispatch record, not a general remote-shell request. Humanity has already invented enough generic remote-shell endpoints.

---

## 7. Execution design: two-job isolation

Primary QC strengthens the Phase 2 security design by splitting Codex execution and GitHub publication into **separate jobs**.

### Job A — `codex_execute`

Authority:

- GitHub `contents: read` only;
- dedicated OpenAI API key secret available only to the Codex Action step;
- no GitHub publication token passed into the Codex process.

Responsibilities:

1. validate Issue actor/title/schema/repository/path/SHA;
2. checkout the exact source SHA with persisted Git credentials disabled where practical;
3. invoke the pinned official OpenAI Codex GitHub Action;
4. instruct Codex to read the fixed synthetic Work Order;
5. run under a hard timeout;
6. capture safe execution metadata and the resulting patch/diff;
7. upload a narrowly scoped patch/evidence artifact for Job B.

Job A **must not push, commit or open a PR**.

### Job B — `validate_publish`

Authority:

- fresh runner;
- no OpenAI API key;
- `contents: write` and `pull-requests: write` only for the same disposable repository;
- job-scoped `GITHUB_TOKEN` preferred before introducing a GitHub App/PAT.

Responsibilities:

1. fresh checkout of the exact original source SHA;
2. download Job A's untrusted patch artifact;
3. apply patch locally;
4. independently verify that only `dispatch-target.txt` changed;
5. verify exact expected content `dispatch-complete:<NONCE>`;
6. run the deterministic shell assertion;
7. reject any symlink/path/control-character anomaly;
8. create nonce branch;
9. commit with correlated Issue/nonce/source-SHA metadata;
10. push branch and open PR;
11. publish safe run summary for Primary verification.

This separation is intentional:

> The job capable of executing model-generated changes should not also possess the credential that publishes them.

If GitHub's repository settings prevent PR creation with the workflow `GITHUB_TOKEN`, that is evidence. Only then should a repository-scoped GitHub App installation token be evaluated as a fallback. Do not provision broader authority in advance to solve a failure that has not happened.

---

## 8. Synthetic Work Order

The live PoC task should remain deliberately humiliating in its simplicity:

```markdown
# Synthetic dispatch P3

Change exactly `dispatch-target.txt` from:

`dispatch-pending`

to:

`dispatch-complete:<DISPATCH_NONCE>`

Do not change any other file.
Do not create infrastructure.
Do not access unrelated repositories or services.
Do not commit, push, or open a PR; the trusted harness owns publication.
```

The harness, not Codex's final prose, determines success.

---

## 9. Credential model

### Credential A — ChatGPT → GitHub

Use the existing connected GitHub integration.

Required capability for Phase 3:

- Primary can access the new private sandbox repository;
- Primary can create the dispatch Issue;
- Primary can later read the Issue, workflow evidence, commit/diff and PR.

Human gate:

- Claire may need to grant/extend the GitHub connector installation to the new private repository.

No GitHub credential value is pasted into chat or stored in the public Playground.

### Credential B — GitHub Actions → OpenAI Codex

Use a **dedicated OpenAI Platform API key** created only for the PoC/project boundary.

Policy:

- store it in GitHub Actions secret/environment storage;
- never commit it;
- never paste it into ChatGPT/Codex conversation;
- expose it only to the Codex execution step/job;
- use the narrowest project/billing boundary and lowest practical spend limit available;
- revoke it after experiment completion unless Claire explicitly approves retention.

### Credential C — GitHub publication

First candidate: job-scoped repository `GITHUB_TOKEN` with only required permissions.

Do not introduce a PAT or custom GitHub App until evidence says the built-in token cannot satisfy the disposable-repo publication contract.

This reduces the original Phase 2 design from several new credential systems to one genuinely new secret: the dedicated OpenAI API key.

---

## 10. What Claire must do

Claire remains the Human Authorization Gate, not the runtime message bus.

### Before implementation

1. **Approve Phase 3 architecture and scope.**
   - disposable private repository;
   - synthetic one-file task only;
   - one concurrent run;
   - hard workflow timeout;
   - low API spend boundary;
   - no Nook code/data.

2. **Create or approve creation of the disposable private GitHub repository.**
   - If an installed tool can safely create it with the required privacy settings and Claire explicitly authorizes that action, an Agent may perform the creation.
   - Otherwise Claire creates it in GitHub UI.

3. **Grant the existing ChatGPT GitHub connector access to that private repository.**
   - This may require GitHub UI/account authorization.
   - Primary must verify access afterward; do not assume installation propagation.

### Before the first live Codex run

4. **Create/approve a dedicated OpenAI Platform API project/key for this experiment.**
   - Keep billing/security separate from Claire's ChatGPT product login.
   - Apply the lowest practical project budget/rate boundary available.

5. **Place the API key into the private repository's GitHub Actions secret/environment store.**
   - Claire may need to use GitHub UI and MFA.
   - The secret value must never be shown to Primary or Codex.

6. **Review and approve the prepared workflow/harness before enabling the live run.**
   - Primary performs Architecture/Security QC first.
   - Claire performs the human authorization decision.

7. **Authorize exactly one measured live dispatch.**
   - After that authorization, Claire does not perform per-task actions in the measured path.

### After evidence review

8. **Functional acceptance and cleanup authorization.**
   - approve secret revocation;
   - approve disabling workflow/connector access if temporary;
   - archive or delete disposable repository according to the agreed evidence-retention window.

### Claire should NOT do during the measured happy path

Claire should not:

- paste a Work Order into Codex;
- start a Codex Task;
- click Run workflow;
- copy a task ID or status between agents;
- click Create PR;
- run a shell command;
- manually edit `dispatch-target.txt`;
- tell Primary that Codex finished.

If any of those are required, the experiment has not yet removed the Human Relay.

---

## 11. What Primary Agent should do

Primary retains architecture ownership and independent verification.

### Phase 3 preparation

1. preserve PR #30 as Phase 2 evidence; merge only after normal QC/acceptance policy, not merely because this plan references it;
2. verify official provider documentation/current versions immediately before the live experiment;
3. prepare the implementation Work Order for Codex after the private repository and access boundary exist;
4. require Codex to implement only the sandbox/workflow/harness, not to decide the architecture;
5. review every workflow permission, Action pin, secret reference, input parser, changed-path guard, timeout and publication step;
6. reject any implementation that requires Claire to operate shell/runner infrastructure.

### Measured live dispatch

Primary, not Claire, should:

1. read the sandbox source SHA and Work Order from GitHub;
2. generate a nonce;
3. create the structured dispatch Issue using the existing GitHub connector;
4. observe GitHub workflow state/evidence;
5. inspect resulting commit, exact diff, test result and PR;
6. verify Issue number + nonce + source SHA correlation;
7. classify the experiment Confirmed / Partial / Failed without trusting Codex's own final statement.

---

## 12. What should be delegated to Codex

Codex should receive implementation work only after Claire has authorized the sandbox boundary and the repository is available.

### Work Order P3-PREP — Build the dispatch sandbox

Recommended scope:

- create the synthetic Work Order and target file;
- implement the Issue-triggered GitHub Actions workflow;
- use the official OpenAI Codex GitHub Action;
- implement strict dispatch-envelope parsing/validation;
- implement the two-job execution/publication separation;
- implement patch artifact transfer;
- implement deterministic changed-path/content tests;
- implement nonce branch/commit/PR publication;
- implement timeout/fail-closed behavior;
- add documentation for permissions, secrets by symbolic name only, evidence and cleanup;
- statically validate YAML/scripts as far as possible without requiring the live OpenAI secret;
- commit/publish implementation for Primary QC.

### Explicit P3-PREP exclusions

Codex must not:

- create or inspect the OpenAI API key;
- request Claire to paste a key into chat;
- execute the measured dispatch itself;
- broaden GitHub permissions because it is convenient;
- introduce Netlify, Supabase, DigitalOcean or a persistent runner unless a blocking requirement is demonstrated and escalated;
- replace the closed Issue schema with arbitrary prompt/shell input;
- merge or deploy after its own report;
- decide that a failed provider capability should be silently worked around with a broader secret.

### Stop / escalation conditions for the implementation Work Order

Codex must stop and report `Decision Required` when:

- the official Codex Action cannot support the required synthetic workspace write under a safe sandbox;
- the private repository settings prevent the proposed Issue/Actions trigger model;
- built-in `GITHUB_TOKEN` cannot publish the required branch/PR under the intended permissions;
- implementation would require exposing the OpenAI API key outside the Codex execution step;
- an architectural change would add a new service, long-lived host, PAT, GitHub App or database;
- there are two materially different security interpretations and choosing one would change trust boundaries.

"I found a harder path and implemented it anyway" is not an escalation protocol.

---

## 13. Phase 3 implementation sequence

### Gate 0 — Primary QC complete

Status after this document: **architecture candidate selected; no live infrastructure authorized yet.**

### Gate 1 — Claire creates/authorizes disposable private sandbox

Required outputs:

- repository identity;
- repository privacy confirmed;
- ChatGPT GitHub connector access confirmed;
- Codex task/workspace access path confirmed for preparation work.

No OpenAI API secret is required yet.

### Gate 2 — Codex P3-PREP implementation

Primary writes a bounded Work Order in the private repository.

Claire performs the current one-time Human Relay only to start that preparation Codex Task if direct Primary → Codex dispatch does not yet exist.

Codex implements workflow/harness and returns GitHub-visible evidence.

### Gate 3 — Primary implementation/security QC

Primary independently reviews:

- Actions source/pins;
- workflow triggers and `if` gates;
- exact permission blocks per job;
- checkout credential persistence;
- OpenAI secret exposure scope;
- Codex sandbox/timeout;
- issue parser and injection handling;
- patch isolation;
- deterministic validation;
- publication authority;
- evidence correlation and redaction;
- cleanup path.

Do not proceed on "looks reasonable" if a secret or publication boundary is ambiguous.

### Gate 4 — Claire secret/billing authorization

Only after code QC:

- create dedicated OpenAI Platform API key/project boundary;
- store secret through GitHub UI/approved secret store;
- confirm spend/rate controls;
- authorize one live dispatch.

### Gate 5 — Measured happy path

Primary creates the dispatch Issue.

Claire does nothing operational.

Success requires:

```text
Primary created Issue
→ GitHub automatically started workflow
→ official Codex Action executed
→ Codex produced expected workspace patch
→ independent second job validated it
→ harness published branch/commit/PR
→ Primary independently verified all evidence
```

### Gate 6 — Narrow failure tests

Only after the happy path is proven, add a small second Work Order or controlled test set for:

- malformed Issue body;
- stale/invalid SHA;
- duplicate nonce;
- unexpected second-file modification;
- revoked/invalid OpenAI key;
- timeout.

Do not inflate the first live run into a miniature zero-trust platform certification ceremony.

### Gate 7 — cleanup and decision

Classify:

- **Confirmed**: Human Relay removed for dispatch through publication/verification;
- **Partial**: some autonomous boundaries work but one human action remains;
- **Failed**: no safe end-to-end path under current provider surfaces.

Then decide whether to:

- preserve Issue-based dispatch as the minimal phone;
- build a richer App/MCP admission bridge;
- investigate two-way question/escalation;
- revisit native Codex Cloud dispatch later.

---

## 14. Evidence contract

The same correlation set should appear across the transaction:

```text
repository
source SHA
Issue number
nonce
Work Order path
workflow run ID
Codex Action / CLI version
patch hash or safe artifact identity
commit SHA
PR number
```

Success evidence must show all of the following:

1. the dispatch Issue was created through Primary's connected GitHub capability;
2. Claire did not perform a per-dispatch execution action;
3. the Issue triggered the expected workflow automatically;
4. Job A executed the official Codex Action on a fresh hosted runner;
5. the Codex job had no GitHub publication authority beyond read access;
6. Job B started from a fresh checkout and independently validated the patch;
7. only the expected file changed to the exact expected content;
8. a branch/commit/PR was created by the trusted publication job;
9. Primary read and matched the evidence independently;
10. no secret appeared in Issue, repository content, diff, PR, safe artifact or visible logs.

A PR by itself is not proof that Codex executed. A successful Codex final message is not proof that the expected file changed. A green workflow is not proof that Claire was removed from the dispatch path. Humans remain distressingly capable of declaring victory at the wrong layer.

---

## 15. Security boundary summary

### Codex is trusted to

- read the fixed synthetic Work Order;
- reason about the tiny requested code/text change;
- write inside the checked-out workspace under sandbox controls;
- emit output/patch evidence.

### Codex is not trusted to

- hold publication authority;
- choose credentials;
- choose repository scope;
- expand the task;
- decide its own success;
- publish directly;
- create infrastructure.

### Harness is trusted to

- validate strict inputs;
- inspect exact diff;
- enforce deterministic acceptance;
- publish only after policy passes.

### Claire is trusted to

- authorize provider/repository access;
- create/store secrets through provider UI;
- approve cost/risk boundary;
- perform final functional acceptance.

### Primary is trusted to

- design scope/boundaries;
- issue dispatch through approved tools;
- review implementation;
- independently verify evidence;
- stop or redesign when provider reality contradicts the plan.

---

## 16. What is intentionally deferred

Phase 3 should not attempt to solve all future collaboration at once.

Deferred:

- Codex → Primary interactive questions/escalation;
- cancellation from ChatGPT UI;
- multiple repositories;
- parallel Codex jobs;
- long-lived job database;
- Supabase status ledger;
- Netlify/MCP dispatch service;
- provider webhooks back into the current conversation;
- production Nook repositories;
- native Codex Cloud task integration;
- multi-agent Coordinator-style fan-out.

The next research question after a successful Phase 3 should likely be:

> Can Codex publish a structured `Decision Required` / question signal into the durable GitHub boundary such that Primary can detect it, answer it, and resume the same unit of work without Claire acting as relay?

That is the beginning of collaboration. Phase 3 first proves that the telephone can ring.

---

## 17. Primary acceptance of the Phase 2 report

Primary judgment on PR #30:

- **Architecture reasoning quality:** accepted.
- **Environment-fit analysis:** accepted.
- **Security instincts:** accepted, with simplification available.
- **Track A caution:** accepted.
- **Persistent-server rejection:** accepted.
- **Need for separate Codex and publication authority:** accepted and strengthened into two jobs.
- **Custom admission bridge as first PoC:** superseded by Issue-triggered dispatch unless repository/provider evidence disproves it.
- **Unknown non-interactive Codex auth:** materially reduced by current official API-key CI guidance and official Codex GitHub Action.
- **Need for custom CLI installation:** superseded for first PoC by official Codex GitHub Action.
- **Need for new GitHub App/PAT at the outset:** not accepted; try built-in workflow `GITHUB_TOKEN` first and escalate only on evidence.

PR #30 remains useful evidence even where this plan supersedes specific implementation choices. The report did its job: it exposed the boundaries clearly enough for independent QC to simplify them rather than blindly inherit them.

---

## 18. Phase 3 go/no-go checklist

Phase 3 implementation may begin when all items below are satisfied:

- [ ] Claire accepts this Phase 3 scope and private-sandbox policy.
- [ ] Disposable private repository exists.
- [ ] ChatGPT GitHub connector can access/create Issues in it.
- [ ] Codex can access the repository for the P3-PREP implementation task.
- [ ] P3-PREP Work Order exists in the private repository.

The first **live** dispatch may begin only after:

- [ ] Codex P3-PREP implementation is GitHub-visible.
- [ ] Primary QC accepts workflow/harness/security boundaries.
- [ ] Claire creates a dedicated OpenAI Platform API key/project boundary.
- [ ] Secret is stored through GitHub's secret UI/store without exposure to either agent.
- [ ] Claire authorizes one measured live run.

No requirement exists for:

- Claire-owned server;
- Docker on iPad;
- always-on VM;
- DigitalOcean droplet;
- Netlify Function;
- Supabase database;
- broad GitHub PAT;
- copying a Codex browser/session credential.

That absence is not an omission. It is the point of the design.