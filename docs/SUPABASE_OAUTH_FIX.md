# Supabase OAuth Configuration Fix

## Problem
OAuth popup redirects to home page (`/en?code=...`) instead of closing after successful authentication.

## Root Cause
Supabase is not configured with the correct redirect URLs for the popup flow.

## Solution

### 1. Add Redirect URLs to Supabase Dashboard

Go to your Supabase project dashboard:
1. Navigate to Authentication > URL Configuration
2. Add these redirect URLs:
   - `http://localhost:3001/auth/callback-popup`
   - `http://localhost:3001/auth/callback-official`
   - `http://localhost:3001/auth/callback`
   
For production, also add:
   - `https://yourdomain.com/auth/callback-popup`
   - `https://yourdomain.com/auth/callback-official`
   - `https://yourdomain.com/auth/callback`

### 2. Update OAuth Provider Settings

In Authentication > Providers > Google:
1. Ensure "Use PKCE flow" is enabled
2. Add the same redirect URLs to Google OAuth Console

### 3. Test the Fix

After updating Supabase configuration:
1. Clear browser cache and cookies
2. Test OAuth login with popup
3. Verify popup closes after successful auth