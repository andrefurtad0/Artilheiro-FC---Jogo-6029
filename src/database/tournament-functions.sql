-- Funções para geração de jogos de campeonatos (ligas e copas)
-- Execute este script no SQL Editor do Supabase

-- 1. Função para gerar jogos de liga (pontos corridos em 2 turnos)
CREATE OR REPLACE FUNCTION generate_league_tournament(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  total_teams INTEGER;
  total_rounds INTEGER;
  matches_per_round INTEGER;
  total_matches INTEGER := 0;
  round_id UUID;
  match_date TIMESTAMP WITH TIME ZONE;
  i INTEGER;
  j INTEGER;
  k INTEGER;
  round_num INTEGER := 1;
  team_a UUID;
  team_b UUID;
BEGIN
  -- Buscar times do campeonato
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM championship_teams
  WHERE championship_id = generate_league_tournament.championship_id;
  
  total_teams := array_length(team_ids, 1);
  
  IF total_teams IS NULL OR total_teams < 4 THEN
    RAISE EXCEPTION 'Campeonato deve ter pelo menos 4 times';
  END IF;
  
  -- Verificar se é número par de times (para evitar folga)
  IF total_teams % 2 != 0 THEN
    RAISE EXCEPTION 'Número de times deve ser par para liga de pontos corridos';
  END IF;
  
  -- Cálculos para liga de pontos corridos
  -- Turno único: cada time joga contra todos os outros uma vez
  -- Total de rodadas em um turno: (n-1) onde n é o número de times
  -- Total de jogos em um turno: n*(n-1)/2
  -- Para dois turnos, multiplicamos por 2
  
  total_rounds := (total_teams - 1) * 2; -- dois turnos
  matches_per_round := total_teams / 2;  -- jogos por rodada
  
  -- Atualizar campeonato com número total de rodadas
  UPDATE championships 
  SET total_rounds = total_rounds 
  WHERE id = championship_id;
  
  -- Algoritmo Round-Robin para gerar os jogos do primeiro turno
  -- Primeiro turno: rodadas 1 até (total_teams - 1)
  FOR round_num IN 1..(total_teams - 1) LOOP
    -- Criar rodada
    match_date := start_date + ((round_num - 1) * INTERVAL '7 days');
    
    INSERT INTO rounds (
      championship_id,
      round_number,
      start_time,
      end_time,
      status
    ) VALUES (
      championship_id,
      round_num,
      match_date,
      match_date + INTERVAL '24 hours',
      CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END
    ) RETURNING id INTO round_id;
    
    -- Gerar jogos da rodada usando algoritmo circle
    FOR k IN 0..(matches_per_round - 1) LOOP
      -- Em cada rodada, o time 0 joga com um diferente
      -- Os outros jogam em pares espelhados
      IF k = 0 THEN
        team_a := team_ids[1];
        team_b := team_ids[(round_num % (total_teams - 1)) + 2];
      ELSE
        team_a := team_ids[((round_num + k - 1) % (total_teams - 1)) + 2];
        team_b := team_ids[((round_num - k + total_teams - 1) % (total_teams - 1)) + 2];
      END IF;
      
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
        team_a,
        team_b,
        CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END
      );
      
      total_matches := total_matches + 1;
    END LOOP;
  END LOOP;
  
  -- Segundo turno: rodadas (total_teams) até (total_rounds)
  -- Invertemos os mandos de campo
  FOR round_num IN total_teams..total_rounds LOOP
    -- Criar rodada para o segundo turno
    match_date := start_date + ((round_num - 1) * INTERVAL '7 days');
    
    INSERT INTO rounds (
      championship_id,
      round_number,
      start_time,
      end_time,
      status
    ) VALUES (
      championship_id,
      round_num,
      match_date,
      match_date + INTERVAL '24 hours',
      'scheduled'
    ) RETURNING id INTO round_id;
    
    -- Buscar partidas do turno correspondente
    -- e criar as mesmas com mandos invertidos
    FOR team_a, team_b IN
      SELECT team_b_id, team_a_id
      FROM matches
      WHERE championship_id = generate_league_tournament.championship_id
        AND round_id IN (
          SELECT id 
          FROM rounds 
          WHERE championship_id = generate_league_tournament.championship_id
            AND round_number = (round_num - total_teams + 1)
        )
    LOOP
      -- Inserir partida com mandos invertidos
      INSERT INTO matches (
        round_id,
        championship_id,
        team_a_id,
        team_b_id,
        status
      ) VALUES (
        round_id,
        championship_id,
        team_a,
        team_b,
        'scheduled'
      );
      
      total_matches := total_matches + 1;
    END LOOP;
  END LOOP;
  
  RETURN total_matches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para gerar jogos de copa (mata-mata com ida e volta)
CREATE OR REPLACE FUNCTION generate_cup_tournament(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  total_teams INTEGER;
  total_rounds INTEGER;
  total_matches INTEGER := 0;
  round_id UUID;
  round_id_return UUID;
  match_date TIMESTAMP WITH TIME ZONE;
  return_match_date TIMESTAMP WITH TIME ZONE;
  i INTEGER;
  round_num INTEGER := 1;
  matches_in_round INTEGER;
  team_a UUID;
  team_b UUID;
BEGIN
  -- Buscar times do campeonato
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM championship_teams
  WHERE championship_id = generate_cup_tournament.championship_id;
  
  total_teams := array_length(team_ids, 1);
  
  IF total_teams IS NULL THEN
    RAISE EXCEPTION 'Nenhum time cadastrado no campeonato';
  END IF;
  
  -- Verificar se o número de times é válido para copa (8 ou 16)
  IF total_teams != 8 AND total_teams != 16 THEN
    RAISE EXCEPTION 'Copas devem ter 8 ou 16 times';
  END IF;
  
  -- Calcular número de fases (rodadas)
  -- Para 8 times: 3 fases (quartas, semi, final) = log2(8) = 3
  -- Para 16 times: 4 fases (oitavas, quartas, semi, final) = log2(16) = 4
  total_rounds := log(2, total_teams);
  
  -- Atualizar campeonato com número total de rodadas
  UPDATE championships 
  SET total_rounds = total_rounds * 2 -- Multiplicado por 2 (ida e volta)
  WHERE id = championship_id;
  
  -- Embaralhar os times para sorteio
  -- Isso cria um array com os índices embaralhados
  team_ids := (SELECT array_agg(team_id) 
               FROM (SELECT team_id 
                     FROM championship_teams 
                     WHERE championship_id = generate_cup_tournament.championship_id
                     ORDER BY random()) AS shuffled);
  
  -- Criar jogos de cada fase
  matches_in_round := total_teams / 2;
  
  -- Loop para cada fase (quartas, semi, final)
  FOR round_num IN 1..total_rounds LOOP
    -- Datas dos jogos de ida e volta
    match_date := start_date + ((round_num * 2 - 2) * INTERVAL '7 days');
    return_match_date := start_date + ((round_num * 2 - 1) * INTERVAL '7 days');
    
    -- Criar rodada de ida
    INSERT INTO rounds (
      championship_id,
      round_number,
      start_time,
      end_time,
      status
    ) VALUES (
      championship_id,
      round_num * 2 - 1, -- Rodadas ímpares são jogos de ida
      match_date,
      match_date + INTERVAL '24 hours',
      CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END
    ) RETURNING id INTO round_id;
    
    -- Criar rodada de volta
    INSERT INTO rounds (
      championship_id,
      round_number,
      start_time,
      end_time,
      status
    ) VALUES (
      championship_id,
      round_num * 2, -- Rodadas pares são jogos de volta
      return_match_date,
      return_match_date + INTERVAL '24 hours',
      'scheduled'
    ) RETURNING id INTO round_id_return;
    
    -- Criar jogos da fase atual
    FOR i IN 0..(matches_in_round - 1) LOOP
      IF round_num = 1 THEN
        -- Primeira fase: times definidos pelo sorteio inicial
        team_a := team_ids[i * 2 + 1];
        team_b := team_ids[i * 2 + 2];
      ELSE
        -- Fases seguintes: os times serão definidos pelos vencedores das fases anteriores
        -- Aqui usamos NULL para indicar "a definir" - serão atualizados após os jogos
        team_a := NULL;
        team_b := NULL;
      END IF;
      
      -- Inserir jogo de ida
      INSERT INTO matches (
        round_id,
        championship_id,
        team_a_id,
        team_b_id,
        status,
        match_number -- Usamos para rastrear confrontos entre fases
      ) VALUES (
        round_id,
        championship_id,
        team_a,
        team_b,
        CASE WHEN round_num = 1 THEN 'active' ELSE 'scheduled' END,
        i + 1
      );
      
      -- Inserir jogo de volta (mandos invertidos)
      INSERT INTO matches (
        round_id,
        championship_id,
        team_a_id,
        team_b_id,
        status,
        match_number -- Mesmo número do jogo de ida para identificar o confronto
      ) VALUES (
        round_id_return,
        championship_id,
        team_b,
        team_a,
        'scheduled',
        i + 1
      );
      
      total_matches := total_matches + 2;
    END LOOP;
    
    -- Próxima fase tem metade dos jogos
    matches_in_round := matches_in_round / 2;
  END LOOP;
  
  RETURN total_matches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para processar o avanço de fase em copas
CREATE OR REPLACE FUNCTION advance_cup_phase(championship_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_round_num INTEGER;
  next_round_record RECORD;
  match_record RECORD;
  total_updated INTEGER := 0;
  team_a_aggregate INTEGER;
  team_b_aggregate INTEGER;
  winner_team UUID;
  next_match_number INTEGER;
  is_team_a BOOLEAN;
BEGIN
  -- Verificar campeonato
  SELECT current_round INTO current_round_num
  FROM championships
  WHERE id = championship_id AND type = 'cup';
  
  IF NOT FOUND OR current_round_num IS NULL THEN
    RAISE EXCEPTION 'Campeonato de copa não encontrado ou inválido';
  END IF;
  
  -- Só processa se a rodada atual for par (volta)
  IF current_round_num % 2 != 0 THEN
    RETURN 0; -- Não é uma rodada de volta, não processa
  END IF;
  
  -- Buscar próxima rodada
  SELECT * INTO next_round_record
  FROM rounds 
  WHERE championship_id = advance_cup_phase.championship_id 
    AND round_number = current_round_num + 1;
  
  -- Se não houver próxima rodada, é o final
  IF NOT FOUND THEN
    RETURN 0; -- Final do campeonato
  END IF;
  
  -- Para cada confronto da rodada atual (volta)
  FOR match_record IN 
    SELECT 
      m.id, 
      m.match_number, 
      m.team_a_id, 
      m.team_b_id, 
      m.score_team_a, 
      m.score_team_b,
      ida.score_team_a as ida_score_a,
      ida.score_team_b as ida_score_b
    FROM matches m
    JOIN rounds r ON m.round_id = r.id
    JOIN matches ida ON ida.match_number = m.match_number
    JOIN rounds r_ida ON ida.round_id = r_ida.id
    WHERE r.championship_id = advance_cup_phase.championship_id
      AND r.round_number = current_round_num
      AND r_ida.round_number = current_round_num - 1
      AND r_ida.championship_id = advance_cup_phase.championship_id
  LOOP
    -- Calcular placar agregado
    team_a_aggregate := match_record.ida_score_b + match_record.score_team_a;
    team_b_aggregate := match_record.ida_score_a + match_record.score_team_b;
    
    -- Determinar vencedor
    IF team_a_aggregate > team_b_aggregate THEN
      winner_team := match_record.team_a_id;
    ELSIF team_b_aggregate > team_a_aggregate THEN
      winner_team := match_record.team_b_id;
    ELSE
      -- Em caso de empate, considerar gols fora
      IF match_record.score_team_a > match_record.ida_score_a THEN
        winner_team := match_record.team_a_id;
      ELSIF match_record.ida_score_a > match_record.score_team_a THEN
        winner_team := match_record.team_b_id;
      ELSE
        -- Ainda empatado, escolher aleatoriamente (simular pênaltis)
        IF random() > 0.5 THEN
          winner_team := match_record.team_a_id;
        ELSE
          winner_team := match_record.team_b_id;
        END IF;
      END IF;
    END IF;
    
    -- Determinar para qual jogo da próxima fase esse time vai
    next_match_number := CEIL(match_record.match_number::float / 2);
    
    -- Determinar se será time A ou B no próximo jogo
    is_team_a := (match_record.match_number % 2 != 0);
    
    -- Atualizar jogos da próxima fase (ida e volta)
    IF is_team_a THEN
      -- Atualizar jogo de ida
      UPDATE matches 
      SET team_a_id = winner_team
      FROM rounds
      WHERE matches.round_id = rounds.id
        AND rounds.championship_id = advance_cup_phase.championship_id
        AND rounds.round_number = current_round_num + 1
        AND matches.match_number = next_match_number;
        
      -- Atualizar jogo de volta
      UPDATE matches 
      SET team_b_id = winner_team
      FROM rounds
      WHERE matches.round_id = rounds.id
        AND rounds.championship_id = advance_cup_phase.championship_id
        AND rounds.round_number = current_round_num + 2
        AND matches.match_number = next_match_number;
    ELSE
      -- Atualizar jogo de ida
      UPDATE matches 
      SET team_b_id = winner_team
      FROM rounds
      WHERE matches.round_id = rounds.id
        AND rounds.championship_id = advance_cup_phase.championship_id
        AND rounds.round_number = current_round_num + 1
        AND matches.match_number = next_match_number;
        
      -- Atualizar jogo de volta
      UPDATE matches 
      SET team_a_id = winner_team
      FROM rounds
      WHERE matches.round_id = rounds.id
        AND rounds.championship_id = advance_cup_phase.championship_id
        AND rounds.round_number = current_round_num + 2
        AND matches.match_number = next_match_number;
    END IF;
    
    total_updated := total_updated + 1;
  END LOOP;
  
  RETURN total_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Modificar a função advance_rounds para lidar com copas
CREATE OR REPLACE FUNCTION advance_rounds() RETURNS INTEGER AS $$
DECLARE
  rounds_advanced INTEGER := 0;
  round_record RECORD;
  next_round_record RECORD;
  championship_record RECORD;
BEGIN
  -- Buscar rodadas que devem ser finalizadas
  FOR round_record IN 
    SELECT r.*, c.type AS championship_type
    FROM rounds r
    JOIN championships c ON r.championship_id = c.id
    WHERE r.status = 'active' AND r.end_time <= NOW()
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
    
    -- Atualizar campeonato
    UPDATE championships 
    SET current_round = round_record.round_number
    WHERE id = round_record.championship_id;
    
    -- Se for campeonato de copa e rodada par (volta), processar classificação
    IF round_record.championship_type = 'cup' AND round_record.round_number % 2 = 0 THEN
      -- Processar classificados para próxima fase
      PERFORM advance_cup_phase(round_record.championship_id);
    END IF;
    
    -- Ativar próxima rodada se existir
    IF FOUND THEN
      UPDATE rounds SET 
        status = 'active',
        start_time = NOW(),
        end_time = NOW() + INTERVAL '24 hours'
      WHERE id = next_round_record.id;
      
      UPDATE matches SET status = 'active' WHERE round_id = next_round_record.id;
      
      -- Atualizar rodada atual do campeonato
      UPDATE championships 
      SET current_round = next_round_record.round_number
      WHERE id = round_record.championship_id;
      
      -- Zerar gols da rodada atual para todos os usuários
      UPDATE users SET gols_current_round = 0;
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

-- 5. Modificação na tabela matches para suportar copas
DO $$
BEGIN
  -- Adicionar coluna match_number se não existir
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'matches' 
    AND column_name = 'match_number'
  ) THEN
    ALTER TABLE matches ADD COLUMN match_number INTEGER;
  END IF;
END
$$;

-- Função auxiliar para testar geração de torneios
CREATE OR REPLACE FUNCTION test_tournament_generation(
  championship_name TEXT,
  tournament_type TEXT,
  num_teams INTEGER
) RETURNS JSON AS $$
DECLARE
  championship_id UUID;
  teams_needed INTEGER;
  teams_created INTEGER := 0;
  team_id UUID;
  team_name TEXT;
  team_color TEXT;
  matches_created INTEGER;
  result JSON;
BEGIN
  -- Validar parâmetros
  IF tournament_type NOT IN ('league', 'cup') THEN
    RETURN json_build_object('success', false, 'error', 'Tipo de torneio deve ser league ou cup');
  END IF;
  
  IF tournament_type = 'league' AND num_teams NOT IN (10, 20) THEN
    RETURN json_build_object('success', false, 'error', 'Ligas devem ter 10 ou 20 times');
  END IF;
  
  IF tournament_type = 'cup' AND num_teams NOT IN (8, 16) THEN
    RETURN json_build_object('success', false, 'error', 'Copas devem ter 8 ou 16 times');
  END IF;
  
  -- Criar campeonato
  INSERT INTO championships (name, type, status)
  VALUES (championship_name, tournament_type, 'active')
  RETURNING id INTO championship_id;
  
  -- Verificar times existentes
  SELECT COUNT(*) INTO teams_created FROM teams;
  
  -- Criar times se não houver suficientes
  teams_needed := num_teams - teams_created;
  
  IF teams_needed > 0 THEN
    FOR i IN 1..teams_needed LOOP
      team_name := 'Time Teste ' || (teams_created + i);
      team_color := '#' || lpad(to_hex((random() * 16777215)::int), 6, '0');
      
      INSERT INTO teams (name, primary_color)
      VALUES (team_name, team_color)
      RETURNING id INTO team_id;
      
      -- Adicionar ao campeonato
      INSERT INTO championship_teams (championship_id, team_id)
      VALUES (championship_id, team_id);
    END LOOP;
  END IF;
  
  -- Adicionar times existentes ao campeonato se necessário
  INSERT INTO championship_teams (championship_id, team_id)
  SELECT championship_id, id FROM teams
  WHERE id NOT IN (
    SELECT team_id FROM championship_teams WHERE championship_id = test_tournament_generation.championship_id
  )
  LIMIT num_teams - (SELECT COUNT(*) FROM championship_teams WHERE championship_id = test_tournament_generation.championship_id);
  
  -- Gerar jogos de acordo com o tipo
  IF tournament_type = 'league' THEN
    SELECT generate_league_tournament(championship_id) INTO matches_created;
  ELSE -- cup
    SELECT generate_cup_tournament(championship_id) INTO matches_created;
  END IF;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'championship_id', championship_id,
    'matches_created', matches_created,
    'teams_count', num_teams,
    'message', 'Torneio ' || tournament_type || ' criado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Funções de geração de torneios criadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Comandos para teste:';
  RAISE NOTICE '1. Criar liga com 10 times: SELECT test_tournament_generation(''Liga Teste 10'', ''league'', 10);';
  RAISE NOTICE '2. Criar liga com 20 times: SELECT test_tournament_generation(''Liga Teste 20'', ''league'', 20);';
  RAISE NOTICE '3. Criar copa com 8 times: SELECT test_tournament_generation(''Copa Teste 8'', ''cup'', 8);';
  RAISE NOTICE '4. Criar copa com 16 times: SELECT test_tournament_generation(''Copa Teste 16'', ''cup'', 16);';
END $$;