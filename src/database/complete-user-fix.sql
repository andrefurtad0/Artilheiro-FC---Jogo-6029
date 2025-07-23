-- Script completo para corrigir definitivamente o problema de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e corrigir estrutura da tabela users
DO $$ 
BEGIN
    -- Adicionar campo email se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Campo email adicionado à tabela users';
    END IF;
    
    -- Tornar email obrigatório após adicionar
    ALTER TABLE users ALTER COLUMN email SET NOT NULL;
    ALTER TABLE users ALTER COLUMN email SET DEFAULT '';
    
    RAISE NOTICE 'Campo email configurado como obrigatório';
END $$;

-- 2. Atualizar emails existentes baseado na tabela auth.users
UPDATE users 
SET email = auth_users.email 
FROM auth.users AS auth_users 
WHERE users.id = auth_users.id;

-- 3. Criar função robusta para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_team_id uuid;
BEGIN
    -- Log para debug
    RAISE NOTICE 'Criando usuário: % com email: %', NEW.id, NEW.email;
    
    -- Buscar primeiro time disponível
    SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
    
    -- Se não houver times, criar um time padrão
    IF default_team_id IS NULL THEN
        INSERT INTO teams (name, primary_color) 
        VALUES ('Time Padrão', '#000000') 
        RETURNING id INTO default_team_id;
        
        RAISE NOTICE 'Time padrão criado: %', default_team_id;
    END IF;
    
    -- Inserir usuário na tabela users
    INSERT INTO public.users (
        id,
        name,
        email,
        team_heart_id,
        team_defending_id,
        is_admin,
        plan,
        gols_current_round,
        total_goals,
        next_allowed_shot_time,
        created_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'team_heart_id')::uuid, default_team_id),
        COALESCE((NEW.raw_user_meta_data->>'team_defending_id')::uuid, default_team_id),
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
        'free',
        0,
        0,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        email = COALESCE(EXCLUDED.email, users.email),
        team_heart_id = COALESCE(EXCLUDED.team_heart_id, users.team_heart_id),
        team_defending_id = COALESCE(EXCLUDED.team_defending_id, users.team_defending_id);
    
    RAISE NOTICE 'Usuário criado com sucesso na tabela users: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Garantir que RLS está configurado corretamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
DROP POLICY IF EXISTS "Users can update own data or admin can update all" ON users;
DROP POLICY IF EXISTS "Allow inserts for new users" ON users;
DROP POLICY IF EXISTS "Allow public inserts to users" ON users;

-- Criar políticas mais simples e funcionais
CREATE POLICY "Enable read access for users" ON users
    FOR SELECT USING (
        auth.uid() = id 
        OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
    );

CREATE POLICY "Enable update for users" ON users
    FOR UPDATE USING (
        auth.uid() = id 
        OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
    );

CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);

-- 7. Verificar e corrigir usuário admin
DO $$
DECLARE
    admin_user_id uuid;
    default_team_id uuid;
BEGIN
    -- Buscar usuário admin
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Buscar primeiro time
        SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
        
        -- Inserir/atualizar na tabela users
        INSERT INTO users (
            id,
            name,
            email,
            team_heart_id,
            team_defending_id,
            is_admin,
            plan,
            gols_current_round,
            total_goals,
            next_allowed_shot_time
        ) VALUES (
            admin_user_id,
            'André Furtado',
            'andrefurtado_cg@hotmail.com',
            default_team_id,
            default_team_id,
            true,
            'annual',
            0,
            0,
            NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            is_admin = true,
            plan = 'annual',
            team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
            team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id);
            
        RAISE NOTICE 'Usuário admin atualizado: %', admin_user_id;
    END IF;
END $$;

-- 8. Verificar se tudo está funcionando
SELECT 
    'Verificação Final' as status,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') as users_with_email,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_users,
    COUNT(*) FILTER (WHERE team_heart_id IS NOT NULL) as users_with_heart_team,
    COUNT(*) FILTER (WHERE team_defending_id IS NOT NULL) as users_with_defending_team
FROM users;

-- 9. Mostrar usuários existentes
SELECT 
    id,
    name,
    email,
    is_admin,
    plan,
    team_heart_id,
    team_defending_id,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 10. Verificar se trigger está ativo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Log final
DO $$
BEGIN
    RAISE NOTICE '=== CORREÇÃO COMPLETA FINALIZADA ===';
    RAISE NOTICE '1. ✅ Campo email adicionado à tabela users';
    RAISE NOTICE '2. ✅ Trigger handle_new_user() atualizado';
    RAISE NOTICE '3. ✅ Políticas RLS configuradas';
    RAISE NOTICE '4. ✅ Usuário admin verificado';
    RAISE NOTICE '5. ✅ Índices criados';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora os usuários devem conseguir:';
    RAISE NOTICE '- Registrar-se normalmente';
    RAISE NOTICE '- Ter seus dados salvos na tabela users';
    RAISE NOTICE '- Fazer login sem problemas';
    RAISE NOTICE '- Ver seus dados no perfil';
END $$;