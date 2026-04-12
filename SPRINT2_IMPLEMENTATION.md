# Sprint 2 Implementation Guide

## Overview
This document describes the implementation of Sprint 2 features for the Sidequesters app, including:
- Guild Roster (Friend List)
- Hall of Fame (Leaderboard)
- Sidequests (Challenges)

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend
npm run prisma:migrate
```

When prompted for a migration name, you can use: `add_sprint2_models`

### 2. Seed Challenge Categories

```bash
cd backend
npm run prisma:seed
```

This will create 6 challenge categories:
- Fitness (💪) - 15 XP
- Courage (🦁) - 20 XP
- Creativity (🎨) - 15 XP
- Wisdom (📚) - 10 XP
- Social (🤝) - 10 XP
- Adventure (🗺️) - 25 XP

### 3. Update User Registration

The registration endpoint now requires a `displayName` field:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "displayName": "string"
}
```

## API Endpoints

### Friendships / Guild Roster

#### Send Friend Request (FR-1)
```
POST /api/friendships
Authorization: Bearer <token>
Body: { "addresseeUsername": "string" }
```

#### Get Pending Friend Requests (FR-2)
```
GET /api/friendships?status=pending
Authorization: Bearer <token>
```

#### Get Accepted Friends (FR-3)
```
GET /api/friendships?status=accepted
Authorization: Bearer <token>
```

#### Accept/Decline Friend Request (FR-2)
```
PATCH /api/friendships/:id
Authorization: Bearer <token>
Body: { "status": "accepted" | "declined" }
```

#### Search Users (FR-1)
```
GET /api/users/search?q=<query>
Authorization: Bearer <token>
```

### Leaderboard / Hall of Fame

#### Get Leaderboard (LB-3)
```
GET /api/leaderboard
Authorization: Bearer <token>
```

Returns XP-ranked list of user's friends + self, with rank, user info, and XP totals.

### Challenges / Sidequests

#### Get Challenge Categories (CH-1)
```
GET /api/challenges/categories
```

Note: This endpoint does NOT require authentication (public)

#### Get Incoming Challenges (CH-2)
```
GET /api/challenges/inbox
Authorization: Bearer <token>
```

Returns challenges with status 'pending' or 'accepted' for the current user.

#### Create Challenge (CH-3)
```
POST /api/challenges
Authorization: Bearer <token>
Body: {
  "recipientIds": ["string"],
  "categoryId": "string",
  "title": "string",
  "description": "string",
  "xpReward": number (optional, defaults to category default),
  "expiresAt": "ISO8601 datetime string" (optional)
}
```

Validation:
- All recipients must be accepted friends (CH-5)
- Returns 403 if any recipient is not a friend

#### Accept/Decline/Complete Challenge (CH-4)
```
PATCH /api/challenges/:challengeId/recipients/:recipientId
Authorization: Bearer <token>
Body: { "status": "accepted" | "declined" | "completed" }
```

When status is set to "completed":
- User receives XP award (LB-1)
- completedAt timestamp is set
- User's total XP is incremented

## Data Model Changes

### User Model
Added fields:
- `displayName: string`
- `avatarUrl: string` (defaults to empty string)
- `xp: number` (defaults to 0)

### New Models
- `Friendship` - Tracks friend requests and accepted friendships
- `ChallengeCategory` - Quest types with icons, colors, and XP rewards
- `Challenge` - Individual challenges/sidequests
- `ChallengeRecipient` - Per-recipient status for challenges (supports group challenges)

## Features Implemented

### ✅ Guild Roster (Friend List)
- **FR-1**: Send friend requests by username
- **FR-2**: Accept or decline incoming requests
- **FR-3**: View accepted friends list
- User search functionality

### ✅ Hall of Fame (Leaderboard)
- **LB-1**: Earn XP when completing challenges
- **LB-2**: User XP total visible in user object
- **LB-3**: Leaderboard showing friends' XP rankings

### ✅ Sidequests (Challenges)
- **CH-1**: Browse challenge categories
- **CH-2**: Receive and view challenges from friends
- **CH-3**: Create group challenges (send to multiple friends)
- **CH-4**: Accept, decline, or complete challenges
- **CH-5**: Challenges restricted to friends only (validated on backend)

## Testing the Implementation

### 1. Create Test Users

Register multiple users with displayName:

```bash
# User 1
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "adventurer1",
    "email": "adv1@example.com",
    "password": "password123",
    "displayName": "Hero One"
  }'

# User 2
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "adventurer2",
    "email": "adv2@example.com",
    "password": "password123",
    "displayName": "Hero Two"
  }'
```

### 2. Send Friend Request

```bash
# User 1 sends request to User 2
curl -X POST http://localhost:4000/api/friendships \
  -H "Authorization: Bearer <user1_token>" \
  -H "Content-Type: application/json" \
  -d '{"addresseeUsername": "adventurer2"}'
```

### 3. Accept Friend Request

```bash
# User 2 accepts
curl -X PATCH http://localhost:4000/api/friendships/<friendship_id> \
  -H "Authorization: Bearer <user2_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

### 4. Create Challenge

```bash
# Get category ID first
curl http://localhost:4000/api/challenges/categories

# User 1 sends challenge to User 2
curl -X POST http://localhost:4000/api/challenges \
  -H "Authorization: Bearer <user1_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientIds": ["<user2_id>"],
    "categoryId": "<fitness_category_id>",
    "title": "Do 50 push-ups",
    "description": "Complete 50 push-ups in one session"
  }'
```

### 5. Complete Challenge

```bash
# User 2 accepts challenge
curl -X PATCH http://localhost:4000/api/challenges/<challenge_id>/recipients/<user2_id> \
  -H "Authorization: Bearer <user2_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'

# User 2 completes challenge (earns XP)
curl -X PATCH http://localhost:4000/api/challenges/<challenge_id>/recipients/<user2_id> \
  -H "Authorization: Bearer <user2_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### 6. View Leaderboard

```bash
curl http://localhost:4000/api/leaderboard \
  -H "Authorization: Bearer <user1_token>"
```

## File Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Updated with Sprint 2 models
│   └── seed.ts                # Challenge category seed data
├── src/
│   ├── controllers/
│   │   ├── challenge.controller.ts
│   │   ├── friendship.controller.ts
│   │   └── leaderboard.controller.ts
│   ├── routes/
│   │   ├── challenge.routes.ts
│   │   ├── friendship.routes.ts
│   │   └── leaderboard.routes.ts
│   ├── services/
│   │   ├── auth.service.ts    # Updated for displayName
│   │   ├── challenge.service.ts
│   │   ├── friendship.service.ts
│   │   └── leaderboard.service.ts
│   └── app.ts                 # Updated with new routes
```

## Notes

- All friendship and challenge operations require authentication
- Challenge categories endpoint is public (no auth required)
- Friend validation is enforced on the backend for challenges (CH-5)
- XP is automatically awarded on challenge completion (LB-1)
- Friendships are bidirectional (both users become friends when accepted)
- Challenges support multiple recipients (group/party challenges)

## Next Steps

To complete the implementation:
1. Run the migration: `npm run prisma:migrate`
2. Run the seed: `npm run prisma:seed`
3. Test the endpoints with the example curl commands above
4. Build the frontend UI to consume these endpoints
