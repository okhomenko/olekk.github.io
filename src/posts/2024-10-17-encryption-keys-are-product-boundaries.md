---
layout: layouts/post.njk
title: Encryption keys are product boundaries
description: "How I think about key design in multi-tenant SaaS: customer keys should model authority, jurisdiction, deletion, and enterprise trust."
date: 2024-11-12
tags:
  - posts
  - engineering
  - architecture
tagsText: Security, Architecture, B2B SaaS
---

The rule I use for encryption in multi-tenant SaaS is simple: keys should model authority, not tables.

It is easy to stop at the comforting checklist:

```text
Database encryption: enabled
S3 encryption: enabled
KMS: enabled
```

That checklist matters, but it is not the design. Encryption at rest is a baseline. The harder questions show up when the product has serious tenants, enterprise buyers, regional promises, audit requirements, and deletion obligations.

```text
Can we suspend one merchant without touching everyone else?
Can we prove EU data is controlled by EU-region keys?
Can we delete a merchant's historical data from backups?
Can we support enterprise BYOK later?
Can we show auditors who had decrypt capability?
Can we explain what happens when an end user asks to be deleted?
```

Those are product architecture questions wearing security clothes. When I review a key model, I am really asking whether the cryptography reflects the business boundaries the product claims to have.

## The key is the boundary

A cloud KMS gives the machinery: hardened storage, policies, audit logs, regional placement, rotation, and cryptographic operations. The important decision is not merely "use KMS." The important decision is what each key represents.

A weak model is:

```text
one production key for everything
```

That gives encryption, but it does not give much control. If one key protects every tenant, the key does not map to a meaningful business, legal, or operational boundary.

The model I prefer for serious B2B SaaS is:

```text
one customer-managed key per merchant per region
```

For example:

```text
KMS
 ├── CMK: merchant_A / EU
 │   ├── DEK: customer_profile_record
 │   ├── DEK: event_payload_object
 │   └── DEK: export_file
 │
 └── CMK: merchant_B / US
     ├── DEK: customer_profile_record
     └── DEK: event_payload_object
```

Now the key hierarchy matches the product hierarchy. The merchant is the customer boundary. The region is the jurisdiction boundary. The data encryption key is the storage granularity.

## I do not default to user keys

When a product stores information about a merchant's users, one tempting answer is one key per end user. I do not start there.

It sounds elegant on a whiteboard, but in production it usually creates a lifecycle problem:

```text
too many keys
too much state
KMS quota pressure
higher operational cost
messy deletion semantics
little real product value
```

In most B2B SaaS systems, the merchant is the legal and product boundary. The end user is the data subject. Those are different boundaries, so I do not want one mechanism pretending to solve both.

The merchant-level key answers questions like:

```text
Can this merchant be suspended?
Can this merchant's data be made cryptographically unreadable?
Can this merchant be assigned to an EU-only key?
Can this merchant later bring their own key?
Can we produce access logs for this merchant's protected data?
```

The end-user deletion workflow answers a different question:

```text
Can we remove this person's records from the active system and ensure derived copies expire or are deleted according to policy?
```

That distinction is where a lot of key designs go wrong. They try to use cryptography as a shortcut for data lifecycle work. It usually makes both worse.

## Deletion has two levels

When an end user asks to be deleted, I usually do not want to destroy the merchant's master key. That deletes far more than the user. It makes the merchant's whole dataset unreadable.

User deletion should be a data workflow:

```text
- delete primary rows
- delete associated blobs
- remove search/index copies
- remove analytics projections where required
- delete or orphan record-level encrypted data keys where applicable
- retain only legally required suppression or audit markers
- emit an auditable deletion event
- let backups age out under a documented retention window
```

Merchant deletion is different. When the merchant terminates, or when the whole account must be removed, the merchant-level key becomes powerful:

```text
- disable the merchant CMK
- schedule key deletion
- delete account data
- destroy exports
- revoke integrations
- preserve only legally required billing or audit records under a separate policy
```

The operating model becomes:

```text
end-user deletion = data-layer erasure
merchant deletion = cryptographic erasure boundary
```

That is the kind of answer enterprise buyers and auditors can reason about. It names the control scope instead of hiding behind "encrypted at rest."

## Region belongs in the model

For EU customers, key placement is not a footnote. If EU tenant data is encrypted under an EU-region key, and that key cannot be used outside the region, the architecture gives you a concrete residency control. That is stronger than a slide saying "we keep EU data in Europe."

I want the system to make the invariant hard to violate:

```text
EU merchant data -> EU storage -> EU KMS key
US merchant data -> US storage -> US KMS key
```

This is the difference between compliance-by-documentation and compliance-by-design. The first asks people to remember the promise. The second puts the promise into the shape of the system.

## Keys become product features

Once keys map to real product boundaries, they stop being hidden infrastructure. They become features the business can sell, operate, and prove:

```text
merchant-level isolation
regional data residency
enterprise key access logs
merchant kill switch
cryptographic account deletion
future BYOK support
audit-ready deletion evidence
```

That is why I do not find "we use KMS" persuasive by itself. The serious version sounds more like this:

```text
Each merchant's protected data is encrypted under merchant- and region-scoped customer-managed keys. End-user deletion is handled through data deletion and bounded retention. Merchant-level deletion can be enforced cryptographically through key disablement and deletion.
```

That sentence is architecture, security, compliance, and product strategy in one place.

## The rule I use

The mental model I come back to is:

```text
CMK = authority boundary
region = jurisdiction boundary
DEK = data granularity
application workflow = deletion semantics
```

One key for everything gives encryption without much control. One key per user often creates operational tax without matching the real legal boundary. Merchant- and region-scoped keys make the cryptography reflect how the business actually works.

That is the point: in multi-tenant B2B SaaS, encryption keys are not only security plumbing. They are product boundaries.

## Related essays

- [Architecture is the cost structure of change](/posts/architecture-is-the-cost-structure-of-change.html)
- [Growth engineering is the business of reducing the cost of learning](/posts/growth-engineering-cost-of-learning.html)
