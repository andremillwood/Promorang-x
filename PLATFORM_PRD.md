# Promorang Platform Product Requirements Document (PRD)

## 1. Executive Summary
Promorang is a multi-sided ecosystem designed to gamify social amplification and bridge the gap between Brands (Advertisers), Creators, and Operators. The platform incentivizes social engagement through a proprietary rewards system (Gems, Gold, PromoPoints) and provides tools for performance-based marketing.

## 2. Target Audience
- **Creators:** Social media influencers and content producers looking to monetize their reach.
- **Advertisers:** Brands seeking authentic engagement and performance-based marketing.
- **Operators:** "Franchisees" who manage localized or themed Hubs (Seasons) to drive engagement.
- **Investors/Users:** Participants who stake in social forecasts and participate in the ecosystem.

## 3. Core Features & Functional Requirements

### 3.1. User Ecosystem & Profiles
- **Role-Based Profiles:** Support for Creator, Advertiser, Investor, Operator, and Merchant roles.
- **Gamified Progression:** Leveling system, referral tiers (Bronze to Platinum), and achievement badges.
- **Social Links:** Integration with Instagram, TikTok, and YouTube for influence tracking.

### 3.2. Marketplace & E-commerce
- **Multi-Currency Store:** Support for USD, Gems, and Gold.
- **Product Management:** Merchant dashboard for managing products, categories, and reviews.
- **Shopping Cart & Checkout:** Full end-to-end shopping flow with order history.
- **Referral Integration:** Automatic 5% commission on product sales via referral tracking.

### 3.3. Advertiser & Campaign System
- **Campaign Dashboard:** Tools for creating drops, managing budgets, and tracking ROI.
- **Coupon System:** Performance-based coupon distribution (Apply -> Redeem flow).
- **Targeting:** Audience segmentation based on user metrics and social influence.

### 3.4. Operator Hubs (Seasons)
- **Hub Management:** Operators can create and manage branded "Seasons" (e.g., Summer Jam).
- **Revenue Split:** 80% Operator / 20% Platform fee structure on brand budgets.
- **Leaderboards:** Dynamic daily, weekly, and monthly leaderboards for competitive engagement.

### 3.5. Referral & Growth Hub
- **Tiered Commission:** 5% to 10% commission based on referral activity and tier level.
- **Social Forecasts:** Staking and prediction markets for social media performance.
- **Ledger System:** Persistent ledger for tracking staking, funding, and rewards.

## 4. Technical Architecture

### 4.1. Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend:** Node.js (Express), TypeScript/JavaScript.
- **Database/Auth:** Supabase (PostgreSQL, Realtime, JWT Auth).
- **Mobile:** Expo/React Native (in progress).

### 4.2. API Infrastructure
- **Unified Entry Point:** `api.promorang.co` handling all service routes.
- **Environment-Aware CORS:** Secure cross-origin resource sharing for dev and production.
- **Telemetry & Error Reporting:** Automated frontend error tracking and system health monitoring.

## 5. Security & Compliance
- **JWT Authentication:** Secure token-based access via Supabase.
- **Role-Based Access Control (RBAC):** Middleware-enforced permissions for sensitive endpoints.
- **Data Privacy:** Secure handling of user metadata and social credentials.

## 6. Roadmap & Future Enhancements
- **Mobile App Completion:** Finalizing social feed and specialized actions (Apply/Redeem).
- **Advanced Analytics:** Real-time social engagement forecasting using AI.
- **Global Expansion:** Support for additional currencies and localized Operator Hubs.
