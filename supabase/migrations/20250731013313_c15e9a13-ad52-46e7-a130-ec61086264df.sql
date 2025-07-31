-- Criar tabela para trabalhos/serviços
CREATE TABLE public.works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2),
  location TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can create their own works" 
ON public.works 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all works" 
ON public.works 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own works" 
ON public.works 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own works" 
ON public.works 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_works_updated_at
BEFORE UPDATE ON public.works
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar storage bucket para mídia dos trabalhos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-media', 'work-media', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de storage para work-media
CREATE POLICY "Users can upload their own work media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all work media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'work-media');

CREATE POLICY "Users can update their own work media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own work media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);