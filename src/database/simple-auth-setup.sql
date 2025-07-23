-- Setup simples e funcional para autenticação
-- Execute este script no SQL Editor do Supabase

-- 1. Garantir que as tabelas básicas existem
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir alguns times básicos se não existirem
INSERT INTO teams (name, primary_color) VALUES
  ('Flamengo Digital', '#E53935'),
  ('Palmeiras Cyber', '#2E7D32'),
  ('Corinthians Virtual', '#000000'),
  ('São Paulo FC Online', '#FF0000')
ON CONFLICT (name) DO NOTHING;

-- 3. Criar tabela users com estrutura correta
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  team_heart_id UUID REFERENCES teams(id),
  team_defending_id UUID REFERENCES teams(id),
  is_admin BOOLEAN DEFAULT FALSE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  gols_current_round INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  next_allowed_shot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  boost_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Desabilitar RLS temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. Função de trigger simples e robusta
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  default_team_id uuid;
BEGIN
  -- Buscar primeiro time
  SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
  
  -- Inserir usuário
  INSERT INTO public.users (
    id, name, email, team_heart_id, team_defending_id,
    is_admin, plan, gols_current_round, total_goals, next_allowed_shot_time
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
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    team_heart_id = EXCLUDED.team_heart_id,
    team_defending_id = EXCLUDED.team_defending_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Reabilitar RLS com políticas simples
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Política simples: usuários podem ver e editar seus próprios dados
CREATE POLICY "Enable read access for users" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users" ON users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Permitir que todos vejam teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for teams" ON teams
  FOR SELECT USING (true);

-- 10. Criar usuário admin se não existir
DO $$
DECLARE
  admin_user_id uuid;
  default_team_id uuid;
BEGIN
  -- Buscar usuário admin
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
    
    INSERT INTO users (
      id, name, email, team_heart_id, team_defending_id, 
      is_admin, plan, gols_current_round, total_goals
    ) VALUES (
      admin_user_id, 'André Furtado', 'andrefurtado_cg@hotmail.com',
      default_team_id, default_team_id, true, 'annual', 0, 0
    ) ON CONFLICT (id) DO UPDATE SET
      is_admin = true,
      plan = 'annual';
  END IF;
END $$;

-- Log
SELECT 'Setup de autenticação concluído!' as status;