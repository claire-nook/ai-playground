# Single-record Maintenance Pattern

## Position

This Pattern describes ordinary **internal enterprise single-record maintenance** for Nook Works.

It does not describe customer-facing guided journeys, approval workflow, or master-detail maintenance.

Its primary work context is the Query / Worklist, not an individual record detail page.

## Baseline Lifecycle

```text
Query / Worklist Context
├─ Read   → Return        → Query Context
├─ Create → Save / Cancel → Query Context
└─ Update → Save / Cancel → Query Context
```

`Read → Update` may exist, but Update completion returns to the worklist by default.

The goal is to support high-frequency internal operation without unnecessary intermediate surfaces.

## Pattern Responsibility

The Platform Pattern should standardize:

- operation entry semantics for Read / Create / Update;
- effective capability input;
- field-state semantics such as editable / immutable / read-only;
- validation lifecycle;
- dirty-state tracking and unsaved-change guard;
- Save / Cancel lifecycle;
- return-to-work-context behavior;
- Audit presentation semantics;
- mutation-policy decision point;
- consistent error / success contract shape.

The Platform Pattern should **not** decide:

- the business fields or their composition;
- final UI placement or visual design;
- whether a formal Feature uses one mode-based page or separate surfaces;
- whether every Update must detect concurrent modification;
- feature-specific business mutation rules.

## Common Pattern ≠ Common Page Implementation

A formal Feature may use:

```text
Mode-based
One implementation surface
→ Create / Update / Read modes
```

or:

```text
Surface-separated
Create surface
Update surface
Read surface
```

The Platform contract is about semantics and lifecycle, not forcing one code organization.

## Effective Capability

A record should not become editable merely because Frontend code sees one status flag.

Conceptually:

```text
User Capability
+ Record State
+ Feature / Business Rule input
→ Effective Capability
```

Typical outputs include:

- `canView`
- `canCreate`
- `canEdit`

Frontend capability controls presentation and interaction. Authoritative backend authorization remains a separate trusted-boundary responsibility.

## Worklist Context

Query / Worklist is the ordinary internal-maintenance work surface.

Create / Update / Read are temporary operations entered from that work context.

Return should preserve relevant Query Context established by F-QUERY-1 and F-DETAIL-1, including criteria, sort, page size, and stable record identity where applicable.

Page number alone is not sufficient work context.

## Save / Cancel

### Create

```text
Create Entry
→ Editable Form
→ Validate
→ Save
→ Success
→ Query Context
```

Cancel returns to Query Context. Unsaved input should be guarded when leaving would discard meaningful changes.

### Update

```text
Update Entry
→ Load Current Record
→ Resolve Effective Capability
→ Editable / Immutable Field State
→ Validate
→ Save
→ Apply Mutation Policy
→ Success
→ Query Context
```

Cancel returns to Query Context. An intermediate Read Detail surface is not part of the default lifecycle.

### Read

```text
Read Entry
→ Read-only Detail
→ Return
→ Query Context
```

Read may expose an Update action when Effective Capability allows it.

## Mutation Policy

Concurrency handling is a decision point, not a universal Update rule.

### Standard Maintenance

Default candidate:

```text
Last Write Wins
```

This is appropriate when overlapping updates are low-risk and the Business accepts the later Save becoming authoritative.

Native CRUD is a natural implementation candidate.

### Concurrency-sensitive Maintenance

When silent overwrite is not acceptable:

```text
Loaded Version / Updated Timestamp
vs
Current Stored Version / Updated Timestamp
→ mismatch
→ reject stale update
```

This may be implemented through conditional Native Update or a Custom Operation, depending on required error semantics and platform constraints.

### Business-state-sensitive Mutation

When update validity depends on current authoritative state, such as a record becoming void or otherwise non-editable:

```text
Mutation Request
→ Validate Current Business State
→ Validate Authorization / Rule
→ Apply Mutation
```

This is a Business Operation boundary and is a strong Custom API / RPC candidate when atomic rule enforcement is required.

## Platform Default and Decision Guardrail

A Feature Specification may omit an explicit concurrency choice. The Platform therefore needs a default rather than accidental behavior.

Current candidate:

```text
Ordinary Maintenance default
→ Last Write Wins
```

But omission must not erase the decision. Specification / design guidance should expose a question such as:

```text
Concurrent Update Policy
- Standard / Last Write Wins
- Detect stale update
- Business-state-sensitive mutation
```

The SA does not need to know database locking theory to be reminded that the behavior exists.

## Maintenance ≠ Workflow

A maintained Business Object may also participate in a workflow, but these are separate responsibilities.

```text
Maintenance
= maintain the record

Workflow / Approval
= move the record through actors, decisions, and states
```

Approval, claims authorization, review, rejection, and routing should be modeled as a separate Platform Pattern rather than embedded into ordinary single-record Maintenance.

## UI Boundary

F-MAINT-1 used visible buttons and surfaces to simulate operations, but final button position, spacing, visual hierarchy, and component styling are outside this Pattern's current scope.

Action semantics matter; pixel placement does not yet constitute a Platform Rule.

## Evidence Basis

This synthesis is based on:

- `F-QUERY-1` Query baseline;
- `F-DETAIL-1` Read Detail / Return Context baseline;
- `F-MAINT-1` deployed synthetic functional prototype and Claire functional review;
- existing verified Native Data API / Custom API capability evidence elsewhere in Playground.

F-MAINT-1 itself remains Partial evidence because production mutation, authorization, transaction, and concurrency mechanisms were not runtime-tested in this experiment.