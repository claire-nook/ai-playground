# F-MAINT-1 — Consolidated Findings

## Evidence Identity

- Experiment: `F-MAINT-1 — Single-record Maintenance Lifecycle Prototype`
- Date: `2026-09-17`
- Verification Strength: `Partial — Functional / Interaction Evidence`
- Environment: deployed Browser prototype with synthetic fixture
- Predecessors: `F-QUERY-1`, `F-DETAIL-1`

## What was actually observed

Claire reviewed the deployed prototype as an internal enterprise maintenance operation rather than a guided customer flow. The review established that Query / Worklist is the primary work context for this pattern.

The accepted interaction baseline is:

```text
Query / Worklist
├─ Create → Save / Cancel → Query Context
├─ Update → Save / Cancel → Query Context
└─ Read   → Return        → Query Context
```

Read → Update may exist, but Update completion still returns to the worklist instead of detouring through Read Detail.

## Negative Evidence — Save → Read Detail

An earlier candidate used:

```text
Update → Save → Read Detail → Return Query
```

This was rejected during functional review. In a high-frequency maintenance scenario, such as an operator updating hundreds of records, the intermediate Read surface adds an interaction with no business value for each record.

This is not evidence that guided flow is generally wrong. It demonstrates that a flow-centric interaction model is a poor default for Nook Works internal maintenance work.

## Maintenance vs Guided Process

The review clarified a useful architecture distinction:

```text
Internal Enterprise Maintenance
→熟練內部使用者
→高頻、重複、目標明確
→Worklist-centric

Guided Process
→外部或低頻使用者
→需要步驟引導、檢核或說明
→Flow-centric
```

Nook Works general maintenance adopts the first baseline. Workflow / Approval is a separate pattern. A business record can be maintained through a normal maintenance surface while separately participating in an approval workflow.

## Capability Boundary

The prototype separates User Capability from Record State:

```text
User Capability
+ Record State
→ Effective Capability
```

This is a presentation / interaction contract only. Browser-side capability does not prove backend authorization.

## UI Placement Boundary

The prototype originally placed Create between Query and Clear. Claire identified that this visually implied Create was part of Query-form action semantics.

The prototype now separates:

```text
Query / Clear → Query actions
Create        → Feature-level maintenance action
```

This is not a frozen UI layout rule. F-MAINT-1 researches platform lifecycle and action semantics, not final UI placement or visual design.

## Mutation / Concurrency Finding

The initial prototype treated optimistic concurrency detection as if it were part of standard Update lifecycle. Review corrected this assumption.

A more accurate pattern is:

```text
Standard Maintenance
→ Last Write Wins may be acceptable
→ Native CRUD candidate

Concurrency-sensitive Maintenance
→ compare updated_at / version or equivalent
→ conditional Native Update or Custom Operation candidate

Business-state-sensitive Mutation
→ validate current authoritative business state
→ Custom API / RPC / transaction boundary candidate
```

The choice is not purely technical. Whether silent overwrite is acceptable is a Business / Functional decision. However, because not every SA will explicitly identify the issue, the Platform should define a default and expose the decision point rather than pretending the question does not exist.

Current candidate:

```text
Platform Default for ordinary maintenance
→ Last Write Wins

Feature may explicitly upgrade to
→ stale-update detection
or
→ business-state-sensitive mutation
```

The Demo retains the concurrency interaction only as an optional probe. It is not part of the Standard Maintenance baseline.

## Platform Pattern Candidate

The consolidated lifecycle candidate is:

```text
Query / Worklist Context
→ Select Operation: Read / Create / Update
→ Resolve Effective Capability
→ Present Feature-defined Fields
→ Validate Input
→ Track Dirty State
→ Save or Cancel
→ Apply selected Mutation Policy
→ Return to Query / Worklist Context
```

Audit remains the Platform Standard sub-pattern established by F-DETAIL-1.

## What this evidence does NOT prove

This experiment does not verify:

- production Native Data API mutation behavior for this exact pattern;
- production authorization enforcement;
- transaction semantics;
- production optimistic locking;
- API error taxonomy;
- router / Browser History integration;
- DB isolation, deadlock, or load behavior;
- a generic auto-generated form framework;
- final UI layout or component placement.

These remain architecture or future implementation questions rather than hidden conclusions smuggled out of a Browser mock.