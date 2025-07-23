-- Script final para corrigir o registro de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Allow inserts for new users" ON users;
DROP POLICY IF EXISTS "Enable read access for users" ON users;
DROP POLICY IF EXISTS "Enable update for users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- 2. Desabilitar RLS temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Garantir que a tabela users tem a estrutura correta
DO $$ 
BEGIN
  -- Verificar se a tabela users existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename='users') THEN
    -- Criar tabela users se não existir
    CREATE TABLE users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      team_heart_id UUID REFERENCES teams(id),
      team_defending_id UUID REFERENCES teams(id),
      is_admin BOOLEAN DEFAULT FALSE,
      plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'annual')),
      gols_current_round INTEGER DEFAULT 0,
      total_goals INTEGER DEFAULT 0,
      next_allowed_shot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      boost_expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'Tabela users criada com sucesso';
  ELSE
    -- Adicionar colunas que podem estar faltando
    ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS team_heart_id UUID REFERENCES teams(id),
      ADD COLUMN IF NOT EXISTS team_defending_id UUID REFERENCES teams(id),
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free',
      ADD COLUMN IF NOT EXISTS gols_current_round INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_goals INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS next_allowed_shot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 4. Recriar a função de trigger mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_team_id uuid;
  user_name text;
  user_email text;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger executado para usuário: %', NEW.id;

  -- Buscar primeiro time disponível
  SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;

  -- Se não houver times, criar um padrão
  IF default_team_id IS NULL THEN
    INSERT INTO teams (name, primary_color)
    VALUES ('Time Padrão', '#000000')
    RETURNING id INTO default_team_id;
    RAISE NOTICE 'Time padrão criado: %', default_team_id;
  END IF;

  -- Extrair dados do usuário
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário');
  user_email := COALESCE(NEW.email, '');

  -- Inserir usuário com tratamento de erro
  BEGIN
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
      user_name,
      user_email,
      COALESCE((NEW.raw_user_meta_data->>'team_heart_id')::uuid, default_team_id),
      COALESCE((NEW.raw_user_meta_data->>'team_defending_id')::uuid, default_team_id),
      COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
      'free',
      0,
      0,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      team_heart_id = EXCLUDED.team_heart_id,
      team_defending_id = EXCLUDED.team_defending_id;

    RAISE NOTICE 'Usuário inserido com sucesso: %', NEW.id;
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao inserir usuário: % - %', SQLERRM, NEW.id;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Reabilitar RLS com novas políticas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas simples e funcionais
CREATE POLICY "Users can view own data or admin can view all"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

CREATE POLICY "Users can update own data or admin can update all"
  ON users
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

CREATE POLICY "Allow inserts for new users"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 8. Verificar se tudo está funcionando
SELECT 
  'Configuração concluída' as status,
  (SELECT COUNT(*) FROM teams) as total_teams,
  (SELECT COUNT(*) FROM users) as total_users;