# D-BATCH-1 Platform Pattern Checkpoint

> Temporary checkpoint captured during active experimentation. Merge durable conclusions into the main experiment record and Supabase Cron implementation guide when D-BATCH-1 closes.

## Why this matters

D-BATCH-1 is not only testing whether Supabase Cron can schedule work. The experiment is accumulating evidence for a future self-built development platform and its batch / scheduled-work patterns.

A technically feasible pattern does **not** automatically become the current platform standard.

Keep these concepts separate:

```text
Feasibility Evidence
→ Pattern Candidate
→ Current Platform Adoption Judgment
→ Platform Standard / Guide
```

Platform adoption is time-sensitive. A pattern can be technically verified and intentionally deferred because the current platform should start with fewer standard patterns. Deferred does not mean rejected.

Suggested pattern states:

```text
Available / Preferred Now
Deferred
Future Expansion Candidate
Rejected
Deprecated
```

Future platform growth should re-evaluate known deferred capabilities before opening new research from zero.

## Parameter Preparation Responsibility Ladder

A scheduled requirement should be placed at the simplest layer that keeps responsibility clear.

```text
1. Static Literal
   Cron → Core API

2. Simple SQL Runtime Expression
   Cron → SQL expression → Core API

3. DB Helper / Parameter Function
   Cron → PostgreSQL Function return value → Core API

4. Launcher / Shell API
   Cron → Launcher API → Core API

5. Orchestrator
   Cron → Orchestrator → multiple operations / APIs
```

The general direction is:

> As parameter preparation or workflow complexity grows, responsibility should move out of Cron command text and toward an application-layer launcher or orchestrator.

Do not keep logic in SQL merely because SQL can technically express it.

## Intended future documentation split

### Platform Guide

For actual development work:

- Which patterns the platform currently provides
- Selection criteria
- How to use them
- Constraints
- Templates / samples

### Known Capability / Future Pattern Index

For platform evolution:

- Technically verified but not yet standardized patterns
- Evidence links
- Trade-offs
- Reasons for current deferment
- Conditions that may justify future promotion

This prevents both repeated research and premature platform over-design.

## D-BATCH-1 implementation evidence to preserve later

The final experiment record / implementation guide should include representative Cron command or SQL samples for:

- Static request body
- `jsonb_build_object(...)` with execution-time values such as `current_date` / `now()`
- PostgreSQL Function return value used as an API parameter
- PostgreSQL Function returning a complete `jsonb` request body
- Cron calling a Launcher / Shell API
- Clear distinction between Launcher and Orchestrator responsibilities
