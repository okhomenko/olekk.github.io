---
layout: layouts/post.njk
title: Software teams get slow for predictable reasons
date: 2026-05-09
description: Most engineering slowdowns are not mysterious. They are accumulated coordination costs hiding behind technical systems.
tags:
  - posts
tagsText: Engineering Leverage, Organizations, Architecture
---

Software teams rarely become slow all at once. Velocity usually degrades through accumulated coordination cost.

At first the changes are small:

- more meetings before implementation
- more reviewers per pull request
- more uncertainty around ownership
- more defensive testing
- more waiting for context
- more time reconstructing why something exists

Each individual slowdown looks reasonable. Together they create organizational drag.

## The common mistake

Teams often blame delivery problems on people:

```text
not enough ownership
not enough urgency
not enough process
not enough communication
```

Sometimes that is true.

Often the deeper problem is that the system itself became expensive to change.

Once changes require broad context, cross-team coordination, and fear-driven review cycles, the organization slows regardless of how talented the engineers are.

## Coordination is a tax

Every shared dependency increases coordination cost.

That does not mean all sharing is bad. It means dependency surfaces should be intentional.

A healthy system limits how much of the organization must synchronize for one useful change to happen.

The useful metric is not lines of code. The useful metric is:

```text
How many humans must coordinate to safely ship this change?
```

That is where architecture, ownership, tooling, and review systems converge.

## AI changes the slope

AI-assisted development increases execution speed. That is useful only if review, testing, and ownership boundaries scale with it.

Otherwise the organization enters a dangerous state:

```text
changes become cheaper to create
but more expensive to trust
```

That gap creates review bottlenecks, regression fear, and operational fatigue.

The winning organizations will not be the ones generating the most code. They will be the ones with the cleanest execution systems.

## The rule I use

A software organization gets faster when the cost of safe change falls.

That means:

- smaller review surfaces
- clearer ownership
- stronger boundaries
- faster local feedback loops
- simpler operational models
- less hidden coupling

The goal is not maximizing activity.

The goal is reducing the organizational cost of useful change.
