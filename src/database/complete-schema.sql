-- Schema completo e corrigido para o sistema de futebol digital
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tabelas na ordem correta (dependências)

-- TEAMS: Times fictícios
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  shield_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAMPIONSHIPS: Campeonatos (Liga ou Copa)
CREATE TABLE IF NOT EXISTS championships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('league', 'cup')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished', 'scheduled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  current_round INTEGER DEFAULT 1,
  total_rounds INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHAMPIONSHIP_TEAMS: Times participantes de cada campeonato
CREATE TABLE IF NOT EXISTS championship_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(championship_id, team_id)
);

-- ROUNDS: Rodadas de um campeonato
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(championship_id, round_number)
);

-- MATCHES: Partidas individuais dentro de uma rodada
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  team_a_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  score_team_a INTEGER DEFAULT 0,
  score_team_b INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (team_a_id != team_b_id)
);

-- LEVELS: Níveis de gamificação
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_number INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  min_goals INTEGER NOT NULL,
  max_goals INTEGER NOT NULL,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_goals_range CHECK (min_goals <= max_goals)
);

-- USERS: Usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  team_heart_id UUID REFERENCES teams(id),
  team_defending_id UUID REFERENCES teams(id),
  is_admin BOOLEAN DEFAULT FALSE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'annual')),
  gols_current_round INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  next_allowed_shot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  boost_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GOALS: Registro de gols marcados pelos usuários
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_team_defending ON users(team_defending_id);
CREATE INDEX IF NOT EXISTS idx_users_team_heart ON users(team_heart_id);
CREATE INDEX IF NOT EXISTS idx_users_gols_current_round ON users(gols_current_round);
CREATE INDEX IF NOT EXISTS idx_users_total_goals ON users(total_goals);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_match_id ON goals(match_id);
CREATE INDEX IF NOT EXISTS idx_goals_round_id ON goals(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_round_id ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_rounds_championship ON rounds(championship_id);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_rounds_time ON rounds(start_time, end_time);

-- 4. Habilitar RLS em todas as tabelas
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE championship_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS básicas

-- Teams: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Admin can manage teams" ON teams FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Championships: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view championships" ON championships FOR SELECT USING (true);
CREATE POLICY "Admin can manage championships" ON championships FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Championship Teams: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view championship_teams" ON championship_teams FOR SELECT USING (true);
CREATE POLICY "Admin can manage championship_teams" ON championship_teams FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Rounds: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view rounds" ON rounds FOR SELECT USING (true);
CREATE POLICY "Admin can manage rounds" ON rounds FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Matches: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Admin can manage matches" ON matches FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Levels: Todos podem ver, apenas admins podem modificar
CREATE POLICY "Everyone can view levels" ON levels FOR SELECT USING (true);
CREATE POLICY "Admin can manage levels" ON levels FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- Users: Usuários podem ver próprio perfil, admins podem ver todos
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (
  auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (
  auth.uid() = id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);
CREATE POLICY "Allow user registration" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals: Usuários podem ver próprios gols, admins podem ver todos
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Funções auxiliares

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_championships_updated_at BEFORE UPDATE ON championships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Função para criar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_team_id UUID;
BEGIN
  -- Buscar primeiro time disponível
  SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
  
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
    current_level,
    next_allowed_shot_time,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'team_heart_id')::UUID, default_team_id),
    COALESCE((NEW.raw_user_meta_data->>'team_defending_id')::UUID, default_team_id),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, false),
    'free',
    0,
    0,
    1,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
    team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Função para gerar rodadas de liga (todos x todos)
CREATE OR REPLACE FUNCTION generate_league_rounds(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  total_teams INTEGER;
  rounds_to_create INTEGER;
  current_round INTEGER := 1;
  matches_created INTEGER := 0;
  round_id UUID;
  i INTEGER;
  j INTEGER;
BEGIN
  -- Buscar times do campeonato
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM championship_teams
  WHERE championship_teams.championship_id = generate_league_rounds.championship_id;
  
  total_teams := array_length(team_ids, 1);
  
  IF total_teams IS NULL OR total_teams < 2 THEN
    RAISE EXCEPTION 'Campeonato deve ter pelo menos 2 times';
  END IF;
  
  -- Calcular número de rodadas (cada time joga contra todos os outros)
  rounds_to_create := total_teams - 1;
  
  -- Atualizar campeonato com número total de rodadas
  UPDATE championships 
  SET total_rounds = rounds_to_create 
  WHERE id = championship_id;
  
  -- Gerar rodadas
  FOR round_num IN 1..rounds_to_create LOOP
    -- Criar rodada
    INSERT INTO rounds (
      championship_id,
      round_number,
      start_time,
      end_time,
      status
    ) VALUES (
      championship_id,
      round_num,
      start_date + ((round_num - 1) * INTERVAL '24 hours'),
      start_date + (round_num * INTERVAL '24 hours'),
      CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END
    ) RETURNING id INTO round_id;
    
    -- Gerar partidas da rodada (algoritmo round-robin)
    FOR i IN 1..total_teams LOOP
      FOR j IN (i+1)..total_teams LOOP
        -- Inserir partida
        INSERT INTO matches (
          round_id,
          championship_id,
          team_a_id,
          team_b_id,
          status
        ) VALUES (
          round_id,
          championship_id,
          team_ids[i],
          team_ids[j],
          CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END
        );
        
        matches_created := matches_created + 1;
      END LOOP;
    END LOOP;
  END LOOP;
  
  RETURN matches_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para processar chute do usuário
CREATE OR REPLACE FUNCTION process_user_shot(
  p_user_id UUID,
  p_match_id UUID
) RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  match_record RECORD;
  round_record RECORD;
  cooldown_minutes INTEGER;
  next_shot_time TIMESTAMP WITH TIME ZONE;
  user_team_id UUID;
  goal_id UUID;
  result JSON;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO user_record FROM users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Verificar se pode chutar
  IF user_record.next_allowed_shot_time > NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Ainda em cooldown');
  END IF;
  
  -- Buscar dados da partida
  SELECT * INTO match_record FROM matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Partida não encontrada');
  END IF;
  
  -- Verificar se a partida está ativa
  IF match_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Partida não está ativa');
  END IF;
  
  -- Buscar dados da rodada
  SELECT * INTO round_record FROM rounds WHERE id = match_record.round_id;
  
  -- Verificar se a rodada está ativa
  IF round_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Rodada não está ativa');
  END IF;
  
  -- Verificar se o usuário defende um dos times da partida
  IF user_record.team_defending_id NOT IN (match_record.team_a_id, match_record.team_b_id) THEN
    RETURN json_build_object('success', false, 'error', 'Você não defende nenhum dos times desta partida');
  END IF;
  
  user_team_id := user_record.team_defending_id;
  
  -- Determinar cooldown baseado no plano
  cooldown_minutes := CASE 
    WHEN user_record.boost_expires_at > NOW() THEN 5
    WHEN user_record.plan = 'free' THEN 20
    ELSE 10
  END;
  
  next_shot_time := NOW() + (cooldown_minutes || ' minutes')::INTERVAL;
  
  -- Registrar o gol
  INSERT INTO goals (
    user_id,
    match_id,
    round_id,
    team_id,
    scored_at
  ) VALUES (
    p_user_id,
    p_match_id,
    match_record.round_id,
    user_team_id,
    NOW()
  ) RETURNING id INTO goal_id;
  
  -- Atualizar estatísticas do usuário
  UPDATE users SET
    gols_current_round = gols_current_round + 1,
    total_goals = total_goals + 1,
    next_allowed_shot_time = next_shot_time,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Atualizar placar da partida
  IF user_team_id = match_record.team_a_id THEN
    UPDATE matches SET score_team_a = score_team_a + 1 WHERE id = p_match_id;
  ELSE
    UPDATE matches SET score_team_b = score_team_b + 1 WHERE id = p_match_id;
  END IF;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'goal_id', goal_id,
    'next_shot_time', next_shot_time,
    'cooldown_minutes', cooldown_minutes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para avançar rodadas automaticamente
CREATE OR REPLACE FUNCTION advance_rounds() RETURNS INTEGER AS $$
DECLARE
  rounds_advanced INTEGER := 0;
  round_record RECORD;
  next_round_record RECORD;
BEGIN
  -- Buscar rodadas que devem ser finalizadas
  FOR round_record IN 
    SELECT * FROM rounds 
    WHERE status = 'active' AND end_time <= NOW()
  LOOP
    -- Finalizar rodada atual
    UPDATE rounds SET status = 'finished' WHERE id = round_record.id;
    UPDATE matches SET status = 'finished' WHERE round_id = round_record.id;
    
    -- Buscar próxima rodada
    SELECT * INTO next_round_record
    FROM rounds 
    WHERE championship_id = round_record.championship_id 
      AND round_number = round_record.round_number + 1
      AND status = 'scheduled';
    
    -- Ativar próxima rodada se existir
    IF FOUND THEN
      UPDATE rounds SET 
        status = 'active',
        start_time = NOW(),
        end_time = NOW() + INTERVAL '24 hours'
      WHERE id = next_round_record.id;
      
      UPDATE matches SET status = 'active' WHERE round_id = next_round_record.id;
      
      -- Atualizar rodada atual do campeonato
      UPDATE championships SET current_round = next_round_record.round_number
      WHERE id = round_record.championship_id;
    ELSE
      -- Finalizar campeonato se não há mais rodadas
      UPDATE championships SET status = 'finished'
      WHERE id = round_record.championship_id;
    END IF;
    
    rounds_advanced := rounds_advanced + 1;
  END LOOP;
  
  RETURN rounds_advanced;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Schema completo criado com sucesso!';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Executar insert-initial-data.sql';
  RAISE NOTICE '2. Configurar cron job para advance_rounds()';
END $$;