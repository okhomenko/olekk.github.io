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

## Adding a blog post

When adding a new post:

1. Create a Markdown file under `src/posts/`.
2. Use frontmatter matching existing posts.
3. Use the shared post layout.
4. Keep writing direct and practical.
5. Use accurate dates. Do not invent or future-date posts unless explicitly requested.

Expected post structure:

```md
---
layout: layouts/post.njk
title: Example title
date: 2026-01-01
description: One sentence summary.
tags:
  - posts
tagsText: Topic, Topic
---

Post content.
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

Avoid:

- marketing tone
- exaggerated claims
- unnecessary frontend frameworks
- fragile generated markup
- personal or company-specific details

## Before committing

Before changing files, inspect the existing structure and reuse the current pattern.

Do not introduce React, Astro islands, Tailwind, client-side hydration, analytics bloat, or heavy JavaScript tooling unless explicitly requested.

The desired output remains simple static HTML.
