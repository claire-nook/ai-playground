# C-NF-0 — Netlify Functions Deployment Lifecycle

- Date: 2026-09-13
- Status: Completed / Verified
- Question: 在沒有 conventional local development environment 的 iPad-first workflow 下，能否只以 GitHub source + Netlify Git deployment 完成 Custom API 的 create / preview / invoke / observe / production / delete lifecycle？

## Scope

這是昨日 Supabase C-0 的 sibling experiment。刻意排除 Database、Auth、CORS、business logic，只驗證 deployment/runtime lifecycle。

Probe source 曾位於：

`netlify/functions/hello-netlify.mjs`

Response：

```json
{
  "message": "Hello from Netlify Functions",
  "runtime": "Netlify Functions",
  "experiment": "C-NF-0"
}
```

## Source → Provider Path

```text
GitHub source
→ PR #14
→ Netlify Deploy Preview #14
→ preview Function + endpoint + runtime log
→ merge to main
→ Production Function
→ delete source from main
→ Production Function removed
```

No local CLI、Netlify CLI、GitHub Actions deployment workflow 或 Codex workspace was required for this probe.

## Evidence

### Deploy Preview

PR #14 added only `netlify/functions/hello-netlify.mjs`.

Netlify build log observed：

```text
0 new file(s) to upload
1 new function(s) to upload
Site deploy was successfully initiated
```

Claire invoked the Deploy Preview endpoint from iPad Safari and received the expected JSON. Netlify `Cloud compute → Functions` showed：

- `1 function actively running in Deploy Preview #14`
- Function: `hello-netlify`
- provider-generated preview endpoint
- Function log with real invocations
- observed runtime telemetry included Duration and Memory Usage
- UI stated Function logs retained for 24 hours

This verifies that a PR can carry an independently invokable and observable Custom API before merge.

### Production

PR #14 was merged to `main` as commit:

`d3a557c7b36a1e5a602f44ee3122bb1f765c7a7e`

After Netlify Production deployment, `Cloud compute → Functions` showed：

```text
1 function actively running in production.
hello-netlify
```

Therefore the Git-connected path promoted the Function from PR source to Production without a separate deployment command.

### Deletion

The probe source was then deleted directly from `main`:

`netlify/functions/hello-netlify.mjs`

Deletion commit：

`47dbd98f3242ef56b5cba6fd013f1d7ef821922d`

After the resulting Production deployment, Claire observed：

```text
0 functions actively running in production.
```

No provider-side delete command was issued. Within the tested conditions, removal from the deployed Git source was sufficient to remove the Production Function.

## Verified Finding

```text
Create source → Deploy Preview → HTTP invoke → Function log   VERIFIED
Merge source  → Production Function                           VERIFIED
Delete source → Production Function absent                    VERIFIED
Local Desktop / local CLI required                            NO
Separate provider delete command required                     NO, under tested Git deployment path
```

For this experiment, Netlify Function state behaved as a deploy artifact derived from Git source rather than as a separately managed resource lifecycle.

## Operational Observation

The tested iPad-first path is notably Git-native：create / update / delete can be expressed as repository changes, while PRs receive a Deploy Preview endpoint and Function logs before Production merge. This is useful Evidence for later platform comparison, not yet a decision that Netlify Functions should replace Supabase Edge Functions.

## Not Proven

C-NF-0 does not verify Database access、Supabase Auth / JWT propagation、Application Authorization、CORS、secrets、runtime limits、cost、rollback、formal Production governance，or comparative suitability versus Supabase Edge Functions. Those remain separate questions.
