-- Corrigir foreign key constraint no reviews
-- A tabela reviews está tentando referenciar professional_profiles que pode não existir para todos os usuários
-- Vamos modificar a tabela reviews para permitir comentários de perfil geral

-- Primeiro, vamos ver se temos dados na tabela reviews
-- Se houver, vamos fazer backup e recriar

-- Criar nova estrutura para reviews que funciona com profiles normais
DROP TABLE IF EXISTS public.profile_reviews CASCADE;

CREATE TABLE public.profile_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewed_user_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewed_user_id, reviewer_id)
);

-- Habilitar RLS
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can insert their own reviews" 
ON public.profile_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
ON public.profile_reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can view all reviews" 
ON public.profile_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own reviews" 
ON public.profile_reviews 
FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_profile_reviews_updated_at
BEFORE UPDATE ON public.profile_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();