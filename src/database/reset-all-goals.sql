-- Script para zerar todos os gols da rodada atual
-- Execute este script no SQL Editor do Supabase

-- 1. Zerar gols da rodada atual para todos os usuários
UPDATE users 
SET gols_current_round = 0
WHERE gols_current_round > 0;

-- 2. Resetar tempo de próximo chute para permitir chutes imediatos
UPDATE users 
SET next_allowed_shot_time = NOW() - INTERVAL '1 minute'
WHERE next_allowed_shot_time > NOW();

-- 3. Verificar se foi zerado corretamente
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE gols_current_round > 0) as users_with_goals_current_round,
  COUNT(*) FILTER (WHERE total_goals > 0) as users_with_total_goals,
  MAX(gols_current_round) as max_current_round_goals,
  MAX(total_goals) as max_total_goals
FROM users;

-- 4. Mostrar alguns usuários para verificação
SELECT 
  name, 
  email, 
  gols_current_round, 
  total_goals, 
  is_admin,
  next_allowed_shot_time
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Log da operação
DO $$
BEGIN
  RAISE NOTICE 'Gols da rodada atual zerados em: %', NOW();
  RAISE NOTICE 'Próximos chutes liberados para todos os usuários';
END $$;