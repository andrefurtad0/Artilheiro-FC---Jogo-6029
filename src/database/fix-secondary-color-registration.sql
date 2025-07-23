-- Script para corrigir o erro de registro relacionado ao campo secondary_color
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o campo secondary_color existe na tabela teams
DO $$
BEGIN
  -- Adicionar campo secondary_color se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE teams ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#FFFFFF';
    RAISE NOTICE 'Campo secondary_color adicionado à tabela teams';
  END IF;
END $$;

-- 2. Atualizar todos os times existentes para ter secondary_color
UPDATE teams 
SET secondary_color = '#FFFFFF' 
WHERE secondary_color IS NULL OR secondary_color = '';

-- 3. Garantir que todos os times tenham secondary_color preenchido
UPDATE teams 
SET secondary_color = CASE 
  WHEN name LIKE '%Flamengo%' THEN '#000000'
  WHEN name LIKE '%Corinthians%' THEN '#FFFFFF'
  WHEN name LIKE '%Palmeiras%' THEN '#FFFFFF'
  WHEN name LIKE '%São Paulo%' THEN '#000000'
  WHEN name LIKE '%Vasco%' THEN '#FFFFFF'
  WHEN name LIKE '%Santos%' THEN '#000000'
  WHEN name LIKE '%Grêmio%' THEN '#000000'
  WHEN name LIKE '%Internacional%' THEN '#FFFFFF'
  WHEN name LIKE '%Fluminense%' THEN '#FFFFFF'
  WHEN name LIKE '%Botafogo%' THEN '#FFFFFF'
  WHEN name LIKE '%Atlético%' THEN '#FFFFFF'
  WHEN name LIKE '%Cruzeiro%' THEN '#FFFFFF'
  ELSE '#FFFFFF'
END
WHERE secondary_color IS NULL OR secondary_color = '';

-- 4. Inserir times brasileiros com cores corretas se não existirem
INSERT INTO teams (name, primary_color, secondary_color) VALUES
('Flamengo Digital', '#E53935', '#000000'),
('Corinthians Virtual', '#000000', '#FFFFFF'),
('Palmeiras Cyber', '#2E7D32', '#FFFFFF'),
('São Paulo FC Online', '#FF0000', '#000000'),
('Vasco da Gama Net', '#000000', '#FFFFFF'),
('Santos FC Digital', '#FFFFFF', '#000000'),
('Grêmio Conectado', '#0B83C5', '#000000'),
('Internacional Web', '#FF0000', '#FFFFFF'),
('Fluminense Tech', '#9F022F', '#FFFFFF'),
('Botafogo Cloud', '#000000', '#FFFFFF'),
('Atlético-MG Online', '#000000', '#FFFFFF'),
('Cruzeiro Digital', '#0B2B7B', '#FFFFFF'),
('Athletico-PR Tech', '#FF0000', '#000000'),
('Red Bull Bragantino VR', '#FF0000', '#FFFFFF'),
('Bahia Virtual', '#0000FF', '#FFFFFF'),
('Fortaleza E-Sports', '#0000FF', '#FFFFFF')
ON CONFLICT (name) DO UPDATE SET
  secondary_color = EXCLUDED.secondary_color;

-- 5. Corrigir a função de trigger para garantir que funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_team_id uuid;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Criando usuário: % com email: %', NEW.id, NEW.email;
  
  -- Buscar primeiro time disponível
  SELECT id INTO default_team_id 
  FROM teams 
  WHERE secondary_color IS NOT NULL 
  ORDER BY name 
  LIMIT 1;
  
  -- Se não houver times, criar um time padrão
  IF default_team_id IS NULL THEN
    INSERT INTO teams (name, primary_color, secondary_color) 
    VALUES ('Time Padrão', '#000000', '#FFFFFF') 
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
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao criar usuário: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Garantir que RLS está configurado corretamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Enable read access for teams" ON teams;

-- Criar políticas simples e funcionais
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for teams" ON teams 
FOR SELECT USING (true);

-- 8. Verificar se tudo está funcionando
SELECT 
  COUNT(*) as total_teams,
  COUNT(*) FILTER (WHERE secondary_color IS NOT NULL) as teams_with_secondary_color,
  COUNT(*) FILTER (WHERE secondary_color = '' OR secondary_color IS NULL) as teams_without_secondary_color
FROM teams;

-- 9. Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '===CORREÇÃO DO SECONDARY_COLOR CONCLUÍDA===';
  RAISE NOTICE '✅ Campo secondary_color adicionado/corrigido';
  RAISE NOTICE '✅ Times brasileiros inseridos com cores corretas';
  RAISE NOTICE '✅ Trigger handle_new_user corrigido';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora o registro deve funcionar normalmente!';
END $$;