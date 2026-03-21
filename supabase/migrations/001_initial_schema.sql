-- FrictionLens Initial Schema Migration
-- Creates core tables, RLS policies, triggers, and indexes

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE profiles (
    id           uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email        text,
    display_name text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- Auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. user_settings
-- ============================================================
CREATE TABLE user_settings (
    id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                  uuid NOT NULL UNIQUE REFERENCES profiles (id) ON DELETE CASCADE,
    gemini_api_key_encrypted text,
    gemini_api_key_iv        text,
    gemini_api_key_tag       text,
    default_model            text NOT NULL DEFAULT 'gemini-2.5-flash',
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
    ON user_settings FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 3. analyses
-- ============================================================
CREATE TABLE analyses (
    id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          uuid NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    app_name         text NOT NULL,
    platform         text CHECK (platform IN ('ios', 'android', 'both')),
    status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    review_count     integer NOT NULL DEFAULT 0,
    vibe_score       numeric(4,1),
    dimension_scores jsonb,
    friction_scores  jsonb,
    churn_drivers    jsonb,
    action_items     jsonb,
    slug             text UNIQUE,
    is_public        boolean NOT NULL DEFAULT false,
    error_message    text,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
    ON analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public analyses"
    ON analyses FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can insert their own analyses"
    ON analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
    ON analyses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
    ON analyses FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- 4. reviews
-- ============================================================
CREATE TABLE reviews (
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id        uuid NOT NULL REFERENCES analyses (id) ON DELETE CASCADE,
    content            text NOT NULL,
    rating             integer CHECK (rating >= 1 AND rating <= 5),
    author             text,
    review_date        timestamptz,
    platform           text,
    version            text,
    love_score         numeric(3,1),
    frustration_score  numeric(3,1),
    loyalty_score      numeric(3,1),
    momentum_score     numeric(3,1),
    wom_score          numeric(3,1),
    churn_risk         text CHECK (churn_risk IN ('Critical', 'High', 'Medium', 'Low')),
    features_mentioned jsonb,
    summary            text,
    tier               integer,
    ai_processed       boolean NOT NULL DEFAULT false,
    created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Reviews inherit access from their parent analysis.
-- Users can access reviews belonging to their own analyses.
CREATE POLICY "Users can view reviews of their own analyses"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view reviews of public analyses"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.is_public = true
        )
    );

CREATE POLICY "Users can insert reviews into their own analyses"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update reviews in their own analyses"
    ON reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reviews in their own analyses"
    ON reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = reviews.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

-- ============================================================
-- Indexes
-- ============================================================

-- Foreign key indexes
CREATE INDEX idx_user_settings_user_id ON user_settings (user_id);
CREATE INDEX idx_analyses_user_id      ON analyses (user_id);
CREATE INDEX idx_reviews_analysis_id   ON reviews (analysis_id);

-- Common query indexes
CREATE INDEX idx_analyses_slug         ON analyses (slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_analyses_status       ON analyses (status);
CREATE INDEX idx_analyses_created_at   ON analyses (created_at DESC);
CREATE INDEX idx_reviews_ai_processed  ON reviews (ai_processed) WHERE ai_processed = false;
CREATE INDEX idx_reviews_rating        ON reviews (rating);
CREATE INDEX idx_reviews_churn_risk    ON reviews (churn_risk) WHERE churn_risk IS NOT NULL;

-- ============================================================
-- updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_analyses_updated_at
    BEFORE UPDATE ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
