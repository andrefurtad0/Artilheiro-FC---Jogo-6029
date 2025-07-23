-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'andrefurtado@grupodupla.com.br',
  crypt('admin123', gen_salt('bf')), -- Initial password: admin123
  now(),
  jsonb_build_object(
    'name', 'André Furtado',
    'team_heart_id', NULL,
    'team_defending_id', NULL
  )
);

-- Set user as admin
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'andrefurtado@grupodupla.com.br';

-- Create teams (Série A 2025)
INSERT INTO teams (name, primary_color, shield_url) VALUES
-- Times tradicionais
('Flamengo Digital', '#E53935', 'https://i.imgur.com/FlamengoShield.png'),
('Palmeiras Cyber', '#006437', 'https://i.imgur.com/PalmeirasShield.png'),
('Corinthians Virtual', '#000000', 'https://i.imgur.com/CorinthiansShield.png'),
('São Paulo FC Online', '#FF0000', 'https://i.imgur.com/SaoPauloShield.png'),
('Vasco da Gama Net', '#000000', 'https://i.imgur.com/VascoShield.png'),
('Santos FC Digital', '#FFFFFF', 'https://i.imgur.com/SantosShield.png'),
('Grêmio Conectado', '#0B83C5', 'https://i.imgur.com/GremioShield.png'),
('Internacional Web', '#FF0000', 'https://i.imgur.com/InterShield.png'),
('Fluminense Tech', '#9F022F', 'https://i.imgur.com/FluminenseShield.png'),
('Botafogo Cloud', '#000000', 'https://i.imgur.com/BotafogoShield.png'),
('Atlético-MG Online', '#000000', 'https://i.imgur.com/AtleticoMGShield.png'),
('Cruzeiro Digital', '#0B2B7B', 'https://i.imgur.com/CruzeiroShield.png'),
('Athletico-PR Tech', '#FF0000', 'https://i.imgur.com/AthleticoPRShield.png'),
('Red Bull Bragantino VR', '#FF0000', 'https://i.imgur.com/BragantinoShield.png'),
('Bahia Virtual', '#0000FF', 'https://i.imgur.com/BahiaShield.png'),
('Fortaleza E-Sports', '#0000FF', 'https://i.imgur.com/FortalezaShield.png'),
('Cuiabá Digital', '#FFD700', 'https://i.imgur.com/CuiabaShield.png'),
('Vitória Online', '#FF0000', 'https://i.imgur.com/VitoriaShield.png'),
('Sport Web', '#FF0000', 'https://i.imgur.com/SportShield.png'),
('Atlético-GO Tech', '#FF0000', 'https://i.imgur.com/AtleticoGOShield.png');

-- Create first championship
INSERT INTO championships (name, type, status) VALUES
('Brasileirão Digital 2025', 'league', 'active');

-- Add all teams to championship
WITH championship AS (
  SELECT id FROM championships WHERE name = 'Brasileirão Digital 2025'
)
INSERT INTO championship_teams (championship_id, team_id)
SELECT championship.id, teams.id
FROM championship, teams;

-- Generate initial rounds for the championship
SELECT generate_league_rounds(
  (SELECT id FROM championships WHERE name = 'Brasileirão Digital 2025'),
  NOW()
);

-- Create initial levels (if not already created)
INSERT INTO levels (level_number, name, min_goals, max_goals, reward_description)
SELECT * FROM (VALUES
  (1, 'Estreante da Várzea', 0, 9, 'Nenhum prêmio ainda'),
  (2, 'Matador da Pelada', 10, 19, 'Sorteio de brinde exclusivo'),
  (3, 'Craque da Vila', 20, 49, 'Cupom de boost'),
  (4, 'Artilheiro do Bairro', 50, 99, 'Sorteio R$50 em boost'),
  (5, 'Ídolo Local', 100, 199, 'Sorteio de camisa'),
  (6, 'Astro Estadual', 200, 399, 'Sorteio de ticket'),
  (7, 'Maestro Nacional', 400, 699, 'Gift Card R$100'),
  (8, 'Bola de Ouro Regional', 700, 999, 'Sorteio de prêmio exclusivo'),
  (9, 'Lenda do Futebol', 1000, 1499, 'Sorteio mensal de camisa'),
  (10, 'Imortal das Quatro Linhas', 1500, 999999, 'Sorteio anual de viagem')
) AS v(level_number, name, min_goals, max_goals, reward_description)
ON CONFLICT (level_number) DO NOTHING;