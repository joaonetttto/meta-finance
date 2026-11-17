CREATE OR REPLACE FUNCTION public.enforce_free_goal_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  account_plan text;
  goal_count bigint;
BEGIN
  IF auth.role() = 'authenticated' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Você só pode criar metas para a sua própria conta.' USING ERRCODE = '42501';
    END IF;

    SELECT plano INTO account_plan FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;
    IF COALESCE(account_plan, 'gratuito') = 'gratuito' THEN
      SELECT count(*) INTO goal_count FROM public.goals WHERE user_id = NEW.user_id;
      IF goal_count >= 3 THEN
        RAISE EXCEPTION 'O plano Gratuito permite no máximo 3 metas. Veja os planos Ouro e Diamante para criar metas ilimitadas.' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_free_goal_limit() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER enforce_free_goal_limit
BEFORE INSERT ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.enforce_free_goal_limit();