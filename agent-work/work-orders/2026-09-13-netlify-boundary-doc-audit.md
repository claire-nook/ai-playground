# Work Order — Netlify Boundary Documentation Audit

- Status: `Ready`
- Work Type: `Investigation / Review Support`
- Intended Executor: `Codex`
- Target: `claire-nook/ai-playground` / `main`

## Objective

Audit the repository documentation after the Netlify deployment-boundary restructure. Produce findings for Primary Agent review before any fixes are made.

Current structure:

```text
experiments/ = Experiment records and research context
public/      = Netlify static browser artifacts
```

Current browser artifacts are `public/index.html`, `public/auth/index.html`, `public/data-api/index.html`, and `public/data-api-view/index.html`.

The Netlify Publish directory is now `public` and this boundary has been verified. The separate question of which Git changes should trigger a deploy is still open.

## Read First

Read the repository root documentation and the relevant material under `agent-work/`, `experiments/`, `evidence/`, `knowledge/`, and `notes/`, especially the Netlify deployment-boundary experiment and the Auth / Data API experiment records.

## Audit Scope

Search the whole repository for:

- stale references to browser artifacts under `experiments/`
- broken or outdated relative links
- descriptions that still imply the repository root is the Netlify publish output
- confusion between current architecture and historical evidence
- other documentation inconsistencies caused by the restructure

Do not limit the audit to already-known stale paths.

## Important Boundary

This is an audit-only pass. Do not edit existing project documents, source files, directory structure, or deployment settings. Historical statements should not be treated as errors merely because they describe an older state.

## Report

Create only:

`agent-work/reports/2026-09-13-netlify-boundary-doc-audit.md`

For each finding include:

- Finding ID
- Severity
- Category
- Location
- Current statement or reference
- Why it may be inconsistent
- Recommended disposition
- Confidence
- Decision Needed: Yes / No

Also include an Executive Summary, Confirmed Clean Areas, Historical Statements Preserved, and Unknown / Decision Needed.

Commit the report and return the commit SHA. Do not perform fixes in this pass. Primary Agent will review the report first.