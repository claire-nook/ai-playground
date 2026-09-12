# Experiment C — Supabase Custom API

## C-0 — Supabase Edge Function Deployment Lifecycle

- Date: 2026-09-12
- Status: Completed / Verified
- Primary question: can an iPad-first Nook Works development workflow deploy, invoke, inspect, and remove a Supabase Edge Function without requiring a local Desktop / Mac development machine?
- Secondary question: how do GitHub Actions + Supabase CLI and the ChatGPT Supabase Connector differ as deployment mechanisms?

## Why C-0 exists

Experiment C will eventually compare a self-written Custom API against Native Data API / View / RPC approaches. Before adding Database semantics, C-0 first tested the more primitive dependency: **can the API actually be shipped and managed from Claire's real iPad-first workflow?**

This is intentionally a deployment experiment, not an API architecture experiment. Database, Supabase Auth, application authorization, business rules, transactions, and CORS are excluded from C-0.

The experiment artifact is deliberately tiny. A magnificent API that cannot be deployed is merely an unusually expensive text file.

## Artifact

Function source:

`supabase/functions/hello-action/index.ts`

Response:

```json
{
  "message": "Hello from GitHub Actions",
  "runtime": "Supabase Edge Function",
  "experiment": "C-0"
}
```

The same source and the same function name were used for both deployment mechanisms. The first deployment was deleted and independently verified absent before the Connector deployment began, so the second result is not an accidental observation of the first deployment.

`verify_jwt = false` was intentional for C-0 because the endpoint contains no Database, Auth, private data, or business capability and needed to be directly invoked from Safari. This setting is experimental evidence only and is not a default security recommendation for real APIs.

---

## C-0A — GitHub Actions + Supabase CLI

### Path

```text
GitHub Repository
→ Claire manually runs workflow_dispatch from iPad Safari
→ temporary GitHub-hosted Linux Runner
→ Supabase CLI
→ Nook Core
→ deploy hello-action
→ public HTTP GET
→ GitHub Actions Delete workflow
→ Supabase confirms function absent
```

Deployment workflow:

`.github/workflows/deploy-hello-action.yml`

Deletion workflow:

`.github/workflows/delete-hello-action.yml`

### Deployment Evidence

Claire manually started `Deploy Hello Action` from GitHub Actions.

Verified GitHub runtime evidence:

- Workflow: `Deploy Hello Action`
- Run ID: `34700593732`
- Event: `workflow_dispatch`
- Result: `success`
- Head SHA: `7896cd39000fd92398ddab7c6adabdf4ab2dd1d7`
- Job ID: `103571539133`
- Runner: Linux X64 / Ubuntu 24.04.5 LTS
- Supabase CLI: `2.117.0`
- Edge Runtime image observed in deployment log: `ghcr.io/supabase/edge-runtime:v1.74.3`
- Function script size reported by CLI: `794 B`

CLI deployment result:

```text
Deploying Function: hello-action (script size: 794 B)
Deployed Functions on project cctonymfrxneonxryqei: hello-action
```

Claire then opened the public function URL in iPad Safari and observed the expected JSON response. Supabase Dashboard also showed `hello-action` in Nook Core with successful requests and no observed 5xx responses during the experiment.

This Browser evidence matters because an AI-side web fetch limitation is not evidence that a real Browser invocation failed.

### First Deletion Evidence

Claire manually started `Delete Hello Action`.

- Run ID: `34701381528`
- Run number: `1`
- Event: `workflow_dispatch`
- Result: `success`
- Head SHA: `fabfce70d8085066a1c72da930661169df07163b`
- Job ID: `103573649723`
- Supabase CLI: `2.117.0`

CLI result:

```text
Deleted Function hello-action from project cctonymfrxneonxryqei.
```

After deletion, the Supabase Connector independently returned an empty Edge Function list for Nook Core.

Therefore C-0A proved a complete lifecycle rather than deployment alone:

```text
Deploy
→ Verify
→ Delete
→ Verify absent
```

---

## C-0B — ChatGPT Supabase Connector Deployment

### Path

After C-0A deletion was independently verified, AI read the existing `supabase/functions/hello-action/index.ts` source from GitHub and deployed that same source directly through the connected Supabase deployment action.

```text
GitHub source
→ ChatGPT Supabase Connector
→ Nook Core
→ deploy hello-action
→ Connector confirms ACTIVE
→ Safari GET returns expected JSON
```

No GitHub Actions Runner was started for this deployment. Claire did not create, paste, or provide another Supabase PAT for the Connector deployment. The Connector used the already-established platform-managed authorization context; this means credential handling is abstracted by the connected platform, not that authentication or credentials do not exist.

### Connector Evidence

Connector deployment result:

- Function: `hello-action`
- Status: `ACTIVE`
- Version: `1`
- `verify_jwt`: `false`
- Function ID: `8d51fd9a-45a0-4919-b98e-30946e356f5f`

A separate Connector list operation immediately confirmed `hello-action` existed and was `ACTIVE` in Nook Core.

Claire then confirmed in Supabase Dashboard that the function appeared, copied its URL, opened it in Safari, and received the expected JSON.

Therefore Connector deployment is not merely provider-documentation capability; it was actually exercised against Nook Core on 2026-09-12.

---

## Cross-mechanism Lifecycle Evidence

The Connector available during this experiment could deploy, list, and retrieve Edge Functions, but did not expose an Edge Function delete action. C-0 therefore deliberately tested whether an Edge Function created through one deployment mechanism could be removed through another.

Claire ran the existing GitHub Actions `Delete Hello Action` workflow against the Connector-deployed function.

Second deletion:

- Run ID: `34701914597`
- Run number: `2`
- Event: `workflow_dispatch`
- Result: `success`
- Head SHA: `fabfce70d8085066a1c72da930661169df07163b`
- Job ID: `103575072707`
- Supabase CLI: `2.117.0`

CLI result was identical to the first deletion:

```text
Deleted Function hello-action from project cctonymfrxneonxryqei.
```

The two deletion runs used the same workflow, same source commit, same CLI version, same successful step structure, and the same Supabase CLI success message. They ran on different ephemeral GitHub-hosted machines / Azure regions, as expected for GitHub-hosted Runners.

After the second deletion, the Supabase Connector again returned:

```json
{
  "functions": []
}
```

### Observation

Within the tested conditions, Supabase project state did not require the deletion mechanism to match the original deployment mechanism.

```text
GitHub Actions Deploy → GitHub Actions Delete     ✅
Connector Deploy      → GitHub Actions Delete     ✅
```

This supports treating deployment transport and deployed Edge Function state as separable concerns. It does not prove that every future deployment mechanism will always be interoperable; provider behavior should be revalidated when capabilities change.

---

## Credential / Security Findings

### GitHub Actions route

C-0A required a Supabase Personal Access Token (PAT) so the GitHub-hosted Runner could use Supabase CLI against Nook Core.

At experiment time, Claire's Supabase account UI did not expose the documented Scoped PAT capability. The available normal token creation path produced a Classic PAT with broad account-level authority. For the experiment, Claire therefore created a temporary Classic PAT named `github-actions-c0-temp` with a 1-hour expiry and stored it only as the GitHub Actions repository Secret `SUPABASE_ACCESS_TOKEN`. The token value was never shared with AI or committed to GitHub.

GitHub Actions logs showed:

```text
Secret source: Actions
SUPABASE_ACCESS_TOKEN: ***
```

This confirms Secret injection and log masking worked in the observed runs. However, masking does not reduce the underlying credential's authority.

The important risk is **credential blast radius**: a broad Classic PAT is disproportionately powerful for the narrow job of deploying or deleting one Edge Function. Repository privacy, GitHub Secret encryption, short expiration, workflow permissions, and manual `workflow_dispatch` all reduce exposure probability, but they do not make a broad credential narrow if it is obtained or misused.

For a formal private development repository, private visibility is an important additional control and materially reduces casual repository / workflow exposure. It should still not be confused with least-privilege credential design.

Other GitHub Actions considerations include workflow modification risk, third-party Action supply-chain risk, Secret lifecycle, collaborator permissions, and accidental credential output. None of these make GitHub Actions inherently unsafe; they mean the deployment credential must be treated as part of the architecture rather than as plumbing nobody talks about until Friday night.

### Connector route

The Connector deployment did not require Claire to create or inject a separate PAT into GitHub Actions. This removes an entire user-managed credential path:

```text
Classic PAT
→ GitHub Secret
→ Workflow
→ Runner
→ Supabase
```

For the tested operation, the Connector instead used an already-established platform-managed authorization context. AI did not receive the raw credential value.

This is a meaningful credential-management advantage under the current condition where the available GitHub Actions PAT is broad. It is **not sufficient evidence to claim that Connector deployment is universally more secure**. Connector authorization scope, platform controls, auditability, available actions, and future capability changes remain relevant.

### Current comparison

| Area | GitHub Actions + CLI | Supabase Connector |
| --- | --- | --- |
| Deploy | Verified | Verified |
| Inspect / list | Via CLI / Dashboard | Verified |
| Delete | Verified | Not exposed by Connector at experiment time |
| Claire-managed PAT | Required for tested CLI route | Not required for tested Connector route |
| Broad Classic PAT risk | Present under current Supabase account capability | Not part of tested Connector path |
| Source / commit / run traceability | Strong | Source can remain in GitHub, but deployment audit path differs |
| Human approval | Strong via `workflow_dispatch` | Conversation authorization / Connector permission model |
| Complete tested lifecycle | Yes | No, required Actions for deletion |

The result is not a winner-takes-all decision. GitHub Actions currently has stronger explicit lifecycle / CI-CD governance; Connector currently has cleaner user-managed credential handling for deployment.

---

## iPad-first Development Finding

This is the highest-level finding of C-0.

Before the experiment, a plausible dependency chain was:

```text
iPadOS lacks a conventional local Desktop CLI environment
→ Supabase CLI deployment may be blocked
→ Edge Functions may require a Mac / PC development machine
```

C-0 disproved that dependency for the tested Supabase Edge Function deployment lifecycle.

Observed working paths:

```text
iPad
→ GitHub / repository
→ GitHub Actions temporary Linux Runner
→ Supabase CLI
→ Edge Function deploy / delete
```

and:

```text
iPad + ChatGPT
→ Supabase Connector
→ Edge Function deploy
```

### Evidence-supported conclusion

**As of 2026-09-12, Supabase Edge Function source management, deployment, invocation verification, and deletion do not require Claire to own a local Desktop / Mac development machine. The existing iPad-first workflow can delegate missing CLI / Linux execution capability to GitHub-hosted Runners and can also use the Supabase Connector for direct deployment.**

This does **not** mean Claire will never have another reason to buy a Mac mini. It means "Supabase Edge Function deployment requires a Mac mini" is no longer a valid technical purchasing assumption based on current evidence.

That distinction matters. Hardware purchases deserve better justification than one command-line tool holding the architecture hostage.

---

## Decision Triggers for Future Re-evaluation

C-0 is Evidence, not a permanent Platform Rule. Future Technical Decision work should re-evaluate the deployment preference when any of these conditions change:

1. **Scoped PAT becomes available to Claire.** If Supabase allows a credential limited to Nook Core and Edge Functions deployment / deletion, the largest current GitHub Actions security concern becomes substantially smaller.
2. **Connector lifecycle expands.** If the Supabase Connector gains Edge Function deletion, stronger deployment history, approval controls, or clearer fine-grained authorization, Connector may become a stronger primary deployment candidate.
3. **Provider / GitHub Actions behavior changes.** Revalidate stale evidence before high-impact deployment decisions.
4. **Formal production governance requirements become concrete.** Audit trail, environment separation, approvals, rollback, deployment promotion, and ownership may outweigh Playground convenience.

Do not turn the 2026-09-12 result into ancestral law. Preserve the evidence and rerun the judgment when the conditions change.

---

## What C-0 Does Not Prove

C-0 does not yet verify:

- Browser application `fetch()` to the Edge Function across origins / CORS.
- Supabase Auth JWT propagation into a Custom API.
- Application authorization inside an Edge Function.
- Database access from the Edge Function.
- Caller-scoped RLS behavior from a Custom API.
- Business validation / transactions / error contracts.
- Production deployment architecture.
- Whether GitHub Actions or Connector should be the single formal deployment mechanism.

Those belong to later Experiment C phases.

## Final C-0 Result

```text
GitHub Actions + Supabase CLI deployment lifecycle     VERIFIED
Supabase Connector direct deployment                  VERIFIED
Cross-mechanism Connector Deploy → Actions Delete     VERIFIED
iPad Safari real HTTP JSON invocation                 VERIFIED
Local Desktop / Mac required for this lifecycle       NO, under tested conditions
Formal Production deployment mechanism selected       NOT YET
```

C-0 therefore graduates the question from "can Claire deploy Supabase Edge Functions without a Desktop?" to the much more useful next question: "which deployment mechanism should own which responsibility under formal Nook Works security and governance requirements?"
