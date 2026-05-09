---
layout: layouts/post.njk
title: Good infrastructure reduces the cognitive cost of doing the right thing
date: 2024-10-03
description: The best infrastructure systems are not the most sophisticated. They are the ones that make correct behavior cheap and routine.
tags:
  - posts
tagsText: Infrastructure, Developer Experience, Engineering Leverage
---

Most infrastructure discussions focus on capability.

The more important question is cognitive cost.

A system can be technically correct and still damage engineering velocity if it requires too much mental overhead to use safely.

That is why operational simplicity matters.

## Friction compounds

Every additional step creates decision fatigue:

```text
connect VPN
find hostname
refresh credentials
switch AWS profile
remember port
restart tunnel
re-run bootstrap script
```

Individually these are small.

Repeated dozens of times per day across an engineering organization, they become organizational drag.

The important distinction is that engineers do not only spend energy solving business problems. They also spend energy navigating infrastructure.

Bad infrastructure taxes attention.

## The best systems feel boring

Good infrastructure often looks unimpressive.

The workflow feels obvious:

```text
ssh dev
pnpm test
make deploy
```

No ceremony.
No hidden state.
No recovery ritual.
No fragile sequence of tribal knowledge.

The goal is not cleverness.

The goal is reducing the cognitive cost of correct behavior.

## Reliability changes behavior

Engineers adapt to unreliable systems.

If deployments are scary, teams batch changes.
If tests are slow, teams avoid running them.
If environments are fragile, people stop experimenting.
If tooling is unpredictable, everyone creates local workarounds.

That adaptation is rational.

Infrastructure quality directly shapes engineering behavior.

## AI systems make this more important

AI-assisted development increases the amount of generated change flowing through the system.

That means:

- more branches
- more test runs
- more ephemeral environments
- more review load
- more infrastructure pressure

Organizations that succeed with AI will not merely generate more code. They will reduce the operational friction around validating and shipping changes.

## The rule I use

Good infrastructure reduces the cognitive cost of doing the right thing.

If the safe path is slow, confusing, or operationally painful, engineers will eventually route around it.

The strongest systems make correct behavior feel natural, cheap, and boring.
