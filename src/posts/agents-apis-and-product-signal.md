---
title: Agents, APIs, and the Product Signal We Are About to Lose
description: When agents call our APIs, we must capture the user's real goal, not only the final tool call.
date: 2026-04-12
tags: posts
layout: layouts/base.njk
---

A customer says:

> We have too many angry customers after failed payments. Can you clean this up before renewal?

An AI agent understands the request, checks a few systems, and calls an API:

```json
{
  "tool": "retry_invoice",
  "arguments": {
    "customer_id": "cus_123",
    "invoice_id": "inv_456"
  }
}
```

The API log says:

```txt
retry_invoice succeeded
```

Technically, everything worked.

But product-wise, we lost almost everything important.

The customer was not really asking to retry one invoice. They were asking some combination of:

- Why are payments failing?
- How do we recover revenue without annoying customers?
- Should we change retry timing?
- Should we send a different message?
- Should we offer an extension?
- Is this a billing problem, a lifecycle problem, or a retention problem?

The API only saw the final action.

It did not see the real intent.

That is the problem.

## Why this matters

In normal SaaS products, users create a lot of signal before they finish an action.

They search. They click the wrong thing. They abandon a flow. They open support tickets. They ask sales weird questions. They export data to spreadsheets. They describe their problem in messy human language.

That mess is valuable.

It tells the product team what people are trying to do before the product has a clean feature for it.

A simple example:

If users keep searching for “failed payment churn,” but the product only has a page called “invoice retries,” that mismatch is product signal.

It tells us the user does not think in our internal product model. They think in business outcomes.

Now add agents.

The user may never search inside the product. They may never click through the UI. They may never open our retry page. They may just ask an agent:

> Fix failed-payment churn for accounts renewing this month.

Then the agent calls five APIs.

From our side, we see five clean API calls.

But we do not see the original business problem unless we design for it.

## APIs are good at execution, bad at intent

APIs are supposed to be precise.

That is why we like them.

They take known inputs and return predictable outputs:

```txt
customer_id
invoice_id
coupon_id
subscription_id
```

That is great for execution.

But product development depends on understanding the vague part before execution:

```txt
I want to save this customer.
I want to reduce churn.
I want to stop annoying users.
I want to know why this keeps happening.
I want to compare options before touching revenue.
```

Those are not just comments. Those are the real product requirements.

If an agent turns that intent into `retry_invoice`, and we only log `retry_invoice`, our product analytics become dumber.

We know what happened.

We do not know why it happened.

## The risk: becoming blind infrastructure

This is the bigger strategic risk for SaaS companies.

If agents become the main interface, the agent sees the customer goal.

The agent sees:

- the original question
- the confusion
- the failed attempts
- the tradeoffs
- the alternatives
- the missing product capability

The SaaS product sees:

```txt
POST /retry_invoice 200
POST /apply_discount 200
POST /update_subscription 200
```

That is not enough.

At that point, the SaaS product still executes the work, but the agent owns the product conversation.

That means the agent owner may learn what to build next faster than the SaaS vendor does.

That is how a product becomes infrastructure.

It still gets used.

It still gets API traffic.

It may still make money.

But it loses direct visibility into customer demand.

That is dangerous.

## MCP makes this concrete

MCP gives agents a standard way to call tools.

That is useful.

But many MCP tools are designed like basic RPC endpoints:

```ts
server.tool("retry_invoice", {
  customerId: z.string(),
  invoiceId: z.string()
}, async ({ customerId, invoiceId }) => {
  return retryInvoice(customerId, invoiceId);
});
```

This works mechanically.

But it only captures:

- which invoice
- which customer
- which action

It does not capture:

- what the user originally asked for
- why the agent chose this action
- what business outcome the user wanted
- what constraints mattered
- whether the agent had doubts
- whether the product was missing a better workflow

For agent-facing APIs, that is too weak.

## Bad design: tool call only

This is the kind of MCP tool that loses product signal:

```ts
server.tool("apply_discount", {
  subscriptionId: z.string(),
  couponId: z.string()
}, async ({ subscriptionId, couponId }) => {
  return applyDiscount({ subscriptionId, couponId });
});
```

It tells us that a discount was applied.

It does not tell us why.

Was the user trying to save a churning customer?

Fix a billing mistake?

Match a competitor offer?

Reduce support pressure?

Test a lifecycle campaign?

Protect an enterprise renewal?

Those are different product problems. They just happen to use the same low-level API.

## Better design: require intent

The tool should force the agent to pass the user intent together with the action.

Something like this:

```ts
const IntentContext = z.object({
  user_goal: z.string().min(20).describe(
    "The user's original goal in plain business language. Do not reduce this to the API action."
  ),

  job_to_be_done: z.enum([
    "recover_revenue",
    "reduce_churn",
    "save_customer_relationship",
    "fix_billing_error",
    "explore_options",
    "unknown"
  ]),

  constraints: z.array(z.string()).default([]).describe(
    "Important constraints from the user, such as avoid annoying the customer, preserve ARR, do not discount, or finish before renewal."
  ),

  reason_for_action: z.string().min(20).describe(
    "Why the agent chose this tool instead of another option."
  ),

  confidence: z.enum(["high", "medium", "low"]),

  missing_context: z.array(z.string()).default([])
});
```

Then the tool requires it:

```ts
server.tool("apply_retention_offer", {
  accountId: z.string(),
  subscriptionId: z.string(),
  offerId: z.string(),
  intent: IntentContext
}, async ({ accountId, subscriptionId, offerId, intent }) => {
  await recordIntentSignal({
    surface: "mcp",
    tool: "apply_retention_offer",
    accountId,
    subscriptionId,
    intent
  });

  return applyRetentionOffer({
    accountId,
    subscriptionId,
    offerId
  });
});
```

Now the API records two things:

1. The action: retention offer applied.
2. The reason: user wanted to save a renewal at risk without damaging the customer relationship.

That is much more useful.

## Even better: create intent first, then execute tools

For important workflows, I would make intent a first-class object.

First, the agent creates an intent record:

```ts
server.tool("create_customer_intent", {
  raw_user_request: z.string().min(1),

  normalized_goal: z.string().min(20).describe(
    "A clean summary of what the user is trying to accomplish."
  ),

  domain: z.enum([
    "billing",
    "retention",
    "lifecycle",
    "pricing",
    "support",
    "analytics",
    "unknown"
  ]),

  desired_outcome: z.string().min(10),

  constraints: z.array(z.string()).default([]),

  urgency: z.enum(["low", "normal", "high", "critical"])
}, async (input) => {
  return createIntentRecord(input);
});
```

Then every execution tool requires the `intentId`:

```ts
server.tool("retry_invoice", {
  intentId: z.string(),
  customerId: z.string(),
  invoiceId: z.string(),
  retryStrategy: z.enum(["standard", "gentle", "aggressive", "custom"]),
  reason_for_tool_choice: z.string().min(20)
}, async (input) => {
  await linkToolCallToIntent({
    intentId: input.intentId,
    tool: "retry_invoice",
    reason: input.reason_for_tool_choice
  });

  return retryInvoice(input);
});
```

This gives us a better model:

```txt
Intent
  -> list failed invoices
  -> preview retry plan
  -> apply retention offer
  -> schedule retry
```

The intent becomes the parent.

The tool calls become children.

Now we can ask product questions:

- What are customers trying to accomplish?
- Which intents require too many tool calls?
- Which intents fail often?
- Which intents need workarounds?
- Which intents are growing every month?
- Which intents do not have a native product workflow yet?

That is where future product development comes from.

## Capture what the agent could not do

The most valuable signal is often not the successful API call.

It is the failed request.

In the old product world, this was:

- search with no results
- abandoned checkout
- failed onboarding
- support escalation
- spreadsheet workaround

In the agent world, we need to capture the same thing explicitly.

Example MCP tool:

```ts
server.tool("record_unmet_intent", {
  raw_user_request: z.string().min(1),

  normalized_goal: z.string().min(20),

  attempted_tools: z.array(z.string()).default([]),

  reason_unmet: z.enum([
    "missing_api_capability",
    "missing_permissions",
    "missing_data",
    "ambiguous_user_request",
    "product_workflow_gap",
    "unsafe_or_policy_blocked",
    "unknown"
  ]),

  workaround_used: z.string().optional(),

  product_gap_hypothesis: z.string().optional()
}, async (input) => {
  return recordProductSignal(input);
});
```

This matters because the roadmap often lives in the failed request.

If ten customers ask agents to “compare retry strategy against churn risk,” and the agent has to hack around it every time, that is a product opportunity.

But we only learn that if we capture the unmet intent.

## Do not rely only on conversation logs

A weak answer is:

> We will just log the whole agent conversation.

That is not enough.

Raw logs are useful for debugging, but bad for product learning.

They are noisy. They are hard to aggregate. They may contain sensitive data. They require expensive analysis later. And they do not force the agent to classify what happened.

A better event looks like this:

```json
{
  "intent_id": "int_01JZ...",
  "surface": "mcp",
  "raw_user_request_redacted": "Help reduce failed-payment churn before renewal",
  "normalized_goal": "Recover revenue without aggressive customer-hostile retries",
  "job_to_be_done": "recover_revenue",
  "constraints": [
    "avoid aggressive retries",
    "protect enterprise relationship",
    "resolve before renewal date"
  ],
  "tools_called": [
    "list_failed_invoices",
    "preview_retry_plan",
    "apply_retention_offer",
    "schedule_payment_retry"
  ],
  "unmet_needs": [
    "No native way to compare retry strategy against churn risk"
  ],
  "confidence": "medium",
  "outcome": "completed_with_workaround"
}
```

This is not just an API log.

This is product intelligence.

## Make intent required, not optional

The important part is enforcement.

Do not ask agents to “please include intent.”

That will decay.

Make intent part of the schema.

Reject important tool calls when intent is missing.

```ts
function requireIntent(input: { intent?: unknown }) {
  const parsed = IntentContext.safeParse(input.intent);

  if (!parsed.success) {
    throw new Error(
      "This tool requires intent context: user_goal, job_to_be_done, constraints, reason_for_action, confidence."
    );
  }

  return parsed.data;
}
```

Then use it:

```ts
server.tool("change_subscription_plan", {
  subscriptionId: z.string(),
  newPlanId: z.string(),
  effectiveDate: z.string(),
  intent: IntentContext
}, async (input) => {
  const intent = requireIntent(input);

  await recordIntentSignal({
    tool: "change_subscription_plan",
    subscriptionId: input.subscriptionId,
    intent
  });

  return changeSubscriptionPlan(input);
});
```

This is the core design rule:

**Do not let agents turn human intent into silent API traffic.**

## What every agent-facing API should answer

Every important agent-facing tool should answer four questions:

1. What action was taken?
2. What user goal caused the action?
3. Why did the agent choose this action?
4. What could the product not do directly?

Most APIs only answer the first question.

That was acceptable when humans used the UI and product teams could observe the surrounding behavior.

It is not acceptable when agents become the interface.

In the old world, the product primitive was the clickstream.

In the API world, it was the request log.

In the agent world, it should be the intent graph.

If we do this well, agents can give us better product signal than the UI did.

If we do it badly, we will automate the work and lose the learning.

That is the failure mode.

Not broken APIs.

Blind products.
