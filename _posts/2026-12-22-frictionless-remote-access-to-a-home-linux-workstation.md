---
layout: post
title: "Frictionless Remote Access to a Home Linux Workstation"
date: 2026-12-22
author: Alex
categories: [engineering, linux, remote-work]
tags: [linux, ssh, wireguard, tailscale, vpn, remote-development]
---

A powerful Linux workstation at home is a very practical form of personal infrastructure. It can run heavier builds, local services, long-lived agent sessions, databases, containers, and experiments without turning a laptop into a hot, noisy compromise.

The weak point is access.

When access requires manually connecting a VPN, waiting for it to establish, checking whether DNS works, and then finally opening SSH, the machine starts to feel less like infrastructure and more like a chore. The goal should be simpler:

```bash
ssh home
```

That is the whole product requirement.

## The naive setup

The obvious first version is a classic VPN into the home network:

```text
laptop -> home router VPN -> home LAN -> workstation
```

This works. It is also mentally heavier than it looks. Before every SSH session there is a ceremony: open VPN app, connect, wait, verify, then SSH to a private IP or hostname.

That friction matters. Tools that are technically correct but annoying in the first 30 seconds get used less. The result is predictable: the workstation is powerful, but underused.

## Do not expose SSH directly

One tempting shortcut is to forward a public port to the workstation:

```text
public internet -> router:22 -> workstation:22
```

That removes the VPN step but creates unnecessary attack surface. Even with key-only auth, no passwords, a non-standard port, and something like fail2ban, the machine is now part of the public internet's background radiation.

For a personal workstation, the better default is no public inbound SSH at all.

## The better model: private overlay networking

A cleaner approach is to put the laptop and workstation on the same private overlay network:

```text
laptop -> private mesh -> workstation
```

The workstation gets a stable private identity. The laptop gets a stable way to reach it. The router becomes less important. The public internet never sees an open SSH port.

This is where tools like Tailscale, ZeroTier, and similar overlay networks are useful. They turn the problem from "connect to my home network" into "connect to my own device."

That distinction is important.

Classic home VPN:

```text
Connect to the network first, then find the machine.
```

Overlay network:

```text
Address the machine directly.
```

For a remote development workstation, the second model is usually better.

## Keep SSH boring

There is no need to make SSH clever. The clean setup is mostly normal OpenSSH with a better network path underneath it.

Example client config:

```sshconfig
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

## Use tmux for session continuity

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

If the laptop sleeps, the airplane Wi-Fi collapses, or the hotel router decides to be weird, the work keeps running.

## When full VPN still makes sense

A router VPN is still useful as a fallback. Sometimes the goal is not to reach one workstation, but to behave as if the laptop is physically at home:

- access to LAN-only devices
- router admin UI
- storage appliances
- printers or scanners
- services that were never meant to be individually exposed

That is a different requirement.

For routine development, device-to-device access is cleaner. For full home-LAN access, a router VPN is still useful.

## The practical architecture

The setup I like is:

```text
Primary path:
  laptop -> private overlay network -> Linux workstation -> tmux

Fallback path:
  laptop -> router VPN -> home LAN

Avoid:
  public SSH port forwarding
```

This gives the workstation the feel of a small private cloud machine while keeping the operational model simple.

The real test is not whether the network diagram is elegant. The real test is whether opening a terminal while traveling still feels cheap enough to do casually.

The target remains:

```bash
ssh home
```

Everything else is implementation detail.
