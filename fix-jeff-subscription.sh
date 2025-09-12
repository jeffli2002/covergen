#!/bin/bash
# Quick fix script to properly set up Jeff's trial subscription

SUPABASE_URL="https://exungkcoaihcemcmhqdr.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dW5na2NvYWloY2VtY21ocWRyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUzNDMzMywiZXhwIjoyMDcyMTEwMzMzfQ.iE9GyhCUBZZyl3U8-PfEJ6Z_lA82L4rdPIOJ3woOJ0Q"
USER_EMAIL="jefflee2002@gmail.com"
USER_ID="488bf7a3-f07b-41f2-84ce-a5ba3ea8cdcd"

echo "Fixing subscription for $USER_EMAIL..."

# Calculate trial end date (3 days from now)
TRIAL_END=$(date -u -d "+3 days" +"%Y-%m-%dT%H:%M:%S.000Z")
TRIAL_START=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# If consolidated table exists, use it
echo "Checking if subscriptions_consolidated table exists..."
TABLE_CHECK=$(curl -s "$SUPABASE_URL/rest/v1/subscriptions_consolidated?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")

if [[ "$TABLE_CHECK" != *"Could not find"* ]]; then
  echo "Using subscriptions_consolidated table..."
  
  # Upsert into subscriptions_consolidated
  curl -X POST "$SUPABASE_URL/rest/v1/subscriptions_consolidated" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=representation" \
    -d "{
      \"user_id\": \"$USER_ID\",
      \"tier\": \"pro\",
      \"status\": \"trialing\",
      \"daily_limit\": 4,
      \"trial_started_at\": \"$TRIAL_START\",
      \"expires_at\": \"$TRIAL_END\",
      \"current_period_start\": \"$TRIAL_START\",
      \"current_period_end\": \"$TRIAL_END\"
    }"
else
  echo "Consolidated table not found, updating both old tables..."
  
  # Update user_subscriptions
  curl -X PATCH "$SUPABASE_URL/rest/v1/user_subscriptions?user_id=eq.$USER_ID" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"plan_type\": \"pro\",
      \"status\": \"trialing\",
      \"daily_limit\": 4,
      \"expires_at\": \"$TRIAL_END\",
      \"updated_at\": \"$TRIAL_START\"
    }"
  
  # Also ensure subscriptions table has the record
  curl -X POST "$SUPABASE_URL/rest/v1/subscriptions" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=representation" \
    -d "{
      \"user_id\": \"$USER_ID\",
      \"tier\": \"pro\",
      \"status\": \"trialing\",
      \"current_period_start\": \"$TRIAL_START\",
      \"current_period_end\": \"$TRIAL_END\"
    }"
fi

echo ""
echo "Testing subscription status..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc/check_generation_limit" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"p_user_id\": \"$USER_ID\",
    \"p_subscription_tier\": \"free\"
  }" 2>/dev/null | python3 -m json.tool

echo ""
echo "✅ Subscription setup complete!"
echo "- User: $USER_EMAIL"
echo "- Plan: Pro (Trial)"
echo "- Daily Limit: 4 generations"
echo "- Trial Expires: $TRIAL_END"