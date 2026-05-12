---
layout: layouts/post.njk
title: AI made code cheap. It did not make merge decisions cheap
date: 2025-11-06
description: "The rule I use for AI-heavy development: make generation cheap, but make new obligations intentional."
tags:
  - posts
  - engineering
tagsText: AI, Engineering Leadership, Software Organizations
---

The rule I use for AI-heavy development is simple: make generation cheap, but make new obligations intentional.

AI did not create a code generation problem. It created a filtering problem. I do not worry first about whether a team can produce more code. I worry about whether the team can still decide what is worth merging.

For a long time, writing code had natural friction. Even a small feature required enough effort that someone usually had to believe it was worth doing. Implementation cost acted as a crude filter. It blocked good work too, but it also prevented some bad work from entering the system.

That filter is weakening. AI can draft components, wire state, generate tests, move files, create abstractions, and fill in repetitive work faster than a human would type it. That is useful. But the cost of understanding, reviewing, owning, operating, and eventually deleting that code did not fall at the same rate.

Those costs moved to the merge decision.

## Effort used to filter ideas

Before AI, effort was not only a production cost. It was also a decision mechanism. If a change required a lot of work, people were more likely to ask whether it mattered. If a refactor was tedious, someone had to justify the pain. If a new abstraction took time to build, there was at least some resistance before it entered the system.

Now the first draft is cheap. More ideas become code. More experiments become pull requests. More small annoyances become patches. More speculative abstractions look affordable.

The organization sees more output, but not necessarily more value.

## Review becomes the bottleneck

Code generation scales better than human judgment. A developer with AI can produce more diffs. A team with agents can produce even more. Reviewers still have limited attention. Architects still have limited context. Product still has limited ability to reason about every small change entering the system.

The bottleneck moves from writing code to evaluating code. The question is no longer only:

```text
Can we build this?
```

The better question is:

```text
Is this worth merging?
```

Those are not the same question. A change can be correct and still not be worth merging. It can pass tests and still increase cognitive load. It can improve one screen and still damage consistency. It can remove one local inconvenience and create a platform obligation.

AI makes these tradeoffs appear more often because it lowers the price of creating them.

## Plausible code is the real risk

The risk I watch for is not obviously bad code. Obviously bad code is usually easy to reject.

The risk is plausible code: code that compiles, matches nearby patterns, satisfies the ticket, and looks normal in a diff. Plausible code can still be wrong at the system level. It may duplicate an existing pattern, create a second way to solve the same problem, add an abstraction before the organization has enough examples, move logic into the wrong layer, or be locally clean but globally expensive.

That is the kind of code that survives weak review.

## The merge is the economic event

The expensive moment is not when code is written. It is when code is merged.

A merge creates future obligations:

- someone must own the behavior
- someone must debug it later
- someone must migrate it when the platform changes
- someone must explain why it exists
- someone must decide whether future work should follow it

Every merge spends organizational attention. AI makes it easier to create obligations faster than teams can evaluate them.

The response should not be to make coding harder. That is the wrong friction. The response should be to make merging more intentional.

## Fast paths and slow paths

The operating system I want is fast paths for known work and slow paths for new commitments.

Reusing an existing component should be fast. Following an established pattern should be fast. Making a small change inside a clear boundary should be fast.

Creating a new pattern should be slower. Adding a shared abstraction should be slower. Changing ownership boundaries should be slower. Introducing another way to solve an existing problem should be slower.

This is not about limiting people. It is about protecting the system from accidental surface area.

```text
Fast for known paths.
Slow for new obligations.
```

## UI teams feel this early

UI teams feel this early because UI code is easy to generate and easy to visually validate at a shallow level. A screen can look right while the system gets worse underneath.

The component tree can become less coherent. State ownership can drift. Styling can fork. Accessibility can become inconsistent. Loading and error states can become random. Design tokens can be bypassed. The same table, form, modal, or empty state can be rebuilt five times with slightly different behavior.

Each individual change may look harmless. The product becomes harder to change.

This is why design systems, component contracts, review standards, and visual checks matter more in an AI-heavy workflow. They are not ceremony. They are filters. They make the correct path cheap and the divergent path visible.

## The leadership job changes

Engineering leadership has to stop treating output as the main signal. More code is not automatically more progress. More pull requests are not automatically more throughput. More merged work is not automatically more value.

The questions I would rather ask are:

```text
Did this change reduce or increase future cost?
Did it reuse an existing path?
Did it create a new obligation?
Who owns it?
What behavior is now easier?
What behavior is now harder?
What can we safely ignore because of this boundary?
```

Those questions are judgment work. AI can assist with them, but it cannot own them.

## The principle

AI made code cheap. It did not make software cheap.

Software still has to be understood, reviewed, operated, changed, and eventually removed. Those are the expensive parts. The teams that benefit most from AI will not be the teams that generate the most code. They will be the teams with the best filters.

The future advantage is not code generation. The future advantage is high-quality merge decisions.

## Related essays

- [Architecture is the cost structure of change](/posts/architecture-is-the-cost-structure-of-change.html)
- [Git worktrees expose the real cost structure of JavaScript repositories](/posts/git-worktrees-node-modules.html)
