# OAuth Implementation Cleanup Tasks

After verifying OAuth works properly on Vercel, here are the cleanup tasks:

## 1. Remove Debug Components
- [ ] Remove `AuthStatusDebug` component from layout
- [ ] Remove test-auth page (or move to a protected route)
- [ ] Remove `/api/debug/manual-auth-check` endpoint

## 2. Migrate to Unified Auth
- [ ] Replace all `useAuth` from AuthContext with `useVercelAuth` 
- [ ] Replace `WorkingAuthButton` with `UnifiedAuthButton`
- [ ] Update header to use `UnifiedAuthButton`

## 3. Remove Old Code
- [ ] Remove `WorkingAuthButton` component
- [ ] Remove old `useAuth` hook (keep only `useVercelAuth`)
- [ ] Simplify `AuthContext` to use VercelAuth singleton

## 4. Documentation
- [ ] Update README with auth setup instructions
- [ ] Document the Vercel-specific auth approach
- [ ] Add troubleshooting guide

## 5. Security Review
- [ ] Ensure no auth tokens are logged in production
- [ ] Verify all debug endpoints are removed
- [ ] Check that cookies are httpOnly and secure

## 6. Testing
- [ ] Add e2e tests for OAuth flow
- [ ] Test on multiple browsers
- [ ] Verify mobile experience

## Implementation Priority
1. First priority: Remove debug components (security)
2. Second priority: Migrate to unified auth (consistency)
3. Third priority: Documentation (maintainability)