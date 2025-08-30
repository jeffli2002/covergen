# Microservices Architecture - Detailed Diagrams

## 1. Complete Service Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                   │
├───────────────────┬────────────────┬────────────────┬─────────────────────────────┤
│    Web App (React)│  Mobile Apps   │  Partner APIs  │      Admin Dashboard       │
│    Next.js SSR    │  iOS/Android   │  REST/GraphQL  │      React Admin           │
└───────────┬───────┴────────┬───────┴────────┬───────┴─────────┬──────────────────┘
            │                │                │                 │
            └────────────────┴────────────────┴─────────────────┘
                                      │
                             ┌────────▼────────┐
                             │  NGINX/HAProxy  │
                             │ Load Balancer   │
                             └────────┬────────┘
                                      │
                        ┌─────────────▼─────────────┐
                        │      API GATEWAY         │
                        │        (Kong)            │
                        ├─────────────────────────────┤
                        │ • Authentication          │
                        │ • Rate Limiting           │
                        │ • Request Routing         │
                        │ • Response Caching        │
                        │ • Monitoring & Analytics  │
                        └─────────────┬─────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        │                    ┌────────▼────────┐                   │
        │                    │  Service Mesh   │                   │
        │                    │    (Istio)      │                   │
        │                    └────────┬────────┘                   │
        │                             │                             │
┌───────▼───────┐  ┌──────────────────┼──────────────────┐  ┌─────▼─────┐
│               │  │                  │                  │  │           │
│ CORE SERVICES │  │          BUSINESS SERVICES         │  │ SUPPORT   │
│               │  │                  │                  │  │ SERVICES  │
├───────────────┤  ├──────────────────┼──────────────────┤  ├───────────┤
│               │  │                  │                  │  │           │
│┌─────────────┐│  │┌────────────┐   │  ┌─────────────┐│  │┌─────────┐│
││Auth Service ││  ││  Cover     │   │  │  Payment    ││  ││Analytics││
││   (Node.js) ││  ││Generation  │   │  │  Service    ││  ││ Service ││
││             ││  ││  Service   │   │  │  (Node.js)  ││  ││(Node.js)││
││• JWT Auth   ││  ││ (Node.js)  │   │  │             ││  ││         ││
││• OAuth 2.0  ││  ││            │   │  │• Stripe     ││  ││• Events ││
││• User Reg   ││  ││• AI Gen    │   │  │• PayPal     ││  ││• Metrics││
│└─────┬───────┘│  │└─────┬──────┘   │  └──────┬──────┘│  │└────┬────┘│
│      │        │  │      │          │         │       │  │     │     │
│┌─────▼───────┐│  │┌─────▼──────┐   │  ┌──────▼──────┐│  │┌────▼────┐│
││User Mgmt    ││  ││Image Edit  │   │  │Subscription ││  ││ Metrics ││
││  Service    ││  ││  Service   │   │  │  Service    ││  ││ Service ││
││ (Node.js)   ││  ││ (Node.js)  │   │  │ (Node.js)   ││  ││(Node.js)││
││             ││  ││            │   │  │             ││  ││         ││
││• Profile    ││  ││• Mask Edit │   │  │• Plans      ││  ││• System ││
││• Quota      ││  ││• Inpaint   │   │  │• Tiers      ││  ││• Business│
│└─────────────┘│  │└────────────┘   │  └─────────────┘│  │└─────────┘│
│               │  │                  │                  │  │           │
│┌─────────────┐│  │┌────────────┐   │  ┌─────────────┐│  │┌─────────┐│
││Template     ││  ││Content     │   │  │Export       ││  ││Notif.   ││
││  Service    ││  ││Safety      │   │  │Service      ││  ││Service  ││
││ (Node.js)   ││  ││Service     │   │  │(Node.js)    ││  ││(Node.js)││
││             ││  ││(Python)    │   │  │             ││  ││         ││
││• Styles     ││  ││            │   │  │• Resize     ││  ││• Email  ││
││• Categories ││  ││• Text Mod  │   │  │• Watermark  ││  ││• Push   ││
│└─────────────┘│  │└────────────┘   │  └─────────────┘│  │└─────────┘│
│               │  │                  │                  │  │           │
│               │  │┌────────────────────────────────┐  │  │           │
│               │  ││   Task Management Service     │  │  │           │
│               │  ││         (Node.js)             │  │  │           │
│               │  ││ • Queue Management            │  │  │           │
│               │  ││ • Saga Orchestration          │  │  │           │
│               │  │└────────────────────────────────┘  │  │           │
└───────────────┘  └────────────────────────────────────┘  └───────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
           ┌────────▼────────┐  ┌─────▼─────┐  ┌───────▼───────┐
           │   MESSAGE BUS   │  │ DATABASES │  │    STORAGE    │
           ├─────────────────┤  ├───────────┤  ├───────────────┤
           │                 │  │           │  │               │
           │ ┌─────────────┐ │  │┌─────────┐│  │┌─────────────┐│
           │ │  RabbitMQ   │ │  ││PostgreSQL│  ││Google Cloud ││
           │ │             │ │  ││         ││  ││  Storage    ││
           │ │• Task Queue │ │  ││• Users  ││  ││             ││
           │ │• Events     │ │  ││• Payment││  ││• Images     ││
           │ └─────────────┘ │  │└─────────┘│  │└─────────────┘│
           │                 │  │           │  │               │
           │ ┌─────────────┐ │  │┌─────────┐│  │┌─────────────┐│
           │ │   Kafka     │ │  ││ MongoDB ││  ││  AWS S3     ││
           │ │             │ │  ││         ││  ││  (Backup)   ││
           │ │• Analytics  │ │  ││• Tasks  ││  ││             ││
           │ │• Streaming  │ │  ││• Templat││  ││• Backups    ││
           │ └─────────────┘ │  │└─────────┘│  │└─────────────┘│
           │                 │  │           │  │               │
           │ ┌─────────────┐ │  │┌─────────┐│  │┌─────────────┐│
           │ │   Redis     │ │  ││ClickHouse│  ││   CDN       ││
           │ │             │ │  ││         ││  ││(Cloudflare) ││
           │ │• Cache      │ │  ││• Metrics││  ││             ││
           │ │• Sessions   │ │  ││• Logs   ││  ││• Static     ││
           │ └─────────────┘ │  │└─────────┘│  │└─────────────┘│
           └─────────────────┘  └───────────┘  └───────────────┘
```

## 2. Service Communication Matrix

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   FROM \ TO     │  Auth Service   │  User Mgmt      │ Cover Gen       │ Content Safety  │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ API Gateway     │ REST (sync)     │ REST (sync)     │ REST (sync)     │ gRPC (sync)     │
│                 │ JWT validation  │ User queries    │ Generate req    │ Safety checks   │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Auth Service    │       -         │ REST (sync)     │       -         │       -         │
│                 │                 │ Create user     │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ User Mgmt       │       -         │       -         │ REST (sync)     │       -         │
│                 │                 │                 │ Check quota     │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Cover Gen       │       -         │ REST (sync)     │       -         │ gRPC (sync)     │
│                 │                 │ Update quota    │                 │ Validate content│
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Payment Service │       -         │ Event (async)   │       -         │       -         │
│                 │                 │ Sub. updated    │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   FROM \ TO     │ Payment Service │ Task Mgmt       │ Notification    │ Analytics       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ API Gateway     │ REST (sync)     │ REST (sync)     │       -         │       -         │
│                 │ Process payment │ Task status     │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Cover Gen       │       -         │ AMQP (async)    │       -         │ Event (async)   │
│                 │                 │ Queue task      │                 │ Gen. completed  │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Task Mgmt       │       -         │       -         │ AMQP (async)    │ Event (async)   │
│                 │                 │                 │ Send notif.     │ Task metrics    │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ All Services    │       -         │       -         │       -         │ Kafka (async)   │
│                 │                 │                 │                 │ Event stream    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## 3. Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Databases                         │
├─────────────────────────────┬───────────────────────────────────────┤
│      AUTH DATABASE          │         USER DATABASE                  │
├─────────────────────────────┼───────────────────────────────────────┤
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐ │
│ │      users_auth         │ │ │          users                    │ │
│ ├─────────────────────────┤ │ ├───────────────────────────────────┤ │
│ │ id (UUID) PK           │ │ │ id (UUID) PK                     │ │
│ │ email                  │ │ │ auth_id (UUID) FK                │ │
│ │ password_hash          │ │ │ username                         │ │
│ │ auth_provider          │ │ │ full_name                        │ │
│ │ created_at             │ │ │ avatar_url                       │ │
│ │ last_login             │ │ │ subscription_tier                │ │
│ └─────────────────────────┘ │ │ quota_used                       │ │
│                             │ │ quota_limit                       │ │
│ ┌─────────────────────────┐ │ │ created_at                       │ │
│ │      tokens            │ │ │ updated_at                       │ │
│ ├─────────────────────────┤ │ └───────────────────────────────────┘ │
│ │ id (UUID) PK           │ │                                       │
│ │ user_id FK             │ │ ┌───────────────────────────────────┐ │
│ │ token_hash             │ │ │      user_preferences             │ │
│ │ type (refresh/access)  │ │ ├───────────────────────────────────┤ │
│ │ expires_at             │ │ │ user_id (UUID) FK                │ │
│ └─────────────────────────┘ │ │ language                         │ │
│                             │ │ email_notifications              │ │
├─────────────────────────────┼───────────────────────────────────────┤
│    PAYMENT DATABASE         │      SUBSCRIPTION DATABASE            │
├─────────────────────────────┼───────────────────────────────────────┤
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐ │
│ │    payment_methods      │ │ │      subscription_plans           │ │
│ ├─────────────────────────┤ │ ├───────────────────────────────────┤ │
│ │ id (UUID) PK           │ │ │ id (UUID) PK                     │ │
│ │ user_id FK             │ │ │ name                             │ │
│ │ stripe_method_id       │ │ │ tier (free/pro/pro_plus)         │ │
│ │ type                   │ │ │ monthly_price                    │ │
│ │ last_four              │ │ │ yearly_price                     │ │
│ │ is_default             │ │ │ quota_limit                      │ │
│ └─────────────────────────┘ │ │ features (JSONB)                 │ │
│                             │ └───────────────────────────────────┘ │
│ ┌─────────────────────────┐ │                                       │
│ │     transactions        │ │ ┌───────────────────────────────────┐ │
│ ├─────────────────────────┤ │ │      user_subscriptions           │ │
│ │ id (UUID) PK           │ │ ├───────────────────────────────────┤ │
│ │ user_id FK             │ │ │ id (UUID) PK                     │ │
│ │ amount                 │ │ │ user_id FK                       │ │
│ │ currency               │ │ │ plan_id FK                       │ │
│ │ status                 │ │ │ status (active/cancelled)        │ │
│ │ provider               │ │ │ started_at                       │ │
│ │ provider_txn_id        │ │ │ ends_at                          │ │
│ │ created_at             │ │ │ auto_renew                       │ │
│ └─────────────────────────┘ │ └───────────────────────────────────┘ │
└─────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         MongoDB Collections                          │
├─────────────────────────────┬───────────────────────────────────────┤
│    TEMPLATES DATABASE       │      TASKS DATABASE                   │
├─────────────────────────────┼───────────────────────────────────────┤
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐ │
│ │     style_templates     │ │ │      generation_tasks             │ │
│ ├─────────────────────────┤ │ ├───────────────────────────────────┤ │
│ │ _id (ObjectId)          │ │ │ _id (ObjectId)                   │ │
│ │ name                    │ │ │ task_id (UUID)                   │ │
│ │ category                │ │ │ user_id (UUID)                   │ │
│ │ thumbnail_url           │ │ │ type (generate/edit)             │ │
│ │ prompt_template         │ │ │ status                           │ │
│ │ style_params            │ │ │ input_params                     │ │
│ │ popularity_score        │ │ │ result_urls []                   │ │
│ │ is_premium              │ │ │ error_message                    │ │
│ │ created_by              │ │ │ created_at                       │ │
│ │ created_at              │ │ │ started_at                       │ │
│ └─────────────────────────┘ │ │ completed_at                     │ │
│                             │ │ retry_count                      │ │
│ ┌─────────────────────────┐ │ └───────────────────────────────────┘ │
│ │    user_templates       │ │                                       │
│ ├─────────────────────────┤ │ ┌───────────────────────────────────┐ │
│ │ _id (ObjectId)          │ │ │        edit_sessions              │ │
│ │ user_id (UUID)          │ │ ├───────────────────────────────────┤ │
│ │ template_id             │ │ │ _id (ObjectId)                   │ │
│ │ customizations          │ │ │ session_id (UUID)                │ │
│ │ created_at              │ │ │ user_id (UUID)                   │ │
│ └─────────────────────────┘ │ │ original_image_url               │ │
│                             │ │ edit_history []                  │ │
│                             │ │ current_version                  │ │
│                             │ │ created_at                       │ │
│                             │ └───────────────────────────────────┘ │
└─────────────────────────────┴───────────────────────────────────────┘
```

## 4. Event Flow Sequence Diagram

```
User        API Gateway    Auth      Cover Gen    Content      Task Mgmt    AI API     Storage
 │              │           │           │          Safety         │           │          │
 │   Request    │           │           │            │            │           │          │
 ├─────────────▶│           │           │            │            │           │          │
 │              │  Validate │           │            │            │           │          │
 │              ├──────────▶│           │            │            │           │          │
 │              │◀──────────┤           │            │            │           │          │
 │              │   Token   │           │            │            │           │          │
 │              │           │           │            │            │           │          │
 │              │  Generate │           │            │            │           │          │
 │              ├──────────────────────▶│            │            │           │          │
 │              │  Request  │           │            │            │           │          │
 │              │           │           │   Check    │            │            │          │
 │              │           │           ├───────────▶│            │           │          │
 │              │           │           │   Safety   │            │            │          │
 │              │           │           │◀───────────┤            │           │          │
 │              │           │           │     OK     │            │           │          │
 │              │           │           │            │            │           │          │
 │              │           │           │   Create   │            │           │          │
 │              │           │           ├────────────────────────▶│           │          │
 │              │           │           │    Task    │            │           │          │
 │              │           │           │            │            │           │          │
 │              │  Task ID  │           │            │            │           │          │
 │              │◀──────────────────────┤            │            │           │          │
 │◀─────────────┤           │           │            │            │           │          │
 │   Response   │           │           │            │            │           │          │
 │              │           │           │            │            │  Process  │          │
 │              │           │           │            │            ├──────────▶│          │
 │              │           │           │            │            │   Task    │          │
 │              │           │           │            │            │           │          │
 │              │           │           │            │            │  Generate │          │
 │              │           │           │            │            │◀──────────┤          │
 │              │           │           │            │            │   Image   │          │
 │              │           │           │            │            │           │          │
 │              │           │           │            │            │   Store   │          │
 │              │           │           │            │            ├──────────────────────▶│
 │              │           │           │            │            │   Image   │          │
 │              │           │           │            │            │           │          │
 │              │           │           │  Complete  │            │           │          │
 │              │           │           │◀────────────────────────┤           │          │
 │              │           │           │   Event    │            │           │          │
 │              │           │           │            │            │           │          │
 │  Notification│           │           │            │            │           │          │
 │◀─────────────┼───────────┼───────────┼────────────┼────────────┼───────────┼──────────┤
 │              │           │           │            │            │           │          │
```

## 5. Resilience Pattern Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Circuit Breaker Pattern                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Client Request                                                     │
│       │                                                            │
│       ▼                                                            │
│  ┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│  │ CLOSED  │────▶│   OPEN   │────▶│HALF-OPEN │────▶│  CLOSED  │  │
│  │ State   │     │  State   │     │  State   │     │  State   │  │
│  └────┬────┘     └────┬─────┘     └────┬─────┘     └──────────┘  │
│       │               │                 │                          │
│       │               │                 │                          │
│  Requests        All Requests      Test Request                   │
│  Pass Through     Rejected         Allowed                        │
│       │               │                 │                          │
│       ▼               ▼                 ▼                          │
│  Track Failures   Return Error    If Successful,                  │
│                   Immediately     Close Circuit                   │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         Retry with Backoff                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Initial Request ──▶ Failure ──▶ Wait 1s ──▶ Retry 1              │
│                                     │                              │
│                                     ▼                              │
│                               Failure ──▶ Wait 2s ──▶ Retry 2      │
│                                              │                     │
│                                              ▼                     │
│                                        Failure ──▶ Wait 4s ──▶ Retry 3
│                                                       │            │
│                                                       ▼            │
│                                                 Final Failure      │
│                                                 Return Error       │
└─────────────────────────────────────────────────────────────────────┘
```

## 6. Multi-Region Data Replication

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Global Data Replication Strategy                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────┐                  │
│  │   US-EAST-1     │         │   EU-WEST-3     │                  │
│  │  (Primary)      │         │  (Primary)      │                  │
│  ├─────────────────┤         ├─────────────────┤                  │
│  │                 │         │                 │                  │
│  │  PostgreSQL     │◀───────▶│  PostgreSQL     │                  │
│  │  (Master)       │  Sync   │  (Master)       │                  │
│  │                 │         │                 │                  │
│  │  MongoDB        │◀───────▶│  MongoDB        │                  │
│  │  (Replica Set)  │         │  (Replica Set)  │                  │
│  │                 │         │                 │                  │
│  └────────┬────────┘         └────────┬────────┘                  │
│           │                            │                           │
│           │      Cross-Region          │                           │
│           │      Replication           │                           │
│           │                            │                           │
│           ▼                            ▼                           │
│  ┌─────────────────┐         ┌─────────────────┐                  │
│  │  ASIA-PACIFIC   │         │   CHINA-BEIJING  │                  │
│  │  (Read Replica) │         │   (Isolated)     │                  │
│  ├─────────────────┤         ├─────────────────┤                  │
│  │                 │         │                 │                  │
│  │  PostgreSQL     │         │  PostgreSQL     │                  │
│  │  (Read Only)    │         │  (Master)       │                  │
│  │                 │         │                 │                  │
│  │  MongoDB        │         │  MongoDB        │                  │
│  │  (Secondary)    │         │  (Primary)      │                  │
│  │                 │         │                 │                  │
│  └─────────────────┘         └─────────────────┘                  │
│                                                                    │
│  Replication Rules:                                                │
│  • User data: Eventually consistent (5-minute lag acceptable)      │
│  • Payment data: Strong consistency required                       │
│  • Templates: Cache with 1-hour TTL                               │
│  • Analytics: Async replication to central warehouse               │
└─────────────────────────────────────────────────────────────────────┘
```

## 7. Service Mesh Traffic Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Istio Service Mesh                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐                           ┌─────────────┐         │
│  │   Ingress   │                           │   Service   │         │
│  │   Gateway   │                           │    Mesh     │         │
│  └──────┬──────┘                           └──────┬──────┘         │
│         │                                          │                │
│         ▼                                          ▼                │
│  ┌──────────────────────────────────────────────────────┐         │
│  │                  Virtual Services                     │         │
│  ├──────────────────────────────────────────────────────┤         │
│  │                                                       │         │
│  │  cover-generation-service:                           │         │
│  │    - Weight: 90% → v1.0 (stable)                    │         │
│  │    - Weight: 10% → v2.0 (canary)                    │         │
│  │                                                       │         │
│  │  user-management-service:                            │         │
│  │    - Header match: x-user-type=beta → v2.0          │         │
│  │    - Default → v1.0                                 │         │
│  │                                                       │         │
│  └──────────────────────────────────────────────────────┘         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐         │
│  │              Destination Rules                        │         │
│  ├──────────────────────────────────────────────────────┤         │
│  │                                                       │         │
│  │  Load Balancing:                                     │         │
│  │    - ROUND_ROBIN (default)                          │         │
│  │    - LEAST_REQUEST (for CPU-intensive)              │         │
│  │                                                       │         │
│  │  Circuit Breaker:                                    │         │
│  │    - consecutiveErrors: 5                           │         │
│  │    - interval: 30s                                  │         │
│  │    - baseEjectionTime: 30s                          │         │
│  │                                                       │         │
│  │  Connection Pool:                                    │         │
│  │    - http1MaxPendingRequests: 100                   │         │
│  │    - http2MaxRequests: 1000                         │         │
│  │                                                       │         │
│  └──────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## 8. Monitoring and Observability Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Observability Architecture                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│  │   Services   │     │   Services  │     │   Services  │         │
│  │      A       │     │      B      │     │      C      │         │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘         │
│         │                    │                    │                │
│         │         Metrics    │     Traces        │    Logs        │
│         └────────────────────┼────────────────────┘                │
│                              │                                     │
│         ┌────────────────────┼────────────────────┐                │
│         │                    │                    │                │
│         ▼                    ▼                    ▼                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐         │
│  │ Prometheus  │     │   Jaeger    │     │    ELK      │         │
│  │             │     │             │     │   Stack     │         │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘         │
│         │                    │                    │                │
│         └────────────────────┼────────────────────┘                │
│                              │                                     │
│                              ▼                                     │
│                     ┌─────────────────┐                           │
│                     │    Grafana      │                           │
│                     │  (Dashboards)   │                           │
│                     └─────────────────┘                           │
│                                                                    │
│  Key Metrics:                                                      │
│  • Request rate, error rate, duration (RED)                       │
│  • CPU, Memory, Network, Disk (USE)                              │
│  • Business metrics (conversions, generations/hour)               │
│                                                                    │
│  Alerts:                                                           │
│  • Service down > 1 minute                                        │
│  • Error rate > 5%                                               │
│  • Response time p99 > 2s                                        │
│  • Disk usage > 80%                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## 9. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Security Layer Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐          │
│  │                   External Traffic                   │          │
│  └─────────────────────────┬───────────────────────────┘          │
│                            │                                       │
│                            ▼                                       │
│  ┌─────────────────────────────────────────────────────┐          │
│  │              Web Application Firewall (WAF)          │          │
│  │                    Cloudflare                        │          │
│  ├─────────────────────────────────────────────────────┤          │
│  │ • DDoS Protection                                   │          │
│  │ • SQL Injection Prevention                          │          │
│  │ • XSS Protection                                    │          │
│  │ • Rate Limiting                                     │          │
│  └─────────────────────────┬───────────────────────────┘          │
│                            │                                       │
│                            ▼                                       │
│  ┌─────────────────────────────────────────────────────┐          │
│  │                  API Gateway                         │          │
│  │                 Kong Gateway                         │          │
│  ├─────────────────────────────────────────────────────┤          │
│  │ • JWT Validation                                    │          │
│  │ • API Key Management                                │          │
│  │ • OAuth 2.0 / OIDC                                 │          │
│  │ • Request Signing                                   │          │
│  └─────────────────────────┬───────────────────────────┘          │
│                            │                                       │
│                            ▼                                       │
│  ┌─────────────────────────────────────────────────────┐          │
│  │               Service Mesh Security                  │          │
│  │                    Istio                            │          │
│  ├─────────────────────────────────────────────────────┤          │
│  │ • mTLS between services                            │          │
│  │ • Service-to-service authentication                │          │
│  │ • Authorization policies                           │          │
│  │ • Network policies                                 │          │
│  └─────────────────────────┬───────────────────────────┘          │
│                            │                                       │
│                            ▼                                       │
│  ┌─────────────────────────────────────────────────────┐          │
│  │                Application Security                  │          │
│  ├─────────────────────────────────────────────────────┤          │
│  │ • Input validation                                  │          │
│  │ • Output encoding                                   │          │
│  │ • Secure session management                        │          │
│  │ • Encryption at rest (AES-256)                     │          │
│  │ • Secret management (HashiCorp Vault)              │          │
│  └─────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

## 10. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CI/CD Pipeline Flow                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Developer                                                          │
│      │                                                             │
│      ▼                                                             │
│  Git Push                                                          │
│      │                                                             │
│      ▼                                                             │
│  ┌────────────┐     ┌────────────┐     ┌────────────┐            │
│  │   GitHub   │────▶│  GitHub    │────▶│   Build    │            │
│  │            │     │  Actions   │     │   Docker   │            │
│  └────────────┘     └────────────┘     └─────┬──────┘            │
│                                               │                    │
│                     ┌─────────────────────────┴─────────┐          │
│                     │                                   │          │
│                     ▼                                   ▼          │
│              ┌────────────┐                    ┌────────────┐      │
│              │    Run     │                    │   Push to  │      │
│              │   Tests    │                    │  Registry  │      │
│              └─────┬──────┘                    └─────┬──────┘      │
│                    │                                  │            │
│                    ▼                                  │            │
│              ┌────────────┐                          │            │
│              │   Static   │                          │            │
│              │  Analysis  │                          │            │
│              └─────┬──────┘                          │            │
│                    │                                  │            │
│                    └──────────────┬───────────────────┘            │
│                                   │                                │
│                                   ▼                                │
│                          ┌─────────────────┐                      │
│                          │    Deploy to    │                      │
│                          │   Kubernetes    │                      │
│                          └────────┬────────┘                      │
│                                   │                               │
│           ┌───────────────────────┼───────────────────────┐       │
│           │                       │                       │       │
│           ▼                       ▼                       ▼       │
│    ┌────────────┐         ┌────────────┐         ┌────────────┐  │
│    │    Dev      │         │  Staging   │         │    Prod    │  │
│    │Environment │         │Environment │         │Environment │  │
│    └────────────┘         └────────────┘         └────────────┘  │
│                                                                   │
│    Deployment Strategy:                                           │
│    • Dev: Automatic on commit                                     │
│    • Staging: Automatic on PR merge                              │
│    • Prod: Manual approval + Blue/Green deployment               │
└─────────────────────────────────────────────────────────────────────┘
```

These detailed diagrams provide a comprehensive view of the microservices architecture, showing service interactions, data flow, resilience patterns, and deployment strategies for the Cover Generation Tool.