# PromoPush Architecture

## Definition

PromoPush is the geo-triggered distribution engine that feeds Promorang Moments.

It does three things:

1. Captures attention through ads, QR codes, and direct links.
2. Routes people into a live Moment.
3. Amplifies the Moment through nearby participants and creators.

PromoPush is not marketing support. It is the input pipe for the Promorang economy.

## System Positioning

| Layer | Function |
| --- | --- |
| PromoPush | Traffic and distribution: who sees the Moment |
| Promorang Moments | Behavior and execution: what they do |
| Proof System | Verification: did it happen |
| Rewards and Reputation | Retention: why they repeat |

## Existing Execution, Reframed

- Flyers and QR codes become direct entry into a specific Moment.
- Meta geo ads become geo-triggered Moment distribution.
- On-ground prompts become the proof and reward loop.

## Core Architecture

### Distribution Zone

Each PromoPush unit should define:

- `moment_id`
- `campaign_id`
- `geo_label`
- `geo_radius_meters`
- `distribution_starts_at`
- `distribution_ends_at`

This is the active geo and time fence around the Moment.

### Entry Channels

Every entry path must resolve to a single Moment entry endpoint.

Allowed channels:

- QR code
- Meta ad link
- Direct link

Rules:

- No landing-page detours
- No generic forms
- No website-first funnel

### Participant Flow

1. Click or scan
2. Join Moment
3. Execute one action
4. Submit proof
5. Receive reward

### Creator Layer

Nearby participants and creators should be able to distribute the same Moment and earn per verified outcome. That creates local amplification, lower CAC, and better attribution.

## Economic Engine

PromoPush should support both distribution spend and outcome spend.

Illustrative outcome pricing:

- `JMD 20` per scan and signup
- `JMD 50` per verified post
- `JMD 100` per purchase proof

Platform margin can sit inside distribution markup, verification, and platform fees.

## Closed Loop

PromoPush exists to create a closed-loop chain:

`impression -> entry -> move -> proof -> reward`

That loop should anchor dashboards, creator incentives, and operational controls.

## Minimum Build

### V1

- Moment-linked geo campaign
- QR generator tied to Moment
- manual ad deployment
- creator referral links
- dashboard for impressions, entries, moves, proofs, rewards

### V2

- Meta API integration
- automated geo-campaign creation
- dynamic reward pricing
- activity heatmaps

## Product Rule

Without PromoPush, Promorang has no scalable input. It should be treated as a core system layer, not a support feature.
