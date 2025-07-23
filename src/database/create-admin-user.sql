-- Script para criar o usuário admin andrefurtado_cg@hotmail.com
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar se o usuário já existe no auth.users
DO $$
DECLARE
  user_id uuid;
  team_id uuid;
BEGIN
  -- Buscar se o usuário já existe
  SELECT id INTO user_id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com';
  
  -- Se não existir, criar o usuário
  IF user_id IS NULL THEN
    -- Criar usuário no sistema de autenticação
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'andrefurtado_cg@hotmail.com',
      crypt('123456', gen_salt('bf')), -- senha padrão: 123456
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "André Furtado"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;
  END IF;
  
  -- Buscar primeiro time disponível
  SELECT id INTO team_id FROM teams ORDER BY name LIMIT 1;
  
  -- Inserir ou atualizar na tabela users
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
    user_id,
    'André Furtado',
    'andrefurtado_cg@hotmail.com',
    team_id,
    team_id,
    true, -- É admin
    'annual', -- Plano anual
    0, -- Gols zerados
    0, -- Total zerado
    NOW(),
    NULL,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
    team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id),
    is_admin = true,
    plan = 'annual',
    gols_current_round = 0, -- Zerar gols
    total_goals = COALESCE(users.total_goals, 0); -- Manter total ou zerar se null
    
  RAISE NOTICE 'Usuário admin criado/atualizado com ID: %', user_id;
END $$;

-- 2. Verificar se foi criado corretamente
SELECT 
  u.id, u.name, u.email, u.is_admin, u.plan, 
  u.gols_current_round, u.total_goals,
  t1.name as team_heart, t2.name as team_defending
FROM users u
LEFT JOIN teams t1 ON u.team_heart_id = t1.id
LEFT JOIN teams t2 ON u.team_defending_id = t2.id
WHERE u.email = 'andrefurtado_cg@hotmail.com';

-- 3. Garantir que as políticas RLS permitam acesso
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que admins vejam todos os usuários
CREATE POLICY IF NOT EXISTS "Admin can view all users" 
ON users 
FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true) 
  OR auth.uid() = id
);

-- Política para permitir que admins atualizem todos os usuários
CREATE POLICY IF NOT EXISTS "Admin can update all users" 
ON users 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true) 
  OR auth.uid() = id
);

-- 4. Zerar todos os gols da rodada atual para começar limpo
UPDATE users SET gols_current_round = 0 WHERE gols_current_round > 0;

-- 5. Verificar contagem final
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE gols_current_round > 0) as users_with_goals,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users
FROM users;