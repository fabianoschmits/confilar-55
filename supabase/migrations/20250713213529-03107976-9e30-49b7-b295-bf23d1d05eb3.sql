-- Habilitar realtime para mensagens
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.messages;

-- Habilitar realtime para comments
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.comments;

-- Habilitar realtime para likes
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.likes;

-- Habilitar realtime para posts
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.posts;