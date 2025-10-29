# Growth Hub API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Staking](#staking)
  - [Funding](#funding)
  - [Shield](#shield)
  - [Creator Rewards](#creator-rewards)
  - [Ledger](#ledger)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer your-jwt-token
```

## Base URL

```
https://api.promorang.com/api/growth
```

## Endpoints

### Staking

#### Get Staking Channels

```
GET /staking/channels
```

**Query Parameters:**
- `active` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "channels": [
    {
      "id": "staking-1",
      "name": "30-Day Staking",
      "description": "Earn rewards for 30 days",
      "apy": 10.5,
      "min_duration_days": 30,
      "max_duration_days": 30,
      "min_amount": 100,
      "is_active": true
    }
  ]
}
```

#### Create Staking Position

```
POST /staking/positions
```

**Request Body:**
```json
{
  "channel_id": "staking-1",
  "amount": 1000,
  "duration_days": 30
}
```

**Response:**
```json
{
  "success": true,
  "position": {
    "id": "position-1",
    "user_id": "user-1",
    "channel_id": "staking-1",
    "amount": 1000,
    "duration_days": 30,
    "start_date": "2025-10-28T00:00:00Z",
    "end_date": "2025-11-27T00:00:00Z",
    "status": "active"
  }
}
```

### Funding

#### Get Funding Projects

```
GET /funding/projects
```

**Query Parameters:**
- `status` (string, optional): Filter by status (draft, active, funded, completed, cancelled)
- `creator_id` (string, optional): Filter by creator ID
- `limit` (number, optional): Number of results to return (default: 20)
- `offset` (number, optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "project-1",
      "creator_id": "user-1",
      "title": "New Feature Development",
      "description": "Help us build amazing new features",
      "target_amount": 5000,
      "amount_raised": 2500,
      "status": "active",
      "start_date": "2025-10-01T00:00:00Z",
      "end_date": "2025-12-31T00:00:00Z"
    }
  ],
  "count": 1
}
```

### Shield

#### Get Shield Policies

```
GET /shield/policies
```

**Response:**
```json
{
  "success": true,
  "policies": [
    {
      "id": "shield-1",
      "name": "Basic Protection",
      "description": "Basic account protection",
      "premium_amount": 100,
      "coverage_amount": 1000,
      "duration_days": 30,
      "is_active": true
    }
  ]
}
```

### Creator Rewards

#### Get Creator Rewards

```
GET /creator/rewards
```

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, approved, paid)
- `period` (string, optional): Filter by period (YYYY-MM)

**Response:**
```json
{
  "success": true,
  "rewards": [
    {
      "id": "reward-1",
      "creator_id": "user-1",
      "amount": 50,
      "period": "2025-10",
      "status": "pending",
      "metrics": {
        "views": 1000,
        "shares": 50,
        "comments": 20,
        "engagement_score": 75
      }
    }
  ]
}
```

### Ledger

#### Get Ledger Entries

```
GET /ledger
```

**Query Parameters:**
- `limit` (number, optional): Number of results to return (default: 20)
- `offset` (number, optional): Number of results to skip (default: 0)
- `type` (string, optional): Filter by transaction type
- `start_date` (ISO date, optional): Filter by start date
- `end_date` (ISO date, optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "entries": [
    {
      "id": "ledger-1",
      "user_id": "user-1",
      "source_type": "staking_reward",
      "source_id": "position-1",
      "amount": 10.5,
      "currency": "gems",
      "status": "completed",
      "metadata": {
        "note": "Staking reward for October 2025"
      },
      "created_at": "2025-10-28T12:00:00Z"
    }
  ],
  "count": 1
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds to complete the transaction",
    "details": {
      "available_balance": 500,
      "required_amount": 1000
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `INVALID_INPUT` | Invalid request parameters |
| `INSUFFICIENT_FUNDS` | Not enough balance |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_SERVER_ERROR` | Server error |

## Rate Limiting

- **Public endpoints:** 100 requests per minute per IP
- **Authenticated endpoints:** 1000 requests per minute per user
- **Admin endpoints:** 5000 requests per minute per user

## Webhooks

### Events

- `staking.position_created`
- `funding.project_created`
- `funding.pledge_created`
- `shield.subscription_created`
- `creator.reward_created`

### Webhook Payload

```json
{
  "event": "staking.position_created",
  "data": {
    "id": "position-1",
    "user_id": "user-1",
    "amount": 1000,
    "created_at": "2025-10-28T12:00:00Z"
  },
  "timestamp": "2025-10-28T12:00:01Z"
}
```

### Retry Policy

- 3 retry attempts
- Exponential backoff (1s, 5s, 15s)
- After 3 failures, the webhook will be marked as failed
