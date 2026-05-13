---
layout: layouts/post.njk
title: Remote dev boxes need secret brokers, not copied env files
date: 2026-05-13
description: "The rule I use for remote development secrets: keep the vault on the laptop and hand the remote only scoped runtime leases."
tags:
  - posts
  - engineering
  - agents
  - architecture
tagsText: Security, SSH, AI agents, remote development
---

The rule I use for remote development secrets is simple: the laptop is the control plane, the remote box is compute, and secrets should cross that boundary only as scoped runtime leases.

Not copied `.env` files.

Not a remote shell profile full of tokens.

Not a remote machine signed into the same vault as the laptop.

The useful mental model is a remote secret broker. Secrets stay on the laptop, in 1Password, the system keychain, `pass`, Bitwarden, or another local vault. The remote Linux box receives only the specific values needed to run one command, one project, one worktree, or one agent session.

The problem statement is narrow:

```text
How can a process on a remote dev box use the secrets it needs
without turning the remote box into a durable secret store?
```

That distinction matters. A powerful remote Linux box is useful because it can run builds, databases, long-lived tmux sessions, containers, and coding agents without punishing the laptop. It becomes dangerous when every convenience feature turns it into a second laptop with worse physical control, broader network exposure, and a pile of stale credentials on disk.

## The common mistake

The common mistake is treating `.env` distribution as the problem.

That leads to workflows like this:

```bash
scp .env remote:~/work/app/.env
```

or this:

```bash
echo 'export GITHUB_TOKEN=...' >> ~/.profile
echo 'export DB_PASSWORD=...' >> ~/.profile
```

or this:

```bash
op signin
op run --env-file=.env -- ./gradlew bootRun
```

on the remote machine itself.

The last version is cleaner than a copied plaintext file, but it still changes the trust model. The remote box is now a vault client. If the goal was to keep vault access local, that goal is gone.

The better question is not:

```text
How do I sync secrets to the remote machine?
```

The better question is:

```text
How do I let a remote process receive a narrow capability at execution time?
```

That is a different architecture.

## The practical shape

The most practical version is:

```text
laptop secret broker + reverse SSH tunnel + remote command wrapper
```

On the laptop:

```text
laptop
  secret-broker
    -> reads local vaults
    -> asks for local unlock or approval
    -> applies policy
    -> returns short-lived secret bundles
```

When connecting to the remote box, the SSH session forwards a remote socket back to the laptop:

```bash
ssh \
  -R /run/user/1000/secrets.sock:/Users/alex/.local/run/secrets.sock \
  remote-box
```

If Unix socket forwarding is annoying, TCP works too:

```bash
ssh \
  -R 127.0.0.1:18443:127.0.0.1:18443 \
  remote-box
```

I prefer a Unix socket when possible. Put it under `/run/user/$UID` or a private `0700` directory. A socket directly in `/tmp` is convenient, but it is easier to get permissions and stale paths wrong.

On the remote box, the developer does not run the app directly:

```bash
./gradlew bootRun
```

They run it through a wrapper:

```bash
secrets run billing-dev -- ./gradlew bootRun
```

The wrapper calls back through the SSH tunnel:

```text
remote secrets run
  -> forwarded socket
  -> laptop broker
  -> local vault / approval / policy
  -> scoped env bundle
  -> exec target command with env injected
```

The Java process still sees normal environment variables:

```text
DB_URL=...
DB_USER=...
DB_PASSWORD=...
GITHUB_TOKEN=...
```

The difference is where those values live before execution. They do not live in the remote repository, remote home directory, shell profile, or agent config. They appear in the target process at runtime.

This is close to "SSH agent forwarding, but for runtime secrets." That analogy is useful, but it has a warning label. SSH agent forwarding does not expose private key material, but it does let the remote side ask the local agent to perform authentication operations. OpenSSH explicitly tells users to enable agent forwarding with caution because someone who can access the forwarded socket can use the agent. A secret broker has the same shape. The forwarded socket must be treated as authority.

## The policy lives on the laptop

The remote repository can declare what it wants. The laptop decides what it gets.

A repository-level file might say:

```yaml
secretProfile: billing-dev
requires:
  - DB_URL
  - DB_USER
  - DB_PASSWORD
  - GITHUB_TOKEN
ttl: 4h
```

That file is a request, not authority.

The local broker policy is the authority:

```yaml
profiles:
  billing-dev:
    allowedHosts:
      - remote-devbox-1
    allowedRemoteUsers:
      - alex
    allowedPaths:
      - /home/alex/work/billing/**
    allowedCommands:
      - ./gradlew bootRun
      - pnpm dev
      - npm test
    secrets:
      DB_URL: op://Engineering/Billing Dev DB/url
      DB_USER: op://Engineering/Billing Dev DB/username
      DB_PASSWORD: op://Engineering/Billing Dev DB/password
      GITHUB_TOKEN: op://Private/GitHub/repo-limited-token
    ttl: 4h
    requireApproval: true
```

A good approval prompt is concrete:

```text
remote-devbox-1 requests profile billing-dev

Path:
  /home/alex/work/billing/worktrees/invoice-retry

Command:
  ./gradlew bootRun

Secrets:
  DB_URL
  DB_USER
  DB_PASSWORD
  GITHUB_TOKEN

Allow:
  once / 1 hour / 4 hours / deny
```

The important rule is that the remote machine never gets a broad endpoint like this:

```text
give me all secrets
```

It gets a narrow request:

```text
I am remote session S.
I am on host H as user U.
I am in cwd C.
I want profile P.
I am about to exec command X.
```

Then the laptop decides.

That is the security idea behind the whole model. Identity alone is too blunt. The request needs context, and the returned authority needs scope.

## Why capabilities are the right lens

The older security literature is useful here because this is not a new class of problem.

Saltzer and Schroeder's protection principles still apply: economy of mechanism, fail-safe defaults, complete mediation, least privilege, least common mechanism, and psychological acceptability. The broker model is good only if it keeps those properties visible. A giant remote vault login violates several of them at once.

Norm Hardy's confused deputy problem is also directly relevant. A privileged program can be tricked into using its own authority for someone else's goal. AI agents make that failure mode more ordinary because they read untrusted text, execute tools, and often hold broad user authority in the same session.

Capability-security people have been making the same point for decades: authority should be handed over explicitly, narrowly, and in a form the receiver can use without inheriting unrelated power. A remote secret bundle is a capability. A repo asks for a capability. The laptop grants or denies it.

The wrong model is:

```text
remote user alex is trusted, therefore give the session broad secret access
```

The better model is:

```text
this command receives these secrets for this purpose, for this lease duration
```

That is the useful distinction.

## Four levels

There are four useful implementation levels.

### Level 1: pipe secrets at invocation time

The dumb version is still better than copied files:

```bash
op run --env-file=.env.billing -- ssh remote-box '
  cd ~/work/billing &&
  ./gradlew bootRun
'
```

or:

```bash
op inject -i local.env.tpl | ssh remote-box '
  cd ~/work/billing &&
  set -a &&
  source /dev/stdin &&
  set +a &&
  ./gradlew bootRun
'
```

This is useful for one-off work. It is not the model I would build around.

Shell quoting is easy to get wrong. Process lists, shell history, debug output, `set -x`, crash reports, and test logs can leak values. Long-running shells and tmux sessions make the lifecycle unclear. Coding agents make it worse because they create scripts, run tools, and inspect output aggressively.

Use this level when the command is simple and disposable.

### Level 2: remote wrapper through an SSH tunnel

This is the sweet spot for daily development:

```bash
secrets run billing-dev -- ./gradlew bootRun
```

The local broker reads 1Password or another local vault. The remote wrapper receives only the environment bundle for the command it is about to execute. Nothing needs to be written to the remote disk.

A prototype can be brutally simple:

```text
GET /v1/env/billing-dev
```

returns:

```json
{
  "env": {
    "DB_URL": "...",
    "DB_USER": "...",
    "DB_PASSWORD": "...",
    "GITHUB_TOKEN": "..."
  },
  "ttlSeconds": 14400
}
```

The wrapper should be careful. Do not build it around unsafe shell expansion like this:

```bash
export $(curl ...)
```

That is how quoting bugs become secret leaks or command injection bugs. A better broker response is NUL-delimited key/value data, a small execing wrapper written in a real language, or a file descriptor protocol where the wrapper parses structured data and calls `execve` with an explicit environment.

The interface can still feel simple:

```bash
secrets run billing-dev -- pnpm dev
secrets run billing-dev -- ./gradlew bootRun
secrets run github-agent -- codex
secrets run aws-dev -- aws sts get-caller-identity
```

The UX is the product. The security model will only be used if the fast path is faster than copying `.env`.

### Level 3: send short-lived credentials

The stronger version is to avoid sending long-lived secrets whenever a platform can mint short-lived credentials.

Instead of returning:

```text
AWS_SECRET_ACCESS_KEY=...
GITHUB_PAT=...
DB_PASSWORD=...
```

the broker returns:

```text
AWS STS credentials valid for one hour
GitHub App installation token valid for one hour
database temporary auth token
service token with a narrow lease
```

This is the model to prefer for cloud access. AWS STS exists for temporary credentials. GitHub App installation tokens are a better default than broad personal access tokens for automation. Vault's dynamic secrets and leases are the general version of the same idea: credentials are created for use, tied to a lease, and revocable.

Static secrets create cleanup work. Leased credentials create expiration as part of the design.

### Level 4: proxy what the remote should never possess

Some secrets should not be injected into the remote process at all.

For those, use a local proxy:

```text
remote process
  -> forwarded localhost endpoint
  -> laptop proxy
  -> upstream API
```

For example:

```bash
export OPENAI_BASE_URL=http://127.0.0.1:19001/openai
export OPENAI_API_KEY=dummy
```

The remote process thinks it is calling an API endpoint. The laptop proxy holds the real upstream key, signs the request, applies policy, logs use, and can block dangerous requests.

This matters most for AI agents. An agent with private data, untrusted content, and external communication is exactly the shape that creates data-exfiltration risk. If the agent also gets broad GitHub tokens, cloud credentials, vendor API keys, and production-like database access, the blast radius is not a tooling detail. It is the system.

For agent sessions, I would split secrets into categories:

```text
Okay to inject:
  dev-only database password
  disposable test tenant credentials
  short-lived AWS STS credentials
  repo-limited GitHub token

Better proxied:
  OpenAI or Anthropic keys
  broad GitHub credentials
  production-like database access
  expensive or high-volume vendor APIs

Never available to agents:
  1Password session tokens
  personal master passwords
  cloud admin credentials
  billing provider root tokens
  anything that can mutate customer data broadly
```

The rule is blunt:

```text
If the remote process is not allowed to possess the secret, proxy the action instead of injecting the secret.
```

## Environment variables are delivery, not protection

Environment variables are a convenient delivery mechanism. They are not a strong security boundary.

On Linux, process environments are visible through process interfaces such as `/proc/<pid>/environ` subject to kernel permission checks. Secrets can also leak through child processes, debug logs, shell traces, crash dumps, test output, generated scripts, and agent transcripts.

You can reduce exposure:

```text
separate Unix users
0700 working directories
restricted forwarded sockets
hidepid=2 on /proc where appropriate
no shell tracing around secrets
short leases
redacted logs
careful wrappers
```

Those controls help. They do not change the core fact:

```text
If a process receives a secret, that process can leak it.
```

So the real decision is not whether env vars are secure. The real decision is whether this process should possess this secret at all.

## Detached work changes the lease model

SSH reverse tunnels are per session. That is good for security and annoying for remote development.

If I run this inside SSH:

```bash
secrets run billing-dev -- ./gradlew bootRun
```

the command can fetch secrets through the tunnel and continue. But what happens if the command runs inside tmux and the laptop disconnects?

There are three policies:

```text
Fetch once, then continue:
  best UX, acceptable for many dev servers

Require broker connectivity:
  stronger control, annoying when networks fail

Issue a short-lived remote lease:
  best compromise for agents and long-running work
```

For personal development, fetching once and continuing is often fine for low-risk dev secrets. For coding agents, I prefer short-lived leases or proxy mode. For production-like access, I want the credential itself to expire even if the process keeps running.

## A minimal useful version

The first useful version does not need to be a platform.

On the laptop:

```bash
secret-broker serve \
  --socket ~/.local/run/secret-broker.sock \
  --policy ~/.config/secret-broker/policy.yaml
```

Connect to the remote box:

```bash
ssh \
  -o ExitOnForwardFailure=yes \
  -R /run/user/1000/secret-broker.sock:$HOME/.local/run/secret-broker.sock \
  remote-box
```

On the remote:

```bash
cd ~/work/billing
secrets run billing-dev -- ./gradlew bootRun
```

Then harden the design in this order:

```text
per-session nonce
socket path under a private runtime directory
local approval prompt
allowed host/user/path/command policy
explicit secret allowlists
audit log
redaction
short-lived token minting
proxy mode for high-value APIs
no all-secrets endpoint
```

The broker should not trust claims from the remote machine blindly. The SSH launcher can create a session record locally, bind a forwarded socket to that session, and issue a nonce that the remote wrapper must present. That does not make a compromised remote machine safe, but it prevents the laziest failure mode: any process that finds the socket pretending to be any project.

## The honest boundary

This model does not make an untrusted remote box safe.

If the remote user, kernel, wrapper, or target process is compromised, injected secrets can be stolen. A secret broker mainly prevents durable sprawl:

```text
no copied .env files
no remote vault login
no stale shell profile tokens
no all-purpose agent credential
fewer forgotten secrets on disk
shorter compromise windows
better approval and audit points
```

That is still a large improvement. Most developer-secret leaks are not movie-plot attacks. They are residue: a token in a dotfile, a forgotten worktree, a debug script, a tmux pane, a CI experiment, a copied config file, an agent transcript, a remote box that used to be temporary.

The broker model attacks residue.

## The rule I use

The operating rule is:

```text
Keep the vault local.
Make the remote ask for a named capability.
Grant the smallest useful bundle.
Prefer leases over static secrets.
Proxy secrets the remote should not possess.
Treat agents as high-risk consumers by default.
```

Do not make `.env` files smarter. Make them disappear from the remote box.

The target developer experience should be boring:

```bash
devssh remote-box
cd ~/work/billing
secrets run billing-dev -- ./gradlew bootRun
```

Everything else is implementation detail.

## Related essays

- [Frictionless remote access to a home Linux workstation](/posts/frictionless-remote-access-home-linux-workstation.html)
- [AI coding agents need identity boundaries](/posts/separate-unix-users-agentic-development.html)

## References

- [OpenSSH `ssh(1)` manual](https://man.openbsd.org/cgi-bin/man.cgi/OpenBSD-current/man1/ssh.1)
- [OpenSSH `ssh_config(5)` manual](https://man.openbsd.org/OpenBSD-current/ssh_config.5)
- [1Password CLI `op run`](https://developer.1password.com/docs/cli/reference/commands/run/)
- [AWS IAM temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html)
- [GitHub App installation access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)
- [Vault leases, renewals, and revocation](https://developer.hashicorp.com/vault/docs/concepts/lease)
- [Secretless Broker](https://secretless.io/)
- [Linux `/proc/pid/environ`](https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html)
- [The Twelve-Factor App: Config](https://www.12factor.net/config)
- [Saltzer and Schroeder, The Protection of Information in Computer Systems](https://web.mit.edu/Saltzer/www/publications/protection/)
- [Norm Hardy, The Confused Deputy](https://www.cs.umd.edu/~jkatz/security/downloads/capabilities.html)
- [Mark Miller, Ka-Ping Yee, and Jonathan Shapiro, Capability Myths Demolished](https://papers.agoric.com/papers/capability-myths-demolished/abstract/)
- [Simon Willison, The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
- [Model Context Protocol security best practices](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices)
