# Case B Docs-only Trigger Probe

- Date: 2026-09-13
- Purpose: provider validation of the Deploy Preview Trigger Boundary.
- Change type: repository-only documentation.

This file intentionally does not modify `public/`, `netlify/functions/`, `netlify/edge-functions/`, `netlify.toml`, or root package manifests / lockfiles.

Expected provider behavior: the Netlify custom ignore rule should classify this Pull Request as `repository_only_change`, return exit code `0`, and stop before dependency installation / build / deploy.

Actual provider result remains pending until the Netlify Deploy Preview log is reviewed.
