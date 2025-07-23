-- Inserir dados iniciais para o sistema
-- Execute após o complete-schema.sql

-- 1. Inserir times brasileiros
INSERT INTO teams (name, primary_color, secondary_color) VALUES
('Flamengo Digital', '#E53935', '#000000'),
('Palmeiras Cyber', '#006437', '#FFFFFF'),
('Corinthians Virtual', '#000000', '#FFFFFF'),
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
ON CONFLICT (name) DO NOTHING;

-- 2. Inserir níveis de gamificação
INSERT INTO levels (level_number, name, min_goals, max_goals, reward_description) VALUES
(1, 'Estreante da Várzea', 0, 9, 'Nenhum prêmio ainda'),
(2, 'Matador da Pelada', 10, 19, 'Sorteio de brinde exclusivo'),
(3, 'Craque da Vila', 20, 49, 'Cupom de boost + 24h'),
(4, 'Artilheiro do Bairro', 50, 99, 'Sorteio R$50 em boost'),
(5, 'Ídolo Local', 100, 199, 'Sorteio de camisa oficial'),
(6, 'Astro Estadual', 200, 399, 'Sorteio de ticket VIP'),
(7, 'Maestro Nacional', 400, 699, 'Gift Card R$100'),
(8, 'Bola de Ouro Regional', 700, 999, 'Sorteio de prêmio exclusivo'),
(9, 'Lenda do Futebol', 1000, 1499, 'Sorteio mensal de camisa'),
(10, 'Imortal das Quatro Linhas', 1500, 999999, 'Sorteio anual de viagem')
ON CONFLICT (level_number) DO NOTHING;

-- 3. Criar campeonato principal
INSERT INTO championships (name, type, status, start_date) VALUES
('Brasileirão Digital 2025', 'league', 'active', NOW())
ON CONFLICT DO NOTHING;

-- 4. Adicionar todos os times ao campeonato
WITH championship AS (
  SELECT id FROM championships WHERE name = 'Brasileirão Digital 2025' LIMIT 1
)
INSERT INTO championship_teams (championship_id, team_id)
SELECT championship.id, teams.id
FROM championship, teams
ON CONFLICT (championship_id, team_id) DO NOTHING;

-- 5. Gerar rodadas do campeonato
DO $$
DECLARE
  championship_id UUID;
  matches_created INTEGER;
BEGIN
  SELECT id INTO championship_id FROM championships WHERE name = 'Brasileirão Digital 2025';
  
  IF championship_id IS NOT NULL THEN
    SELECT generate_league_rounds(championship_id, NOW()) INTO matches_created;
    RAISE NOTICE 'Criadas % partidas para o Brasileirão Digital 2025', matches_created;
  END IF;
END $$;

-- 6. Criar usuário admin
DO $$
DECLARE
  admin_user_id UUID;
  default_team_id UUID;
BEGIN
  -- Buscar primeiro time
  SELECT id INTO default_team_id FROM teams ORDER BY name LIMIT 1;
  
  -- Verificar se usuário admin já existe
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'andrefurtado_cg@hotmail.com';
  
  -- Se não existir, criar
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data
    ) VALUES (
      'andrefurtado_cg@hotmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      jsonb_build_object(
        'name', 'André Furtado',
        'is_admin', true,
        'team_heart_id', default_team_id,
        'team_defending_id', default_team_id
      )
    ) RETURNING id INTO admin_user_id;
  END IF;
  
  -- Inserir/atualizar na tabela users
  INSERT INTO users (
    id, name, email, team_heart_id, team_defending_id, 
    is_admin, plan, gols_current_round, total_goals
  ) VALUES (
    admin_user_id, 'André Furtado', 'andrefurtado_cg@hotmail.com',
    default_team_id, default_team_id, true, 'annual', 0, 0
  ) ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    plan = 'annual',
    team_heart_id = COALESCE(users.team_heart_id, EXCLUDED.team_heart_id),
    team_defending_id = COALESCE(users.team_defending_id, EXCLUDED.team_defending_id);
    
  RAISE NOTICE 'Usuário admin criado/atualizado: %', admin_user_id;
END $$;

-- 7. Verificar dados criados
SELECT 
  (SELECT COUNT(*) FROM teams) as total_teams,
  (SELECT COUNT(*) FROM levels) as total_levels,
  (SELECT COUNT(*) FROM championships) as total_championships,
  (SELECT COUNT(*) FROM rounds) as total_rounds,
  (SELECT COUNT(*) FROM matches) as total_matches,
  (SELECT COUNT(*) FROM users WHERE is_admin = true) as admin_users;

-- 8. Mostrar status do campeonato
SELECT 
  c.name,
  c.type,
  c.status,
  c.current_round,
  c.total_rounds,
  COUNT(ct.team_id) as participating_teams
FROM championships c
LEFT JOIN championship_teams ct ON c.id = ct.championship_id
WHERE c.name = 'Brasileirão Digital 2025'
GROUP BY c.id, c.name, c.type, c.status, c.current_round, c.total_rounds;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE 'Dados iniciais inseridos com sucesso!';
  RAISE NOTICE 'Sistema pronto para uso!';
END $$;