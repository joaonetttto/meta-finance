
-- Restrict SECURITY DEFINER trigger functions: only triggers/owner need EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Disable GraphQL exposure (REST/PostgREST remains fully functional)
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) FROM anon, authenticated;

-- Add missing UPDATE policy on categories so users can rename their own categories
CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
