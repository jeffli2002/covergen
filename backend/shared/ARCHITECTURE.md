# Shared Modules Architecture

## Overview

This document describes the architecture of reusable authentication, user management, and subscription/payment modules designed for maximum flexibility and reusability across different SaaS projects.

## Architecture Principles

1. **Separation of Concerns**: Each module handles a specific domain
2. **Dependency Inversion**: Modules depend on abstractions, not concrete implementations
3. **Framework Agnostic**: Can be integrated with any Node.js framework
4. **Database Agnostic**: Supports multiple database engines through adapters
5. **Event-Driven**: Modules communicate through events for loose coupling
6. **Security First**: Built-in security best practices
7. **Testability**: Designed for easy unit and integration testing

## Module Structure

```
shared/
├── core/                      # Core abstractions and interfaces
│   ├── interfaces/           # Common interfaces
│   ├── errors/              # Custom error classes
│   ├── events/              # Event system
│   └── types/               # Common types
│
├── modules/
│   ├── auth/                # Authentication module
│   │   ├── core/           # Auth domain logic
│   │   ├── adapters/       # External integrations
│   │   ├── providers/      # OAuth providers
│   │   └── strategies/     # Auth strategies
│   │
│   ├── user/                # User management module
│   │   ├── core/           # User domain logic
│   │   ├── repositories/   # Data access
│   │   └── services/       # User services
│   │
│   └── billing/             # Subscription/Payment module
│       ├── core/           # Billing domain logic
│       ├── providers/      # Payment providers
│       └── webhooks/       # Webhook handlers
│
├── infrastructure/          # Infrastructure concerns
│   ├── database/           # Database adapters
│   ├── cache/              # Caching implementations
│   ├── queue/              # Queue implementations
│   └── storage/            # File storage adapters
│
└── utils/                   # Shared utilities
    ├── crypto/             # Cryptographic utilities
    ├── validation/         # Validation helpers
    └── monitoring/         # Logging/monitoring
```

## Module Interactions

```mermaid
graph TD
    A[API Gateway] --> B[Auth Module]
    A --> C[User Module]
    A --> D[Billing Module]
    
    B --> E[Event Bus]
    C --> E
    D --> E
    
    B --> F[Database Adapter]
    C --> F
    D --> F
    
    B --> G[Cache Adapter]
    C --> G
    
    D --> H[Payment Providers]
    D --> I[Webhook Handler]
    
    B --> J[OAuth Providers]
    B --> K[JWT Service]
    
    C --> L[Storage Adapter]
    
    subgraph Infrastructure
        F
        G
        L
        M[Queue Adapter]
    end
    
    subgraph External Services
        H
        J
        N[Email Service]
    end
```

## Data Flow

1. **Authentication Flow**:
   - Request → Auth Middleware → JWT Validation → User Context
   - OAuth: Request → Provider → Callback → Token Generation
   - Magic Link: Request → Token Generation → Email → Verification

2. **User Management Flow**:
   - CRUD operations through repository pattern
   - Events emitted for user lifecycle changes
   - Profile updates trigger cache invalidation

3. **Billing Flow**:
   - Subscription creation → Payment provider → Webhook → Database update
   - Usage tracking through event system
   - Invoice generation on billing cycle

## Security Architecture

1. **Authentication Security**:
   - JWT with short-lived access tokens (15 min)
   - Refresh tokens with rotation (30 days)
   - Rate limiting on auth endpoints
   - Brute force protection with exponential backoff
   - CSRF protection for web clients

2. **Data Security**:
   - Encryption at rest for sensitive data
   - PII handling with field-level encryption
   - Audit logging for compliance
   - GDPR compliance with data retention policies

3. **Payment Security**:
   - PCI DSS compliance through tokenization
   - Webhook signature verification
   - Idempotency keys for payment operations
   - Fraud detection integration points

## Deployment Architecture

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-module
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-module
  template:
    metadata:
      labels:
        app: auth-module
    spec:
      containers:
      - name: auth
        image: your-registry/auth-module:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secret
              key: jwt-secret
```

## Configuration

All modules use environment variables for configuration:

```env
# Database
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Auth Module
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
OAUTH_GOOGLE_CLIENT_ID=xxx
OAUTH_GOOGLE_CLIENT_SECRET=xxx

# User Module
AVATAR_STORAGE_TYPE=s3
AVATAR_MAX_SIZE=5242880

# Billing Module
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
BILLING_CURRENCY=USD
```

## Integration Examples

### Express.js Integration
```typescript
import express from 'express';
import { AuthModule, UserModule, BillingModule } from '@your-org/shared-modules';

const app = express();

// Initialize modules
const auth = new AuthModule({ ... });
const user = new UserModule({ ... });
const billing = new BillingModule({ ... });

// Apply middleware
app.use(auth.middleware());

// Mount routes
app.use('/auth', auth.router());
app.use('/users', user.router());
app.use('/billing', billing.router());
```

### NestJS Integration
```typescript
import { Module } from '@nestjs/common';
import { AuthModule, UserModule, BillingModule } from '@your-org/shared-modules';

@Module({
  imports: [
    AuthModule.forRoot({ ... }),
    UserModule.forRoot({ ... }),
    BillingModule.forRoot({ ... })
  ]
})
export class AppModule {}
```