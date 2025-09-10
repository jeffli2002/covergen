# OAuth Testing Guide

## Pre-test Cleanup

1. **Clear all browser data**:
   ```javascript
   // Run in browser console
   localStorage.clear()
   sessionStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;'
   })
   ```

2. **Sign out completely**:
   - Click sign out if signed in
   - Check that no auth cookies remain

## Testing Steps

### Test 1: Basic OAuth Flow
1. Start dev server: `npm run dev`
2. Open browser console
3. Navigate to http://localhost:3000/en
4. Click "Sign in with Google"
5. Complete Google OAuth
6. Check console for warnings

**Expected**: 
- No "Multiple GoTrueClient instances" warnings
- Successful login
- User menu shows correctly

### Test 2: Page Refresh
1. After successful login, refresh the page
2. Check console for warnings
3. Verify user is still logged in

**Expected**:
- No warnings on refresh
- Session persists

### Test 3: Navigation
1. Navigate between pages
2. Check console after each navigation
3. Verify session remains active

**Expected**:
- No warnings during navigation
- Consistent auth state

### Test 4: Logout/Login Cycle
1. Sign out
2. Sign in again
3. Check console throughout

**Expected**:
- Clean logout
- Clean login
- No warnings

## Console Checks

Look for these specific messages:
- ❌ "Multiple GoTrueClient instances detected"
- ✅ "[Auth] OAuth sign in successful"
- ✅ "[Auth] Session established"

## Debug Information

If issues occur, check:
1. Network tab for OAuth redirects
2. Application tab for cookies/localStorage
3. Console for error messages

## Verification Checklist

- [ ] No multiple client warnings in console
- [ ] OAuth login works smoothly
- [ ] Sessions persist across refreshes
- [ ] Navigation maintains auth state
- [ ] Logout clears all auth data
- [ ] Re-login works without issues