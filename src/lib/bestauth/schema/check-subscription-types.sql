-- Check the data types and enums for bestauth_subscriptions

-- 1. Check column types in bestauth_subscriptions
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bestauth_subscriptions'
ORDER BY ordinal_position;

-- 2. Check if subscription_status enum exists
SELECT 
  n.nspname as schema,
  t.typname as type_name,
  t.typtype,
  ARRAY(
    SELECT e.enumlabel 
    FROM pg_enum e 
    WHERE e.enumtypid = t.oid 
    ORDER BY e.enumsortorder
  ) as enum_values
FROM pg_type t 
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname LIKE '%subscription%status%'
   OR t.typname = 'subscription_status';

-- 3. Check all custom types that might be related
SELECT 
  n.nspname as schema,
  t.typname as type_name,
  CASE t.typtype
    WHEN 'e' THEN 'enum'
    WHEN 'c' THEN 'composite'
    ELSE t.typtype::text
  END as type_type
FROM pg_type t 
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND t.typname LIKE '%subscription%'
ORDER BY n.nspname, t.typname;