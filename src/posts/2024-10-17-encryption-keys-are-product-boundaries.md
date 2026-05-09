---
layout: layouts/base.njk
title: Encryption Keys Are Product Boundaries
description: In multi-tenant B2B SaaS, key management is not just encryption plumbing. It models tenant authority, jurisdiction, deletion, and enterprise trust.
date: 2024-11-12
tags: posts
---

# Encryption Keys Are Product Boundaries

Most SaaS teams start with the same comforting checklist:

```text
Database encryption: enabled
S3 encryption: enabled
KMS: enabled
```

That is not wrong. It is just incomplete.

Encryption at rest is a security baseline. It does not automatically answer the questions that matter once the product becomes a serious multi-tenant B2B system:

```text
Can we suspend one merchant without touching everyone else?
Can we prove EU data is controlled by EU-region keys?
Can we delete a merchant's historical data from backups?
Can we support enterprise BYOK later?
Can we show auditors who had decrypt capability?
Can we explain what happens when an end user asks to be deleted?
```

Those are not only security questions. They are product architecture questions.

The mistake is treating keys as storage implementation details. In a multi-tenant SaaS product, keys should model authority.

## KMS is the service. The key is the boundary.

A cloud Key Management Service gives you the machinery: hardened key storage, access policies, audit logs, regional placement, rotation, and cryptographic operations.

But the important design decision is not merely "use KMS."

The important design decision is: **what does each key represent?**

A poor answer is:

```text
one production key for everything
```

That gives you encryption, but it does not give you strong tenant isolation. If one key protects all tenants, then the key does not map to a meaningful business, legal, or operational boundary.

A better answer is:

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

Now the key hierarchy matches the product hierarchy.

The merchant is the customer boundary. The region is the jurisdiction boundary. The data encryption key is the storage granularity.

That is the design principle:

> Keys should model authority, not tables.

## Merchant keys are not user keys.

If you collect information about a merchant's users, it is tempting to think the cleanest model is one key per end user.

That is usually the wrong design.

It sounds elegant on a whiteboard, but it becomes a lifecycle problem in production:

```text
too many keys
too much state
KMS quota pressure
higher operational cost
messy deletion semantics
little real product value
```

In most B2B SaaS systems, the merchant is the legal and product boundary. The end user is the data subject. Those are different boundaries.

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

Do not overload one mechanism to solve both problems.

## User deletion and merchant deletion are different workflows.

When an end user asks to be deleted, you usually should not destroy the merchant's master key. That would delete more than the user. It would make the merchant's whole dataset unreadable.

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

Merchant deletion is different.

When the merchant terminates, or when you need to remove the entire account, the merchant-level key becomes powerful:

```text
- disable the merchant CMK
- schedule key deletion
- delete account data
- destroy exports
- revoke integrations
- preserve only legally required billing or audit records under a separate policy
```

That gives you two levels of control:

```text
end-user deletion = data-layer erasure
merchant deletion = cryptographic erasure boundary
```

This distinction matters because auditors, enterprise buyers, and regulators do not want vague claims. They want to understand control scope.

## Region is part of the key model.

For EU customers, key placement is not trivia.

If EU tenant data is encrypted under an EU-region key, and the key cannot be used outside that region, the architecture gives you a concrete data-residency control. It is stronger than a slide saying "we keep EU data in Europe."

The system should make the invariant hard to violate:

```text
EU merchant data -> EU storage -> EU KMS key
US merchant data -> US storage -> US KMS key
```

This is where key design becomes compliance-by-design instead of compliance-by-documentation.

## Keys become product features.

Once keys map to real product boundaries, they stop being hidden infrastructure.

They become features you can sell, operate, and prove:

```text
merchant-level isolation
regional data residency
enterprise key access logs
merchant kill switch
cryptographic account deletion
future BYOK support
audit-ready deletion evidence
```

That is why "we use KMS" is not enough.

The serious version is:

```text
Each merchant's protected data is encrypted under merchant- and region-scoped customer-managed keys. End-user deletion is handled through data deletion and bounded retention. Merchant-level deletion can be enforced cryptographically through key disablement and deletion.
```

That sentence is architecture, security, compliance, and product strategy in one place.

## The operating rule

The useful mental model is simple:

```text
CMK = authority boundary
region = jurisdiction boundary
DEK = data granularity
application workflow = deletion semantics
```

If you use one key for everything, you get encryption but not much control.

If you use one key per user, you probably created an operational tax without matching the real legal boundary.

If you scope keys by merchant and region, then your cryptography starts to reflect how the business actually works.

That is the point: in multi-tenant B2B SaaS, encryption keys are not just security plumbing.

They are product boundaries.