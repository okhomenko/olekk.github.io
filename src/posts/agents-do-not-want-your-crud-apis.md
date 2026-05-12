---
layout: layouts/post.njk
title: Agents do not want your CRUD APIs
date: 2026-03-18
description: Most SaaS products are not agent-ready because their APIs expose implementation details instead of useful capabilities.
tags:
  - posts
  - agents
  - engineering
  - architecture
tagsText: AI agents, APIs, architecture, SaaS
---

Every B2B software company is going to claim it has an agentic platform. Most will start by wrapping existing APIs with an MCP server and declaring the job done.

That is not enough.

A headless product is not automatically an agent-ready product. Headless only means the interface is not tied to a human UI. It says nothing about whether the interface is understandable, safe, composable, or useful to an agent trying to accomplish a goal.

The old model of SaaS looked like this:

```text
human -> UI -> backend -> database
```

The common headless model looks like this:

```text
external system -> API -> backend -> database
```

The agentic model is different:

```text
agent -> capability surface -> execution systems -> observable outcomes
```

That middle layer matters. It is where most products are weak.

## Agents pursue goals, not screens

Humans can tolerate messy interfaces because they bring judgment, patience, and context. They can click around, read labels, recover from ambiguity, ask someone in Slack, and decide that a weird warning probably does not matter.

Agents are worse at that kind of product anthropology. They need explicit affordances. They need names that mean something. They need operations with clear preconditions, side effects, and outcomes.

Most APIs were not designed that way. They were designed as remote access to internal objects.

```text
POST /subscriptions/{id}/addons
PATCH /customers/{id}
POST /coupons/apply
DELETE /discounts/{id}
```

Those endpoints may be fine for an integration written by an engineer who already understands the product. They are much less useful for an agent asked to do something higher level:

```text
retain this customer
recover this failed payment
prepare a downgrade offer
explain why expansion revenue dropped
```

The gap between those two layers is where agentic product design lives.

## MCP is transport, not product design

MCP can make tools discoverable to a model. That is useful. But a protocol does not repair weak product semantics.

If the underlying actions are low-level, inconsistent, unsafe, or full of hidden side effects, wrapping them in MCP only makes the confusion easier to reach.

A bad API behind an MCP server is still a bad API. It is just easier for an agent to misuse.

## Capability design is the real work

An agent-ready product needs a capability layer. Not just endpoints. Not just generated OpenAPI descriptions. Capabilities.

A capability is a product-level action with a meaningful outcome.

Bad shape:

```json
{
  "operation": "updateSubscription",
  "subscription_id": "sub_123",
  "fields": {
    "plan_id": "starter_annual"
  }
}
```

Better shape:

```json
{
  "capability": "prepare_downgrade_offer",
  "customer_id": "cus_123",
  "constraints": {
    "preserve_annual_term": true,
    "max_discount_percent": 20,
    "requires_human_approval": true
  }
}
```

The second interface is not just syntactic sugar. It carries intent. It exposes constraints. It gives the platform a place to enforce policy, explain tradeoffs, and produce an auditable result.

That is the difference between an API that lets an agent mutate state and an interface that lets an agent operate the product.

## Good agentic interfaces are boring in specific ways

The hard part is not making the interface feel magical. The hard part is making it boring enough to trust.

Agent-facing actions should be:

```text
idempotent
observable
bounded
composable
reversible when possible
explicit about side effects
clear about required approval
clear about cost and risk
```

This is normal backend engineering, but the tolerance for sloppiness is lower. Agents retry. Agents compose actions. Agents act quickly. Agents will find every place where the system relies on tribal knowledge or UI-only guardrails.

If an operation cannot safely be retried, say so. If it sends an email, say so. If it changes billing, say so. If it requires approval, encode that in the action instead of hoping the caller read a paragraph in a document.

## The UI is no longer the only product surface

For years, product quality mostly meant human UX. Is the workflow clear? Are the buttons obvious? Does the user understand what happened?

Agentic UX asks a different question:

```text
Can a non-human operator understand the available capabilities, select the right one, execute it safely, and verify the outcome?
```

That does not remove the UI. It changes its role. The UI becomes one product surface among several. The capability layer becomes more central because both humans and agents eventually depend on it.

A product with a beautiful UI and a chaotic backend will struggle here. The agent does not care that the screen is polished. It cares whether the system exposes clean actions with clean semantics.

## This punishes accidental architecture

The companies that will struggle are not necessarily the ones without AI teams. They are the ones whose products grew through years of local exceptions:

```text
one-off workflows
implicit state machines
side effects hidden in services
API fields nobody can explain
permissions checked only in the UI
business rules copied across layers
```

That architecture was already expensive. Agents make it more visible.

A human can learn the mess. An agent can be prompted around it for a while. But durable autonomy requires the system itself to become more legible.

This is why agentic software is not only an AI problem. It is a domain modeling problem. It is an API design problem. It is an authorization problem. It is an observability problem. It is a product semantics problem.

## The likely winners

The winners in B2B AI will not simply be the companies with the most agents. They will be the companies with the cleanest capability surfaces.

That means:

```text
clear domain boundaries
high-level product actions
explicit constraints
safe execution semantics
structured outcomes
strong audit trails
```

The model matters, but the model is not the moat. Models will keep improving and becoming easier to call. The harder asset is a product whose capabilities are coherent enough for agents to operate without turning the system into a slot machine.

## The practical test

A useful test for any SaaS product is simple:

```text
Could an agent operate this product without pretending to be a human?
```

If the answer is no, the product is not really agent-ready. It may have APIs. It may have MCP. It may have AI features. But it does not yet have an agentic interface.

The work starts by identifying the real capabilities of the product and exposing them as safe, constrained, observable actions.

Agents do not want your CRUD APIs.

They want the ability to get useful work done without inheriting every leak in your internal model.
