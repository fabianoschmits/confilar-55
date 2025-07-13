-- Corrigir avisos de RLS otimizando as políticas
-- Remover políticas existentes e recriar com melhor performance

-- Corrigir políticas da tabela profiles
DROP POLICY IF EXISTS "Perfis são visíveis por todos" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (user_id = auth.uid());

-- Corrigir políticas da tabela posts
DROP POLICY IF EXISTS "Posts são visíveis por todos" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem criar posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios posts" ON public.posts;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios posts" ON public.posts;

CREATE POLICY "posts_select_all" ON public.posts
FOR SELECT USING (true);

CREATE POLICY "posts_insert_own" ON public.posts
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "posts_update_own" ON public.posts
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "posts_delete_own" ON public.posts
FOR DELETE USING (user_id = auth.uid());

-- Corrigir políticas da tabela comments
DROP POLICY IF EXISTS "Comentários são visíveis por todos" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem criar comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios comentários" ON public.comments;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios comentários" ON public.comments;

CREATE POLICY "comments_select_all" ON public.comments
FOR SELECT USING (true);

CREATE POLICY "comments_insert_own" ON public.comments
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_update_own" ON public.comments
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "comments_delete_own" ON public.comments
FOR DELETE USING (user_id = auth.uid());

-- Corrigir políticas da tabela likes
DROP POLICY IF EXISTS "Likes são visíveis por todos" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem dar like" ON public.likes;
DROP POLICY IF EXISTS "Usuários podem remover seus próprios likes" ON public.likes;

CREATE POLICY "likes_select_all" ON public.likes
FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON public.likes
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete_own" ON public.likes
FOR DELETE USING (user_id = auth.uid());

-- Corrigir políticas da tabela conversations
DROP POLICY IF EXISTS "Usuários podem ver suas próprias conversas" ON public.conversations;
DROP POLICY IF EXISTS "Usuários podem criar conversas" ON public.conversations;

CREATE POLICY "conversations_select_own" ON public.conversations
FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "conversations_insert_own" ON public.conversations
FOR INSERT WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Corrigir políticas da tabela messages
DROP POLICY IF EXISTS "Usuários podem ver mensagens de suas conversas" ON public.messages;
DROP POLICY IF EXISTS "Usuários podem enviar mensagens" ON public.messages;

CREATE POLICY "messages_select_conversation" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
);

CREATE POLICY "messages_insert_conversation" ON public.messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
);

-- Corrigir políticas da tabela notifications
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public.notifications;

CREATE POLICY "notifications_select_own" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON public.notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

-- Corrigir políticas da tabela user_roles usando as funções security definer
DROP POLICY IF EXISTS "Administradores podem ver todos os roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem atualizar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Administradores podem deletar roles" ON public.user_roles;

CREATE POLICY "user_roles_admin_select" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_insert" ON public.user_roles
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_update" ON public.user_roles
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_delete" ON public.user_roles
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));