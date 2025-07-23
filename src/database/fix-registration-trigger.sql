-- Corrigir trigger para criar usuário automaticamente quando registrado no Auth
-- Este script é CRÍTICO para garantir que novos usuários sejam criados corretamente

-- 1. Primeiro, permitir inserções públicas na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public inserts to users" 
ON users 
FOR INSERT 
WITH CHECK (true);

-- 2. Criar função de trigger que insere usuário na tabela users quando criado no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  team_id uuid;
BEGIN
  -- Se não houver time definido, pegar o primeiro time disponível
  IF (NEW.raw_user_meta_data->>'team_heart_id') IS NULL THEN
    SELECT id INTO team_id FROM teams ORDER BY name LIMIT 1;
  ELSE
    team_id := (NEW.raw_user_meta_data->>'team_heart_id')::uuid;
  END IF;
  
  -- Inserir o usuário na tabela users com valores padrão
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
    boost_expires_at,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'team_heart_id')::uuid, team_id),
    COALESCE((NEW.raw_user_meta_data->>'team_defending_id')::uuid, team_id),
    false,
    'free',
    0,
    0,
    NOW(),
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    team_heart_id = EXCLUDED.team_heart_id,
    team_defending_id = EXCLUDED.team_defending_id;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o trigger para garantir que está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Garantir que usuários possam ser atualizados
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON users 
FOR UPDATE 
USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- 5. Permitir que usuários vejam seus próprios dados
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON users 
FOR SELECT 
USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- 6. Verificar se o usuário andrefurtado_cg@hotmail.com existe e tem times
DO $$
DECLARE
  user_id uuid;
  team_id uuid;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO user_id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com';
  
  IF user_id IS NOT NULL THEN
    -- Buscar primeiro time disponível
    SELECT id INTO team_id FROM teams ORDER BY name LIMIT 1;
    
    -- Atualizar o usuário se necessário
    UPDATE users 
    SET 
      team_heart_id = COALESCE(team_heart_id, team_id),
      team_defending_id = COALESCE(team_defending_id, team_id)
    WHERE 
      id = user_id AND 
      (team_heart_id IS NULL OR team_defending_id IS NULL);
  END IF;
END $$;