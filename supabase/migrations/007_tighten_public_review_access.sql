-- Tighten public review access.
--
-- Before: an "Anyone can view reviews of public analyses" RLS policy let any
-- anon/authenticated caller SELECT every column of `reviews` for any public
-- analysis (author, review_date, raw content, version, …) — fine for the
-- report page, but also exposed the entire row-level dataset to anyone with
-- the anon key and an analysis id.
--
-- After: the policy is removed; the public report page reads through a
-- SECURITY DEFINER function that returns only the columns the UI actually
-- renders. Owners still see all columns of their own reviews via the
-- pre-existing policy.

DROP POLICY IF EXISTS "Anyone can view reviews of public analyses" ON reviews;

CREATE OR REPLACE FUNCTION public.get_public_analysis_reviews(p_slug text)
RETURNS TABLE (
    id                uuid,
    content           text,
    rating            integer,
    review_date       timestamptz,
    love_score        numeric(3,1),
    frustration_score numeric(3,1),
    loyalty_score     numeric(3,1),
    momentum_score    numeric(3,1),
    wom_score         numeric(3,1),
    churn_risk        text,
    summary           text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id,
           r.content,
           r.rating,
           r.review_date,
           r.love_score,
           r.frustration_score,
           r.loyalty_score,
           r.momentum_score,
           r.wom_score,
           r.churn_risk,
           r.summary
    FROM reviews r
    JOIN analyses a ON a.id = r.analysis_id
    WHERE a.slug = p_slug
      AND a.is_public = true
      AND a.status = 'completed'
    ORDER BY r.frustration_score DESC NULLS LAST
$$;

-- Allow the anon and authenticated roles to call the RPC. The function body
-- enforces the public/completed filter; columns like `author` and `platform`
-- are intentionally not returned.
REVOKE ALL ON FUNCTION public.get_public_analysis_reviews(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_analysis_reviews(text) TO anon, authenticated;
