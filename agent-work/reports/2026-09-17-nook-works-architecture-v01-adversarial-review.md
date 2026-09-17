# Nook Works Application Architecture v0.1 — Adversarial Review

> Date: 2026-09-17
>
> Review target: `knowledge/platform/nook-works-application-architecture.md` v0.1
>
> Work Order: `agent-work/work-orders/2026-09-17-nook-works-architecture-v01-adversarial-review.md`
>
> Execution type / weight: Review / High-Risk
>
> Reviewer role: independent Architecture Reviewer + prospective Implementer
>
> Result: **Revise before using v0.1 as a formal platform implementation contract**

## 1. Context Preflight

Preflight passed before review began:

- the Work Order and every repository-local `Read First` document were present and readable;
- the target identifies itself as `Architecture Baseline Candidate v0.1` and contains all four required archetypes: Scheduled / Batch, Query, Query → Read Detail, and Single-record Maintenance;
- the workspace HEAD contains both required commits: `03406661aa30301a33755419f56f2a44599f710f` and `1bd2d8d90ab33a6d548a7a517b27468d3490601f` as ancestors;
- `playground.md` was not sought or read;
- this report is the only intended repository change. The architecture source was not modified.

Review method: reconstruct the responsibility graph, walk every archetype end to end, compare architecture claims with the cited evidence boundaries, and then attempt to derive implementable modules and contracts without silently making architecture decisions.

## 2. Executive Judgment

v0.1 has a **sound decomposition direction but is not yet a safe formal implementation baseline**. It correctly resists a universal service layer, generic form framework, automatic UI generator, and the equation of navigation visibility with authorization. Its strongest idea is that lifecycle/state/transaction ownership follows semantic responsibility rather than visual containment or provider convenience.

The central defect is a maturity mismatch: the document says the platform can move to architecture-first refinement, yet the minimum contracts that protect correctness are simultaneously left open. An implementer can build a shell and a synthetic query from this document, but cannot safely build a production mutation or batch operation without inventing authorization, validation, error, credential, identity, idempotency, and observability behavior. These are not interchangeable implementation details. Different guesses alter security and business semantics.

There is no finding that the overall architecture must be discarded. There are, however, **five High findings** that should block treating v0.1 as an implementation contract:

1. authorization and identity enforcement are named but not constructible;
2. the Operation Contract is a checklist without a wire/type/lifecycle contract;
3. Last Write Wins is too easy to inherit by omission and audit is incorrectly presented as its mitigation;
4. production Batch correctness depends on contracts deferred as workload-driven;
5. native Data API / View guidance omits critical Supabase security semantics and can lead to an exposed or inconsistent boundary.

No Critical finding is assigned because v0.1 is explicitly a candidate, forbids equating UI capabilities with backend authorization, and does not itself ship a runtime. If these open contracts were carried unchanged into production implementation, Findings F-01, F-03, or F-05 could become Critical depending on data sensitivity.

## 3. Strengths Worth Keeping

1. **Separation of unlike responsibilities.** Shell lifecycle, Feature interaction state, Operation semantics, and execution mechanism are not forced into a single mandatory pipeline.
2. **Thin Feature Activation seam.** Refusing to invent a `FeatureRuntime`, plugin framework, service locator, or global feature state container is proportionate to current evidence.
3. **Mechanism selection by operation shape.** Native Data API, View, RPC, and Custom API remain alternatives rather than architectural ranks.
4. **Authorization distinctions.** Authentication, eligibility, navigation visibility, feature entry, data access, and Business Authorization are correctly stated as different decisions.
5. **Transaction ownership principle.** Assigning a transaction to the layer that owns the complete Business Operation is consistent with C-BSA-1, provided the selection and runtime constraints are made concrete.
6. **Pattern restraint.** Query, Detail, and Maintenance do not imply generated pages or a universal form/grid framework.
7. **Audit versus operational observability.** The document correctly says record provenance is not runtime diagnostics.
8. **State follows semantic lifecycle.** This is a useful default rule and should remain, after the missing states and shared ownership are described.
9. **Explicit evidence caveat.** The document repeatedly says feasibility is not a Platform Rule; the needed revision is to apply that caveat more consistently to several highlighted defaults.

## 4. Findings

Categories below use the Work Order taxonomy. “Evidence contradiction” means the architecture claim exceeds or conflicts with repository evidence; it does not mean external evidence disproves the proposed design.

### F-01 — Business Authorization is a named boundary, not an implementable contract

- **Severity:** High
- **Category:** Missing contract
- **Impact:** A feature implementer cannot determine what permission to request, which subject/tenant/scope inputs are trusted, where policy is evaluated, or how RLS, grants, and operation permission compose. Each feature can therefore invent a different policy vocabulary or accidentally treat a browser-provided capability as authority.
- **Evidence / reasoning:** Section 14 correctly separates controls, but explicitly leaves feature permission, operation permission, row/scope authorization, errors, and production identity governance open. Those items are exactly the minimum data needed to implement any protected Query or Mutation. C-BSA-1 proves grants, RLS, function execution, caller authentication, and backend DB identity are independent boundaries; it does not select their production composition. F-MAINT-1 explicitly does not verify production authorization.
- **Required revision:** Before formal feature implementation, define a minimum authorization decision contract: authenticated subject source; application-user mapping; operation identifier; resource/scope inputs; authoritative policy owner; deny-by-default behavior; DB enforcement relationship; decision/result semantics; audit/diagnostic handling. Provider-specific mapping may remain a technical design, but the semantic inputs and enforcement point may not.
- **Disposition:** **Downgrade current Authorization Architecture to Open Contract**, while keeping its separation principles as baseline constraints.

### F-02 — Feature Activation leaks credential responsibility and underspecifies teardown

- **Severity:** Medium
- **Category:** Implementation ambiguity
- **Impact:** “credential/session access when needed” can produce cached tokens, feature-level refresh logic, broad credential distribution, or SDK coupling. “disposal / supersession ownership” does not say who cancels requests, unsubscribes listeners, rejects late results, or owns feature-local resources.
- **Evidence / reasoning:** The Shell owns restore/refresh/invalidation, yet the Feature is offered session access. This creates dual responsibility unless activation supplies a freshness-preserving invocation capability rather than a credential snapshot. The source also assigns stale/superseded request behavior to Platform/Technical Design, while the state table has no operation-control state.
- **Recommendation:** Specify that Features do not own refresh or persist credentials. Define either an invocation dependency that always obtains current auth context or a narrowly scoped current-session accessor. Activation must define start, abort/supersede, dispose, late-completion suppression, and session-invalid signaling. Do not require a framework class.
- **Disposition:** **Revise** the minimum activation obligations.

### F-03 — The Operation Contract is descriptive but not constructible

- **Severity:** High
- **Category:** Missing contract
- **Impact:** Two teams can satisfy the checklist while producing incompatible return envelopes, cancellation semantics, error mapping, authorization inputs, pagination metadata, and correlation. The seam therefore cannot yet support interchangeable mechanisms or shared Feature behavior.
- **Evidence / reasoning:** Section 9 lists topics (“input semantics”, “transaction need”, “error classification”) without defining required fields, types, invariants, or which omissions are legal. “when applicable” appears on cancellation and observability without a selector. The general application architecture already contains a more concrete Query contract checklist; the Nook-specific synthesis loses useful precision rather than specializing it.
- **Required revision:** Define small contract families rather than one universal DTO: invocation context; success/failure discriminant; operation-specific input/output; cancellation/supersession semantics for interactive reads; stable identity rules; authorization obligation; mutation policy; boundedness metadata; correlation. Provide one worked contract for each baseline archetype and define which fields are normative versus examples.
- **Disposition:** **Revise**; keep the seam, reject the current checklist as sufficient.

### F-04 — Error categories mix cause, policy, and transport, with no retry or disclosure contract

- **Severity:** Medium
- **Category:** Missing contract
- **Impact:** Implementers must guess mappings such as missing row versus forbidden (which may intentionally be indistinguishable), constraint violation versus validation/business rule, timeout after unknown commit, dependency failure retryability, and cancelled versus failed. Browser behavior and information disclosure will drift.
- **Evidence / reasoning:** The taxonomy names useful categories but omits stable codes, safe user message versus diagnostic detail, retryability, commit/side-effect certainty, field-level validation details, and correlation. `backend / dependency failure` conflates failures with very different recovery. `not-found` can leak record existence if authorization is scope-sensitive.
- **Recommendation:** Keep a small top-level taxonomy, but add stable code, safe details, field errors where relevant, retryability, outcome certainty (`not-applied` / `applied` / `unknown`), correlation ID, and policy for not-found/forbidden concealment. Provider errors remain server diagnostics.
- **Disposition:** **Downgrade taxonomy to Open Contract** until mapped through the four walkthroughs.

### F-05 — Native Data API and View selection guidance is unsafe without a Supabase access profile

- **Severity:** High
- **Category:** Implementation ambiguity
- **Impact:** “Simple read → Native Data API” and “View → Native Data API” may lead implementers to expose relations under default grants, assume RLS behavior transfers through a View, or use a privileged server identity that bypasses the intended user scope. Native CRUD may also make authoritative business validation impossible to perform atomically.
- **Evidence / reasoning:** The table says RLS/grants and View security must be explicit, but gives no go/no-go test. C-BSA-1 demonstrates that caller endpoint authentication, DB identity, object privileges, RLS, and `SECURITY DEFINER` execution are independent. It also warns that its direct-connection feasibility used `postgres`, not a production role. “Not a provider-specific hard rule” does not remove the fact that the baseline is Supabase-first and these choices have provider-specific security behavior.
- **Required revision:** Define approved access profiles: browser user-context Data API, server Data API with restricted role, invoker-safe curated View, constrained RPC, and backend direct connection. For each, require identity, grants, RLS/bypass behavior, exposed schema, function/view ownership, `search_path`, and secret boundary. A View must pass an explicit security review, not be selected merely because it is curated.
- **Disposition:** **Revise** selection guidance and **Need New Evidence** for the chosen production View and identity profiles.

### F-06 — Last Write Wins can become an accidental business rule

- **Severity:** High
- **Category:** Architecture judgment disagreement
- **Impact:** A silent overwrite can lose another user's accepted work. Because specifications may omit concurrency, calling Last Write Wins the ordinary platform default shifts a business-risk decision into architecture by absence. “Audit records the last modifier/time” neither prevents nor reliably reconstructs the overwritten values.
- **Evidence / reasoning:** F-MAINT-1 says Last Write Wins *may* be acceptable and the Business choice should be exposed; it did not verify production mutation/concurrency. v0.1 retains “candidate” wording, but also directs the platform to default when the SA omits a choice. The decision guardrail is not enforceable: no risk classification, explicit acceptance field, or implementation check is specified. Audit here is only the ordinary created/updated presentation sub-pattern, not immutable change history.
- **Required revision:** Do not silently inherit Last Write Wins. Require an explicit mutation-policy declaration, with a documented low-risk shortcut that may select LWW only after overwrite impact is accepted. Distinguish “last-modified attribution” from change history/audit log. Define conditional update result semantics (including zero/multiple affected rows and version token generation) before offering stale detection.
- **Disposition:** **Downgrade platform default to Open Contract**; keep LWW as an eligible policy.

### F-07 — Validation ownership leaves an authoritative gap for Native CRUD

- **Severity:** High
- **Category:** Missing contract
- **Impact:** If a browser performs Native CRUD, a rule depending on authoritative state cannot safely be enforced by browser validation. A DB constraint may cover invariants, but cannot necessarily express policy-rich business errors. Implementers do not know when ordinary CRUD stops being allowed.
- **Evidence / reasoning:** The architecture correctly assigns authoritative validation to a trusted boundary “when correctness depends” on current data, but its selection table independently recommends Native CRUD for ordinary mutation. There is no rule inventory, execution order, canonical normalization behavior, or atomicity requirement connecting those sections.
- **Required revision:** Require every mutation to classify rules into input/interaction, authoritative business precondition, and DB invariant. Any current-state-dependent rule must execute atomically with mutation at RPC/DB or backend transaction boundary. Define normalization, field/cross-field error shape, constraint mapping, and whether browser duplication is advisory only. Add a selection gate: Native CRUD is eligible only if authoritative requirements are completely enforced by grants/RLS/constraints/atomic row predicate.
- **Disposition:** **Revise** before Maintenance implementation.

### F-08 — Transaction principle is sound, but “operation owner” is circular

- **Severity:** Medium
- **Category:** Implementation ambiguity
- **Impact:** Teams may choose a layer because it offers convenient transaction support, then declare that layer the operation owner. Edge/serverless direct connections also add pooling, timeout, connection release, credential, and retry obligations absent from the architecture.
- **Evidence / reasoning:** C-BSA-1 supports both DB-owned and backend-owned transactions, but explicitly limits the latter: production needs a restricted role and connection governance. The state table says transaction state belongs to “Operation owner / backend”, even though DB may be the owner. External effects are deferred to separate compensation/orchestration without a baseline rule against holding a DB transaction across external calls.
- **Recommendation:** Select semantic operation ownership first (rules, effects, atomic invariants), then mechanism. State non-negotiables: no browser-owned multi-call transaction; no assumption that sequential Data API calls are atomic; no slow external I/O inside a DB transaction; explicit timeout/retry/unknown-outcome handling; restricted role and pooler-compatible connection lifecycle for backend ownership.
- **Disposition:** **Keep principle; Revise construction guidance**.

### F-09 — Batch correctness contracts are deferred past the point where Scheduled / Batch can be a baseline archetype

- **Severity:** High
- **Category:** Evidence contradiction
- **Impact:** A cron-triggered operation can duplicate effects, overlap with itself, time out after committing, or report scheduler success while downstream work failed. Without run identity and idempotency/overlap/error semantics, a production batch cannot be safely implemented or operated.
- **Evidence / reasoning:** D-BATCH-1 verifies invocation shapes and parameter provenance, and explicitly shows scheduler success, HTTP success, and business/data success differ. v0.1 accurately lists run identity, retry, idempotency, failure classification, observability, and long-running boundaries as open—but then says these should wait for an actual requirement while presenting Batch as part of the first baseline. Exact retry counts can wait; explicit selection/decision points cannot.
- **Required revision:** For any production batch require: stable operation identity; run/attempt identity; overlap policy; idempotency or explicit at-most-once tradeoff; timeout; retry owner and limit; input provenance; outcome recording; correlation; safe manual replay; scheduler/transport/business status separation. Long-running orchestration can remain deferred if workloads do not need it.
- **Disposition:** **Revise** minimum Batch contract; **Need New Evidence** for retry/timeout behavior of the selected production path.

### F-10 — Batch bypasses the Operation Contract in the responsibility graph

- **Severity:** Medium
- **Category:** Architecture judgment disagreement
- **Impact:** Interactive and scheduled invocation of the same business operation may acquire different validation, authorization, transaction, error, and audit semantics. Direct `Batch Operation Contract → DB` is especially ambiguous: it might mean an approved DB operation or unconstrained table manipulation.
- **Evidence / reasoning:** The high-level graph creates separate Feature-facing and Batch contracts, but both can target identical side effects. The text says they may share mechanisms, not whether they share business-operation semantics. Batch identity is mentioned, but service-principal authorization and delegation are not.
- **Recommendation:** Separate **Business Operation Contract** from **invocation adapters**. Browser and scheduler adapters may differ in lifecycle, identity, retry, and result delivery, while invoking the same authoritative operation where semantics are actually shared. If Batch uses a different operation, state that explicitly. Replace direct-to-DB ambiguity with a named constrained DB-owned operation.
- **Disposition:** **Revise** responsibility graph.

### F-11 — State ownership omits shared and transient state needed by the baseline

- **Severity:** Medium
- **Category:** Missing contract
- **Impact:** Router reload, back/forward, late network results, session invalidation, unsaved forms, cached reads, and batch progress have no complete ownership/lifetime model. Libraries chosen during implementation may accidentally become architecture owners.
- **Evidence / reasoning:** The table includes semantic states but omits operation request/abort/correlation state, route-serialized versus memory-only query state, return anchor/scroll focus, authoritative record/version snapshot, validation errors, save outcome certainty, authorization policy inputs, cache freshness, and Batch attempt versus logical run. Route is Shell-owned while query state may be transported through it, creating shared custody not captured by a single “Primary Owner”.
- **Recommendation:** Extend the table with semantic owner, storage/transport custodian, lifetime, canonical source, invalidation trigger, and sensitive-data constraint. Explicitly model operation-control state and Query/Detail return context. This need not prescribe a state-management library.
- **Disposition:** **Revise**.

### F-12 — Query → Detail return semantics promise more than the open resolution contract supports

- **Severity:** Medium
- **Category:** Evidence contradiction
- **Impact:** “Re-resolve current work position” sounds mandatory, but no bounded algorithm or fallback contract exists. Implementers might issue expensive rank scans, recreate unstable OFFSET behavior, or preserve sensitive query criteria in unsafe URL/history state.
- **Evidence / reasoning:** F-DETAIL-1 explicitly says the prototype scans synthetic data and does not prove a production anchor-position implementation. v0.1 correctly calls resolution open in Section 7.2, but its archetype summary presents restoration without the qualification. Stable record identity alone is insufficient; deterministic sort and tie-breaker, changed criteria, record disappearance/authorization loss, page-size change, and refresh must be defined.
- **Recommendation:** Define a minimal return-context object and deterministic fallback now; keep exact rank/cursor mechanism open. Require total ordering with stable tie-breaker. Permit “refresh query then highlight if found; otherwise return to first/nearest valid page with an explicit notice” as a valid baseline rather than promising exact position.
- **Disposition:** **Revise wording; keep exact resolution as Open Contract**.

### F-13 — Audit is over-generalized from a presentation pattern

- **Severity:** Medium
- **Category:** Evidence contradiction
- **Impact:** Teams may treat `created_at/by` and `updated_at/by` as sufficient compliance/business audit or trust browser-supplied actor fields. This also obscures batch/service actor, impersonation, and immutable history requirements.
- **Evidence / reasoning:** F-DETAIL-1 establishes a common Detail presentation candidate and explicitly leaves actual fields/extensions to formal architecture/requirements. v0.1 labels it “Business Audit” and associates it with trace semantics, which is broader. No authoritative population or tamper-resistance contract is given.
- **Recommendation:** Rename the baseline “record provenance metadata presentation”. Define authoritative actor/time population and identities (human, service, batch). Treat immutable change/event audit, security audit, access audit, and compliance retention as separate requirement-driven contracts.
- **Disposition:** **Revise / downgrade claim**.

### F-14 — Provider independence is asserted more strongly than achieved

- **Severity:** Medium
- **Category:** Architecture judgment disagreement
- **Impact:** Implementers may believe mechanisms are replaceable while contracts inherit Supabase-specific RLS, PostgREST filtering/count behavior, RPC transaction semantics, Edge Function timeout/connection constraints, Cron/pg_net delivery, and Netlify/browser routing/configuration.
- **Evidence / reasoning:** Supabase-first and Netlify delivery are explicit drivers, so coupling is not inherently wrong. The problem is undocumented coupling boundaries. Operation semantics can hide SDK calls, but cannot hide materially different consistency, authorization, pagination, cancellation, or delivery guarantees.
- **Recommendation:** Maintain a provider adapter/assumption register. For each mechanism record semantic dependencies, not just SDK dependencies. State that replaceability holds only when the replacement preserves the contract; otherwise architecture review and migration are required. Netlify SPA fallback, runtime config/cache behavior, and Supabase token refresh should be captured as deployment designs, not leaked into Features.
- **Disposition:** **Revise** provider-boundary documentation; do not build a speculative portability layer.

### F-15 — Delete/Void can be deferred as a generic pattern, but absence must be explicit per Feature

- **Severity:** Low
- **Category:** Optional improvement
- **Impact:** A “Maintenance” label can be interpreted as CRUD, causing implementers to add delete because the provider exposes it or to assume records never disappear during Detail return.
- **Evidence / reasoning:** The baseline explicitly includes only Read/Create/Update, so generic Delete/Void implementation is legitimately deferred. However, Detail fallback reasoning and authorization need to distinguish absent, out-of-scope, voided, and deleted records.
- **Recommendation:** State that baseline Maintenance excludes Delete/Void and that every Feature must explicitly declare lifecycle operations. Keep the generic handling pattern deferred.
- **Disposition:** **Keep deferred**, clarify exclusion.

## 5. Four-Archetype Walkthrough

### 5.1 Scheduled / Batch

**Path tested:** Schedule definition → invocation → batch operation → Edge Function or RPC/DB function → DB/external side effect → result.

| Question | v0.1 answer | Adversarial result |
| --- | --- | --- |
| State owner | “Batch runtime / operation owner” | Logical run, attempt, lease/overlap, checkpoint, and business outcome are collapsed into one row. Missing contract. |
| Authoritative validation | Batch operation / backend implied | Inputs may be literals, SQL expressions, or helper results, but provenance, schema/version, and validation point are unspecified. |
| Authorization | Trusted boundary principle | Scheduler/service identity, operation permission, DB identity, and secret rotation are not defined. |
| Transaction | DB or backend owner | Valid for DB-only work; external side effects require outcome/idempotency design before production. |
| Error return | execution result / observability | Scheduler, HTTP, DB, and business outcome are known to differ; no durable status mapping exists. |
| Provider boundary | Cron / pg_net / Edge / RPC | These are evidence-backed mechanisms, but timeout, retry, delivery, and pooler behavior are semantic dependencies. |

**Implementer verdict:** I can prove the job fires, but cannot claim it ran exactly as intended, decide whether to retry it, or safely replay it. F-09 and F-10 block production Batch, not experimental Cron capability.

### 5.2 Query

**Path tested:** Shell → activation → Query criteria/sort/page → Operation Contract → Data API/View/Custom API → bounded rows + metadata → presentation.

| Question | v0.1 answer | Adversarial result |
| --- | --- | --- |
| State owner | Query Feature | Correct semantically, but route/history custody and operation supersession state are absent. |
| Authoritative validation | browser functional + technical boundary | Criteria schema, normalization, maximum page size, count semantics, and too-broad threshold are unspecified. |
| Authorization | trusted data boundary | No subject/scope/row-policy contract; View and Data API profiles remain unsafe to guess. |
| Transaction | normally one read | Snapshot consistency between rows and count is not stated; separate count/data requests may disagree. |
| Error return | minimum categories | Missing retryability, safe details, and stale-result/cancelled outcome shape. |
| Provider boundary | Native Data API or View | PostgREST range/count/maximum-row behavior and View security must not leak as accidental semantics. |

**Implementer verdict:** A minimal bounded query is feasible only after the first Feature Technical Design fills these gaps. v0.1 should provide a worked Query contract so that this does not become feature-specific invention.

### 5.3 Query → Detail

**Path tested:** preserve query context → stable identity → Read operation → Detail → return → refresh/re-resolve context.

| Question | v0.1 answer | Adversarial result |
| --- | --- | --- |
| State owner | Query/work context + Detail Feature | Return anchor, focus/scroll, route serialization, and refresh invalidation need explicit custody. |
| Authoritative validation | Read operation implied | Identity format, record visibility changes, and criteria drift behavior are absent. |
| Authorization | trusted boundary | `not-found` versus `forbidden` disclosure is undefined. |
| Transaction | independent read | Acceptable, but exact snapshot continuity is not promised and must not be implied. |
| Error return | not-found/forbidden/etc. | No fallback contract when record disappears, becomes unauthorized, or leaves the result. |
| Provider boundary | bounded anchor position open | Correctly open, but the summary overstates restoration. |

**Implementer verdict:** Stable identity is necessary, not sufficient. Implement the smallest explicit fallback before attempting exact rank resolution; otherwise the “current work position” promise creates expensive rework.

### 5.4 Single-record Maintenance

**Path tested:** Worklist → Read/Create/Update → validation/capability → Save/Cancel → selected execution mechanism → return.

| Question | v0.1 answer | Adversarial result |
| --- | --- | --- |
| State owner | Maintenance Feature | Draft, baseline/version, validation errors, save-in-flight, unknown outcome, and navigation guard ownership are missing. |
| Authoritative validation | backend when current state matters | No enforceable test for choosing Native CRUD versus custom operation. |
| Authorization | backend trusted boundary | Effective capability is presentation only, but no authoritative operation-permission mapping exists. |
| Transaction | mechanism owning complete operation | Correct principle; construction and serverless connection obligations remain open. |
| Error return | validation/conflict/business/etc. | Field mapping, constraint mapping, safe retry, and unknown-commit outcome are missing. |
| Provider boundary | Native CRUD default candidate | Can be valid only for constrained low-risk operations whose invariants/policy are enforced atomically. |

**Implementer verdict:** Read/Create/Update lifecycle and dirty-state interaction can be built, but Save cannot be made production-correct from v0.1 alone. F-01, F-03, F-06, and F-07 must be resolved in a Feature contract or platform minimum.

## 6. Implementer Ambiguities

If formal implementation starts tomorrow, I would have to ask or guess all of the following:

1. What is the canonical Feature identifier, route parameter schema, and activation/disposal interface?
2. Does a Feature receive a token, an SDK client, or an authenticated invocation function? Who refreshes it during a long-lived form?
3. What TypeScript/HTTP discriminated result represents success, validation, forbidden, not-found, conflict, cancellation, dependency failure, and unknown mutation outcome?
4. How does an Operation declare its permission and scope? Is scope derived server-side or accepted from the Browser?
5. Which schemas/tables/views/functions are exposed through Supabase Data API, to which roles, with what RLS and grants?
6. What makes a View safe: invoker semantics, explicit grants, security options, or an RPC wrapper?
7. For Query, are rows and total count one consistent response? What are maximum page sizes, deterministic sorts, null ordering, stable tie-breakers, and provider truncation behavior?
8. Where is late-response suppression implemented, and what is the abort behavior when route/session changes?
9. What is the return-context data structure? Can it contain sensitive criteria in URL/history? What is the fallback when the anchor is gone or unauthorized?
10. Is Last Write Wins explicitly accepted for this Feature, or inherited? What constitutes a version token and how is a conditional update reported?
11. Which validation rules are duplicated for interaction, and which trusted mechanism authoritatively enforces each rule atomically?
12. Who writes `created_by/updated_by`, and can the Browser spoof them? How are service/batch actors represented?
13. For backend-owned transactions, which restricted role, pooler mode, timeout, connection cleanup, and retry policy are approved for Supabase Edge runtime?
14. For Batch, what constitutes one logical run versus retry attempt, who prevents overlap, and how is manual replay made safe?
15. Which component produces correlation IDs and where may diagnostic details be logged without leaking secrets or personal data?
16. What does Netlify own beyond static delivery: SPA fallback, cache headers, runtime configuration freshness, and error routing?

These are not requests for a giant framework. A thin reference contract and approved security/deployment profiles would remove most guessing.

## 7. Hidden Assumptions and Provider Coupling

### 7.1 Supabase

- Native Data API is assumed to be semantically “simple”, but simplicity depends on exposed schema, grants, RLS policy, role/token, row limits, count behavior, and atomic predicates.
- RPC is treated as an operation/transaction boundary, but privileged function ownership, `search_path`, default `EXECUTE`, and error mapping require governance.
- Edge Function is treated as a general Custom API/backend, but direct PostgreSQL transactions add secret, restricted-role, pooler, timeout, and connection lifecycle requirements.
- Cron/pg_net feasibility is treated as Batch foundation, but transport timeout/success is not business completion and delivery semantics are not yet standardized.
- Supabase Auth session freshness is assumed to remain a Shell concern while Features invoke operations; the adapter contract that makes this true is missing.

### 7.2 Netlify / Browser

- Browser-safe configuration is assigned to Shell without defining build-time versus runtime configuration or cache invalidation.
- Deep-link/reload/history support assumes a deployment rewrite/fallback and router integration contract.
- Browser cancellation does not guarantee server or DB cancellation; it only prevents stale UI application unless the backend supports cancellation.
- Browser navigation guards are advisory: refresh/tab close behavior differs and sensitive draft/query state must not be indiscriminately persisted.
- A browser Feature cannot safely hold service credentials, derive authoritative scope, or populate audit actors just because the UI hides operations.

### 7.3 Abstractions that look clean but are hard to construct

- one “Operation Contract” across Query, Mutation, Business Operation, and Batch without typed variants;
- one “trusted backend boundary” even when the trusted enforcement may be RLS, constraint, RPC, Edge Function, or direct DB transaction;
- “Effective Capability” without version/freshness and without a mapping to backend decision semantics;
- “transaction owner = operation owner” without first defining semantic ownership independently of mechanism;
- “restore work context” without deterministic ordering and a bounded anchor/fallback contract;
- “Business Audit” inferred from four provenance fields;
- provider independence defined as hiding SDK names rather than preserving semantics.

## 8. Deferred Items Audit

| Deferred item | Can it remain deferred? | Review judgment |
| --- | --- | --- |
| Master-detail / one-to-many / many-to-many | Yes | Not needed for the four baseline archetypes. Do not prebuild it. |
| Workflow / Approval | Yes, conditionally | Keep separate. A Feature requiring approval is not baseline Maintenance and must not be implemented until the pattern exists. |
| Delete / Void generic handling | Yes | Baseline must explicitly exclude it per Feature; Detail fallback still needs absence/visibility semantics. |
| Cursor / Keyset Pagination | Yes | OFFSET/page may be adequate for initial bounded workloads, but deterministic sort/tie-breaker and scale test are required now. |
| Infinite Scroll | Yes | UI interaction variant, not a baseline blocker. |
| Generic Data Grid / Form Framework | Yes | Premature abstraction; current rejection is correct. |
| Pessimistic locking | Yes | Mutation-policy declaration cannot be deferred, but this mechanism can. |
| Distributed transaction / compensation | **Partially** | A generic framework can wait. Any baseline Batch/operation touching external systems needs an explicit consistency, idempotency, and recovery decision now. |
| Long-running orchestration | Yes, conditionally | Keep deferred unless an identified Batch exceeds provider/runtime limits. Batch timeout and workload-boundary selection are required now. |
| Full Design System | Yes | Not relevant to architecture correctness. |
| Browser History / route integration for unsaved state (Open Contract) | **No for Maintenance implementation** | Exact router library can wait; ownership and expected Save/Cancel/navigation behavior cannot. |
| Batch run identity/retry/idempotency (Open Contract) | **No for production Batch** | Parameters may be workload-specific, but decision points and durable outcome model are baseline safety requirements. |
| Production identity/secret/connection governance (Open Contract) | **No for Custom API/direct DB implementation** | This is a precondition, not polish. |

## 9. Disposition Summary

| Disposition | Items |
| --- | --- |
| **Keep** | semantic responsibility decomposition; thin Feature Activation seam; Shell/Feature separation; operation-shape-based mechanism selection; Business Query versus Technical Result Boundary; transaction-ownership principle; audit/observability distinction; rejection of generic UI/service frameworks; requirement-driven extension principle |
| **Revise** | Feature activation credential/teardown obligations; typed Operation Contract families; execution-mechanism go/no-go gates; transaction construction guidance; Batch graph and invocation adapters; state ownership table; Query/Detail fallback; provider assumption register; provenance terminology |
| **Downgrade to Open Contract** | production Business Authorization composition; current Error taxonomy; Last Write Wins as an omission-based default; “Business Audit” beyond provenance display; exact Query/Detail anchor resolution |
| **Remove** | the implication that last-modified audit mitigates silent overwrite; direct Batch-to-DB ambiguity; implication that a curated View is naturally safe; implication that hiding the SDK makes mechanisms semantically replaceable |
| **Need New Evidence** | production Supabase View/RLS/grant profile; restricted backend DB role and Edge/pooler operational behavior; selected conditional update semantics; Batch retry/timeout/duplicate/overlap behavior; first real bounded Query performance/count behavior; chosen anchor-resolution strategy if exact restoration is required |

## 10. Recommended Revision Order

1. Define semantic authorization and identity contracts, then map approved Supabase access profiles.
2. Publish typed minimum Operation Contract variants with one example per baseline archetype.
3. Connect validation and mutation-policy selection to mechanism eligibility; remove silent LWW inheritance.
4. Define Batch run/outcome/idempotency minimums and separate invocation adapters from shared Business Operations.
5. Expand state ownership/lifetimes, including request control and Query/Detail/Maintenance navigation state.
6. Harden Error and provenance contracts, including safe disclosure and unknown outcomes.
7. Record provider/deployment assumptions and run focused evidence only where a selected production mechanism remains uncertain.

This order does not require a generic platform framework. It makes the thin seams executable before shared implementation hardens accidental decisions.

## 11. Limitations / Unknowns

- This is a repository-document review, not a runtime security assessment of an existing Nook Works production environment.
- No formal Nook Works Business Specification or data classification was provided; severity could increase for financial, regulated, personally sensitive, or high-contention records.
- No actual first Feature schema, expected row volume, concurrency rate, batch SLA, retention policy, or external API contract was available. Mechanism recommendations therefore remain selection criteria rather than final choices.
- External provider documentation was not used. Provider observations here are derived from the repository’s experiments/evidence and reviewer reasoning; production implementation should verify current Supabase/Netlify behavior against authoritative documentation.
- This review does not decide v0.2 Architecture Rules. Primary Technical QC and Claire/Primary disposition remain required.

## 12. Completion Judgment

**Executor result: Completed.** The v0.1 direction is worth preserving, but it should remain an Architecture Baseline Candidate and should not be handed to Feature teams as a sufficient production implementation contract. Primary Technical QC should prioritize F-01, F-03, F-05, F-06, F-07, and F-09 before authorizing formal platform implementation.
