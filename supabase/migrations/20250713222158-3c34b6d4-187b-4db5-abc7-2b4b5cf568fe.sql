-- Criar tabela para posts de trabalho com mídia
CREATE TABLE public.work_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  location TEXT,
  category TEXT,
  media_urls TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.work_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "work_posts_select_all" ON public.work_posts FOR SELECT USING (true);
CREATE POLICY "work_posts_insert_own" ON public.work_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "work_posts_update_own" ON public.work_posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "work_posts_delete_own" ON public.work_posts FOR DELETE USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_work_posts_updated_at
  BEFORE UPDATE ON public.work_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para mídia de trabalhos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-media', 'work-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para work-media
CREATE POLICY "work_media_select_all" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'work-media');

CREATE POLICY "work_media_insert_own" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "work_media_update_own" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "work_media_delete_own" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'work-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Habilitar realtime
ALTER TABLE public.work_posts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_posts;