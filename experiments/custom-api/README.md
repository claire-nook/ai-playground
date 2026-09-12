# Experiment C — Supabase Custom API

## C-0 — GitHub Actions Deployment Lifecycle

- Date started: 2026-09-12
- Status: In Progress
- Goal: verify that a Supabase Edge Function stored in this repository can be deployed from a manually triggered GitHub Actions workflow and invoked as a real HTTP API.

## Scope

This phase intentionally excludes Database, Supabase Auth, application authorization, business rules, and transactions.

The first deployment artifact is deliberately tiny:

```text
GitHub Repository
→ Claire manually runs GitHub Actions workflow
→ temporary GitHub-hosted Linux Runner
→ Supabase CLI
→ deploy hello-action
→ Supabase Edge Function
→ public HTTP invocation
```

Function source:

`supabase/functions/hello-action/index.ts`

Deployment workflow:

`.github/workflows/deploy-hello-action.yml`

Expected endpoint:

`https://cctonymfrxneonxryqei.supabase.co/functions/v1/hello-action`

Expected JSON shape:

```json
{
  "message": "Hello from GitHub Actions",
  "runtime": "Supabase Edge Function",
  "experiment": "C-0"
}
```

## Security / Credential Boundary

`hello-action` is intentionally deployed with JWT verification disabled because C-0 only verifies deployment and invocation and exposes no Database, Auth, private data, or business capability.

The Supabase Project Ref is public metadata and may exist in the workflow.

`SUPABASE_ACCESS_TOKEN` is a secret and must never be committed to the repository or printed in workflow logs. The deployment workflow reads it only from GitHub Actions Secrets.

## Evidence still required

C-0 is not complete until actual runtime evidence exists for:

1. Claire manually starts `Deploy Hello Action` from GitHub Actions.
2. GitHub-hosted Runner installs Supabase CLI successfully.
3. `hello-action` deploys to Nook Core successfully.
4. The public endpoint returns the expected JSON.
5. GitHub Actions can later delete `hello-action` and the endpoint becomes unavailable.

The delete step is intentionally part of the experiment: deployment without a proven cleanup path is not a complete deployment lifecycle.

## Why C-0 exists

Experiment C will eventually compare a self-written Custom API against Native Data API / View / RPC approaches. Before adding Database semantics, C-0 first proves the more primitive dependency: **can the API actually be deployed, invoked, and removed through the chosen iPad-first workflow?**

Writing a magnificent API that cannot be shipped would be an impressively sophisticated way to produce nothing.
