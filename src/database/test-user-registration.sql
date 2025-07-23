-- Script para testar o registro de usuário após correção do campo email
-- Execute este script APÓS o fix-user-email-field.sql

-- 1. Verificar se a tabela users tem o campo email
SELECT 
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) AS email_field_exists;

-- 2. Verificar se o trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Simular criação de usuário (apenas para teste - NÃO execute em produção)
/*
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    default_team_id uuid;
BEGIN
    -- Buscar primeiro time
    SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
    
    -- Simular inserção na auth.users (apenas para teste do trigger)
    -- Em produção, isso é feito pelo Supabase Auth
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'teste@exemplo.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        jsonb_build_object(
            'name', 'Usuário Teste',
            'team_heart_id', default_team_id,
            'team_defending_id', default_team_id
        ),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Usuário teste criado com ID: %', test_user_id;
END $$;
*/

-- 5. Verificar se usuários existentes têm email
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') as users_with_email,
    COUNT(*) FILTER (WHERE email IS NULL OR email = '') as users_without_email
FROM users;

-- 6. Listar usuários com seus emails
SELECT 
    u.id,
    u.name,
    u.email,
    au.email as auth_email,
    u.is_admin,
    u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- 7. Verificar se há discrepâncias entre auth.users e users
SELECT 
    'Missing in users table' as issue,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Email mismatch' as issue,
    u.id,
    u.email || ' vs ' || au.email as email,
    u.created_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email != au.email;

-- Log final
DO $$
BEGIN
    RAISE NOTICE 'Teste de registro de usuário concluído!';
    RAISE NOTICE 'Verifique os resultados acima para garantir que:';
    RAISE NOTICE '1. Campo email existe na tabela users';
    RAISE NOTICE '2. Trigger está ativo';
    RAISE NOTICE '3. Políticas RLS estão corretas';
    RAISE NOTICE '4. Usuários existentes têm emails';
END $$;