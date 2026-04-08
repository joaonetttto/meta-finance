
CREATE TABLE public.saved_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL DEFAULT 'Minha Projeção',
  valor_desejado NUMERIC NOT NULL,
  prazo_anos NUMERIC NOT NULL,
  aporte_mensal NUMERIC NOT NULL DEFAULT 0,
  cenario TEXT NOT NULL DEFAULT 'moderado',
  convertida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_projections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projections"
  ON public.saved_projections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projections"
  ON public.saved_projections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projections"
  ON public.saved_projections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projections"
  ON public.saved_projections FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_projections_updated_at
  BEFORE UPDATE ON public.saved_projections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
