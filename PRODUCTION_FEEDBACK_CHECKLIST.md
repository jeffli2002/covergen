# Production Deployment Checklist for Feedback Feature

## Pre-Deployment

### 1. Environment Variables
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to production environment
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` is set to production URL
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set to production key
- [ ] Ensure variables are set for "Production" environment only

### 2. Database Setup
- [ ] Run migration script in production Supabase project
- [ ] Verify feedback table is created
- [ ] Test RLS policies are working correctly
- [ ] Verify indexes are created

### 3. Security Verification
- [ ] Confirm service role key is NOT in any client-side code
- [ ] Verify .env files are in .gitignore
- [ ] Check that API route validates all inputs
- [ ] Test rate limiting (if implemented)

## Deployment

### 4. Deploy to Production
- [ ] Push code to main branch
- [ ] Trigger production deployment
- [ ] Monitor deployment logs for errors

### 5. Post-Deployment Testing
- [ ] Test anonymous feedback submission
- [ ] Test authenticated user feedback submission
- [ ] Verify feedback appears in Supabase dashboard
- [ ] Check error handling with invalid data
- [ ] Test feedback modal on different pages
- [ ] Verify user agent and page URL are captured

### 6. Monitoring Setup
- [ ] Set up error alerts for failed submissions
- [ ] Create Supabase query to monitor feedback volume
- [ ] Set up weekly feedback summary report (optional)

## Rollback Plan

If issues occur:
1. Remove `SUPABASE_SERVICE_ROLE_KEY` from environment
2. API will return 503 error (service unavailable)
3. Frontend will show error message but app continues working
4. Fix issues and redeploy

## Common Production Issues

### Issue: "Feedback service is not configured"
**Solution**: Verify environment variables are set in production environment

### Issue: Feedback not saving but no errors
**Solution**: 
- Check Supabase dashboard for RLS policy issues
- Verify production database has the feedback table
- Check Supabase project is not paused

### Issue: CORS errors
**Solution**: 
- Verify production URL is added to Supabase allowed URLs
- Check API route is using correct headers

## Production Best Practices

1. **Rate Limiting**: Consider implementing rate limiting to prevent spam
2. **Monitoring**: Set up alerts for high volume or error rates
3. **Backup**: Regular database backups (Supabase handles this)
4. **Privacy**: Ensure compliance with privacy laws (GDPR, CCPA)
5. **Retention**: Define data retention policy for feedback

## Admin Features (Future)

Consider building:
- Admin dashboard to view/manage feedback
- Export functionality for feedback analysis
- Automated responses for common feedback types
- Integration with support ticket system