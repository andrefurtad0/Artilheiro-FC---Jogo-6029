-- Script para corrigir dados de usuários e zerar contagens de gols
-- Execute este script no SQL Editor do Supabase

-- 1. Zerar gols da rodada atual para todos os usuários
UPDATE users 
SET gols_current_round = 0
WHERE gols_current_round > 0;

-- 2. Adicionar times para o usuário andrefurtado_cg@hotmail.com se necessário
UPDATE users 
SET 
  team_heart_id = (SELECT id FROM teams ORDER BY name LIMIT 1),
  team_defending_id = (SELECT id FROM teams ORDER BY name LIMIT 1)
WHERE 
  email = 'andrefurtado_cg@hotmail.com' 
  AND (team_heart_id IS NULL OR team_defending_id IS NULL);

-- 3. Garantir que todos os usuários tenham valores padrão corretos
UPDATE users 
SET 
  gols_current_round = 0,
  next_allowed_shot_time = NOW(),
  boost_expires_at = NULL,
  plan = COALESCE(plan, 'free')
WHERE 
  gols_current_round IS NULL OR next_allowed_shot_time IS NULL;

-- 4. Verificar se a atualização funcionou
SELECT 
  id, name, email, gols_current_round, total_goals, plan, 
  team_heart_id, team_defending_id,
  next_allowed_shot_time, boost_expires_at, created_at 
FROM users 
ORDER BY created_at DESC;

-- 5. Criar trigger para garantir valores corretos em novos registros
CREATE OR REPLACE FUNCTION ensure_user_defaults() 
RETURNS TRIGGER AS $$
BEGIN
  -- Garantir que novos usuários tenham valores zerados
  NEW.gols_current_round := COALESCE(NEW.gols_current_round, 0);
  NEW.total_goals := COALESCE(NEW.total_goals, 0);
  NEW.plan := COALESCE(NEW.plan, 'free');
  NEW.next_allowed_shot_time := COALESCE(NEW.next_allowed_shot_time, NOW());
  NEW.boost_expires_at := NEW.boost_expires_at; -- Pode ser NULL
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela users
DROP TRIGGER IF EXISTS trigger_ensure_user_defaults ON users;
CREATE TRIGGER trigger_ensure_user_defaults
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION ensure_user_defaults();

-- 6. Garantir que usuários possam inserir registros
CREATE POLICY IF NOT EXISTS "Allow public inserts to users" 
ON users 
FOR INSERT 
WITH CHECK (true);

-- 7. Garantir que o usuário possa ser atualizado pelo próprio usuário ou por admin
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON users 
FOR UPDATE 
USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- 8. Permitir que usuários vejam seus próprios dados
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
ON users 
FOR SELECT 
USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));