---
title: Growth engineering is the business of reducing the cost of learning
description: "The way I judge growth engineering: does the work make the next product question cheaper, safer, and easier to trust?"
date: 2024-10-17
tags:
  - posts
  - engineering
layout: layouts/post.njk
tagsText: Growth, Engineering, Product Systems
---

The way I judge growth engineering is not by how many experiments ship. I judge it by whether the next product question becomes cheaper, safer, and easier to trust.

Growth engineering is often described as experimentation work: change a flow, add an offer, move a button, test the result, repeat. That description is not wrong, but it is too small.

The higher-leverage version of growth engineering is the business of reducing the cost of learning.

Every product company has questions it wants to ask. Which customers are ready for expansion? Which customers are at risk? Which offers help without training customers to wait for discounts? Which lifecycle moments deserve intervention? Which parts of the product journey create confusion, friction, or unnecessary churn?

The quality of a growth system is partly determined by how cheaply, safely, and repeatedly the company can ask those questions.

## The experiment is not the asset

A weak growth system turns every question into a custom project. A strong growth system turns repeated questions into reusable capabilities: targeting, eligibility, offer configuration, exposure logging, rollout controls, analytics contracts, audit trails, and safe rollback.

The experiment is not the asset. The learning system is the asset.

That distinction matters because the visible cost of an experiment is only engineering time. The real cost includes product time to define the question, design time to shape the experience, engineering time to implement the flow, data time to define measurement, QA time to verify permutations, support time to understand customer impact, and operational time when rollout behavior does not match the plan.

Then there is the most expensive cost: false confidence.

## Bad learning is worse than slow learning

A bad experiment can produce a number without producing knowledge. That happens when exposure is not logged correctly, eligibility rules are unclear, tracking changes midstream, users see multiple treatments, or the metric moves and nobody understands why.

That is the failure mode I care about. Growth engineering must protect the business from learning the wrong lesson.

Instrumentation is part of the product architecture. It is not a dashboard detail. It is how the company preserves the integrity of its feedback loop.

## Growth work lives between systems

Growth engineering rarely belongs to one layer of the stack. It touches identity, billing, subscriptions, entitlements, pricing, lifecycle events, email, analytics, support tooling, permissions, experiments, and customer-facing UI.

That is why growth work often looks deceptively simple from the outside and surprisingly complex from the inside.

A cancellation offer is not just a screen. It may depend on customer segment, subscription state, contract terms, region, product usage, payment history, support context, and compliance rules. A pricing experiment is not just a price change. It touches invoices, tax, analytics, entitlements, revenue reporting, and customer expectations.

The role of engineering is not merely to make the screen render. The role is to make the business action safe, observable, reversible, and understandable.

## I look for missing primitives

I am suspicious of repeated one-off growth work. If every new offer requires a custom implementation, the system is telling you something. If every lifecycle campaign needs new wiring, the system is telling you something. If every experiment requires a new analytics debate, the system is telling you something.

The question I would ask is not only:

```text
How do we ship this?
```

The better question is:

```text
What capability would make this class of work cheaper next time?
```

That does not mean every feature deserves a platform. Premature platforms are expensive. The engineering judgment is knowing when a request is a one-time exception and when it reveals a missing primitive.

## The metric is learning velocity

Shipping more experiments is not automatically better. A team can increase output while decreasing understanding.

The useful metric is learning velocity: how quickly the company can move from question to safe production exposure to trustworthy interpretation to the next decision.

That requires more than frontend speed. It requires backend contracts, event discipline, operational ownership, clean state models, and an architecture that makes change cheap without making correctness optional.

This is where growth engineering becomes strategic. It does not just serve the roadmap. It improves the company's ability to discover what the roadmap should become.

## The senior engineering role

The senior engineering question is not only whether the implementation works. The question is whether it improves the learning system.

```text
Did we make the next experiment cheaper?
Did we make the result easier to trust?
Did we reduce coordination cost?
Did we create a reusable primitive?
Did we make the product safer to change?
```

That is the difference between shipping growth work and building growth leverage.

The best growth teams do not merely run experiments. They build the machinery that makes better questions possible.

## Related essays

- [Agent APIs need an intent layer](/posts/agents-apis-and-product-signal.html)
- [Architecture is the cost structure of change](/posts/architecture-is-the-cost-structure-of-change.html)

## Further reading

- Nicole Forsgren, Jez Humble, and Gene Kim, *Accelerate*
- Martin Fowler, *Feature Toggles*
- Matthew Skelton and Manuel Pais, *Team Topologies*
- Ronny Kohavi, Diane Tang, and Ya Xu, *Trustworthy Online Controlled Experiments*
