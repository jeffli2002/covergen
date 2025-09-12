#!/bin/bash

# Script to add a trial subscription for a user
# Usage: ./add-trial-subscription.sh <user_email> <tier> <trial_days>

SUPABASE_URL="https://exungkcoaihcemcmhqdr.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" # Replace with your actual anon key

USER_EMAIL="${1:-jefflee2002@gmail.com}"
TIER="${2:-pro}"
TRIAL_DAYS="${3:-3}"

# Calculate dates
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
TRIAL_END_DATE=$(date -u -d "+${TRIAL_DAYS} days" +"%Y-%m-%dT%H:%M:%S.000Z")

echo "Adding trial subscription for user: $USER_EMAIL"
echo "Tier: $TIER"
echo "Trial period: $TRIAL_DAYS days"
echo "Trial ends at: $TRIAL_END_DATE"

# First, get the user ID from the email
echo -e "\n1. Getting user ID..."
USER_ID=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/auth.users?email=eq.${USER_EMAIL}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" | jq -r '.[0].id')

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo "Error: User not found with email: $USER_EMAIL"
  echo "Make sure the user has signed up first."
  exit 1
fi

echo "Found user ID: $USER_ID"

# Check if subscription already exists
echo -e "\n2. Checking existing subscription..."
EXISTING_SUB=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${USER_ID}" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" | jq -r '.[0].id')

if [ ! -z "$EXISTING_SUB" ] && [ "$EXISTING_SUB" != "null" ]; then
  echo "Warning: Subscription already exists for this user (ID: $EXISTING_SUB)"
  echo "Do you want to update it? (y/n)"
  read -r response
  if [ "$response" != "y" ]; then
    exit 0
  fi
  
  # Update existing subscription
  echo -e "\n3. Updating existing subscription..."
  curl -X PATCH \
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
    }"
else
  # Create new subscription
  echo -e "\n3. Creating new trial subscription..."
  curl -X POST \
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
    }"
fi

echo -e "\n\nDone! The user should now have a ${TIER} trial subscription."
echo "You can verify by signing in and checking the header badge."