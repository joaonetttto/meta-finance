CREATE OR REPLACE FUNCTION public.protect_profile_plano()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.plano := 'gratuito';
    ELSIF NEW.plano IS DISTINCT FROM OLD.plano THEN
      RAISE EXCEPTION 'O plano não pode ser alterado diretamente pelo cliente'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_profile_plano() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_plano ON public.profiles;
CREATE TRIGGER protect_profile_plano
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_plano();