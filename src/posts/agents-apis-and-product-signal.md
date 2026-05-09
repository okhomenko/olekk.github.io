---
title: Agents, APIs, and the Product Signal We Are About to Lose
description: If agents become the main interface to software, execution APIs are not enough. Product teams need to preserve user intent before agents compress it into tool calls.
date: 2026-05-09
tags: posts
layout: layouts/base.njk
---

The dangerous part of agentic software is not that agents will call our APIs.

That part is obvious.

The dangerous part is that once agents call our APIs, we may stop seeing what people actually wanted.

A human user carries intent. They search, hesitate, rephrase, abandon, complain, compare, and misuse the product in interesting ways. That messy behavior is not noise. It is the product signal.

An agent compresses that mess into an execution path.

The user says something vague like:

> We have too many angry customers after failed payments. Can you clean this up before renewal?

The agent turns that into:

```json
{
  "tool": "retry_invoice",
  "arguments": {
    "customer_id": "cus_123",
    "invoice_id": "inv_456"
  }
}
```

The system records that an invoice retry happened.

But the business question was not really “retry this invoice.”

The real question may have been:

- Why are so many customers failing at renewal?
- Which recovery message works best for this segment?
- Should we offer an extension before retrying?
- Are we damaging trust by retrying too aggressively?
- Is this really a payment problem, or a lifecycle problem?

If all we capture is the final API call, we learn less than we used to learn from the old UI.

That is the strategic problem.

## APIs optimize for execution. Product discovery depends on ambiguity.

APIs are designed to be precise.

They want stable inputs, known identifiers, valid states, explicit permissions, predictable output.

That is good engineering.

But product development often starts from imprecise human behavior:

- search queries that do not match the product model
- support tickets written in emotional language
- repeated workarounds
- abandoned flows
- spreadsheet exports used as shadow product surfaces
- “can it also do this?” questions in sales calls
- users asking for one thing while clearly needing another

That ambiguity is where new product direction comes from.

Google learned from queries. Amazon learned from searches and abandoned carts. SaaS companies learn from support pain, onboarding friction, usage patterns, and the awkward mismatch between what the product exposes and how customers describe their work.

Agents can accidentally erase that mismatch.

Not because agents are bad.

Because agents are good at translation.

They translate human intent into machine action. If the product only observes the machine action, the product team loses the original shape of demand.

## The SaaS risk: becoming blind infrastructure

A SaaS product that exposes APIs to agents but does not preserve intent risks becoming invisible infrastructure.

The agent owns the conversation.

The agent sees the goal.

The agent sees the failed attempts.

The agent sees the tradeoffs.

The agent sees the moments where the user was confused, disappointed, or trying to do something the product does not support.

The SaaS vendor sees:

```txt
POST /retry_invoice 200 OK
POST /apply_offer 200 OK
POST /update_subscription 200 OK
```

That is not enough.

Those logs tell you execution frequency. They do not tell you why the work existed.

Over time, this changes the product relationship. The application becomes a tool surface behind someone else's interface. It still receives calls. It still makes money. But it loses the discovery loop that tells it what to build next.

That is how products become utilities.

Not immediately. Slowly.

First, the UI matters less.

Then, onboarding matters less.

Then, workflows move into the agent.

Then, the product roadmap starts depending on secondhand signal from whatever system owns the interaction layer.

At that point the vendor still owns execution, but no longer owns product intuition.

That is a bad trade.

## MCP makes this more urgent

MCP is useful because it gives agents a standard way to discover and call tools.

But the default mental model around MCP is still too RPC-shaped.

Expose a tool. Define parameters. Let the agent call it.

That is necessary, but not sufficient.

If an MCP server exposes tools like this:

```ts
server.tool("retry_invoice", {
  customerId: z.string(),
  invoiceId: z.string()
}, async ({ customerId, invoiceId }) => {
  return retryInvoice(customerId, invoiceId);
});
```

it may be technically correct and strategically incomplete.

It captures the object and the action.

It does not capture the job.

It does not capture what the user asked for.

It does not capture why the agent selected this tool instead of another one.

It does not capture whether the user wanted revenue recovery, customer goodwill, lower support burden, reduced churn, or just a quick operational fix.

The better design is to treat intent as part of the contract, not as optional telemetry.

## Bad MCP tool design: execution-only

This is the API shape that will make product teams blind:

```ts
server.tool("apply_discount", {
  subscriptionId: z.string(),
  couponId: z.string()
}, async ({ subscriptionId, couponId }) => {
  return applyDiscount({ subscriptionId, couponId });
});
```

It answers only:

- what object changed
- what action ran
- whether it succeeded

It does not answer:

- what the user was trying to accomplish
- what alternatives were considered
- what constraint mattered
- whether this is a one-off fix or evidence of a missing workflow
- whether the agent had high or low confidence

For internal automation, that may feel acceptable.

For product learning, it is weak.

## Better MCP tool design: require intent context

The tool should force the caller to carry intent through the execution boundary.

For example:

```ts
const IntentContext = z.object({
  user_goal: z.string().min(20).describe(
    "The user's original business goal in their own terms. Do not reduce this to the API action."
  ),
  job_to_be_done: z.enum([
    "recover_revenue",
    "reduce_churn",
    "save_customer_relationship",
    "fix_billing_error",
    "explore_options",
    "unknown"
  ]),
  trigger: z.enum([
    "user_direct_request",
    "agent_recommendation",
    "scheduled_policy",
    "support_escalation",
    "workflow_continuation"
  ]),
  constraints: z.array(z.string()).default([]).describe(
    "Business constraints the user expressed, such as do not annoy customer, preserve contract terms, avoid discounting, keep ARR, or handle before renewal."
  ),
  alternatives_considered: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]),
  missing_context: z.array(z.string()).default([])
});

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

  return applyRetentionOffer({ accountId, subscriptionId, offerId });
});
```

This changes the contract.

The agent cannot just say “apply coupon X.”

It has to say why this action exists.

The API now records both execution and demand.

## Better still: separate intent capture from execution

For more important workflows, I would not bury intent capture inside every tool call only.

I would create an explicit first-class intent object.

```ts
server.tool("create_customer_intent", {
  actor: z.object({
    type: z.enum(["human", "agent", "system"]),
    id: z.string().optional()
  }),
  raw_user_request: z.string().min(1),
  normalized_goal: z.string().min(20),
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
  urgency: z.enum(["low", "normal", "high", "critical"]),
  constraints: z.array(z.string()).default([]),
  entities_mentioned: z.array(z.object({
    type: z.string(),
    value: z.string()
  })).default([])
}, async (input) => {
  return createIntentRecord(input);
});
```

Then every execution tool requires the `intentId`.

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

That is closer to how product analytics should work in an agent world.

Intent becomes the parent object.

Tool calls become child events.

Now the product team can ask better questions:

- What goals are users trying to accomplish?
- Which intents require many tool calls?
- Which intents fail?
- Which intents require workarounds?
- Which intents are increasing but have no native product workflow?
- Which tool calls are symptoms of a larger lifecycle problem?

That is much more valuable than endpoint frequency.

## Capture failed and abandoned intent too

The most valuable product signal is often the thing that did not execute.

A user asks for something. The agent cannot do it. The agent works around it. Or the user gives up.

If only successful tool calls are logged, you miss the roadmap.

MCP servers should expose an explicit failure or gap signal:

```ts
server.tool("record_unmet_intent", {
  raw_user_request: z.string().min(1),
  normalized_goal: z.string().min(20),
  attempted_tools: z.array(z.string()).default([]),
  reason_unmet: z.enum([
    "missing_api_capability",
    "missing_permissions",
    "ambiguous_user_request",
    "missing_data",
    "unsafe_or_policy_blocked",
    "product_workflow_gap",
    "unknown"
  ]),
  workaround_used: z.string().optional(),
  product_gap_hypothesis: z.string().optional()
}, async (input) => {
  return recordProductSignal(input);
});
```

This is the equivalent of search-with-no-results, abandoned cart, failed onboarding, and support escalation in the old product world.

It should not be an afterthought.

It is one of the main reasons to instrument agents in the first place.

## Do not trust free-form logs only

A common lazy answer is: “We will log the conversation.”

That is not enough.

Raw conversation logs are useful for debugging, but bad as the primary product signal:

- they are hard to aggregate
- they are noisy
- they may contain sensitive data
- they are expensive to analyze at scale
- they create retention and privacy problems
- they do not force the agent to classify what happened

The better pattern is structured intent capture plus optional redacted snippets.

Something like:

```json
{
  "intent_id": "int_01JZ...",
  "surface": "mcp",
  "raw_user_request_redacted": "Help reduce failed-payment churn before renewal",
  "normalized_goal": "Recover revenue while avoiding customer-hostile retry behavior",
  "job_to_be_done": "recover_revenue",
  "constraints": [
    "avoid aggressive retries",
    "protect relationship with enterprise customer",
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

This is product-grade telemetry.

It is not just observability.

It is roadmap input.

## The contract should make bad telemetry impossible

The strongest version is not “please include intent.”

That will decay.

The strongest version is schema-level enforcement.

For high-value tools, reject calls without intent.

```ts
function requireIntent<T extends { intent?: unknown }>(input: T) {
  const parsed = IntentContext.safeParse(input.intent);

  if (!parsed.success) {
    throw new Error(
      "This tool requires intent context: user_goal, job_to_be_done, trigger, constraints, confidence."
    );
  }

  return parsed.data;
}
```

Then inside each business tool:

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

You do not get durable product signal by asking nicely.

You get it by making intent part of the interface.

## This is not just analytics. It changes the product architecture.

Once intent is first-class, new capabilities become possible.

You can build:

- intent search across customers
- product gap reports
- workflow heatmaps
- “top unmet intents” dashboards
- agent quality reviews
- confidence-based approval flows
- human review for low-confidence actions
- product discovery from failed automation
- account-level memory of what the customer was trying to accomplish

This is a different product primitive.

In the old world, the primitive was the clickstream.

In the API world, the primitive was the request log.

In the agent world, the primitive should be the intent graph.

## The operating rule

Every agent-facing API should answer four questions:

1. What action was taken?
2. What user goal caused the action?
3. Why did the agent choose this action?
4. What could the product not do natively?

Most APIs only answer the first question.

That was acceptable when humans operated the UI directly and the product team could observe the surrounding behavior.

It is not acceptable when the agent becomes the interface.

If we expose tools without preserving intent, we may successfully automate the work and still lose the market signal.

That is the failure mode.

Not broken APIs.

Blind products.
