-- Add admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create admin user (replace with your email)
UPDATE users SET is_admin = TRUE WHERE email = 'admin@futeboldigital.com';

-- Create policy for admin access
CREATE POLICY "Admin can manage all users" ON users
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

-- Allow admins to manage all tables
CREATE POLICY "Admin can manage teams" ON teams
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can manage championships" ON championships
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can manage championship_teams" ON championship_teams
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can manage rounds" ON rounds
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

CREATE POLICY "Admin can manage levels" ON levels
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );

-- Function to generate league rounds (all vs all)
CREATE OR REPLACE FUNCTION generate_league_rounds(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  team_a UUID;
  team_b UUID;
  round_start TIMESTAMP WITH TIME ZONE;
  round_end TIMESTAMP WITH TIME ZONE;
  rounds_created INTEGER := 0;
  i INTEGER;
  j INTEGER;
BEGIN
  -- Get all teams for this championship
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM championship_teams
  WHERE championship_teams.championship_id = generate_league_rounds.championship_id;

  -- Generate rounds for each team vs each other team
  FOR i IN 1..array_length(team_ids, 1) LOOP
    FOR j IN (i+1)..array_length(team_ids, 1) LOOP
      team_a := team_ids[i];
      team_b := team_ids[j];
      
      -- Calculate round times (24 hours each, starting from provided date)
      round_start := start_date + (rounds_created * INTERVAL '1 day');
      round_end := round_start + INTERVAL '24 hours';
      
      -- Insert round
      INSERT INTO rounds (
        championship_id,
        team_a_id,
        team_b_id,
        start_time,
        end_time,
        status
      ) VALUES (
        generate_league_rounds.championship_id,
        team_a,
        team_b,
        round_start,
        round_end,
        'scheduled'
      );
      
      rounds_created := rounds_created + 1;
    END LOOP;
  END LOOP;
  
  RETURN rounds_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate cup rounds (knockout)
CREATE OR REPLACE FUNCTION generate_cup_rounds(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  team_count INTEGER;
  round_number INTEGER := 1;
  round_start TIMESTAMP WITH TIME ZONE;
  round_end TIMESTAMP WITH TIME ZONE;
  rounds_created INTEGER := 0;
  i INTEGER;
BEGIN
  -- Get all teams for this championship
  SELECT ARRAY_AGG(team_id) INTO team_ids
  FROM championship_teams
  WHERE championship_teams.championship_id = generate_cup_rounds.championship_id;
  
  team_count := array_length(team_ids, 1);
  
  -- Generate first round (pair teams randomly)
  FOR i IN 1..team_count BY 2 LOOP
    IF i + 1 <= team_count THEN
      round_start := start_date + ((rounds_created) * INTERVAL '1 day');
      round_end := round_start + INTERVAL '24 hours';
      
      INSERT INTO rounds (
        championship_id,
        team_a_id,
        team_b_id,
        start_time,
        end_time,
        status
      ) VALUES (
        generate_cup_rounds.championship_id,
        team_ids[i],
        team_ids[i + 1],
        round_start,
        round_end,
        'scheduled'
      );
      
      rounds_created := rounds_created + 1;
    END IF;
  END LOOP;
  
  RETURN rounds_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;