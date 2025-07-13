-- Limpar dados de usuários de teste, mantendo apenas o usuário principal
-- Identifica o ID do usuário principal pelo email
DO $$
DECLARE
    main_user_id UUID;
BEGIN
    -- Busca o ID do usuário principal
    SELECT id INTO main_user_id 
    FROM auth.users 
    WHERE email = 'fabiano.schmits@outlook.com';
    
    -- Se encontrou o usuário principal, limpa os dados mantendo apenas os dele
    IF main_user_id IS NOT NULL THEN
        -- Limpa conversas e mensagens (todas, pois são de teste)
        DELETE FROM public.messages;
        DELETE FROM public.conversations;
        
        -- Limpa notificações que não são do usuário principal
        DELETE FROM public.notifications 
        WHERE user_id != main_user_id;
        
        -- Limpa likes que não são do usuário principal
        DELETE FROM public.likes 
        WHERE user_id != main_user_id;
        
        -- Limpa comentários que não são do usuário principal
        DELETE FROM public.comments 
        WHERE user_id != main_user_id;
        
        -- Limpa posts que não são do usuário principal
        DELETE FROM public.posts 
        WHERE user_id != main_user_id;
        
        -- Limpa perfis que não são do usuário principal
        DELETE FROM public.profiles 
        WHERE user_id != main_user_id;
        
        -- Limpa roles que não são do usuário principal
        DELETE FROM public.user_roles 
        WHERE user_id != main_user_id;
        
        RAISE NOTICE 'Dados limpos com sucesso. Mantido apenas o usuário: %', main_user_id;
    ELSE
        RAISE NOTICE 'Usuário principal não encontrado. Nenhuma limpeza realizada.';
    END IF;
END $$;