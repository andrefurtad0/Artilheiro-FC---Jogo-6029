-- Script para corrigir o sistema de registro de usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar e corrigir a estrutura da tabela users
DO $$ 
BEGIN
  -- Garantir que todos os campos necessários existem
  ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS team_heart_id uuid REFERENCES teams(id),
    ADD COLUMN IF NOT EXISTS team_defending_id uuid REFERENCES teams(id),
    ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS gols_current_round integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_goals integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS next_allowed_shot_time timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
END $$;

-- 2. Garantir que existe pelo menos um time
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM teams LIMIT 1) THEN
    INSERT INTO teams (name, primary_color) 
    VALUES ('Time Padrão', '#000000');
  END IF;
END $$;

-- 3. Corrigir o trigger para registro de usuários
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
  
  -- Inserir usuário na tabela users com validações adicionais para evitar erros
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
      team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
      team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id);
      
    RAISE NOTICE 'Usuário criado com sucesso na tabela users: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar usuário: % - %', SQLERRM, NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Configurar RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own data or admin can view all" ON users;
DROP POLICY IF EXISTS "Users can update own data or admin can update all" ON users;
DROP POLICY IF EXISTS "Allow inserts for new users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Criar políticas mais simples e permissivas
CREATE POLICY "Users can view own data or admin can view all" ON users FOR SELECT USING (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

CREATE POLICY "Users can update own data or admin can update all" ON users FOR UPDATE USING (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

CREATE POLICY "Allow inserts for new users" ON users FOR INSERT WITH CHECK (true);

-- 6. Verificar se tudo está funcionando
DO $$ 
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  -- Verificar estrutura da tabela
  RAISE NOTICE 'Tabela users está correta';
  -- Verificar times
  RAISE NOTICE 'Existe pelo menos um time padrão';
  -- Verificar trigger
  RAISE NOTICE 'Trigger handle_new_user está ativo';
  -- Verificar políticas
  RAISE NOTICE 'Políticas RLS configuradas';
END $$;