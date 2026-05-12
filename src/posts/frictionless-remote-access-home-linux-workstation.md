---
layout: layouts/post.njk
title: Frictionless remote access to a home Linux workstation
date: 2025-12-22
description: "The setup I want for a home Linux workstation: private access that makes SSH feel cheap without exposing a public port."
tags:
  - posts
  - engineering
tagsText: Linux, SSH, VPN, remote development
---

The product requirement for my home Linux workstation is not complicated:

```bash
ssh home
```

That is the whole test. If access takes a VPN ritual, a router check, a DNS guess, or a hunt for the right IP address, the machine stops feeling like infrastructure and starts feeling like a chore.

A powerful workstation at home is useful personal infrastructure. It can run heavier builds, local services, long-lived agent sessions, databases, containers, and experiments without turning a laptop into a hot, noisy compromise. The weak point is access. If the first 30 seconds are annoying, the machine gets used less.

## The naive setup

The obvious first version is a classic VPN into the home network:

```text
laptop -> home router VPN -> home LAN -> workstation
```

This works. It is also mentally heavier than it looks. Before every SSH session there is ceremony: open the VPN app, connect, wait, verify, then SSH to a private IP or hostname.

That friction matters. Tools that are technically correct but annoying at the start get used less. The workstation can be powerful and still underused.

## I do not expose SSH directly

The tempting shortcut is to forward a public port to the workstation:

```text
public internet -> router:22 -> workstation:22
```

That removes the VPN step, but it creates unnecessary attack surface. Even with key-only auth, no passwords, a non-standard port, and something like fail2ban, the machine is now part of the public internet's background noise.

For a personal workstation, my default is no public inbound SSH.

## The better model is device-to-device

The cleaner model is to put the laptop and workstation on the same private overlay network:

```text
laptop -> private mesh -> workstation
```

The workstation gets a stable private identity. The laptop gets a stable way to reach it. The router becomes less important. The public internet never sees an open SSH port.

Tools like Tailscale, ZeroTier, and similar overlay networks are useful because they turn the problem from "connect to my home network" into "connect to my own device."

Classic home VPN:

```text
Connect to the network first, then find the machine.
```

Overlay network:

```text
Address the machine directly.
```

For routine remote development, I prefer the second model.

## Keep SSH boring

There is no need to make SSH clever. The clean setup is normal OpenSSH with a better network path underneath it.

Example client config:

```text
Host home
  HostName home-linux.example-tailnet.ts.net
  User alex
  ServerAliveInterval 30
  ServerAliveCountMax 3
  ForwardAgent no
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_ed25519
```

Then the daily workflow becomes:

```bash
ssh home
```

No IP address. No VPN preflight. No router UI. No public port.

## Use tmux because networks fail

Network access solves only half the problem. Travel Wi-Fi, hotel networks, and cellular handoffs still happen.

The remote machine should treat the SSH connection as disposable. The actual work should live inside a persistent terminal session:

```bash
tmux new -s work
```

Reconnect later with:

```bash
tmux attach -t work
```

A useful alias is:

```bash
alias ht='ssh home -t "tmux attach -t work || tmux new -s work"'
```

Now the workflow is:

```bash
ht
```

If the laptop sleeps, the airplane Wi-Fi drops, or a hotel router behaves badly, the work keeps running.

## When full VPN still matters

A router VPN is still useful as a fallback. Sometimes the goal is not to reach one workstation, but to behave as if the laptop is physically at home:

- access to LAN-only devices
- router admin UI
- storage appliances
- printers or scanners
- services that were never meant to be individually exposed

That is a different requirement. For routine development, device-to-device access is cleaner. For full home-LAN access, a router VPN is still useful.

## The setup I like

The setup I like is:

```text
Primary path:
  laptop -> private overlay network -> Linux workstation -> tmux

Fallback path:
  laptop -> router VPN -> home LAN

Avoid:
  public SSH port forwarding
```

This gives the workstation the feel of a small private cloud machine while keeping the operating model simple.

The real test is not whether the network diagram is elegant. The real test is whether opening a terminal while traveling still feels cheap enough to do casually.

The target remains:

```bash
ssh home
```

Everything else is implementation detail.

## Related essays

- [AI coding agents need identity boundaries](/posts/separate-unix-users-agentic-development.html)
- [Git worktrees expose the real cost structure of JavaScript repositories](/posts/git-worktrees-node-modules.html)
