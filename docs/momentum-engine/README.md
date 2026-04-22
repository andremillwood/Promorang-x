# Promorang Momentum Engine

This documentation set defines the next product direction for Promorang as a real-world momentum platform rather than a narrow task-and-reward app.

The package is split into the following working artifacts:

1. [PRD](./prd-v1.md)
Product narrative, stakeholders, feature model, and success criteria.

2. [Domain Model](./domain-model.md)
Canonical objects, states, and relationships for product and engineering.

3. [V1 Scope](./v1-scope.md)
What ships first, what is intentionally deferred, and why.

4. [Agent API Spec](./agent-api-spec.md)
How Promorang should expose discovery, optimization, execution, proof, and legacy primitives to AI agents.

5. [Trust, Safety, and Regulatory](./trust-safety-and-regulatory.md)
Operational, fraud, privacy, and language constraints.

6. [Roadmap](./roadmap.md)
Execution sequence across operational core, retention core, network effects, and agent readiness.

7. [Schema Proposal](./schema-proposal.md)
Additive database evolution plan using the current `moments`, `venues`, `profiles`, and content foundations.

8. [API Contracts V1](./api-contracts-v1.md)
Application-facing contracts for moments, pulse, proof, memories, and dashboards.

9. [Navigation Model](./navigation-model.md)
Recommended information architecture around `Pulse`, `Discover`, `Create`, `Vault`, and `Dashboard`.

10. [Repo Implementation Map](./repo-implementation-map.md)
Concrete mapping from strategy to existing frontend, backend, and migration areas in this repo.

11. [Category Map](./category-map.md)
Venue categories, moment archetypes, proof models, stakeholder fit, and GTM priority across the broader real-world interaction landscape.

## Positioning

Promorang is a `real-world momentum engine` that converts:

- attention into verified movement
- movement into memory
- memory into long-term economic loyalty

## Product Spine

The platform is organized into five layers:

- `Pulse Layer`: live coordination, urgency, density, and action
- `Gathering Layer`: shared synchronized participation and venue energy
- `Memory Layer`: persistence, collectibles, status, and perks
- `Attribution Layer`: digital intent to physical movement to verified outcome
- `Agent Layer`: machine-readable opportunities and optimization surfaces

## Working Principle

The backend model can remain economically and behaviorally rich, but the user-facing experience should remain simple:

1. Join the pulse
2. Show up and verify
3. Keep the memory

Everything else should ladder beneath those three loops.
