---
layout: layouts/post.njk
title: Why Do We Keep Building the Same Software?
date: 2026-09-28
description: "AI makes software easier to build, but why are we still rebuilding the same CRM, newsletter, and task tracker instead of making software easier to combine?"
tags:
  - posts
  - engineering
  - architecture
tagsText: Software Engineering, AI, Architecture
---

I've been wondering why we keep building the same software over and over again. Every company seems to need its own CRM, newsletter platform, email service, Kanban board, task tracker, workflow engine, and a dozen other things. Sure, they all have slightly different features and interfaces, but underneath they're solving pretty much the same problems. We've spent decades building these things, and somehow we still start from scratch every time.

What's even more strange is that AI is making software development cheaper and faster, and instead of using this opportunity to solve the problem, we're just accelerating it. Now everyone can build their own CRM or project management tool in a weekend. Great, but do we really need another ten thousand versions of the same thing?

I keep thinking about Unix and the philosophy behind it. More than 50 years ago, people figured out that instead of building large programs that do everything, you could build small tools that do one thing well and make them work together. `grep`, `sort`, `awk`, `sed`, pipes, and so on. Those tools were built decades ago, and we still use them every day. You can combine them in ways their original developers probably never imagined, without needing to rewrite anything.

So why can't we do something similar for modern software? Why can't we have a common set of capabilities for managing contacts, sending emails, handling payments, scheduling jobs, tracking events, and whatever else we need? Not another giant platform that tries to do everything, but small, independent services that work together. I know we have APIs, open-source libraries, MCP, and all sorts of integration tools, but let's be fair, connecting five different services is often more work than building your own version. Something is clearly missing.

Of course, services are more complicated than Unix commands. There's state, authentication, permissions, failures, and all the other fun parts of distributed systems. But we've had the internet for decades, and now we have AI that can write and connect software for us. Surely we can come up with something better than having every developer rebuild the same basic functionality again and again.

Maybe instead of asking AI to build yet another application, we should be asking what the next Unix should look like. A set of reusable capabilities that both developers and AI agents can discover, combine, and replace as needed.

I don't know exactly what that looks like, but I find it strange that we've made so much progress in building software and so little in making it work together.

## Related essays

I have been thinking about the same problem from the agent side in [Agents do not want your CRUD APIs](/posts/agents-do-not-want-your-crud-apis.html) and [Agent APIs need an intent layer](/posts/agents-apis-and-product-signal.html).
