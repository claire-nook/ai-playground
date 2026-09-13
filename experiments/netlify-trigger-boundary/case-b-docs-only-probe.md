# Case B Docs-only Trigger Probe

- Date: 2026-09-13
- Status: Verified
- Purpose: provider validation of the Deploy Preview Trigger Boundary.
- Change type: repository-only documentation.

This file intentionally does not modify `public/`, `netlify/functions/`, `netlify/edge-functions/`, `netlify.toml`, or root package manifests / lockfiles.

## Expected Provider Behavior

The Netlify custom ignore rule should classify this Pull Request as `repository_only_change`, return exit code `0`, and stop before dependency installation / build / deploy.

## Provider Result — PR #12

Verified by Netlify Deploy Preview provider log.

Observed changed path:

```text
experiments/netlify-trigger-boundary/case-b-docs-only-probe.md
```

Observed trigger decision:

```text
TRIGGER_DECISION=SKIP reason=repository_only_change
```

Netlify then reported:

```text
User-specified ignore command returned exit code 0. Returning early from build.
```

The deploy was canceled before dependency installation, deployment, cleanup, and post-processing. Netlify UI also showed Deploying / Cleanup / Post-processing as skipped.

## Evidence Judgment

For the tested Deploy Preview scenario, the fresh-base Trigger Boundary correctly distinguishes a repository-only PR and stops the Netlify pipeline before deploy work begins.

This verifies Case B for Deploy Preview. It does not yet verify production push boundary semantics, which remain fail-safe toward deploy until separately researched.
