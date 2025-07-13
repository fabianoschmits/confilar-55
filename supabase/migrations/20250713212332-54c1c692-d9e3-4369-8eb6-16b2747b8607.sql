-- Limpar dados de exemplo e configurar aplicativo para novos usuários

-- Garantir que todas as tabelas estão vazias para novos usuários
DELETE FROM public.comments;
DELETE FROM public.likes;  
DELETE FROM public.posts;
DELETE FROM public.notifications;
DELETE FROM public.messages;
DELETE FROM public.conversations;

-- Limpar perfis existentes mas manter estrutura
DELETE FROM public.profiles;

-- Garantir que o trigger handle_new_user está funcionando corretamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recriar trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
    now(), 
    now()
  );
  RETURN NEW;
END;
$function$;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir que as políticas de storage estão corretas para avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Recriar políticas de storage para avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);