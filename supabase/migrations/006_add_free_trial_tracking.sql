-- Add free trial usage tracking to user_settings.
-- New users get 2 free analyses using the platform Gemini key
-- before needing to add their own API key.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS free_analyses_used integer NOT NULL DEFAULT 0;

-- Ensure the column has a sensible constraint
ALTER TABLE user_settings
  ADD CONSTRAINT free_analyses_used_non_negative CHECK (free_analyses_used >= 0);
