#!/bin/bash

# Apply database migrations script

echo "Applying database migrations to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Extract database URL from .env.local
DATABASE_URL=$(grep SUPABASE_DB_URL .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DATABASE_URL" ]; then
    echo "Error: SUPABASE_DB_URL not found in .env.local"
    echo "Please add your database URL to .env.local:"
    echo "SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:[port]/postgres"
    exit 1
fi

echo "Applying migration: 20250903_add_usage_tracking.sql"

# Apply the migration using psql
psql "$DATABASE_URL" < supabase/migrations/20250903_add_usage_tracking.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    
    # Verify tables were created
    echo ""
    echo "Verifying tables..."
    psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('user_usage', 'anonymous_usage', 'generation_logs');"
else
    echo "❌ Migration failed"
    exit 1
fi