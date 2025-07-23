-- Script para corrigir definitivamente o registro de usuários e dados
-- Execute este script no SQL Editor do Supabase

-- 1. Ajustar função de trigger para capturar corretamente nome e email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_team_id uuid;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Criando usuário: % com email: % e nome: %', 
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'name';

  -- Buscar primeiro time disponível
  SELECT id INTO default_team_id 
  FROM teams 
  ORDER BY name 
  LIMIT 1;

  -- Se não houver times, criar um padrão
  IF default_team_id IS NULL THEN
    INSERT INTO teams (name, primary_color)
    VALUES ('Time Padrão', '#000000')
    RETURNING id INTO default_team_id;
  END IF;

  -- Inserir usuário com dados corretos do auth
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
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), -- Usa email como fallback para nome
    NEW.email, -- Email direto do auth
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
    email = NEW.email, -- Sempre atualiza email com o valor do auth
    team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
    team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id);

  RAISE NOTICE 'Usuário criado com sucesso: % (%) - %', 
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Atualizar usuários existentes com dados corretos do auth
UPDATE users u
SET 
  name = COALESCE(au.raw_user_meta_data->>'name', au.email),
  email = au.email
FROM auth.users au
WHERE u.id = au.id
  AND (u.name = 'Novo Usuário' OR u.email IS NULL OR u.email = '');

-- 4. Log de verificação
DO $$
BEGIN
  RAISE NOTICE '===CORREÇÃO DE DADOS CONCLUÍDA===';
  RAISE NOTICE '✅ Trigger atualizado para capturar nome e email';
  RAISE NOTICE '✅ Dados existentes corrigidos';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora o registro deve salvar corretamente:';
  RAISE NOTICE '1. Nome do formulário de registro';
  RAISE NOTICE '2. Email do auth';
  RAISE NOTICE '3. Times selecionados';
END $$;

-- 5. Verificar resultado
SELECT 
  id,
  name,
  email,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;