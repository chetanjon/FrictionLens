-- Add missing columns to analyses table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bdvwpjcsnwxlrxrczcki/sql/new

-- 1. Add results JSONB column (stores full analysis output)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS results jsonb;

-- 2. Add competitors JSONB column (stores competitor comparison data)
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS competitors jsonb;

-- 3. Add completed_at timestamp
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- 4. Add release_impact JSONB column
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS release_impact jsonb;

-- 5. Add churn_phrases to reviews (if missing)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS churn_phrases jsonb;

-- 6. Relax platform CHECK constraint to allow 'unknown'
ALTER TABLE analyses DROP CONSTRAINT IF EXISTS analyses_platform_check;
ALTER TABLE analyses ADD CONSTRAINT analyses_platform_check
  CHECK (platform IN ('ios', 'android', 'both', 'unknown'));
