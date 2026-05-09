---
layout: layouts/post.njk
title: AI coding agents need identity boundaries
date: 2026-02-12
description: Shared Unix accounts turn AI-assisted development into a pile of ambient authority, credential bleed, and hidden state.
tags:
  - posts
tagsText: Linux, SSH, AI agents, developer workflow
---

AI coding agents are useful, but they are also messy tenants. They accumulate shell history, Git credentials, SSH keys, package caches, editor state, API tokens, local configuration, daemon processes, and assumptions about the current working directory. When everything runs under one Unix account, all of that state collapses into one shared home directory.

That works until it does not.

A cleaner model is to use separate Linux accounts for separate trust boundaries. Not one account per repository. That becomes operational noise. The better split is by identity, credentials, and risk profile.

```text
alex
agent-work
agent-personal
agent-sandbox
```

The human account remains the administrative account. The agent accounts hold the state needed for different contexts. Each account gets its own home directory, SSH keys, Git identity, tool configuration, package caches, and login sessions.

```text
/home/agent-work/.ssh
/home/agent-work/.gitconfig
/home/agent-work/.config
/home/agent-work/.cache

/home/agent-personal/.ssh
/home/agent-personal/.gitconfig
/home/agent-personal/.config
/home/agent-personal/.cache
```

This is not perfect isolation. It is not a replacement for containers, VMs, or a real sandbox when executing untrusted code. But it is a strong default boundary for day-to-day development. It prevents accidental credential reuse, makes the current context obvious, and gives each agent a smaller blast radius.

The decision rule is simple: split accounts when credentials, cloud access, Git identity, organizational boundary, or risk level differ. Keep projects together when they merely differ by language, framework, branch, or local port.

A practical setup might look like this:

```bash
sudo adduser agent-work
sudo adduser agent-personal
sudo adduser agent-sandbox

sudo chmod 700 /home/agent-work
sudo chmod 700 /home/agent-personal
sudo chmod 700 /home/agent-sandbox
```

Then use SSH aliases from the laptop:

```text
Host dev-work
  HostName devbox.example.com
  User agent-work

Host dev-personal
  HostName devbox.example.com
  User agent-personal

Host dev-sandbox
  HostName devbox.example.com
  User agent-sandbox
```

Now connecting to a context is explicit:

```bash
ssh dev-work
ssh dev-personal
ssh dev-sandbox
```

The biggest win is credential hygiene. Tools tend to read from default locations. Agents especially tend to follow whatever ambient authority exists in the shell. A separate Unix account turns many hidden defaults into explicit boundaries.

There are tradeoffs. Tooling may need to be installed more than once. Shell configuration must be repeated or templated. Docker access requires care, because membership in the `docker` group is effectively root-equivalent on most systems. A sandbox account should not casually receive Docker access unless that risk is understood.

The important distinction is that Unix users separate identity and authority, while repository-level files such as `AGENTS.md`, editor rules, and project documentation guide behavior. These solve different problems. Use both.

A good baseline is:

```text
one human admin account
one account for trusted professional code
one account for personal code
one account for risky experiments
```

That is usually enough structure to avoid state pollution without turning the machine into an account-management project.
