# AGENTS.md

Instructions for AI coding agents working in this repository.

## Site model

This site is generated with Eleventy (11ty) and deployed through GitHub Pages.

The repository intentionally produces plain static HTML output with minimal framework complexity.

Current publishing model:

- Source content: `src/`
- Layouts/includes: `src/_includes/`
- Blog posts: `src/posts/*.md`
- Generated output: `_site/`
- Deployment: GitHub Actions Pages workflow

## Editorial positioning

This site should read like a public operating manual for engineering leverage: architecture, AI-assisted development, development infrastructure, and the organizational mechanics that determine whether software teams get faster or slower over time.

The voice should be direct, concrete, systems-oriented, and personal only when the personal detail explains a decision, tradeoff, or changed belief.

Good posts should show at least one of these:

- a real engineering or operating problem
- the mechanism that makes the problem happen
- a clear tradeoff and decision rule
- a reusable operating principle
- technical taste under constraints

Avoid posts that are only notes, tool summaries, generic optimism, preferences without consequences, or lessons without a sharp point.

## Editorial voice synthesis

Write with a synthesized founder/operator voice: direct product-company writing plus approachable category-building essays. Do not imitate any specific person. Capture the useful traits, not the surface mannerisms.

The desired voice:

- blunt but not performative
- plainspoken but not simplistic
- founder-level practical, not academic
- skeptical of bloat, ceremony, and fake sophistication
- optimistic about better systems, but intolerant of vague optimism
- comfortable saying the simple thing when the simple thing is true
- interested in how tools change behavior, incentives, markets, and product learning

Use a strong, simple thesis early. Then prove it with an ordinary example.

Good pattern:

```text
Simple claim.
Concrete example.
What most teams miss.
Why it matters.
The operating rule.
```

Prefer lines that sound like operating advice:

- `Do not confuse usage with understanding.`
- `The API worked. The product still learned nothing.`
- `The bug is not in the endpoint. The bug is in the feedback loop.`
- `If the agent owns the conversation, the product must fight to preserve intent.`
- `A clean tool call can hide a messy customer problem.`
- `Do not automate away the signal you need to build the next product.`

Avoid inflated strategy language when a simple sentence works.

Instead of:

```text
The AI transition risks severing the feedback loop between user intent and product evolution.
```

Prefer:

```text
If agents turn customer goals into silent API calls, product teams stop seeing what customers actually wanted.
```

Instead of:

```text
This creates a strategic disintermediation risk for SaaS vendors.
```

Prefer:

```text
The agent gets the conversation. The SaaS product gets the API call. That is a bad trade.
```

## Voice rules

Prefer this pattern:

```text
Claim -> mechanism -> failure mode -> operating principle -> concrete rule
```

Good sentence openings:

- `The failure mode is...`
- `The useful distinction is...`
- `The tradeoff is...`
- `The rule I use is...`
- `The mistake is...`
- `The metric that matters is...`

Avoid soft openings unless uncertainty is real:

- `I think...`
- `Maybe...`
- `Just...`
- `In my opinion...`
- `Recently I was exploring...`
- `This post is about...`

Operator tone means decision pressure, not executive theater. Connect technical choices to throughput, cost of change, review cost, reliability, risk, ownership, or learning speed.

Senior engineering tone means naming mechanisms and boundaries. Do not merely say something is important. Explain what breaks when it is missing.

## Adding a blog post

When adding a new post:

1. Create a Markdown file under `src/posts/`.
2. Use frontmatter matching existing posts.
3. Use the shared post layout.
4. Start with a thesis, not background.
5. Include a decision rule or operating principle.
6. Use accurate dates. Do not invent or future-date posts unless explicitly requested.

Expected post structure:

```md
---
layout: layouts/post.njk
title: Example title
date: 2026-01-01
description: One sentence summary with a point of view.
tags:
  - posts
tagsText: Topic, Topic
---

Opening thesis.

## The common mistake

What people usually get wrong.

## The mechanism

Why the problem actually happens.

## The tradeoff

What is gained, what is lost, and what is not free.

## The rule I use

A concrete operating principle.
```

## Content constraints

This is a personal public blog. Avoid including employer names, private project details, private infrastructure identifiers, credentials, internal URLs, customer data, or sensitive personal details unless explicitly requested.

Using the name `Alex` is acceptable when needed. Prefer generic examples for hostnames, repositories, networks, and accounts.

## Style

Write in a direct, practical, engineering-notes style.

Prefer:

- concrete mechanisms
- simple examples
- durable links
- minimal generated markup
- code blocks where useful
- short paragraphs
- crisp claims
- explicit tradeoffs

Avoid:

- marketing tone
- exaggerated claims
- unnecessary frontend frameworks
- fragile generated markup
- personal or company-specific details
- vague thought-leadership language
- motivational filler

## Before committing

Before changing files, inspect the existing structure and reuse the current pattern.

Do not introduce React, Astro islands, Tailwind, client-side hydration, analytics bloat, or heavy JavaScript tooling unless explicitly requested.

The desired output remains simple static HTML.
