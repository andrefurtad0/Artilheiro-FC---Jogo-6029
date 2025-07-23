-- Script para corrigir políticas de autenticação e RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, desabilitar RLS temporariamente para corrigir dados
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes da tabela users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow public inserts to users" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;

-- 3. Recriar função de trigger mais robusta
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Reabilitar RLS com políticas mais simples
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Políticas mais permissivas
-- Permitir que usuários vejam seus próprios dados OU sejam admin
CREATE POLICY "Users can view own data or admin can view all" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

-- Permitir que usuários atualizem seus próprios dados OU admin pode atualizar todos
CREATE POLICY "Users can update own data or admin can update all" ON users
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

-- Permitir inserções para novos usuários (necessário para o trigger)
CREATE POLICY "Allow inserts for new users" ON users
  FOR INSERT WITH CHECK (true);

-- Permitir que admins façam qualquer operação
CREATE POLICY "Admin full access" ON users
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

-- 7. Garantir que o usuário admin existe e tem times
DO $$
DECLARE
  admin_user_id uuid;
  default_team_id uuid;
BEGIN
  -- Buscar usuário admin
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'andrefurtado_cg@hotmail.com';
  
  -- Se existir, garantir que tem dados na tabela users
  IF admin_user_id IS NOT NULL THEN
    -- Buscar primeiro time
    SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
    
    -- Inserir/atualizar na tabela users
    INSERT INTO users (
      id, name, email, team_heart_id, team_defending_id, 
      is_admin, plan, gols_current_round, total_goals, next_allowed_shot_time
    ) VALUES (
      admin_user_id, 'André Furtado', 'andrefurtado_cg@hotmail.com',
      default_team_id, default_team_id, true, 'annual', 0, 0, NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      is_admin = true,
      plan = 'annual',
      team_heart_id = COALESCE(users.team_heart_id, default_team_id),
      team_defending_id = COALESCE(users.team_defending_id, default_team_id);
      
    RAISE NOTICE 'Usuário admin atualizado: %', admin_user_id;
  END IF;
END $$;

-- 8. Zerar gols da rodada atual para teste limpo
UPDATE users SET gols_current_round = 0;

-- 9. Log de verificação
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users,
  COUNT(*) FILTER (WHERE team_heart_id IS NOT NULL) as users_with_heart_team,
  COUNT(*) FILTER (WHERE team_defending_id IS NOT NULL) as users_with_defending_team
FROM users;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Políticas de autenticação corrigidas!';
  RAISE NOTICE 'Agora os usuários devem conseguir:';
  RAISE NOTICE '1. Fazer cadastro normalmente';
  RAISE NOTICE '2. Logar sem travamento';
  RAISE NOTICE '3. Ver seus próprios dados';
  RAISE NOTICE '4. Admins podem ver todos os dados';
END $$;