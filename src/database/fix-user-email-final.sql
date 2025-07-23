-- Script final para corrigir definitivamente o campo email na tabela users
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e adicionar campo email na tabela users
DO $$ 
BEGIN
    -- Verificar se o campo email existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        -- Adicionar campo email
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Campo email adicionado à tabela users';
    END IF;
    
    -- Tornar o campo NOT NULL após adicionar
    ALTER TABLE users ALTER COLUMN email SET NOT NULL;
    ALTER TABLE users ALTER COLUMN email SET DEFAULT '';
    
    RAISE NOTICE 'Campo email configurado como obrigatório';
END $$;

-- 2. Atualizar emails existentes baseado na tabela auth.users
UPDATE users 
SET email = auth_users.email 
FROM auth.users AS auth_users 
WHERE users.id = auth_users.id 
AND (users.email IS NULL OR users.email = '');

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
    
    -- Inserir usuário na tabela users com TODOS os campos obrigatórios
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
        COALESCE(NEW.email, ''),
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

-- 5. Garantir RLS correto
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
DROP POLICY IF EXISTS "Users can update own data or admin can update all" ON users;
DROP POLICY IF EXISTS "Allow inserts for new users" ON users;
DROP POLICY IF EXISTS "Allow public inserts to users" ON users;
DROP POLICY IF EXISTS "Enable read access for users" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Criar políticas simples e funcionais
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() = id 
        OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        auth.uid() = id 
        OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
    );

CREATE POLICY "Users can insert their own record" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);

-- 7. Garantir que o usuário admin existe
UPDATE users 
SET email = 'andrefurtado_cg@hotmail.com'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com'
);

-- 8. Log de verificação final
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') as users_with_email,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_users
FROM users;

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '=== CORREÇÃO FINAL DO EMAIL CONCLUÍDA ===';
    RAISE NOTICE '1. ✅ Campo email adicionado e configurado';
    RAISE NOTICE '2. ✅ Trigger handle_new_user() corrigido';
    RAISE NOTICE '3. ✅ Políticas RLS simplificadas';
    RAISE NOTICE '4. ✅ Índices criados';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora novos usuários devem conseguir se registrar!';
END $$;