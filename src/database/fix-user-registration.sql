-- Corrigir políticas de RLS para permitir inserção de usuários
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir inserções públicas na tabela users
CREATE POLICY "Allow public inserts to users" ON users 
FOR INSERT WITH CHECK (true);

-- Permitir que usuários vejam e atualizem seus próprios dados
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Trigger para garantir que novos usuários tenham dados zerados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, team_heart_id, team_defending_id, is_admin, plan, gols_current_round, total_goals, next_allowed_shot_time)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    (NEW.raw_user_meta_data->>'team_heart_id')::uuid,
    (NEW.raw_user_meta_data->>'team_defending_id')::uuid,
    false,
    'free',
    0,
    0,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();