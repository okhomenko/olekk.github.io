---
layout: layouts/post.njk
title: Architecture is the cost structure of change
date: 2025-11-18
description: "The way I judge architecture: does it make the next valuable change cheaper to understand, test, review, and recover from?"
tags:
  - posts
  - engineering
  - architecture
tagsText: Engineering Leverage, Architecture, Software Organizations
---

The way I judge architecture is not by the diagram. I judge it by the cost structure of change.

A system has good architecture when the next valuable change is cheap to understand, cheap to test, cheap to review, and cheap to ship. A system has bad architecture when every change requires broad context, informal permission, defensive testing, and a reviewer who remembers why the weird part exists.

The code may still run. The organization slows down.

## The mistake I watch for

The mistake I watch for is treating architecture as code organization. Packages, folders, services, layers, naming conventions, and dependency graphs matter, but they are not the point.

The point is economic.

Every unclear boundary becomes future coordination. Every hidden dependency becomes future regression risk. Every shared mutable surface becomes future review cost. Every shortcut that makes one change faster can make the next ten changes slower.

That is the architecture bill.

## Where the cost shows up

Software teams get slower when the cost of safe change rises. That cost shows up in predictable places:

- more files touched per feature
- more people required to approve a change
- more local knowledge needed to avoid breakage
- more test time before confidence
- more rollback fear
- more Slack archaeology
- more meetings to reconstruct ownership

None of these look like architecture problems at first. They look like delivery problems, quality problems, planning problems, or communication problems. Often they are architecture problems wearing organizational clothing.

## Boundaries are leverage

A good boundary does not merely make code prettier. It reduces how much of the system must be loaded into a human head before making a change.

That is leverage.

A useful module boundary should answer:

```text
Who owns this?
What can call it?
What can it call?
What can change without review from another area?
What failure does this boundary contain?
```

If a boundary does not reduce cognitive load, review scope, failure blast radius, or ownership ambiguity, I treat it as decorative until proven otherwise.

## AI raises the stakes

AI-assisted development makes this more important, not less.

Agents are good at local execution. They are bad at organizational judgment. They follow ambient authority, copy existing patterns, and make plausible changes across whatever surface area the repository allows.

In a clean system, agents can operate inside narrow boundaries and produce reviewable work. In a tangled system, agents create faster entropy.

The useful distinction is:

```text
AI increases execution speed.
Architecture determines whether that speed turns into leverage or cleanup.
```

## Review economics matter

Review is where architecture becomes visible. A small change with unclear boundaries can be expensive to review. A larger change inside a well-owned boundary can be cheap to review.

The metric is not lines of code. The metric is uncertainty.

A reviewer is really asking:

```text
Do I know the intended behavior?
Do I know the affected boundary?
Do I know what cannot be affected?
Do I trust the tests around this change?
Do I understand the rollback path?
```

Good architecture gives better answers to those questions.

## The tradeoff

Architecture is not free. Boundaries add ceremony. Abstractions add vocabulary. Enforcement adds friction. A system with too many boundaries becomes slow in a different way.

The goal is not maximum abstraction. The goal is making the common change cheap and the dangerous change obvious.

That is the tradeoff I care about.

## The rule I use

Architecture should make the next valuable change cheaper. If it does not reduce cost of change, cost of review, cost of testing, cost of ownership, or cost of recovery, it is probably not architecture. It is structure.

Structure is easy to create. Leverage is harder.

The test I use is:

```text
After this change, will future changes be easier to reason about?
```

If the answer is no, the architecture did not improve. The code only moved.

## Related essays

- [AI made code cheap. It did not make merge decisions cheap](/posts/ai-made-code-cheap.html)
- [Agents do not want your CRUD APIs](/posts/agents-do-not-want-your-crud-apis.html)
