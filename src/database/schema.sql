-- Verificar se o usuário já existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email='andrefurtado@grupodupla.com.br'
  ) THEN
    -- Criar usuário admin se não existir
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data
    )
    VALUES (
      'andrefurtado@grupodupla.com.br',
      crypt('123456', gen_salt('bf')),
      now(),
      jsonb_build_object(
        'name', 'André Furtado',
        'is_admin', true
      )
    );
  END IF;
END $$;

-- Garantir que o usuário seja admin
INSERT INTO public.users (
  id,
  name,
  email,
  is_admin
)
SELECT 
  id,
  raw_user_meta_data->>'name',
  email,
  true
FROM auth.users 
WHERE email='andrefurtado@grupodupla.com.br'
ON CONFLICT (id) 
DO UPDATE SET is_admin=true;

-- Garantir política de RLS para admin
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admin full access" ON public.users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin=true
    )
  );

-- Permitir que usuários vejam seus próprios dados
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);
  
-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Permitir inserção na tabela users
CREATE POLICY IF NOT EXISTS "Allow inserts to users" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Desabilitar confirmação de email no projeto
UPDATE auth.config SET confirm_email=false;