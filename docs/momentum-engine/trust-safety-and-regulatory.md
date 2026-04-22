# Momentum Engine Trust, Safety, and Regulatory Guide

This document captures the non-negotiable constraints for the Momentum Engine.

## 1. Core Risks

### 1.1 Securities and Gambling Risk
Using financial language too literally creates regulatory exposure.

Avoid default public language such as:
- exchange
- trading
- asset speculation
- market order
- yield farming

Prefer:
- pulse value
- momentum stream
- flow volatility
- surge
- catalyst
- founder

### 1.2 Stampede Risk
If incentives spike too sharply, users may rush a venue in unsafe ways.

Required mitigations:
- hard capacity ceilings
- cooldown periods
- reward tapering instead of cliff drops
- venue pause controls
- visible “full” and “cooling” states

### 1.3 Fraud and Proof Abuse
As value rises, spoofing incentives rise.

Preferred proof stack for high-value moments:
- geofence
- rotating venue QR or time-bound code
- timestamped photo or receipt
- anomaly detection
- optional venue confirmation

### 1.4 Privacy Risk
Real-time movement systems can drift into surveillance if designed poorly.

Promorang should:
- show fuzzy location clusters, not individual user pins
- avoid exposing exact participant locations to other users
- minimize retention of sensitive raw location data
- use explicit consent for high-resolution location features

## 2. Operational Safety Requirements

Every gathering-capable venue or moment should support:
- `capacity_limit`
- `cooldown_policy`
- `safety_mode`
- `proof_mode`
- `emergency_pause`

## 3. Human Experience Rule

Promorang should never feel like:
- a manipulation engine
- a rush-to-win system
- a pseudo-financial product

It should feel like:
- a high-trust coordination platform
- a memory and perk system
- a socially meaningful movement layer

## 4. Moderation Requirements

Admin tooling must support:
- proof review
- venue override
- suspicious activity scoring
- duplicate evidence detection
- participant appeals
- creator and venue suspension paths

## 5. Language Policy

Public-facing product and marketing copy should emphasize:
- movement
- energy
- participation
- memory
- perks
- community
- story

Internal models can remain more technical, but user-facing journeys must remain human-readable.
