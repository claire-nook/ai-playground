# Application Shell Probe

- Status: Candidate / Discussion Draft
- Track: Application Shell
- Evidence state: Not implemented; no new runtime evidence yet
- Primary target: Nook Works browser application shell
- Experience priority: iPad-first, with iPhone narrow viewport and desktop sanity
- Review input: `agent-work/reviews/application-shell-experiment-review-v2.md`

## Why this experiment exists

Nook Works needs more than a responsive menu. The Application Shell must establish and maintain the browser-side application lifecycle before a feature can safely and predictably run.

This experiment asks whether one deliberately disposable but realistic Shell artifact can combine:

`Browser Entry → Bootstrap → Supabase Auth Identity → APP_USER eligibility → Application User Context → Route Resolution → Shell Ready`

and reliably invalidate identity-derived state on sign-out or invalid session, while presenting the same Shell coherently across iPad and iPhone responsive layouts.

The experiment is not intended to choose or produce the production application framework.

## Research questions

1. Can the Shell deterministically separate Authentication Identity, Application User eligibility, and Application User Context?
2. Can a real Supabase Auth + APP_USER happy path establish `user_type` and Shell context without treating UI visibility as backend authorization?
3. Can difficult failure states be reproduced with bounded deterministic test controls without turning the experiment into a fake application?
4. Can route/deep-link/history semantics survive bootstrap, refresh, back/forward, and invalidation?
5. Can one Shell structure remain usable on iPad landscape/portrait and iPhone narrow viewports without becoming separate navigation systems?
6. What responsibilities belong to the Shell, and what must remain outside it?

## Confirmed architecture inputs

### Identity layers

The experiment must keep these layers distinct:

1. **Authentication Identity** — Supabase Auth answers who authenticated.
2. **Application User** — `APP_USER` answers whether that identity is eligible to use Nook Works.
3. **Application User Context** — carries application-level context such as `app_user_oid`, display identity and `user_type`.

Authentication success does not by itself mean Application eligibility.

### `user_type`

`APP_USER.user_type` is a single coarse Application User classification:

- `admin`
- `user`
- `guest`

It is not Role/RBAC/Permission architecture. `guest` is an eligible Application User type and is not synonymous with anonymous/signed-out.

Shell may use `user_type` for coarse Navigation / Feature Entry visibility. Hidden UI is not an authoritative backend authorization boundary.

## Experiment shape

One disposable Shell artifact, two evidence checkpoints.

### Checkpoint A — Lifecycle / Integration

Use a **hybrid probe**:

- Real integration for the normal trunk: Supabase Auth → authenticated identity → APP_USER lookup → eligibility / `is_active` → `user_type` → Application User Context.
- Deterministic synthetic controls only for states that are costly or unreliable to manufacture against provider/runtime state, such as invalid/expired restore outcome, context lookup failure, malformed/unknown context.

The purpose is to obtain real integration evidence without turning provider failure simulation into the experiment itself.

### Checkpoint B — Responsive / Human Experience

Reuse the same lifecycle artifact after Checkpoint A stabilizes. Observe the Shell at:

- iPad landscape — primary
- iPad portrait — primary
- iPhone narrow — primary responsive target
- desktop width — sanity only
- iPad Split View — exploratory observation, not a full acceptance matrix unless it exposes a blocker

This checkpoint evaluates Shell structure, touch navigation, viewport transitions, deep links and browser history. It does not evaluate full Feature UI aesthetics.

## Minimal synthetic feature fixture

Use only three stable synthetic feature entries:

| Entry | admin | user | guest |
| --- | :---: | :---: | :---: |
| `home` | Visible | Visible | Visible |
| `workspace` | Visible | Visible | Hidden |
| `admin-inspector` | Visible | Hidden | Hidden |

This 3 / 2 / 1 staircase is intentionally sufficient to prove coarse visibility without creating a permission engine, dynamic menu model or role administration UI.

Direct URL attempts to a hidden entry are used to illustrate that:

`Navigation Visibility ≠ Route Attempt ≠ Backend Authorization`

The experiment must not invent a backend `403` or relabel empty RLS results as authorization denial merely to make the demo look complete.

## Initial lifecycle outline

```text
ENTRY
  ↓
BOOTSTRAP
  ├─ no / invalid session → SIGNED OUT
  └─ valid session
          ↓
     LOAD APP USER
          ├─ not eligible → INELIGIBLE
          ├─ failed       → SHELL ERROR
          └─ eligible
                 ↓
        BUILD APP CONTEXT
                 ↓
         RESOLVE ROUTE
            ├─ known   → SHELL READY
            └─ unknown → UNKNOWN ROUTE
```

`admin / user / guest` are attributes of Application User Context, not lifecycle states.

On sign-out or session invalidation, the Shell must clear Application User Context, `user_type`-derived navigation, and protected visible content before reaching the next stable signed-out state.

## Route / browser behavior to preserve

The experiment should use observable browser URL/history semantics rather than fake buttons that only swap DOM content.

Minimum behaviors:

- Menu selection changes route/content.
- Direct URL/deep link preserves the requested route through bootstrap.
- Refresh does not silently reset every route to home.
- Back/forward behaves as route history, not a second bootstrap instance.
- Unknown route has a deterministic recoverable outcome.
- No redirect/retry loop.

No production router library is selected by this experiment.

## Shell-owned state candidate

Keep global Shell ownership intentionally small:

- Auth state
- Application User Context
- current route
- Shell navigation UI state
- bootstrap / Shell-level error state

Feature data, form state, CRUD state, server result caches and feature validation do not belong in Shell global state merely because they exist in the application.

## Error ownership candidate

Shell-level error handling is limited to failures that prevent the application lifecycle from being established or maintained, such as:

- bootstrap failure
- Application User Context load failure
- unexpected Shell-level failure

Feature-specific validation, CRUD errors and external API errors remain feature responsibilities.

## Visual / RWD outline

The visual artifact should look recognizably like a Nook Works application shell rather than a raw technical harness, while avoiding premature Design System decisions.

Minimum visible regions:

- application identity / top-level chrome
- responsive Navigation surface
- route/content outlet
- current Application User affordance and sign-out
- bootstrap/loading presentation
- Shell-level error / unknown-route presentation

Candidate responsive behavior may include expanded navigation on wider iPad layouts and drawer/overlay navigation on narrow layouts, but exact breakpoints, dimensions, logo treatment, colors and portrait navigation pattern remain discussion/demo decisions rather than confirmed platform rules.

## Evidence checkpoints

### A. Lifecycle / Integration Evidence

Expected evidence should show:

- real Auth → APP_USER → `user_type` normal trunk
- signed-out outcome
- authenticated-but-ineligible outcome
- representative deterministic context failure / invalid-session outcome
- stable 3 / 2 / 1 entry visibility
- direct-route outcome without claiming client visibility is authorization
- sign-out/invalidation removes stale privileged Shell UI/content
- requested route and final outcome are observable

### B. Responsive / Human Evidence

Expected evidence should show:

- iPad landscape and portrait Shell states
- iPhone narrow maximum and reduced navigation states
- desktop sanity state
- touch menu interaction
- orientation/viewport transition behavior
- refresh and back/forward behavior
- exploratory iPad Split View observation

Screenshots prove static presentation only; dynamic behavior needs an action/observation log. Emulated viewport evidence must not be mislabeled as real-device evidence.

## Stop condition

Stop when there is enough evidence to answer:

1. whether Shell lifecycle ownership is deterministic across the selected states;
2. whether real Auth/Application User integration can establish the expected context;
3. whether coarse `user_type` visibility works without creating a permission model;
4. whether route/deep-link/history semantics remain stable;
5. whether the same Shell structure is usable across the primary iPad/iPhone responsive targets;
6. which observed behaviors are Runtime Evidence versus still-open Platform Design choices.

Do not continue merely to make the disposable artifact production-ready.

## Explicitly out of scope

- production framework selection
- production router library selection
- global state-management library selection
- component library / Design System selection
- Dynamic Menu / Menu Maintenance
- Role / Permission / RBAC
- feature-level permission matrix
- production 401/403 UX contract
- real Feature CRUD / Form / Table / Dialog patterns
- PWA/offline behavior
- multi-tab/session synchronization
- OAuth/passkey expansion
- exhaustive Safari/device certification
- full accessibility certification
- production Session Policy

## Open discussion points

The following remain intentionally open for Claire + Primary discussion before implementation:

- exact boundary between real APP_USER integration and synthetic lifecycle controls
- exact Application User eligibility contract to exercise in the probe
- visual navigation behavior for iPad portrait versus iPhone narrow
- how the experiment exposes scenario/test controls without making them look like production role switching
- whether any existing safe backend outcome is worth reusing for a trust-boundary illustration, or whether documented client/backend separation is sufficient
- exact evidence capture format and experiment catalog metadata

## Current judgment

The preferred initial direction is a **disposable-but-realistic hybrid Shell probe**: real provider/application integration on the normal path, bounded synthetic controls for difficult failure states, and one shared artifact for lifecycle and responsive evidence.

This card is a discussion baseline. It does not yet promote any implementation mechanism, visual pattern or framework choice to a Platform Rule.