# AGENTS.md

Instructions for AI coding agents working in this repository.

## Site model

This is a deliberately simple static HTML site hosted from GitHub Pages.

Do **not** assume a framework, build step, or generator unless the repository is explicitly changed to add one.

Current publishing model:

- Homepage: `index.html`
- Styles: `style.css`
- Static pages: root-level `*.html`
- Blog posts: `posts/*.html`

Do not create Jekyll-style `_posts/*.md` posts unless the site is intentionally migrated to Jekyll and the homepage/build pipeline is updated accordingly.

## Adding a blog post

When adding a new post:

1. Create a static HTML file under `posts/`.
2. Match the structure of existing posts.
3. Link `../style.css` from the post.
4. Include the standard header/nav/footer used by existing posts.
5. Add the post to the `Posts` list in `index.html`.
6. Keep the homepage list in reverse chronological order.
7. Use accurate dates. Do not invent or future-date posts unless explicitly requested.

Expected post path format:

```text
posts/descriptive-slug.html
```

Expected homepage entry shape:

```html
<li>
  <a href="posts/descriptive-slug.html">Post title</a>
  <time datetime="YYYY-MM-DD">Month D, YYYY</time>
  <p class="description">
    One or two sentence summary.
  </p>
</li>
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
- plain HTML
- code blocks where useful
- short paragraphs

Avoid:

- marketing tone
- exaggerated claims
- unnecessary frameworks
- fragile generated markup
- personal or company-specific details

## Before committing

Before changing files, inspect the existing structure and reuse the current pattern. Do not introduce a new content system casually.

Before finishing, verify that any new post is reachable from `index.html`.
