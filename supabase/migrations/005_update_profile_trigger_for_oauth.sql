-- Migration 005: Update profile trigger for Google OAuth
-- Adds avatar_url column and updates handle_new_user() to extract Google metadata

-- Add avatar_url column for OAuth profile photos
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update trigger to extract Google OAuth metadata (full_name, avatar_url)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data ->> 'display_name',
            NEW.raw_user_meta_data ->> 'full_name',
            NEW.raw_user_meta_data ->> 'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;
