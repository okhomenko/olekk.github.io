---
layout: layouts/post.njk
title: Upstream Is No Longer a Product
date: 2026-10-12
description: "A conversation on composable application contracts, independently evolving forks, and why upstream may become a guardian of contracts."
tags:
  - posts
  - engineering
  - architecture
tagsText: Open Source, Application Contracts, Software Architecture
---

*A conversation about what comes after open source, forks, and traditional software distribution.*

## Question 1

![The original post by Can. (@cancelik) that started the conversation](/images/upstream-original-question.webp)

*The question that started the conversation — [Can. (@cancelik), September 19, 2026](https://x.com/cancelik/status/2101377989317472768).*

### Answer 1

I think the deeper idea is that **we need to separate software from whoever maintains and distributes it.**

Open source gave us access to code and permission to modify it. Git gave us forks and merges. But the basic model hasn't changed much: there's one canonical project, maintainers decide what belongs in it, and everyone else either follows upstream or maintains a fork.

AI makes writing and maintaining custom code much cheaper, but it doesn't solve the problem of keeping thousands of independently modified versions compatible.

The missing primitive might be **independently distributable changes**, rather than independently distributable copies of entire products.

Imagine software where:

- You can replace or extend any capability without owning the entire codebase.
- Your changes survive upstream updates without repeatedly merging them.
- Other people can discover and adopt your extensions without getting approval from the original maintainers.
- Compatibility, dependencies, conflicts, and trust are managed through shared protocols.

Some of this exists in plugins, package managers, Nix overlays, and Linux distributions. But it's fragmented, and none provides a universal composition model for arbitrary software.

There's also an important distinction: **Git already decentralizes source code. It doesn't decentralize the evolution of a running product.**

That might be the real problem you're pointing at.

I'd sharpen your final thought to:

> Maybe the next generation of software doesn't have a single upstream at all. Upstream becomes a set of protocols and compatibility contracts, while the product is assembled from independently evolving pieces.

And there's a harder question underneath: **What is the smallest unit of software that can evolve, be distributed, and be replaced independently without breaking everything around it?**

That is probably where the new primitives need to begin.

---

## Question 2

there are already network protocols. application contracts is a much bigger space. it has to be assembleable/composable by ai. ai can do a lot today with APIs (grpc, rest etc)

upstream, fork. can change implementation or contract, can add new api

### Answer 2

I think the distinction is bigger than interoperability. **We need software that AI can assemble, modify, extend, and evolve without depending on a single upstream authority.**

REST, gRPC, and other APIs already give us ways to connect systems. AI is increasingly good at working with them. But our software distribution model still assumes that an application is a relatively fixed product, owned and evolved by one project.

What if we change that assumption?

A fork could independently:

- **Replace an implementation** while keeping the same contract.
- **Extend a contract** by introducing new APIs or capabilities.
- **Change an existing contract**, including breaking changes.
- **Compose capabilities** from multiple forks or entirely different projects.

And AI would do much of the integration work: understand contracts, discover implementations, generate adapters, resolve dependencies, modify callers, and assemble the application.

For example, imagine forking a CRM because you dislike how it handles contacts. Today you inherit the entire CRM and its maintenance burden. In this model, you could replace contact management, add new APIs, keep the rest of the original application, and independently distribute your changes. Someone else could build on your version without requiring either upstream maintainer to accept anything.

**The important part is that contracts themselves can evolve.** We're not trying to freeze the world into one universal API standard. AI should be able to work across different contracts and generate the integration code when they diverge.

There is one fundamental difficulty: schemas describe interfaces, but not necessarily semantics. AI can translate between two API shapes, but it cannot automatically know whether their authorization rules, transactional guarantees, or business invariants are equivalent. We would need machine-readable contracts, executable tests, and explicit rules for composition and incompatibility.

That leads me to a slightly different formulation of your idea:

> Open source made software forkable, but it never made forks truly composable. We still treat upstream as the authority and merging as the way changes get distributed.
>
> AI changes this. We already have APIs and protocols. What we need is a way to describe, modify, and distribute application contracts and implementations so AI can assemble them into working software.
>
> A fork should be able to replace an implementation, extend an existing contract, or introduce an entirely new API without becoming a permanent copy of the whole product.
>
> Maybe upstream stops being the place where everything must eventually merge. It becomes just another dependency in a system that can evolve independently.

The more interesting consequence is that **an application may stop being the primary unit of software distribution.**

Instead of downloading *a CRM*, you assemble a CRM from independently evolving implementations and capabilities, with AI handling much of the composition.

That is a more fundamental change than making existing open-source development faster.

---

## Question 3

for such system to function there must be rules established how pieces integrate

### Answer 3

Yes. And I think this is where the real challenge begins. **We need rules for composition, not just protocols for communication.**

REST and gRPC tell us how systems communicate. They don't tell us how to replace one part of an application, extend its behavior, or combine two independently evolving forks.

For this to work, we need a small set of common primitives:

1. **Capabilities.** Every piece declares what it provides and what it requires. Dependencies are expressed as capabilities, not hardcoded implementations.
2. **Contracts.** Define inputs, outputs, events, behavior, and guarantees. Not just schemas, but things like idempotency, authorization, and consistency.
3. **Composition.** Rules for connecting, replacing, extending, and overriding capabilities. Including what happens when two pieces implement the same capability.
4. **State and ownership.** Rules for who owns data, how it is shared, and how it migrates when implementations or contracts change.
5. **Verification.** A way to determine whether a particular assembly actually works. Contract tests, invariants, compatibility checks, and integration tests.

AI becomes the **composer**. It discovers capabilities, understands contracts, generates adapters when needed, resolves dependencies, and verifies the resulting application.

But there's an important architectural distinction.

**We shouldn't standardize every application contract. We should standardize how contracts are described, composed, evolved, and verified.**

Otherwise we're trying to invent a universal CRM API, billing API, inventory API, and thousands of others. That's both unrealistic and undesirable.

Consider a billing application. One developer forks the payment implementation. Another adds a new invoice API. A third changes the subscription lifecycle. The system should allow AI to assemble these changes, identify where contracts conflict, generate adaptations where possible, and reject combinations that violate required behavior.

This also means composition cannot be guaranteed for arbitrary pieces. Some contracts express genuinely incompatible business rules. AI can write integration code, but it cannot make contradictory guarantees both true.

The analogy I keep coming back to is **a linker and package manager for application behavior**, rather than just code. Except the pieces and their contracts can evolve, and AI does much of the work a developer would traditionally do manually.

That suggests an interesting shift:

**Today, we distribute applications and allow people to extend them. In this model, we distribute composable capabilities and assemble applications from them.**

A traditional upstream can still exist, but it has no special authority over the resulting application. It's simply one source of capabilities among many.

The fundamental design question becomes: **What is the smallest shared set of composition rules that allows independently developed software to work together, without forcing everyone to agree on the same application architecture?**

That could be the POSIX-like foundation for AI-assembled software.

---

## Question 4

now upstream becomes a guardian of contracts

### Answer 4

Yes. **Upstream stops being the authority over implementations and becomes the guardian of contracts.**

Its responsibility shifts from deciding which features and code get merged to maintaining the rules that allow independently developed software to work together.

An upstream project would define contracts, compatibility guarantees, conformance tests, and rules for evolving those contracts. Anyone could replace an implementation, introduce new APIs, or extend existing behavior without asking for permission.

This changes the meaning of a fork. A fork is no longer necessarily a competing copy of the application. It can be an independently evolving implementation or an extension of its contracts.

And when a fork needs to change a contract, it can establish a new version or branch of that contract. AI can help bridge the differences. Upstream doesn't have to accept the change for the fork to remain useful.

There's one important distinction: **upstream governs a contract, but shouldn't own the namespace of all possible contracts.** Otherwise we've simply moved the old maintainer bottleneck from code reviews to API approvals.

The resulting model is interesting:

**Upstream maintains compatibility. Forks drive experimentation. AI handles composition.**

And the application becomes an assembly of independently evolving parts, rather than a single codebase everyone must agree on.

The real measure of success would be whether a developer can adopt an upstream security fix while keeping their own implementation, modified contracts, and extensions—without repeatedly resolving the same fork conflicts.

---

## Question 5

so w3c and chrome/firefox/opera?

### Answer 5

**Exactly. The web platform may be the closest existing example of what you're describing.**

The analogy is:

| Web ecosystem | AI-composable software |
|---|---|
| W3C / WHATWG | Guardians of contracts |
| HTML, DOM, CSS, Web APIs | Application capability contracts |
| Chrome, Firefox, Safari | Independent implementations |
| Browser-specific features | Extensions and new APIs |
| Web Platform Tests | Contract conformance tests |
| Websites | Applications built on shared contracts |

The key achievement of the web is that **no browser vendor needs permission from another to build, innovate, or distribute its implementation.** They cooperate on standards while competing on implementations.

A few technical distinctions: HTML is now maintained by WHATWG rather than W3C alone, and Opera uses Chromium's Blink engine, so it isn't an independent engine like Firefox's Gecko.

But your idea goes one level further.

Browsers implement a shared platform. You're describing **applications assembled from independently developed pieces, each potentially implementing, extending, or changing contracts.**

For example, a CRM could use one implementation of contacts, another of billing, and a third of workflows. Each could evolve independently. AI would resolve their contracts and compose a working application.

This suggests three distinct roles:

- **Standards bodies (upstreams)** maintain contracts and compatibility rules.
- **Developers (forks)** create implementations, extensions, and new contracts.
- **AI (composer)** assembles compatible pieces, creates necessary adapters, and verifies integration.

One important lesson from the web: standards don't have to precede innovation. Browsers regularly experiment with APIs before those capabilities become standards. Successful experiments can eventually become shared contracts.

**The web separated standards from implementations. You're proposing to also separate applications from their implementations.**

That is a much stronger idea than simply improving open-source forking.

---

## Question 6

so ai3c, but it doesn't really have anything to do with ai frankly

### Answer 6

Exactly. **AI is the catalyst, not the foundation.**

The problem existed long before LLMs: software is difficult to compose, extend, replace, and evolve independently. AI makes this problem more visible because generating implementations is becoming cheap, while integrating and maintaining them remains expensive.

What you're describing is fundamentally a **software interoperability and composition standard**.

Just as W3C and WHATWG helped establish a common platform that competing browsers could implement, this new ecosystem would establish rules for how independently developed application capabilities work together.

The important difference is that the web standardized a shared execution platform and its APIs. You're proposing something broader: standardized rules for composing application behavior, including contracts that can themselves be extended or forked.

And I would make one design principle non-negotiable:

**The system must work without AI. AI should make composition easier, not be required for correctness.**

A deterministic resolver should be able to validate contracts, dependencies, and compatibility. AI can propose adapters, migrations, or new implementations, but the resulting assembly must be testable and reproducible.

So perhaps not *AI3C*.

**A3C — Application Contracts & Composition Consortium** might be closer, although the name matters much less than the underlying model.

The interesting historical parallel is that the web didn't succeed because browsers could generate HTML faster. It succeeded because independently developed browsers and websites could agree on how things worked.

AI may create the same pressure for application software that the internet created for networked documents: **a need for common rules without centralized control over implementations.**

## Related essays

This follows the same questions raised in [Why Do We Keep Building the Same Software?](/posts/why-do-we-keep-building-the-same-software.html) and [Agents Do Not Want Your CRUD APIs](/posts/agents-do-not-want-your-crud-apis.html).
