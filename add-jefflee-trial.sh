#!/bin/bash

# Direct script to add trial subscription for jefflee2002@gmail.com

SUPABASE_URL="https://exungkcoaihcemcmhqdr.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dW5na2NvYWloY2VtY21ocWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzQzMzMsImV4cCI6MjA3MjExMDMzM30.pU6RCNu0ugnAac8kSgCNyZDHEfU_6B_NpVgR9MwS4_Y"

USER_EMAIL="jefflee2002@gmail.com"
TIER="pro"
TRIAL_DAYS="3"

# Calculate dates
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
TRIAL_END_DATE=$(date -u -d "+${TRIAL_DAYS} days" +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Adding Pro trial subscription for: $USER_EMAIL"
echo "Trial ends at: $TRIAL_END_DATE"

# First, we need to get the user ID using Supabase service role key
# Since we only have anon key, we'll need to use a different approach

# Try to get user from profiles table (public accessible)
echo -e "\n1. Getting user ID from profiles..."
USER_ID=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/profiles?email=eq.${USER_EMAIL}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" | jq -r '.[0].id')

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo "Error: Could not find user ID. The user might need to sign in first to create a profile."
  echo "Please sign in with jefflee2002@gmail.com first, then run this script again."
  exit 1
fi

echo "Found user ID: $USER_ID"

# Check if subscription already exists
echo -e "\n2. Checking existing subscription..."
EXISTING_SUB=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json")

if [ "$EXISTING_SUB" != "[]" ]; then
  echo "Found existing subscription, updating it..."
  
  # Update existing subscription
  RESPONSE=$(curl -s -X PATCH \
    "${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${USER_ID}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"tier\": \"${TIER}\",
      \"status\": \"trialing\",
      \"current_period_start\": \"${CURRENT_DATE}\",
      \"current_period_end\": \"${TRIAL_END_DATE}\",
      \"trial_ends_at\": \"${TRIAL_END_DATE}\",
      \"updated_at\": \"${CURRENT_DATE}\"
    }")
else
  echo "No existing subscription found, creating new one..."
  
  # Create new subscription
  RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/subscriptions" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"user_id\": \"${USER_ID}\",
      \"tier\": \"${TIER}\",
      \"status\": \"trialing\",
      \"current_period_start\": \"${CURRENT_DATE}\",
      \"current_period_end\": \"${TRIAL_END_DATE}\",
      \"trial_ends_at\": \"${TRIAL_END_DATE}\",
      \"created_at\": \"${CURRENT_DATE}\",
      \"updated_at\": \"${CURRENT_DATE}\"
    }")
fi

echo -e "\n3. Response:"
echo "$RESPONSE" | jq .

echo -e "\n\nDone! You should now see 'Pro Trial' badge when signed in."
echo "Please refresh the page after running this script."