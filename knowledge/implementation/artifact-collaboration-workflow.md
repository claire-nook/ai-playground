# Artifact Transport and Publication Pattern

- Status: Verified research-derived implementation pattern (2026-09-18)
- Evidence: [A-ARTIFACT-1](../../experiments/artifact-transport/README.md)
- Scope: binary intake, processing, staging, integrity validation, batch publication, and known transport boundaries

## Purpose

This guide records the reproducible publication mechanism demonstrated by A-ARTIFACT-1. It is **not** a private storage policy, agent startup instruction, or account-specific operating guide. Tool availability and authorization must be checked in the execution environment.

## Verified batch publication path

~~~text
Conversation-provided binary
→ local processing (rotate / resize / re-encode / EXIF normalization)
→ output decode / byte length / SHA-256 validation
→ temporary staging upload
→ short-lived single-use download URL
→ batch_json
→ [COLLAB] Artifact Batch Publish (manual workflow_dispatch in tested environment)
→ GitHub Actions binary fetch
→ byte length / SHA-256 / full image decode verification
→ atomic repository commit
→ repository / visual quality check
~~~

Relevant public implementation:

- `.github/workflows/collab-artifact-batch-publish.yml`
- `.github/workflow-contracts/artifact-batch-publish.schema.json`
- `scripts/process-image-artifact.py`
- `scripts/ingest-image-batch-from-urls.py`
- `scripts/ingest-image-from-url.py`

One image is a one-item batch; multiple images use the same batch contract. The experiment verified both. Temporary download URLs must not be persisted into the Repository. Publication destinations must satisfy the workflow allowlist.

## Verified directions and limitations

| Transport / processing | Observation in A-ARTIFACT-1 |
| --- | --- |
| Conversation attachment → local image processing | Verified |
| Processed local artifact → staging upload | Verified |
| Staging URL → GitHub Actions → binary commit | Verified |
| One-item / multi-item batch | Verified |
| Existing Dropbox binary → local processing | Not established |
| Existing GitHub binary → local processing | General path not established |
| Autonomous GitHub workflow_dispatch | Unavailable in tested Connector; human dispatch used |
| GitHub Markdown text → PDF rendering | Verified; binary image inputs need separate materialization |

A successful preview or temporary URL does not prove direct binary access in a separate runtime. Transport direction matters: **local → storage** and **storage → local** are different capabilities.

## PDF rendering boundary

For Markdown-to-PDF implementation, see [Markdown → PDF Rendering Pattern](markdown-to-pdf.md) and `scripts/render-markdown-pdf.py`. Missing referenced image bytes must produce a visible placeholder, not a silent omission. A renderer supporting local images does not imply that repository images are automatically available in its filesystem.

## Evidence and re-verification

The dated [A-ARTIFACT-1 experiment](../../experiments/artifact-transport/README.md) preserves control cases, failures, historical alternatives, lifecycle probe, and integrity evidence. Its observations describe the tested environment, not a guarantee of future Connector capabilities. Re-check permissions, available transport primitives, source bytes, integrity checks, and publication results before repeating the workflow.
