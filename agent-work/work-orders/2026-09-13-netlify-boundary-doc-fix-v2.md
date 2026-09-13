# Work Order — Netlify Boundary Documentation Fix v2

- Date: 2026-09-13
- Repository: `claire-nook/ai-playground`
- Primary Agent: ChatGPT Project Agent
- Executor: Codex
- Work Type: Documentation consistency fix
- Status: Ready for execution
- Source Audit: `agent-work/reports/2026-09-13-netlify-boundary-doc-audit.md`

## Why v2 exists

The first execution attempt correctly stopped because its Preflight assumed a conventional Git clone with a configured remote and local `main` ref. The observed Codex cloud workspace instead used a clean local `work` branch at the expected repository snapshot, without exposing those conventional Git markers. This v2 adapts Preflight to the observed Codex workspace model. The stopped attempt made no file changes.

## Objective

Apply only the four stale Browser Artifact path corrections accepted from NBDA-001 and NBDA-002.

## Preflight

In the Codex cloud workspace, absence of a configured Git remote, local `main` ref, or GitHub CLI session is not by itself a failure.

Before editing, confirm:

1. This v2 Work Order exists at `agent-work/work-orders/2026-09-13-netlify-boundary-doc-fix-v2.md`.
2. The accepted Audit Report exists at `agent-work/reports/2026-09-13-netlify-boundary-doc-audit.md`.
3. Repository structure includes `experiments/`, `public/`, `evidence/`, `knowledge/`, and `agent-work/`.
4. Working tree is clean before editing.
5. Target documents and replacement Browser Artifacts exist.

Stop before editing if any of these checks fails.

## Approved changes

Modify only these two files and only these four current Artifact references:

`experiments/data-api/README.md`
- `experiments/data-api/index.html` → `public/data-api/index.html`

`evidence/index.md`
- `experiments/auth/index.html` → `public/auth/index.html`
- `experiments/data-api/index.html` → `public/data-api/index.html`
- `experiments/data-api-view/index.html` → `public/data-api-view/index.html`

## Guardrails

- Preserve historical evidence and historical path narration elsewhere.
- Do not change repository structure, Knowledge Architecture, Netlify configuration, Trigger Boundary, Browser Artifact files, or runtime code.
- Do not perform opportunistic cleanup or wording/formatting improvements.
- Report any newly discovered issue without fixing it.
- Minimal Diff Principle: expected content change is four path replacements across two files.

## Validation

Confirm all four approved current references are corrected, replacement paths exist, only the two approved files changed, and diff/whitespace checks pass.

## Deliverable

Create a local commit containing only the approved fixes and prepare the change for the Codex product's Create PR flow against `main`. Do not merge. Report the local commit SHA; after the PR is published, Primary Agent will review the GitHub-visible PR.
