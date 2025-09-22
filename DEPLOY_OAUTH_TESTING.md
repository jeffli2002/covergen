# Testing Real Google OAuth on Vercel

## Before Deploying

1. **Remove WSL2 Mock Configuration**
   - The mock OAuth only runs in WSL2 development
   - In production (Vercel), it will automatically use real Google OAuth endpoints
   - No code changes needed!

2. **Update Google Console**
   Add your Vercel preview URL to Google Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your OAuth 2.0 Client ID
   - Add to Authorized redirect URIs:
     - `https://your-app.vercel.app/api/auth/callback/google`
     - `https://your-app-*.vercel.app/api/auth/callback/google` (for preview URLs)

3. **Set Environment Variables in Vercel**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   BESTAUTH_JWT_SECRET=your-jwt-secret
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

## Deploy to Vercel

1. **Push your changes**
   ```bash
   git add .
   git commit -m "Add OAuth with WSL2 mock support"
   git push
   ```

2. **Deploy**
   - If connected to Vercel, it will auto-deploy
   - Or use: `vercel --prod`

## Testing on Vercel

1. Visit: `https://your-app.vercel.app/test-bestauth`
2. Click "Sign in with Google"
3. Complete real Google OAuth
4. Should redirect to `/auth/signin-simple` with success

## What's Different in Production

- **No WSL2 detection** → Uses real Google OAuth endpoints
- **Real token exchange** → Connects to `https://oauth2.googleapis.com/token`
- **Real user data** → Gets actual Google user profile
- **Proper SSL/HTTPS** → No network timeout issues

## Troubleshooting

If OAuth fails on Vercel:
1. Check Vercel logs for errors
2. Verify environment variables are set
3. Confirm redirect URIs in Google Console match exactly
4. Check browser console for errors

## Local vs Production

| Environment | OAuth Endpoints | Network | SSL |
|------------|----------------|---------|-----|
| WSL2 Local | Mock (localhost) | Limited | No |
| Vercel | Real Google | Full | Yes |

The code automatically detects the environment and uses the appropriate endpoints!