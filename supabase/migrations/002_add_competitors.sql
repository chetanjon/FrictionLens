-- Add competitors JSONB column to analyses table
-- Stores competitor comparison data for Vibe Battles
-- Format: [{ name, platform, vibe_score, review_count, dimension_scores: { love, frustration, loyalty, momentum, wom } }]

ALTER TABLE analyses ADD COLUMN IF NOT EXISTS competitors jsonb;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS results jsonb;
