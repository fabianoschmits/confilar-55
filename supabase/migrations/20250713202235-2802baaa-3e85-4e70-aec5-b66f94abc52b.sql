-- Manual para tornar usuário admin
-- Execute este comando depois de fazer login, substituindo SEU_EMAIL pelo email usado no login

-- Primeiro, crie uma conta normal no app e faça login
-- Depois execute este comando no SQL Editor do Supabase:

-- Insere o role de admin para o usuário com o email especificado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::user_role
FROM auth.users 
WHERE email = 'fabiano.schmits@outlook.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Para promover outros usuários a admin, use:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::user_role
-- FROM auth.users 
-- WHERE email = 'EMAIL_DO_USUARIO'
-- ON CONFLICT (user_id, role) DO NOTHING;