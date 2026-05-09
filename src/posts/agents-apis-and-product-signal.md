---
layout: layouts/post.njk
title: Agent APIs need an intent layer
date: 2026-04-12
description: If agents become the interface, API logs stop being enough. Products need to capture the user goal before it becomes a tool call.
tags:
  - posts
tagsText: AI Agents, APIs, Product Architecture
---

A customer says:

> We have too many angry customers after failed payments. Can you clean this up before renewal?

An agent understands the request, checks a few systems, and calls an API:

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

```text
retry_invoice succeeded
```

Technically, everything worked.

Product-wise, almost everything important disappeared.

The customer was not really asking to retry one invoice. They were asking how to recover revenue, reduce churn, avoid annoying customers, and fix whatever is causing renewal pain. The API saw the action. The product lost the demand signal.

That is the problem with agent-facing APIs designed only as execution surfaces.

## The discovery loop moves away from the product

Traditional SaaS products learn from messy human behavior.

Users search for the wrong words. They click the wrong thing. They abandon flows. They export data to spreadsheets. They open support tickets. They ask sales for features that do not match the product model.

That mess is not noise. It is product signal.

If users keep searching for “failed payment churn,” but the product only has a page called “invoice retries,” the mismatch tells us something important: users think in business outcomes, not internal product objects.

Agents can erase that mismatch.

The user may never search inside the product. They may never click through the retry page. They may just ask an agent:

> Fix failed-payment churn for accounts renewing this month.

The agent then calls five clean APIs.

From the SaaS product's side, everything looks precise. In reality, the product may have lost the original business problem.

## Execution logs are not product intelligence

APIs are supposed to be precise. They take known inputs and return predictable outputs:

```text
customer_id
invoice_id
coupon_id
subscription_id
```

That is good for execution.

It is weak for discovery.

The valuable part often starts before execution:

```text
I want to save this customer.
I want to reduce churn.
I want to stop annoying users.
I want to know why this keeps happening.
I want to compare options before touching revenue.
```

If the agent compresses that intent into `retry_invoice`, and we only log `retry_invoice`, our analytics get cleaner and dumber at the same time.

We know what happened.

We do not know why it happened.

## The risk is blind infrastructure

If agents become the main interface, the agent owns the product conversation.

The agent sees the original question, the confusion, the failed attempts, the alternatives, the tradeoffs, and the missing capability.

The SaaS product sees:

```text
POST /retry_invoice 200
POST /apply_discount 200
POST /update_subscription 200
```

That is not enough.

At that point, the product still executes the work. It may still get API traffic. It may still make money. But the system closest to the user learns what to build next faster than the system doing the work.

That is how a product becomes infrastructure.

Not because it failed technically.

Because it lost the demand signal.

## MCP makes this concrete

MCP gives agents a standard way to discover and call tools. That is useful. But many tools are still shaped like basic RPC endpoints:

```ts
server.tool("retry_invoice", {
  customerId: z.string(),
  invoiceId: z.string()
}, async ({ customerId, invoiceId }) => {
  return retryInvoice(customerId, invoiceId);
});
```

This works mechanically.

It captures the customer, invoice, and action. It does not capture what the user asked for, why the agent chose this action, what constraint mattered, whether the agent had doubts, or whether the product lacked a better workflow.

For agent-facing APIs, that is too weak.

## Add intent to the contract

Do not ask agents to include intent as optional telemetry. That will decay.

Make intent part of the interface.

A minimal intent object can be simple:

```ts
const IntentContext = z.object({
  user_goal: z.string().min(20),
  job_to_be_done: z.enum([
    "recover_revenue",
    "reduce_churn",
    "save_customer_relationship",
    "fix_billing_error",
    "explore_options",
    "unknown"
  ]),
  constraints: z.array(z.string()).default([]),
  reason_for_action: z.string().min(20),
  confidence: z.enum(["high", "medium", "low"]),
  missing_context: z.array(z.string()).default([])
});
```

Then high-value tools require it:

```ts
server.tool("apply_retention_offer", {
  accountId: z.string(),
  subscriptionId: z.string(),
  offerId: z.string(),
  intent: IntentContext
}, async (input) => {
  await recordIntentSignal({
    surface: "mcp",
    tool: "apply_retention_offer",
    accountId: input.accountId,
    subscriptionId: input.subscriptionId,
    intent: input.intent
  });

  return applyRetentionOffer(input);
});
```

Now the product records two things:

1. The action: retention offer applied.
2. The reason: the user wanted to save a renewal at risk without damaging the customer relationship.

Those are different levels of product intelligence.

## Make intent the parent object

For important workflows, intent should be first-class.

The agent creates an intent record first:

```text
Intent
  raw_user_request
  normalized_goal
  desired_outcome
  constraints
  urgency
```

Then execution tools attach to that intent:

```text
Intent int_01JZ...
  -> list failed invoices
  -> preview retry plan
  -> apply retention offer
  -> schedule payment retry
```

That model lets the product team ask better questions:

- What are customers trying to accomplish?
- Which intents require too many tool calls?
- Which intents fail often?
- Which intents need workarounds?
- Which intents are growing every month?
- Which intents have no native workflow yet?

Endpoint frequency tells you what ran.

Intent frequency tells you what customers needed.

## Capture unmet intent

The most valuable signal is often not the successful API call. It is the failed request.

In the old product world, this looked like search with no results, abandoned checkout, failed onboarding, support escalation, or spreadsheet workarounds.

In the agent world, capture it explicitly:

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

If ten customers ask agents to compare retry strategy against churn risk, and the agent has to hack around it every time, that is roadmap signal.

But only if the system records the unmet intent.

## Do not rely on raw conversation logs

A weak answer is:

> We will just log the whole agent conversation.

Raw logs are useful for debugging. They are bad as the primary product signal.

They are noisy. They are hard to aggregate. They may contain sensitive data. They require expensive analysis later. They also do not force the agent to classify what happened.

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

That is not just observability.

That is roadmap input.

## The rule

Every important agent-facing API should answer four questions:

1. What action was taken?
2. What user goal caused the action?
3. Why did the agent choose this action?
4. What could the product not do directly?

Most APIs only answer the first question.

That was acceptable when humans used the UI and product teams could observe the surrounding behavior. It is not acceptable when agents become the interface.

In the old world, the product primitive was the clickstream.

In the API world, it was the request log.

In the agent world, it should be the intent graph.

Do not let agents turn human intent into silent API traffic.

If we do this well, agents can give us better product signal than the UI did.

If we do it badly, we will automate the work and lose the learning.

That is the failure mode.

Not broken APIs.

Blind products.
