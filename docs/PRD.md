# Promorang - Product Requirements Document (PRD)  
**Last Updated:** October 29, 2025  
**Version:** 2.0  

## 1. Product Overview

### Vision
Promorang is a social media monetization platform that empowers creators to earn sustainable income through multiple revenue streams while providing supporters with investment opportunities in creator success.

### Core Value Propositions
- **For Creators**: Monetize content through staking, funding, and performance-based rewards
- **For Supporters**: Invest in creators and earn yields through various engagement mechanisms
- **For Advertisers**: Access to engaged audiences through transparent, performance-based campaigns

## 2. Technical Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: React Query + Zustand
- **UI Components**: Radix UI + Tailwind CSS
- **Routing**: React Router v6
- **Authentication**: Supabase Auth Helpers
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Vercel Serverless Functions)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Payments**: Stripe Integration
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Infrastructure
- **Hosting**: Vercel (Frontend + Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **CI/CD**: Vercel Deployments

## 3. Core Features

### 3.1 Multi-Currency Economy

#### Gems (Primary Currency)
- **Purpose**: Premium currency for transactions
- **Earning**: 
  - Completing paid drops
  - Staking rewards
  - Creator funding payouts
- **Spending**:
  - Content shares
  - Forecasts/predictions
  - Tier upgrades
  - Social Shield subscriptions

#### Points
- **Purpose**: Engagement-based currency
- **Earning**:
  - In-app actions (likes, comments, shares)
  - External social actions (with verification)
  - Referral bonuses
  - Instagram verification
- **Spending**:
  - Conversion to Keys (500:1 ratio)

#### Keys
- **Purpose**: Access to premium opportunities
- **Earning**:
  - Point conversion
  - External move verification
  - Move Drops completion
- **Spending**:
  - Applying to Paid Drops

### 3.2 Growth Hub

#### Staking System
- **Channels**: Predefined APY rates (5-15%)
- **Lock Periods**: 30-90 days
- **Features**:
  - Flexible and fixed-term options
  - Compounding rewards
  - Early withdrawal penalties

#### Creator Funding
- **Project Campaigns**: Creators can launch funding campaigns
- **Pledges**: Supporters can back projects
- **Milestone-Based**: Funds released upon milestone completion

#### Social Shield
- **Premium Protection**: Insurance against revenue fluctuations
- **Subscription Model**: Monthly premium in Gems
- **Coverage Tiers**: Based on creator tier and earnings

### 3.3 Content & Investment

#### Content Shares
- **Share Economy**: Users can invest in content
- **Price Discovery**: Dynamic pricing based on demand
- **Revenue Sharing**: Earnings from content performance

#### Social Forecasts
- **Prediction Markets**: Users predict content performance
- **Staking**: Wager Gems on predictions
- **Payouts**: Based on prediction accuracy

## 4. User Tiers

### Free Tier
- Basic features
- Standard reward rates
- Limited access to premium drops

### Premium Tier (500 Gems)
- 1.5x point multiplier
- Reduced Proof Drop requirements
- Priority support
- Advanced analytics

### Super Tier (1000 Gems)
- 2.0x point multiplier
- Minimal Proof Drop requirements
- VIP support
- Exclusive events
- Custom targeting

## 5. Implementation Status

### ✅ Implemented
- Core authentication flow (Supabase)
- Growth Hub database schema
- Staking system (channels, positions, claims)
- Creator funding campaigns
- Basic content sharing
- User wallet system

### 🚧 In Progress
- Social Shield implementation
- Advanced analytics dashboard
- Mobile optimization
- Admin moderation tools

### 📅 Planned
- Native mobile apps
- Advanced prediction markets
- Expanded payment options
- Enhanced social features

## 6. Technical Considerations

### Performance
- Implemented Supabase Row Level Security
- Optimized database indexes
- Server-side pagination for large datasets
- Caching with React Query

### Security
- JWT-based authentication
- Rate limiting on API endpoints
- Input validation with Zod
- Regular security audits

### Scalability
- Serverless architecture
- Database connection pooling
- CDN for static assets
- Monitoring with Vercel Analytics

## 7. Development Roadmap

### Q4 2025
- [ ] Launch Growth Hub MVP
- [ ] Implement Social Shield
- [ ] Enhanced analytics dashboard

### Q1 2026
- [ ] Mobile app beta
- [ ] Advanced prediction markets
- [ ] Expanded payment options

### Q2 2026
- [ ] AI-powered recommendations
- [ ] Advanced creator tools
- [ ] Community features

## 8. Success Metrics

### User Growth
- Monthly Active Users (MAU)
- Creator signup rate
- Supporter conversion rate

### Engagement
- Average session duration
- Actions per user
- Content creation rate

### Revenue
- Total value locked (TVL) in staking
- Creator earnings
- Platform revenue share

### Technical
- API response times
- Error rates
- Uptime (target: 99.9%)

---

*This document will be updated as the platform evolves. Last updated: October 29, 2025*
