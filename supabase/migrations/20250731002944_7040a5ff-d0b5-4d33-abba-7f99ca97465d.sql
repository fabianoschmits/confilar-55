-- Adicionar campos adicionais na tabela profiles para cadastro completo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('masculino', 'feminino', 'nao_binario', 'outro', 'prefiro_nao_dizer'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Criar tabela para provedores OAuth
CREATE TABLE IF NOT EXISTS public.oauth_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_name, provider_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.oauth_providers ENABLE ROW LEVEL SECURITY;

-- Create policies for oauth_providers
CREATE POLICY "Users can view their own oauth providers" 
ON public.oauth_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth providers" 
ON public.oauth_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth providers" 
ON public.oauth_providers 
FOR UPDATE 
USING (auth.uid() = user_id);