---
layout: layouts/post.njk
title: Git worktrees and the node_modules tax
date: 2026-05-09
description: A practical field note on using Git worktrees with large JavaScript repositories without letting node_modules destroy your disk and workflow.
tags:
  - posts
tagsText: Git, JavaScript, developer workflow
---

Git worktrees are one of the cleanest ways to run parallel branches, experiments, and coding-agent tasks. They also expose the ugliest part of large JavaScript repositories: every isolated checkout wants its own dependency universe.

A worktree gives you another working directory attached to the same repository. Instead of constantly switching branches, stashing local changes, or letting an agent mutate your main checkout, you create a separate directory per task.

```bash
git worktree add ../wt/refactor-router -b refactor/router
cd ../wt/refactor-router
```

The win is obvious: branch isolation without cloning the repository again. The trap is less obvious until you do it in a serious frontend codebase. Each worktree is a separate project root, so package managers normally create a separate `node_modules` tree for each one.

```text
repo-main/
  node_modules/

wt/refactor-router/
  node_modules/

wt/agent-pricing/
  node_modules/

wt/bugfix-vite/
  node_modules/
```

## The real problem is mutable sharing

The naive optimization is to symlink `node_modules` from one worktree into another. That feels clever for about ten minutes. Then one branch upgrades Vite, another changes a generated client, a third pulls a native dependency, and now the filesystem lies about what each branch actually depends on.

> Do not share mutable project directories across worktrees. Share immutable caches. Keep each worktree's working directory honest.

## The better model

The clean pattern is simple: use one worktree per task, install dependencies per worktree, and rely on a content-addressed package store to avoid paying the full disk and network cost each time. This is where [pnpm](https://pnpm.io/) is much better suited than plain npm for large worktree-heavy repositories.

```bash
corepack enable
pnpm config set store-dir ~/.pnpm-store

mkdir -p ~/code/product/wt
cd ~/code/product/main

git worktree add ../wt/agent-123 -b agent/123
cd ../wt/agent-123
pnpm install --frozen-lockfile
```

You still see a `node_modules` directory in every worktree. That is fine. The important part is that package contents are reused through pnpm's store rather than copied as a completely independent dependency tree every time.

## For npm-only repositories

If the repo is still on npm, worktrees are not wrong; they are just more expensive. Use `npm ci` instead of casual `npm install` so the worktree matches the lockfile exactly.

```bash
npm ci --prefer-offline
```

The npm cache avoids redownloading packages, but it does not remove the fundamental disk cost: every worktree gets a physically materialized `node_modules` tree. For two worktrees, acceptable. For ten agent branches, painful.

## The agent workflow

Worktrees are especially useful when multiple coding agents or experiments are in flight. The rule is that no agent works in the main checkout. Every task gets a branch, a worktree, a clean install, and a disposable lifecycle.

```text
main/                  # stable human checkout
wt/codex-issue-1842/   # agent task
wt/claude-router-v7/   # agent task
wt/manual-cleanup/     # human experiment
```

Cleanup matters. Dead worktrees are not harmless. They keep dependency installs, build output, test output, generated files, and stale local state around long after the branch stopped mattering.

```bash
git worktree list
git worktree remove ../wt/agent-123
git worktree prune
pnpm store prune
```

## The rule I use

Share caches, not working directories. Share the pnpm store, npm cache, Docker layer cache, or remote build cache. Do not share `node_modules`, `dist`, generated clients, coverage output, or local database state. That boundary keeps the workflow fast without destroying correctness.

## References

- [Git worktree documentation](https://git-scm.com/docs/git-worktree)
- [pnpm motivation](https://pnpm.io/motivation)
- [npm ci documentation](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [Corepack documentation](https://nodejs.org/api/corepack.html)
- [Turborepo documentation](https://turbo.build/repo/docs)
