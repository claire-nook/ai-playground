# Work Order — Application Shell Experiment Review v2

## Objective

Independently review and refine the proposed Application Shell experiment before implementation. Produce a GitHub-visible review artifact that Claire + Primary Agent can use to decide the final experiment design.

This is a **Review / Experiment Design Refinement** task, not Shell implementation.

The previous Issue #35 review request is superseded as the dispatch contract because the formal Nook Works Application User model has since been clarified and because GitHub-visible PR is the required handoff surface.

## Confirmed Cross-Repository Architecture Context

The formal `claire-nook/nook-works` repository has now established the following Application User design (PR #3, merged to `main`, merge commit `bc62d0cf20ee185fd4455e3907e9c6c7193c50f7`):

- `app_user.user_type` is a single coarse Application User classification.
- Allowed values: `admin`, `user`, `guest`.
- Default: `user`.
- `user_type` is **not** a Role Entity and does not create a Role / Permission / RBAC model.
- Shell may use `user_type` for coarse Navigation / Feature Entry Visibility.
- Hidden Menu / Route / Feature Entry is not Backend Authorization.
- Backend data/API authorization remains an independent authoritative boundary.
- If future requirements need multiple roles or fine-grained permission mapping, that is a later Role / Permission design rather than an expansion of `user_type` semantics.

Do not attempt to fetch or modify `nook-works` from this Workspace. Treat the above as confirmed architecture input for this Playground review.

## Read First

Repository files available in this Workspace:

1. `playground.md`
2. `knowledge/README.md`
3. `knowledge/maps/nook-technical-platform.md`
4. `notes/short-term-work.md`
5. `agent-work/README.md`
6. Existing relevant Supabase Auth / browser CRUD / custom API experiment records and evidence referenced by the Research Map.
7. Previous Issue #35 only as historical context if accessible; this Work Order is authoritative when the two differ.

## Preflight

Before review:

1. Confirm this Work Order and the required Playground context files exist in the snapshot.
2. Confirm the task is review-only and does not require Shell implementation.
3. Confirm `user_type = admin / user / guest` is treated as an established external architecture input, not an open research question.
4. If required Playground context is actually missing or contradictory, stop and report the blocker instead of inventing context.

## Primary Draft to Review

### A. Human-visible / RWD Shell Demo Scope

The later experiment is expected to include a visual Shell demo observable at minimum in:

- iPad landscape
- iPad portrait
- iPhone narrow viewport
- desktop width as a sanity check, not the primary design target

Candidate visible Shell responsibilities:

- top-level application chrome / header
- responsive Navigation / Menu
- route/content outlet
- Application User identity/context affordance and sign-out
- global loading / unexpected error presentation region
- direct/deep-link entry with observable route outcome
- observable coarse Navigation / Feature Entry differences for `admin`, `user`, `guest`

The visual goal is Shell structure, responsive behavior, touch usability, and lifecycle observability. It is **not** the Feature UI / Design System experiment: do not expand into full Form / Table / Dialog aesthetics, component library selection, dashboard design, or CRUD screen design.

### B. Platform / Lifecycle Responsibilities

Candidate lifecycle:

`cold start / deep link → bootstrap → Auth session restore or invalid session → Application User eligibility → user_type context → route resolution → Navigation / Feature Entry visibility → feature entry → authoritative backend authorization → sign-out / state invalidation`

Candidate responsibilities to evaluate:

1. Application bootstrap ownership.
2. Supabase Auth session restore / invalid session / sign-out lifecycle.
3. Application User eligibility context, distinct from Authentication Identity.
4. `user_type` as coarse Application User Context, distinct from Role / Permission / RBAC.
5. Route resolution / page lifecycle / deep link.
6. Navigation visibility / permission-aware feature entry based on coarse `user_type` context.
7. Direct route cannot rely on hidden Menu as authorization boundary.
8. Sign-out / invalid session clears stale privileged UI/Application state.
9. Global loading / unexpected error boundary ownership.
10. Browser-safe runtime configuration boundary.
11. Minimal global Shell state ownership so Shell does not become a feature-state garbage dump.

## Required Review Questions

Assess independently rather than merely agreeing with the Primary Draft:

1. Is the proposed experiment scope too large or too small? Should it be split into phases? If so, propose the smallest useful phase structure.
2. Which concerns require runtime Evidence, and which should remain Platform Design / Rule discussion rather than experimental claims?
3. Does the lifecycle omit important states such as expired session, refresh, direct deep link, browser back/forward, network failure, unknown route, or stale context? Include only states that materially improve the research; avoid checklist inflation.
4. How should `admin` / `user` / `guest` be represented in the demo so visibility differences are observable without accidentally designing a Role/Permission matrix?
5. What is the minimum useful visibility matrix or feature-entry fixture for proving coarse `user_type` behavior? Prefer synthetic/simple features over production feature design.
6. How should the experiment demonstrate that hidden Navigation / Feature Entry is not Backend Authorization without turning this Shell experiment into another full security experiment?
7. What are the minimum useful RWD observable states and viewport/device matrix for iPad-first + iPhone support?
8. Are there browser/iPadOS-specific lifecycle or interaction concerns worth including now (for example viewport transitions, back/forward, refresh, touch navigation), and which should be deferred?
9. Which framework/router/state-management/component-library choices should deliberately remain deferred so a demo does not become an accidental Platform Rule?
10. Revise the Acceptance / Stop Condition so the experiment stops once the architectural questions are answered rather than growing into a miniature application framework.
11. Identify hidden assumptions, coupling risks, or evidence gaps.

## Candidate Acceptance / Stop Condition

Review and improve this candidate:

- Shell lifecycle transitions are deterministic for the selected observable states.
- No redirect loop or stale privileged Shell state is observed in the tested lifecycle.
- `admin` / `user` / `guest` produce deterministic coarse Navigation / Feature Entry visibility differences using a deliberately small synthetic fixture.
- Direct/deep-link behavior makes clear that client-side visibility is not the backend authorization boundary.
- Responsive Shell structure remains usable in iPad landscape, iPad portrait, and iPhone narrow viewport; desktop is sanity-checked.
- Evidence is sufficient to separate Verified runtime behavior from Platform Design candidates.
- No Role/Permission model, dynamic menu framework, Feature UI design system, or framework-specific Platform Rule is created merely to satisfy the demo.

## Scope / Constraints

### In Scope

- Review and refinement of Shell experiment design.
- Lifecycle/state coverage assessment.
- `user_type` coarse visibility experiment design.
- RWD/iPad/iPhone observable-state design.
- Evidence vs Platform Design classification.
- Revised Acceptance / Stop Condition.
- A repository review report committed for PR-visible QC.

### Out of Scope

- Do not implement the Shell demo.
- Do not create production Shell code.
- Do not modify Supabase, Netlify, database objects, or provider configuration.
- Do not create Role / Permission tables, permission matrices, RBAC, or dynamic menu maintenance.
- Do not design full Feature UI / Form / Table / Dialog patterns.
- Do not choose a production framework/router/state-management library as a Platform Rule.
- Do not modify formal `nook-works` files from this Repository.
- Do not update Experiment/Evidence/Research Map status as though the experiment has already run.

## Deliverable

Create:

`agent-work/reviews/application-shell-experiment-review-v2.md`

The report should contain:

1. Scope assessment.
2. Recommended phase split, if any.
3. Runtime Evidence vs Platform Design / Rule classification.
4. Revised lifecycle/state model.
5. Recommended `user_type` visibility fixture/matrix.
6. Recommended RWD observable states / viewport matrix.
7. Revised Acceptance / Stop Condition.
8. Deferred decisions.
9. Hidden assumptions / risks / unknowns.
10. A concise proposed final experiment scope for Claire + Primary Agent discussion.

Use Mermaid where a lifecycle/state diagram materially improves understanding and the repository renderer supports it.

## Report Contract

After completing the review:

- validate Markdown structure and internal repository references as practical;
- run `git diff --check` or equivalent static sanity check;
- local commit the review artifact;
- report changed files, validation performed, known limitations / unknowns, and local commit SHA;
- stop and wait for Claire to create the GitHub PR.

The PR-visible report is the handoff surface for Primary Technical QC. A chat-only review is not the final deliverable.

## Decision Boundary

Codex provides an independent technical review and recommendations. It does not decide the final Shell experiment architecture, Platform Rules, or production framework. Claire + Primary Agent retain those decisions after reviewing the PR-visible artifact.
