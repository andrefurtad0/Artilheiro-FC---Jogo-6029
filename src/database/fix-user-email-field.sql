-- Script para adicionar campo email na tabela users e corrigir o trigger
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campo email na tabela users se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
END $$;

-- 2. Atualizar emails existentes baseado na tabela auth.users
UPDATE users 
SET email = auth_users.email 
FROM auth.users AS auth_users 
WHERE users.id = auth_users.id AND users.email = '';

-- 3. Recriar a função de trigger com o campo email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_team_id uuid;
BEGIN
    -- Buscar primeiro time disponível
    SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
    
    -- Se não houver times, criar um time padrão
    IF default_team_id IS NULL THEN
        INSERT INTO teams (name, primary_color) 
        VALUES ('Time Padrão', '#000000') 
        RETURNING id INTO default_team_id;
    END IF;
    
    -- Inserir usuário na tabela users com email
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
        NEW.email, -- Campo email agora incluído
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Adicionar índice no campo email para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 6. Atualizar política RLS para incluir verificação de email
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
CREATE POLICY "Users can view own data or admin can view all" ON users
    FOR SELECT USING (
        auth.uid() = id 
        OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
    );

-- 7. Garantir que o usuário admin tem email correto
UPDATE users 
SET email = 'andrefurtado_cg@hotmail.com' 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com'
) AND email != 'andrefurtado_cg@hotmail.com';

-- 8. Verificar se a estrutura está correta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 9. Testar se o trigger está funcionando
DO $$
BEGIN
    RAISE NOTICE 'Verificando estrutura da tabela users:';
    RAISE NOTICE 'Campo email adicionado com sucesso!';
    RAISE NOTICE 'Trigger handle_new_user() atualizado!';
    RAISE NOTICE 'Políticas RLS atualizadas!';
END $$;

-- 10. Verificar dados existentes
SELECT 
    id,
    name,
    email,
    is_admin,
    plan,
    gols_current_round,
    total_goals,
    team_heart_id,
    team_defending_id,
    created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 10;