# Application Shell Probe

- Status: Candidate / Ready for Implementation Planning
- Track: Application Shell
- Evidence state: Not implemented; no new runtime evidence yet
- Primary target: Nook Works browser application shell
- Experience priority: iPad-first, with iPhone narrow viewport and desktop sanity
- Review input: `agent-work/reviews/application-shell-experiment-review-v2.md`
- Existing capability baseline: Experiment A, B, B-1, C-DB-1, C-EXT-1

## Why this experiment exists

Nook Works needs more than a responsive menu. The Application Shell is the browser-side composition layer that turns already-verified Auth / Data API / Custom API capabilities into a coherent application lifecycle.

This is therefore an **integration / composition experiment**, not a repeat of earlier provider capability probes.

The live demo should be a deliberately small but real application: it has a real Login page, real Supabase Auth, real `app_user` resolution, a visible Shell, two minimal Feature pages, real data retrieval, routing, sign-out, and responsive behavior. The features are intentionally shallow because the research target is the Shell rather than Feature UI design.

```text
Browser Entry
→ Login / Session Restore
→ Supabase Auth Identity
→ app_user resolution
→ Application Eligibility
→ Application User Context
→ Route Resolution
→ Shell Ready
→ Feature
→ Data Access
→ Rendered Result
```

## Research questions

1. Can the Shell deterministically separate Authentication Identity, Application User eligibility, and Application User Context?
2. Can the normal trunk use real Supabase Auth + `app_user` integration rather than a synthetic identity selector?
3. Can already-verified Native Data API / Custom API mechanisms be composed behind Features without becoming Shell responsibilities?
4. Can `user_type` drive coarse Feature Entry visibility without being mistaken for Role / Permission / backend authorization?
5. Can route, deep-link, refresh and browser history semantics survive bootstrap and sign-out/invalidation?
6. Can the same Shell remain usable on iPad landscape/portrait and iPhone narrow viewports?
7. Which observed behaviors belong to Runtime Evidence, and which still require later Platform Rule / Authorization design?

## Confirmed architecture inputs

### Identity layers

The experiment keeps three layers distinct:

1. **Authentication Identity** — Supabase Auth answers who authenticated.
2. **Application User / Eligibility** — `app_user` maps the Auth Identity into Nook Works and `is_active` determines whether that Application User is currently eligible.
3. **Application User Context** — carries application-level identity such as `app_user_oid`, display identity and `user_type` after bootstrap succeeds.

Authentication success does not itself mean Application Ready. Experiment B already verified that authenticated identities with no `app_user` mapping or inactive `app_user` do not obtain the tested Application Access. This Shell experiment consumes that established model instead of re-proving its RLS mechanism.

### `user_type` scope

Formal schema currently reserves:

- `admin`
- `user`
- `guest`

For this experiment:

- `admin` — In Scope
- `user` — In Scope
- `guest` — **Reserved / Out of Scope**

`guest` currently has no concrete Business Use Case. The experiment does not define guest login behavior, navigation, route access, authorization or responsive acceptance merely because the schema reserves the value.

`user_type` is a coarse Application User classification, not Role / RBAC / Permission architecture.

## Live demo shape

The artifact is one small, actually login-capable Nook Works-style application.

```text
Login
  ↓
Supabase Auth
  ↓
Application User bootstrap
  ↓
Shell
  ├─ Home
  ├─ Business Function
  └─ Common Function
  ↓
Logout
```

### Login versus Shell

The Login surface is the Authentication Entry, not the authenticated Shell itself. The Shell becomes Ready only after Auth and Application User bootstrap complete successfully.

Expected normal transition:

```text
SIGNED OUT
→ AUTHENTICATING
→ LOAD APP USER
→ CHECK ELIGIBILITY
→ BUILD APP CONTEXT
→ RESOLVE ROUTE
→ SHELL READY
```

Representative failure outcomes should include no/invalid session, no `app_user`, inactive `app_user`, Application Context load failure, and malformed/unknown context where a bounded deterministic control is safer than manipulating provider state.

## User fixture

Use two real experiment users for the normal trunk:

| Application User | `user_type` | Business Function | Common Function |
| --- | --- | :---: | :---: |
| Claire | `admin` | Visible / usable | Visible / usable |
| Test User | `user` | Visible / usable | Hidden from Navigation |

No guest account is required.

## Routes and Features

Use three stable content routes:

- `/home` — Shell landing content only; shows enough Application User Context to make successful bootstrap observable.
- `/business` — minimal Business Function.
- `/common` — minimal Common / Control Function.

Only `/business` and `/common` count as Feature pages. `/home` must not grow into a dashboard merely because empty space offends human instincts.

### Business Function

Both `admin` and `user` can enter.

It should perform a real read through an already-verified application data mechanism, preferably Native Data API SELECT against an appropriate safe Business-domain source, then render the returned data in a deliberately simple presentation.

Purpose:

```text
Authenticated Application
→ Shell
→ Business Feature
→ Native Data API
→ Database
→ Rendered Result
```

This does **not** re-test Native CRUD. Experiment B already verified Browser → Auth Session → Native Data API → Grant / RLS → Application Access → CRUD on iPad Safari.

### Common Function

`admin` sees and can enter the Common Feature. `user` does not receive the Navigation entry.

The Feature should also retrieve real data. If a safe existing Custom API can be reused without expanding scope, using a different already-verified access mechanism here is valuable because it demonstrates that the Shell is neutral to Feature data-access implementation:

```text
Business Feature → Native Data API
Common Feature   → Custom API (preferred only if safe/reusable)
```

If Custom API reuse would require substantial new backend work, use a simple real read instead. Custom API capability itself is already verified by C-DB-1 / C-EXT-1 and must not be re-proven for ceremony.

## Visibility, route handling and authorization boundary

The experiment deliberately distinguishes:

```text
Navigation Visibility
≠ Route Handling / Feature Entry
≠ Feature Data Access
≠ Authoritative Backend Authorization
```

For the Test User, `/common` is hidden from Navigation. A direct URL attempt to `/common` must still have a deterministic Shell outcome so the experiment can observe route responsibility.

The experiment must **not** invent a production authorization mechanism, fake a backend `403`, or claim that hidden Navigation protects Common data. If formal backend authorization does not yet enforce `user_type=user → Common data denied`, that remains an input to the separate Authorization / Error Contract design queue.

## Evidence phases

One disposable Shell artifact, three evidence phases.

### Phase A — Bootstrap / Application Context

Verify the application lifecycle around real Auth and real Application User integration.

Evidence should cover:

- Signed-out entry.
- Real login.
- Auth Identity → `app_user` mapping.
- `is_active` eligibility.
- `user_type` / Application User Context establishment.
- Claire / `admin` Ready state.
- Test User / `user` Ready state.
- authenticated-but-no-`app_user` outcome.
- inactive `app_user` outcome.
- representative invalid-session / context-load failure outcome.
- sign-out / invalidation clearing identity-derived state and privileged Shell UI.
- no redirect / retry loop.

Synthetic controls are allowed only for difficult failure states; they must not replace the real normal trunk.

### Phase B — Feature Composition / Navigation / Route

Verify that the established Application Context can drive coarse Feature Entry and real Feature data retrieval.

Evidence should cover:

- `admin`: Business visible and usable; Common visible and usable.
- `user`: Business visible and usable; Common Navigation entry hidden.
- Business Feature obtains and renders real data.
- Common Feature obtains and renders real data for the in-scope admin path.
- direct `/common` attempt as `user` has a deterministic Shell outcome.
- direct/deep link preserves requested route through bootstrap.
- refresh preserves meaningful route semantics.
- Back / Forward behaves as browser route history rather than spawning broken bootstrap instances.
- unknown route has a recoverable deterministic outcome.
- Feature data/error state remains Feature-owned rather than leaking into global Shell state.

### Phase C — iPad-first Responsive / Browser Interaction

Reuse the same stabilized application; do not add Business behavior here.

Primary observations:

- iPad landscape.
- iPad portrait.
- iPhone narrow viewport.
- desktop width sanity check.
- iPad Split View exploratory observation only unless it exposes a blocker.

Human-visible checks should include touch navigation, menu open/close, orientation transition, refresh, Back / Forward, sign-out, loading/error presentation, no necessary horizontal page overflow, no trapped overlay, and no stale privileged content.

Use `admin` as the maximum Navigation Set and `user` as the reduced Navigation Set. Do not create a guest scenario just to manufacture a third responsive matrix row.

Real-device and emulated evidence must be labeled honestly.

## Shell responsibility candidate

Keep global Shell ownership intentionally small:

- Auth/session lifecycle.
- Application User bootstrap and Application User Context.
- current route / route resolution.
- Navigation / Feature Entry visibility.
- Shell navigation UI state.
- bootstrap / Shell-level loading and unexpected error state.
- sign-out and identity-derived state invalidation.
- browser-safe runtime configuration boundary.

Feature data, CRUD/form state, server result caches, Feature validation and Feature-specific API errors do not belong in Shell global state merely because the Shell contains the Feature.

## Existing evidence reused rather than repeated

The Shell experiment should compose, not duplicate, established capability evidence:

- Experiment A — Supabase Auth.
- Experiment B — Native Data API CRUD / Application Access.
- Experiment B-1 — Native View Read Model.
- C-DB-1 — authenticated Browser → Custom API → database-centric path.
- C-EXT-1 — authenticated Custom API composition / External API orchestration.

These baselines reduce the amount of backend probing required. New Shell evidence is about the integrated Application Runtime and responsibility boundaries.

## Stop condition

Stop when the same Live Demo provides enough evidence to answer all of the following:

1. Real login can progress through Auth Identity → `app_user` → eligibility → Application User Context → Shell Ready.
2. Signed-out, ineligible, failure and sign-out/invalidation outcomes are deterministic and do not leave stale privileged state or loops.
3. `admin` / `user` coarse Feature Entry visibility behaves deterministically without creating Role / Permission architecture.
4. Business and Common Feature pages perform real data retrieval and render results, proving a complete Application vertical slice rather than a visual-only shell.
5. Direct route, deep link, refresh, unknown route and Back / Forward semantics remain coherent.
6. Hidden Navigation is not presented as Backend Authorization; any missing backend `user_type` authorization remains explicitly open.
7. The same Shell is usable across primary iPad landscape/portrait and iPhone narrow targets, with desktop sanity evidence.
8. Runtime Evidence is clearly separated from still-open Platform Design choices.

Do not continue merely to make the disposable artifact production-ready.

## Explicitly out of scope

- production framework selection
- production router library selection
- global state-management library selection
- component library / Design System selection
- Dynamic Menu / Menu Maintenance
- Role / Permission / RBAC
- `guest` behavior implementation
- production Business Authorization / 401 / 403 / 404 contract
- Feature CRUD / Form / Table / Dialog maintenance patterns
- dashboard design
- PWA / offline behavior
- multi-tab/session synchronization
- OAuth / passkey expansion
- exhaustive Safari/device certification
- full accessibility certification
- production Session Policy
- new backend mechanism work solely to make the demo appear more complete

## Open implementation-planning points

Before implementation, choose only the minimum details needed to execute the probe:

- exact safe Business-domain data source for `/business`;
- exact safe Common-domain data source for `/common`;
- whether an existing Custom API can be reused for one Feature without scope expansion;
- exact deterministic route outcome for a `user` direct `/common` attempt;
- exact visual navigation behavior for iPad portrait versus iPhone narrow;
- exact evidence capture format and experiment catalog metadata.

These are implementation-planning choices unless they expose a Business / Platform decision that requires Claire + Primary judgment.

## Current judgment

The preferred experiment is a **single disposable-but-realistic Nook Works Shell Live Demo with three evidence phases**. The normal path is real: Supabase Auth, `app_user`, Application Context, Shell, Feature entry, data retrieval and rendered result. Synthetic controls are reserved for difficult failure states only.

The experiment exists to verify composition and responsibility boundaries. It does not promote its router, CSS, state mechanism, menu implementation or data-access choice into a Platform Rule merely because the demo works.