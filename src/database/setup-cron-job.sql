-- Configurar job automático para avançar rodadas
-- Execute este script após criar o schema completo

-- 1. Habilitar extensão pg_cron (deve ser feito pelo admin do Supabase)
-- SELECT cron.schedule('advance-rounds-job', '*/5 * * * *', 'SELECT advance_rounds();');

-- 2. Função para verificar e avançar rodadas manualmente (para testes)
CREATE OR REPLACE FUNCTION check_and_advance_rounds()
RETURNS TABLE (
  championship_name TEXT,
  old_round INTEGER,
  new_round INTEGER,
  status TEXT
) AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Executar função de avanço
  PERFORM advance_rounds();
  
  -- Retornar status dos campeonatos
  RETURN QUERY
  SELECT 
    c.name::TEXT,
    c.current_round - 1,
    c.current_round,
    c.status::TEXT
  FROM championships c
  WHERE c.status IN ('active', 'finished');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para forçar próxima rodada (apenas para testes)
CREATE OR REPLACE FUNCTION force_next_round(championship_name TEXT)
RETURNS JSON AS $$
DECLARE
  championship_id UUID;
  current_round_record RECORD;
  next_round_record RECORD;
BEGIN
  -- Buscar campeonato
  SELECT id INTO championship_id FROM championships WHERE name = championship_name;
  
  IF championship_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Campeonato não encontrado');
  END IF;
  
  -- Buscar rodada atual
  SELECT * INTO current_round_record
  FROM rounds 
  WHERE championship_id = force_next_round.championship_id 
    AND status = 'active'
  ORDER BY round_number DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Nenhuma rodada ativa encontrada');
  END IF;
  
  -- Finalizar rodada atual
  UPDATE rounds SET 
    status = 'finished',
    end_time = NOW()
  WHERE id = current_round_record.id;
  
  UPDATE matches SET status = 'finished' WHERE round_id = current_round_record.id;
  
  -- Buscar próxima rodada
  SELECT * INTO next_round_record
  FROM rounds 
  WHERE championship_id = force_next_round.championship_id 
    AND round_number = current_round_record.round_number + 1
    AND status = 'scheduled';
  
  IF FOUND THEN
    -- Ativar próxima rodada
    UPDATE rounds SET 
      status = 'active',
      start_time = NOW(),
      end_time = NOW() + INTERVAL '24 hours'
    WHERE id = next_round_record.id;
    
    UPDATE matches SET status = 'active' WHERE round_id = next_round_record.id;
    
    -- Zerar gols da rodada atual de todos os usuários
    UPDATE users SET gols_current_round = 0;
    
    -- Atualizar campeonato
    UPDATE championships SET current_round = next_round_record.round_number
    WHERE id = force_next_round.championship_id;
    
    RETURN json_build_object(
      'success', true, 
      'old_round', current_round_record.round_number,
      'new_round', next_round_record.round_number,
      'message', 'Rodada avançada com sucesso'
    );
  ELSE
    -- Finalizar campeonato
    UPDATE championships SET status = 'finished'
    WHERE id = force_next_round.championship_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Campeonato finalizado - não há mais rodadas'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para resetar campeonato (apenas para testes)
CREATE OR REPLACE FUNCTION reset_championship(championship_name TEXT)
RETURNS JSON AS $$
DECLARE
  championship_id UUID;
BEGIN
  -- Buscar campeonato
  SELECT id INTO championship_id FROM championships WHERE name = championship_name;
  
  IF championship_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Campeonato não encontrado');
  END IF;
  
  -- Resetar todas as rodadas
  UPDATE rounds SET 
    status = CASE WHEN round_number = 1 THEN 'active' ELSE 'scheduled' END,
    start_time = NOW() + ((round_number - 1) * INTERVAL '24 hours'),
    end_time = NOW() + (round_number * INTERVAL '24 hours')
  WHERE championship_id = reset_championship.championship_id;
  
  -- Resetar todas as partidas
  UPDATE matches SET 
    status = CASE 
      WHEN round_id IN (SELECT id FROM rounds WHERE championship_id = reset_championship.championship_id AND round_number = 1)
      THEN 'active' 
      ELSE 'scheduled' 
    END,
    score_team_a = 0,
    score_team_b = 0
  WHERE championship_id = reset_championship.championship_id;
  
  -- Resetar campeonato
  UPDATE championships SET 
    status = 'active',
    current_round = 1
  WHERE id = championship_id;
  
  -- Zerar gols de todos os usuários
  UPDATE users SET 
    gols_current_round = 0,
    total_goals = 0,
    next_allowed_shot_time = NOW();
  
  -- Deletar todos os gols registrados
  DELETE FROM goals WHERE match_id IN (
    SELECT id FROM matches WHERE championship_id = championship_id
  );
  
  RETURN json_build_object('success', true, 'message', 'Campeonato resetado com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log de instruções
DO $$
BEGIN
  RAISE NOTICE 'Funções de gerenciamento criadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Comandos úteis:';
  RAISE NOTICE '1. Verificar status: SELECT * FROM check_and_advance_rounds();';
  RAISE NOTICE '2. Forçar próxima rodada: SELECT force_next_round(''Brasileirão Digital 2025'');';
  RAISE NOTICE '3. Resetar campeonato: SELECT reset_championship(''Brasileirão Digital 2025'');';
  RAISE NOTICE '';
  RAISE NOTICE 'Para produção, configure um cron job no Supabase Dashboard';
END $$;