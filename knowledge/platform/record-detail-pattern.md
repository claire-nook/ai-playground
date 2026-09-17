# General Record Detail Pattern

> Status: Pattern Candidate v0.1  
> Date: 2026-09-17  
> Source: `F-DETAIL-1`  
> Scope: Read-only Record Detail + Master → Detail lifecycle  

## 1. Purpose

This document captures the current architecture / interaction candidate distilled from F-DETAIL-1. It is not a production UI specification and it does not require one universal Detail component.

The Pattern standardizes responsibilities and lifecycle where repeated inconsistency would be costly; Feature Specification still owns business composition.

---

## 2. Core Flow

```text
Query Context
→ Select Stable Record Identity
→ Record Detail
→ Feature-defined Business Content
+ Platform-standard Audit
→ Return
→ Re-resolve Stable Record in current result ordering
→ Restore work context
```

The Pattern is intentionally read-only. Mutation lifecycle belongs to the next Maintenance Pattern challenge.

---

## 3. Responsibility Boundary

### Feature Specification owns

- Which business fields appear.
- Field labels and business meaning.
- Grouping and ordering.
- Business-specific sections / summaries / visualizations.
- Whether a field needs ordinary, wider, or full reading space.
- Feature-specific actions.

### Platform Pattern owns / standardizes

- Stable record identity as lifecycle anchor.
- Common read-only field presentation conventions.
- Responsive behavior principles.
- Detail loading / error / not-found states.
- Master → Detail → Return lifecycle semantics.
- Platform-standard Audit presentation.
- Consistent interpretation of common field semantics where useful.

### Platform does not automatically own

- Business page composition.
- DB schema → UI generation.
- Field order inferred from physical column order.
- Business-specific metrics / trace / lifecycle sections.
- Generic metadata-driven form generation merely because the prototype used metadata-like fixtures.

---

## 4. Common Pattern ≠ Auto-generated Page

The current candidate explicitly rejects this inference:

```text
DB Schema / API Payload
→ automatic Platform-generated Detail page
```

No current Evidence requires or justifies that architecture.

A formal Feature may be hand-composed from a Specification while still conforming to Platform Detail conventions.

The Platform should offer reusable primitives / guidance when repetition is useful, but should not steal composition authority from the Feature.

---

## 5. Field Presentation Candidate

Current field semantics exercised by F-DETAIL-1 include:

- Text
- Reference / Code + Description
- Number
- Currency
- Percentage
- Date
- Datetime
- Boolean
- Nullable
- Long Text

These are presentation semantics, not a claim that every Feature must expose these types.

### Layout capability

`normal / wide / full` is currently a layout vocabulary candidate, not a mandatory metadata contract.

Desktop may use multiple columns; tablet / mobile collapse according to available width. The Pattern should not require a fixed three-field row.

### Long Text

Long Text should support readable full-width plain-text presentation, wrapping, paragraph / newline preservation where appropriate.

```text
Long Text ≠ Rich Text
```

Rich Text requires a separate content and security contract.

---

## 6. Platform Standard Audit Pattern

For ordinary single-record Detail surfaces, Audit should be consistently recognizable.

Baseline semantic set:

```text
Created At
Created By
Updated At
Updated By
```

Candidate rule:

> Audit is Platform-standard composition; Business Content is Feature-defined composition.

This does not prevent future extensions such as version, approval, delete, or workflow audit when real Requirements demand them.

---

## 7. Return Context

The Pattern distinguishes work context from pagination coordinates.

```text
Query Context ≠ Old Page Number
```

If record R was selected from page 32 and newer records are inserted while Detail is open, R may move to page 33 / 34 under the same sorting rule.

Candidate return behavior:

```text
Preserve Query Criteria + Sort + Page Size + Stable Record Identity
→ resolve R against current result ordering
→ derive current page/location
→ render current page
→ restore selected-record anchor
```

If R no longer exists or no longer satisfies the Query, the Feature should expose an explicit fallback state rather than silently pretending that the old page is the restored context.

### Backend contract remains open

The production mechanism for bounded anchor-position / cursor resolution is not yet defined. A browser-side full-result scan is prototype convenience, not architecture.

---

## 8. State Ownership Candidate

| State / Meaning | Candidate Owner |
| --- | --- |
| Query criteria / sort / page size | Query Feature |
| Current result/page semantics | Query Feature |
| Stable selected record identity | Detail / transition lifecycle |
| Current Detail data | Detail Feature |
| Route / URL transport | Shell / Routing mechanism |
| Browser History integration | Shell + Feature contract |
| Audit semantic presentation | Platform Pattern |
| Business content composition | Feature Specification |

Principle inherited from the General Application Platform Architecture:

> **State ownership follows semantic lifecycle, not visual containment.**

---

## 9. Handoff to Maintenance Pattern

Read-only Detail is a base interaction pattern, not a requirement that Create / Update / Read share one implementation file or route.

Two valid architecture candidates remain open:

```text
Mode-based surface
Record Feature
├─ Create Mode
├─ Update Mode
└─ Read Mode
```

```text
Surface-separated implementation
Record Create
Record Update
Record Read
```

The next Pattern should compare them under real maintenance pressure rather than declaring one modern and the other obsolete.

The shared question is:

> Which semantics and lifecycle should be Platform-standard regardless of whether Create / Update / Read are one surface or three?

Next pressures include capability / authorization, Save / Cancel, dirty state, validation, Browser Back / navigation guard, concurrent update conflict and post-save return behavior.
