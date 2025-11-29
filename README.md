# Calendly Integration Service

A full backend microservice integrating with the Calendly API.  
This service implements OAuth2 authentication, event syncing, webhook processing, and asynchronous worker queues using BullMQ.

---

## 📐 Architecture Diagram (ASCII)

                      Calendly API
                          │
                          ▼
                ┌────────────────────────┐
                │ Express Server (API)   │
                └─────────┬──────────────┘
                          │
                 Swagger → Controllers → Business → Services → MongoDB
                          │
                          ▼
                ┌──────────────────────┐
                │ /webhooks/receive    │
                └──────────┬───────────┘
                           │ queue job
                           ▼
                   ┌──────────────┐
                   │ BullMQ Worker│
                   └───────┬──────┘
                           ▼
                        MongoDB


 
 ## 📐 PHOTO REPRESENTATION OF ARCHITECTURE  
 <img width="700" height="600" alt="archtechture" src="https://github.com/user-attachments/assets/0299df74-5a8c-4e73-8682-9efd9e896aa6" />
 
## 🧠 Design Decisions & Trade-offs


### 1. Chosen Third-Party API: Calendly

Calendly was selected because it offers:

- A clear OAuth2 workflow
- Well-defined REST endpoints
- Webhooks for real-time updates (with some drawbacks)
- Practical use cases for event syncing

---

### 2. Layered Architecture (Swagger → Controller → Business → Service)

**Decision:**  
Use a strict, layered structure to keep responsibilities decoupled.

**Trade-off:**  
More files and boilerplate but:

- Easier debugging
- More maintainable
- Scales well for multiple entities (contacts, events, invitees later)

---

### 3. MongoDB for Storage

**Decision:**  
Use MongoDB as the data store because:

- Flexible schema for Calendly's nested event structures
- Easy upserts and bulk operations
- JSON-like storage matches Calendly responses

**Trade-off:**  
Not relational, but ideal for event, webhooks etc documents.

---

### 4. Idempotent Sync with Upserts

**Decision:**  
Use `updateOne(..., { upsert: true })` and `bulkWrite`.

**Trade-off:**  
More complex queries but ensures:

- No duplicates
- Safe re-syncing
- Full support for pagination and retries

---

### 5. BullMQ Worker for Webhooks

**Decision:**  
All webhook processing is delegated to a background worker.

**Benefits:**

- API stays fast
- Webhooks are never dropped
- Retry logic is isolated
- Can scale workers independently later

**Trade-off:**  
Worker cannot be deployed on free Render tier → run locally.

---

### 6. Logging Strategy

**Decision:**  
Structured logs with:

- debug
- info
- error  
  Including timestamps and context keys.

**Trade-off:**  
More verbose logs, but very helpful for debugging integration flows.

---

## 🚀 Features

- OAuth2 Authentication with Calendly
- Secure token exchange + refresh token handling
- Sync scheduled events via Calendly API
- Pagination + robust error handling
- Webhook subscription + receiver endpoint
- Background job worker (BullMQ)
- Handles:
  - `invitee.created`
  - `invitee.canceled`
- MongoDB persistence with idempotent upserts
- Clean architecture:
  - Swagger → Controller → Business → Service → Model
- Retry utility with exponential backoff
- Structured logging (info/debug/error)
- Full Swagger documentation

---

## 📂 Project Structure

            src/
            ├── index.js
            ├── config/
            │ ├── db.js
            │ ├── redisConfig.js
            ├── middleware/
            │ ├── authMiddleware.js
            │ ├── errorMiddleware.js
            │ ├── webhookSignatureMiddleware.js
            ├── constants/
            │ └── constants.js
            ├── api/
            │ ├── controllers/
            │ ├── business/
            │ ├── services/
            │ ├── swagger.yaml
            ├── models/
            │ ├── Event.js
            │ ├── Invitee.js
            │ ├── WebhookLog.js
            │ ├── UserToken.js
            ├── jobs/
            │ ├── queue.js
            │ ├── webhook.processor.js
            ├── utils/
            │ ├── logger.js
            │ ├── retry.js
            │ └── httpClient.js
            .env.example
            package.json
            README.md

---

## 🧩 Environment Variables

See `.env.example` for full details. Typical fields:

### API KEY FOR LOCAL APIs

- API_KEY=SAMPLE_API_KEYPORT=PORT

- NODE_ENV=ENV

### MONGODB URI

- MONGO_URI=MONGO_URI

### BASE URL

- PUBLIC_BASE_URL= https://a1f38591d993.ngrok-free.app

### CALENDLY CONFIG

- CALENDLY_CLIENT_ID=CLIENT_ID
- CALENDLY_REDIRECT_URI= HOST/api/v1/auth/callback
- CALENDLY_CLIENT_SECRET=SECRET
- CALENDLY_OAUTH_TOKEN_URL=CALENDLY_API_BASE/oauth/token
- CALENDLY_API_BASE=https://api.calendly.com
- CALENDLY_WEBHOOK_SIGNING_KEY=KEY

### Redis Config

- REDIS_HOST=HOST_NAME
- REDIS_PORT=SAMPLE_PORT
- REDIS_PASSWORD=PASSOWORD

- LOG_LEVEL=SAMPLE_LEVEL

---

## 📘 API Documentation (Swagger)

Swagger live on Render: https://calendlyintegration.onrender.com/api/docs/

---

## 🛠️ Local Setup

### 1. Clone Repo

git clone https://github.com/divyanshsharma11/calendlyIntegration

cd calendlyIntegration
git checkout development

### 2. Install Dependencies

use npm install

### 3. Start Services

Connect MongoDB:
Connect Redis:

### 6. Start BullMQ Worker

node src/jobs/webhook.processor.js
or
npm run worker

---

## 🔐 OAuth2 Flow (Calendly)

1. User calls:
   GET /v1/auth/authorize
2. Calendly login → redirect to:
   GET /v1/auth/callback?code.
3. Server exchanges code → access_token + refresh_token
4. Fetches `/users/me` → extract:

- userUri
- organizationUri

5. Store tokens + metadata in MongoDB

## 🔄 Sync Events (Calendly → MongoDB)

Endpoint:
POST /v1/sync/events

Actions:

- Paginated fetch of scheduled events
- Normalizes and maps Calendly event objects
- Performs bulkWrite upsert
- Prevents duplicates
- Handles rate limits & retries

---

## 🔔 Webhook Handling (Push Sync)

### 1. Webhook Registration

Automatically registered via Calendly API.

### 2. Webhook Receiver

POST /v1/webhooks/receive

Steps:

1. Save webhook payload → `WebhookLog`
2. Push job to BullMQ queue
3. Worker processes:
   - `invitee.created` → append invitee to event
   - `invitee.canceled` → update invitee cancellation fields
4. Update mapped Event document in MongoDB

---

## 🧵 Worker (BullMQ)

Worker responsibilities:

- Consume queued webhook jobs
- Retry logic with exponential backoff
- Update events atomically
- Mark webhook logs as processed

## **Worker is run locally**, since Render workers require a paid plan.

## 📐 Architecture Diagram (ASCII)

                      Calendly API
                          │
                          ▼
                ┌────────────────────────┐
                │ Express Server (API)   │
                └─────────┬──────────────┘
                          │
                 Swagger → Controllers → Business → Services → MongoDB
                          │
                          ▼
                ┌──────────────────────┐
                │ /webhooks/receive    │
                └──────────┬───────────┘
                           │ queue job
                           ▼
                   ┌──────────────┐
                   │ BullMQ Worker│
                   └───────┬──────┘
                           ▼
                        MongoDB

---

# 📘 Sample API Responses

### 1. OAuth: Auth URL

GET /v1/auth/authorize

```json
{
  "authorizeUrl": "https://auth.calendly.com/oauth/authorize?..."
}
```

### 2. OAuth: Callback

GET /v1/auth/callback?code=xxxx

```
{
"message": "Authorization successful",
"userUri": "https://api.calendly.com/users/01ab68...",
"organizationUri": "https://api.calendly.com/organizations/ORGID"
}
```

### 3. Sync Events

```
{
"message": "Events synced successfully",
"syncedCount": 12,
"total": 12
}
```

### 4. Fetch All Events

- GET /v1/events?page=1&limit=10

```
{
  "events": [
    {
      "uri": "https://api.calendly.com/scheduled_events/c120...",
      "name": "30 Minute Meeting",
      "startTime": "2025-12-03T19:30:00.000Z",
      "endTime": "2025-12-03T20:00:00.000Z",
      "invitees": [
        {
          "name": "Walter White",
          "email": "test@gmail.com",
          "uri": "https://api.calendly.com/scheduled_events/.../invitees/abc123",
          "canceled": false
        }
      ],
      "status": "active"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### 5. Event By ID

- GET /v1/eventsById?id=674ed560...

```
{
  "_id": "674ed560...",
  "uri": "https://api.calendly.com/scheduled_events/c120...",
  "name": "30 Minute Meeting",
  "startTime": "2025-12-03T19:30:00.000Z",
  "endTime": "2025-12-03T20:00:00.000Z",
  "invitees": [
    {
      "name": "Walter White",
      "email": "test@gmail.com",
      "uri": "https://api.calendly.com/scheduled_events/.../invitees/abc123",
      "canceled": false
    }
  ]
}
```

### 6. Webhook Receive

- POST /v1/webhooks/receive

```
{
  "success": true,
  "message": "Webhook logged and queued"
}
```

## 🐳 Docker Setup

This project includes full Docker support for running the API server, the background worker, and required dependencies (MongoDB + Redis).  
This enables a complete isolated environment matching a real integration service setup.

### 1. Dockerfile (API Service)

The main application is containerized using a lightweight Node.js Alpine image.  
It installs dependencies, copies source code, exposes port `5000`, and runs the server.

### 2. Worker Dockerfile

A separate Dockerfile is included for the BullMQ worker.  
It runs the webhook processing pipeline independently from the API service.

### 3. Docker Compose

`docker-compose.yml` orchestrates the entire system:

- **api** → Main Calendly integration API
- **worker** → Background webhook processor
- **mongo** → Database for synced events and tokens
- **redis** → Message queue backend for BullMQ

Each service shares the same environment variables and starts in dependency order.

### 4. Build & Run

Build all services:

```bash
docker-compose build
```

### Run the entire stack (API + Worker + MongoDB + Redis):
          docker-compose up

### Stop containers
        docker-compose down

### Run in detached mode
        docker-compose up -d

### View logs
        docker-compose logs -f app

### Run everything (API + Worker + DB + Redis):
        docker-compose up

