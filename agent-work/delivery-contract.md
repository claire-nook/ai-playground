# Agent Delivery Contract｜跨派工管道一致交付規範

Effective: 2026-10-11. Owner: Claire / Primary Agent（墨衡）. Applies to Codex and other delegated implementation agents, across **GitHub Work Order** and **Notion Agent Mailbox** dispatch. This contract supersedes older optional-PR / Primary-creates-PR defaults where inconsistent. Historical execution profiles remain evidence, not exceptions.

## Core boundary

Dispatch channel ≠ work nature ≠ delivery destination. **Primary assigns delivery type explicitly before dispatch**; executor must not guess or downgrade it. A task may require multiple deliveries. If any repository change affects executable code, application behavior, infrastructure/deployment configuration, database migrations, scripts, or security/auth behavior, the repository delivery is `CODE_DELIVERY` even when README or reports are also modified. Unclear classification: stop and ask Primary; do not write main.

## Delivery types

| Type | Deliverable | Mandatory path |
| --- | --- | --- |
| `NOTION_REPORT` | Research/discussion/evidence written to the specified Notion page | Write, read back, provide page URL/message ID. No Git change unless separately assigned. |
| `DOC_DELIVERY` | Add/edit/delete documentation or research report in a repository, without behavior-changing files | Dedicated branch → commit → non-force push → remote read-back → report repo/branch/SHA/files → Primary reviews diff and merges. PR is not required. |
| `CODE_DELIVERY` | Any behavior-changing repository artifact, including code, scripts, deployment/configuration, migrations, and mixed code+docs | Dedicated branch → commit → non-force push → **PR mandatory** → report PR URL/head SHA/files/tests/limitations → Primary technical QC → applicable Claire/preview acceptance → Primary merges after gates pass. No direct push to main. |

If multiple outputs are needed, specify e.g. `NOTION_REPORT + DOC_DELIVERY`. The dispatch channel never changes these requirements. **Only Primary's own low-risk documentation edits, confirmed synchronously with Claire, may update main directly** when repository protection and authorization allow; this is not an executor exemption.

## Mandatory Primary dispatch preflight

1. Read this contract via `ai-playground/agent-work/delivery-contract.md` before *any* Codex dispatch, whether Notion or GitHub. Root README and `agent-work/README.md` must route here.
2. State explicit `Delivery Type(s)`, target repository, baseline/ref, output path or Notion page, required QC/acceptance gates, and relevant task scope. Work Order Template and Notion message must both include these fields.
3. Require executor to read current Codex Memory, this contract, target-repository rules, and report which sources were actually read. A link alone is not proof of reading.
4. Review remote diff/PR independently; do not equate executor `Completed` with QC PASS, deployment PASS, or Claire acceptance. For `CODE_DELIVERY`, **no PR means no completed publication**; if executor cannot create PR, report blocked publication and arrange authorized creation before QC/Merge, never silently waive PR.
5. Merge only after appropriate review/acceptance and permission; never assume deployment/preview succeeded.

## Mandatory Executor preflight / publication

- Confirm assigned delivery type; read Memory + contract + target repo instructions. Confirm workspace repo, HEAD, working tree, remote main and target branch. Check remote updates; Fetch/Fast-forward only if safe. Preserve unknown local work; no blind pull/reset/stash/force push.
- Never modify or push `main` for delegated `DOC_DELIVERY` or `CODE_DELIVERY`. Never infer that a local commit is visible remotely.
- Push to a dedicated branch, read back remote publication; distinguish local SHA from remote head SHA. For code, open PR against intended base and confirm its URL; if the available Codex UI requires a human publication step, report the exact remaining gate, without claiming PR exists.
- Report: delivery type(s), read-confirmation, repo, branch, remote head SHA, changed paths, tests/evidence, PR URL for code, Notion page/message ID where applicable, unknowns, and external gates.
- If required source, publication permission, or PR capability is missing, stop that part and return `Cannot Complete` / explicit publication blocker; do not silently use a weaker workflow.
- `Completed` means executor handoff complete, not merge, technical QC, deployment, or human acceptance.

## Review and preview

PR is the durable review node for **every** code change, not ceremony. Netlify Deploy Preview normally follows PR integration; Branch Deploy can preview pushed branches only when configured. Neither preview nor runtime validation may be claimed without checking actual status. For interactive features Claire may verify via iPad Safari before merge; other external gates are set by Primary.

## Historical rule precedence

Older `agent-work/README.md`, `dispatch-handoff.md`, Work Order Template, and Notion Memory passages mentioning optional PR or Primary-created PR for code are **superseded** by this 2026-10-11 delivery contract. Primary may help create a PR when executor tooling cannot, but **must not merge code without a PR**. Repository-specific stricter safety rules continue to apply.
