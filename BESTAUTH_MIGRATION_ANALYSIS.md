# BestAuth Migration Analysis - Complete Subscription System

## Overview
This document provides a comprehensive analysis of all subscription-related tables in the Supabase Auth solution and what needs to be migrated to BestAuth.

## Tables in Old Supabase Auth System

### 1. Core Subscription Tables
- **subscriptions_consolidated** ✅ (Already migrated)
  - Main consolidated subscription table
  - Contains: user_id, tier, status, trial info, billing periods, Stripe IDs
  
- **user_subscriptions** ⚠️ (Partially migrated)
  - Older subscription table (may contain legacy data)
  - Contains: user_id, plan_type, status, daily_limit, expires_at
  - **Action**: Run additional migration script to capture any missing data

### 2. Usage Tracking Tables
- **user_usage** ✅ (Already migrated with dynamic schema detection)
  - Tracks user generation usage
  - Multiple schema variants handled:
    - date + generation_count
    - usage_date + generations_count  
    - month_key + usage_count (your current schema)
    
- **anonymous_usage** ❌ (Not migrated)
  - Tracks anonymous user usage before signup
  - Contains: anonymous_id, month_key, usage_count
  - **Action**: Included in additional migration script

### 3. Payment & Stripe Tables
- **stripe_customers** ❌ (Table doesn't exist, but referenced)
  - Would contain: Stripe customer details
  - **Action**: Migration handles missing table gracefully

- **stripe_invoices** ❌ (Table doesn't exist, but referenced)
  - Would contain: Stripe invoice history
  - **Action**: Migration handles missing table gracefully

### 4. Profile Tables
- **profiles** ✅ (Created if missing, then migrated)
  - User profile information
  - Contains: full_name, avatar_url, phone, metadata

## BestAuth Target Tables

### Already Created by Migration
1. **bestauth_users** - Core user data
2. **bestauth_user_profiles** - Extended profile info
3. **bestauth_subscriptions** - Subscription details
4. **bestauth_usage_tracking** - Daily usage tracking
5. **bestauth_payment_history** - Payment records

### New Tables in Additional Migration
1. **bestauth_anonymous_usage** - Anonymous usage tracking
2. **bestauth_stripe_webhook_events** - For webhook processing
3. **bestauth_subscription_events** - Audit trail for subscription changes

## Migration Process

### Step 1: Check Current State
```bash
# Check what tables exist and their data
psql $DATABASE_URL < src/lib/bestauth/schema/check-all-subscription-tables.sql
```

### Step 2: Run Main Migration
```bash
# Migrates core subscription data
psql $DATABASE_URL < src/lib/bestauth/schema/migrate-subscriptions.sql
```

### Step 3: Run Additional Migration
```bash
# Migrates remaining tables and creates audit tables
psql $DATABASE_URL < src/lib/bestauth/schema/migrate-additional-tables.sql
```

## Key Findings

### What's Already Handled
1. ✅ User migration from auth.users
2. ✅ Subscription data from subscriptions_consolidated
3. ✅ Usage data with dynamic schema detection
4. ✅ Profile data migration
5. ✅ Payment history (if stripe_invoices exists)

### What's Missing
1. ❌ Anonymous usage tracking data
2. ❌ Legacy user_subscriptions table data (if different from subscriptions_consolidated)
3. ❌ Webhook event storage for audit trail
4. ❌ Subscription change history/events

### Recommendations
1. **Run the additional migration script** to capture anonymous usage and legacy subscription data
2. **Create webhook event tables** for future Stripe integration
3. **Add subscription event tracking** for audit purposes
4. **Verify all active subscriptions** have proper Stripe IDs before going live

## Data Integrity Checks

After migration, verify:
- Total user count matches
- All active subscriptions have valid tiers
- Trial end dates are preserved
- Usage data is correctly aggregated
- No orphaned subscriptions exist

## Next Steps
1. Run `check-all-subscription-tables.sql` to see current state
2. Execute the main migration script (already prepared)
3. Execute the additional migration script for missing tables
4. Verify data integrity
5. Update application to use BestAuth tables