# Work Order — Netlify Boundary Documentation Fix

- Date: 2026-09-13
- Repository: `claire-nook/ai-playground`
- Primary Agent: ChatGPT Project Agent
- Executor: Codex
- Work Type: Documentation consistency fix
- Status: Ready for execution
- Source Audit: `agent-work/reports/2026-09-13-netlify-boundary-doc-audit.md`

## Objective

Apply only the documentation corrections accepted from the Netlify Boundary Documentation Audit. The purpose of this pass is to remove four stale Browser Artifact paths left after the repository separated Experiment Records under `experiments/` from deployable Browser Artifacts under `public/`.

This is an execution pass, not a new architecture review.

## Preflight — Required Before Editing

Before making any change, confirm all of the following:

1. The active repository is exactly `claire-nook/ai-playground`.
2. The working base is the current `main` branch (or a fresh work branch created from current `main`).
3. This Work Order exists at `agent-work/work-orders/2026-09-13-netlify-boundary-doc-fix.md`.
4. The accepted Audit Report exists at `agent-work/reports/2026-09-13-netlify-boundary-doc-audit.md`.

If any preflight check fails, stop without modifying files and report the mismatch.

## Approved Findings

### NBDA-001 — Experiment B Record

Update the current Artifact metadata in:

`experiments/data-api/README.md`

From:

`experiments/data-api/index.html`

To:

`public/data-api/index.html`

### NBDA-002 — Evidence Index

Update exactly these three current Artifact metadata references in:

`evidence/index.md`

- `experiments/auth/index.html` → `public/auth/index.html`
- `experiments/data-api/index.html` → `public/data-api/index.html`
- `experiments/data-api-view/index.html` → `public/data-api-view/index.html`

## Scope Guardrails

Allowed:

- Modify only `experiments/data-api/README.md` and `evidence/index.md` for the four approved stale Artifact path corrections.
- Run repository searches and Markdown/path consistency checks to verify the fixes.
- Create the execution commit and Pull Request.

Not allowed:

- Do not rewrite, normalize, or modernize historical evidence describing the former root-publish layout.
- Do not modify `experiments/netlify-deployment-boundary/README.md` historical narration.
- Do not change the Knowledge Architecture, repository structure, Netlify configuration, Trigger Boundary, Browser Artifact files, or runtime code.
- Do not make opportunistic cleanup, wording improvements, formatting changes, or unrelated documentation fixes.
- If another possible issue is discovered, report it separately without fixing it in this pass.

Minimal Diff Principle applies: the intended content diff is four path replacements across two existing files.

## Validation

After editing:

1. Confirm none of the four stale paths remains as current Artifact metadata in the two target files.
2. Confirm the replacement paths exist:
   - `public/auth/index.html`
   - `public/data-api/index.html`
   - `public/data-api-view/index.html`
3. Confirm no file other than the two approved target files was modified by the fix.
4. Run an appropriate whitespace/diff sanity check.
5. Preserve historical references elsewhere unless they are part of the four explicitly approved replacements.

## Deliverable

Create a commit containing only the approved fixes, then open a Pull Request against `main`.

The Pull Request description should include:

- Work Order path
- Audit Report path
- NBDA-001 and NBDA-002 as resolved findings
- Files changed
- Validation performed
- Any unexpected issue discovered but intentionally left out of scope

Do not merge the Pull Request. Return the PR number and GitHub-observable commit SHA for Primary Agent review.

## Acceptance Criteria

This Work Order is complete when:

- all four approved stale Artifact paths are corrected;
- only the two approved existing documents are changed;
- historical evidence remains untouched;
- validation passes;
- a reviewable Pull Request exists against `main`;
- no unrelated cleanup or architecture change is included.
