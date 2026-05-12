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

It should not read like a generic personal blog. The durable site thesis is:

> Engineering systems, AI-enabled development, and endurance-driven thinking.

The site's public body of work should cluster around:

- software engineering systems
- AI-enabled software development
- product architecture
- technical leadership
- systems thinking
- endurance running as a long-term performance discipline

The voice should be direct, concrete, systems-oriented, and personal only when the personal detail explains a decision, tradeoff, or changed belief.

Good posts should show at least one of these:

- a real engineering or operating problem
- the mechanism that makes the problem happen
- a clear tradeoff and decision rule
- a reusable operating principle
- technical taste under constraints

Avoid posts that are only notes, tool summaries, generic optimism, preferences without consequences, or lessons without a sharp point.

## Site identity

Author/person identity:

- Name: Oleksandr Khomenko
- Public handle: okhomenko
- Canonical site: https://olekk.com
- GitHub: https://github.com/okhomenko

Default site description:

> Essays on software engineering, AI-enabled development, product architecture, systems thinking, and endurance running.

Use this wording or a close variant unless a page has a stronger, specific description.

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

## Writing posts

Write posts from the source of authority the author actually has.

When the source is personal experience, use first person. `I`, `we`, `me`, `my wife`, and concrete trip/race/project details are appropriate when they explain the decision, tradeoff, or changed belief. Do not turn a self-lesson into a lecture aimed at an abstract reader.

Use paragraph breaks deliberately. A one-sentence paragraph is useful for a thesis, turn, or closing line, but a post should not read like hundreds of isolated punchlines. Most paragraphs should carry a complete thought with context, mechanism, and consequence.

Prefer self-directed framing:

```text
I treated every open day as available capacity.
The planning model failed.
Here is the mechanism.
Here is the rule I will use next time.
```

Avoid reader-scolding phrasing:

```text
Stop pretending every day should be memorable.
That only makes sense if the goal is collecting locations.
This is travel designed for humans.
```

Better versions:

```text
I treated too many days as if they needed to become memories.
That looked efficient when I was planning from a map.
For us, fewer transitions would have made the trip better.
```

The general rule: name the author's mistake first, then extract the mechanism. Let the reader recognize themselves without being talked down to.

## Content strategy

Prefer durable essays over short random notes.

Strong recurring themes:

- how engineers adapt to AI
- how AI changes engineering incentives
- how teams maintain code quality while using AI
- how architecture creates leverage
- how product systems compound
- how simplification creates engineering velocity
- how endurance training maps to long-term technical leadership

Avoid shallow SEO content, generic tutorials, or posts that do not connect to the site's operating thesis.

## Sections and taxonomy

Preferred top-level sections:

- `/engineering.html`
- `/ai.html`
- `/systems.html`
- `/running.html`
- `/personal.html` only when truly useful

Running content should not feel disconnected from the rest of the site. Frame it around systems, compounding, durability, consistency, feedback loops, and long-term performance.

## Adding a blog post

When adding a new post:

1. Create a Markdown file under `src/posts/`.
2. Use frontmatter matching existing posts.
3. Use the shared post layout.
4. Start with a thesis, not background.
5. Include a decision rule or operating principle.
6. Use accurate dates. Do not invent or future-date posts unless explicitly requested.
7. Add internal links to at least two related posts or section pages when possible.

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

## Metadata requirements

Every public page/post should have, either directly in HTML or derived from source metadata:

- unique title
- description of at least 20 characters
- canonical URL
- publication date when applicable
- updated date when applicable
- topic/category
- tags when applicable

Every public HTML page should eventually include:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph metadata
- Twitter card metadata
- JSON-LD structured data when appropriate

For articles, prefer `BlogPosting` JSON-LD.
For the homepage, prefer `Person` and/or `WebSite` JSON-LD.
For section index pages, prefer `CollectionPage` JSON-LD.

## SEO generation pipeline

This repo contains a lightweight SEO generator:

- `scripts/generate-seo.mjs`

It scans rendered/static HTML pages matching:

- `**/*.html`

It generates:

- `sitemap.xml`
- `feed.xml`
- `llms.txt`

The build script runs Eleventy and then the SEO generator:

- `npm run build`

The deployment workflow uploads the already-generated SEO files with the Pages artifact:

- `.github/workflows/pages.yml`

The validation workflow checks the same generated outputs on pushes and pull requests:

- `.github/workflows/seo.yml`

Do not hand-maintain generated files unless there is no generator support. Prefer updating `scripts/generate-seo.mjs` or page metadata so generated artifacts stay correct.

## SEO validation rules

The generator should fail rather than silently publishing bad SEO data.

Current expectations:

- At least one HTML page must exist.
- Generated URLs must be unique.
- Generated URLs must use explicit `.html` paths, except the homepage.
- Generated URLs must match each page's canonical URL.
- Every indexed page must have a meaningful title.
- Every indexed page must have a meaningful description.
- Article pages must have a publication date.

If adding new pages, add proper `<title>` and `<meta name="description">` first.

## URL conventions

Use clean, canonical, explicit `.html` URLs:

- `https://olekk.com/`
- `https://olekk.com/running.html`
- `https://olekk.com/engineering.html`
- `https://olekk.com/posts/some-post.html`

Avoid directory-style URLs such as `/running/`, `/engineering/`, or `/posts/some-post/`. The homepage may remain `/`; every other public page should render to a concrete `.html` file and use that `.html` path in internal links, canonical URLs, feeds, sitemaps, and structured data.

## RSS and AI discoverability

The generated `feed.xml` should remain valid Atom.

The generated `llms.txt` should summarize the site and list important pages. It is intended for AI crawlers, agent tooling, and future AI-assisted discovery.

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

## Future improvements

Good next improvements:

- Add reusable metadata/template injection.
- Generate Open Graph images.
- Add topic/tag index pages.
- Generate related-post links from metadata.
- Generate JSON-LD from page/post metadata.
- Add a source-of-truth frontmatter format if the site moves further toward Markdown-driven generation.

Do not introduce a heavy framework unless it materially improves maintainability.
