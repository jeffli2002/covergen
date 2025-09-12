#!/bin/bash

echo "🔧 Fixing OAuth redirect issue..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Check if NEXT_PUBLIC_SITE_URL is already set
if grep -q "NEXT_PUBLIC_SITE_URL" .env.local; then
    echo "⚠️  NEXT_PUBLIC_SITE_URL already exists in .env.local"
    echo "Current value:"
    grep "NEXT_PUBLIC_SITE_URL" .env.local
    echo ""
    echo "To fix OAuth redirect to localhost, update it to:"
    echo "NEXT_PUBLIC_SITE_URL=http://localhost:3001"
else
    echo "✅ Adding NEXT_PUBLIC_SITE_URL to .env.local..."
    echo "" >> .env.local
    echo "# Site URL for OAuth redirects" >> .env.local
    echo "NEXT_PUBLIC_SITE_URL=http://localhost:3001" >> .env.local
    echo ""
    echo "✅ Added NEXT_PUBLIC_SITE_URL=http://localhost:3001"
fi

echo ""
echo "📋 Next steps:"
echo "1. Restart your Next.js dev server (Ctrl+C and npm run dev)"
echo "2. Clear browser cookies for localhost and covergen.pro"
echo "3. Try OAuth sign-in again"
echo ""
echo "🎯 OAuth will now redirect to: http://localhost:3001/auth/callback"