import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import Logo from '../ui/Logo';

const {FiBook, FiCode, FiDatabase, FiLayers, FiSettings, FiCheck, FiX, FiChevronRight, FiChevronDown, FiGitBranch, FiPackage, FiUsers, FiShield, FiZap} = FiIcons;

const DocumentationPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const sections = [
    {id: 'overview', label: 'Visão Geral', icon: FiBook},
    {id: 'architecture', label: 'Arquitetura', icon: FiLayers},
    {id: 'components', label: 'Componentes', icon: FiCode},
    {id: 'database', label: 'Banco de Dados', icon: FiDatabase},
    {id: 'hooks', label: 'Hooks & Utils', icon: FiSettings},
    {id: 'features', label: 'Funcionalidades', icon: FiCheck},
    {id: 'missing', label: 'Pendências', icon: FiX},
    {id: 'deployment', label: 'Deploy', icon: FiPackage}
  ];

  const ExpandableSection = ({title, children, defaultExpanded = false}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    return (
      <div className="border border-gray-700 rounded-lg mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <SafeIcon icon={isExpanded ? FiChevronDown : FiChevronRight} className="text-gray-400" />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{height: 0, opacity: 0}}
              animate={{height: 'auto', opacity: 1}}
              exit={{height: 0, opacity: 0}}
              transition={{duration: 0.3}}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-gray-700">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CodeBlock = ({children, language = 'javascript'}) => (
    <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
      <pre className="text-sm text-gray-300">
        <code>{children}</code>
      </pre>
    </div>
  );

  const StatusBadge = ({status}) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      missing: 'bg-red-100 text-red-800',
      demo: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      completed: '✅ Completo',
      partial: '⚠️ Parcial',
      missing: '❌ Faltando',
      demo: '🎮 Demo'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">⚽ Futebol Digital - Documentação Técnica</h2>
              <p className="text-gray-300 mb-6">
                Sistema gamificado de futebol digital onde usuários escolhem times, participam de partidas de 24h e competem em rankings.
              </p>
            </div>

            <ExpandableSection title="🎯 Objetivo do Sistema" defaultExpanded={true}>
              <ul className="space-y-2 text-gray-300">
                <li>• Criar uma experiência gamificada de futebol digital</li>
                <li>• Permitir que usuários "chutem" para seus times em intervalos regulares</li>
                <li>• Implementar sistema de níveis e progressão</li>
                <li>• Monetizar através de planos premium e boosts</li>
                <li>• Criar competições e rankings entre usuários</li>
              </ul>
            </ExpandableSection>

            <ExpandableSection title="🏗️ Stack Tecnológica">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Frontend</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• React 18.2.0</li>
                    <li>• Vite (bundler)</li>
                    <li>• Tailwind CSS</li>
                    <li>• Framer Motion</li>
                    <li>• React Icons</li>
                    <li>• Date-fns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Backend & Serviços</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Supabase (PostgreSQL)</li>
                    <li>• Supabase Auth</li>
                    <li>• Stripe (pagamentos)</li>
                    <li>• Edge Functions</li>
                    <li>• Row Level Security</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🎮 Modo Demo vs Produção">
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">Modo Demo (Atual)</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Dados mockados no localStorage</li>
                    <li>• Supabase em modo offline</li>
                    <li>• Funcionalidades simuladas</li>
                    <li>• Três contas pré-definidas</li>
                    <li>• Ideal para demonstração</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">Modo Produção</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Supabase real configurado</li>
                    <li>• Autenticação por email</li>
                    <li>• Banco de dados PostgreSQL</li>
                    <li>• Pagamentos via Stripe</li>
                    <li>• Edge Functions ativas</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🏗️ Arquitetura do Sistema</h2>

            <ExpandableSection title="📁 Estrutura de Pastas" defaultExpanded={true}>
              <CodeBlock>
{`src/
├── components/
│   ├── admin/           # Painel administrativo
│   ├── auth/            # Autenticação
│   ├── dashboard/       # Dashboard principal
│   ├── gamification/    # Sistema de níveis
│   ├── navigation/      # Navegação
│   ├── profile/         # Perfil do usuário
│   ├── rankings/        # Rankings
│   ├── rounds/          # Rodadas/partidas
│   ├── ui/              # Componentes UI
│   └── demo/            # Componentes demo
├── config/
│   ├── mockData.js      # Dados simulados
│   ├── supabase.js      # Cliente Supabase
│   └── stripe.js        # Configuração Stripe
├── hooks/
│   ├── useAuth.js       # Autenticação
│   ├── useDemoData.js   # Dados demo
│   └── useUserProfile.js # Perfil usuário
├── database/
│   ├── schema.sql       # Schema do banco
│   └── admin-schema.sql # Schema admin
└── common/
    └── SafeIcon.jsx     # Componente de ícones`}
              </CodeBlock>
            </ExpandableSection>

            <ExpandableSection title="🔄 Fluxo de Dados">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">1. Autenticação</h4>
                  <p className="text-gray-300 text-sm">
                    useAuth hook → localStorage (demo) ou Supabase Auth → Context global
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">2. Dados do Usuário</h4>
                  <p className="text-gray-300 text-sm">
                    useUserProfile → useDemoData (demo) ou Supabase → Estado local
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">3. Ações do Usuário</h4>
                  <p className="text-gray-300 text-sm">
                    Componente → Hook → localStorage (demo) ou Supabase → Atualização UI
                  </p>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🎯 Padrões de Design">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Componentes Funcionais</h4>
                  <p className="text-gray-300 text-sm mb-2">Todos os componentes usam hooks em vez de classes</p>
                  <CodeBlock>
{`const Component = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>...</div>;
};`}
                  </CodeBlock>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Custom Hooks</h4>
                  <p className="text-gray-300 text-sm mb-2">Lógica reutilizável encapsulada em hooks</p>
                  <CodeBlock>
{`const useCustomHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lógica aqui
  
  return { data, loading, actions };
};`}
                  </CodeBlock>
                </div>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'components':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🧩 Componentes Principais</h2>

            <ExpandableSection title="🏠 Dashboard" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="completed" />
                  <span className="text-white font-medium">Dashboard Principal</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Componente central que exibe partida atual, rankings, feed ao vivo e botão de chute.
                </p>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Subcomponentes:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>AllStarTeam</code> - Seleção dos 11 melhores</li>
                    <li>• <code>TopScorers</code> - Top artilheiros</li>
                    <li>• <code>LiveFeed</code> - Feed de gols em tempo real</li>
                    <li>• <code>OtherMatches</code> - Outras partidas</li>
                    <li>• <code>FloatingShootButton</code> - Botão de chute</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Exemplo de uso do Dashboard
const Dashboard = () => {
  const { profile } = useUserProfile();
  const { isDemoMode, demoData } = useDemoData();
  
  const currentProfile = isDemoMode ? demoData : profile;
  
  return (
    <GameBackground>
      <HUDPlayerStats profile={currentProfile} />
      <MatchHeader round={currentRound} />
      <AllStarTeam topScorers={topPlayers} />
      <FloatingShootButton onShoot={handleShoot} />
    </GameBackground>
  );
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="👤 Autenticação">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="demo" />
                  <span className="text-white font-medium">Sistema de Auth</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Componentes:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>AuthScreen</code> - Tela principal</li>
                    <li>• <code>LoginForm</code> - Formulário de login</li>
                    <li>• <code>RegisterForm</code> - Formulário de registro</li>
                    <li>• <code>DemoLogin</code> - Login para demonstração</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Estrutura do AuthScreen
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  if (isDemoMode) {
    return <DemoLogin onDemoLogin={handleDemoLogin} />;
  }
  
  return isLogin ? 
    <LoginForm onToggleForm={() => setIsLogin(false)} /> :
    <RegisterForm onToggleForm={() => setIsLogin(true)} />;
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="⚙️ Painel Admin">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="completed" />
                  <span className="text-white font-medium">Painel Administrativo</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Funcionalidades:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>AdminDashboard</code> - Visão geral</li>
                    <li>• <code>AdminUsers</code> - Gestão de usuários</li>
                    <li>• <code>AdminTeams</code> - Gestão de times</li>
                    <li>• <code>AdminChampionships</code> - Gestão de campeonatos</li>
                    <li>• <code>AdminRounds</code> - Gestão de rodadas</li>
                    <li>• <code>AdminLevels</code> - Gestão de níveis</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Exemplo AdminTeams
const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = async (formData) => {
    await supabase.from('teams').insert([formData]);
    fetchTeams();
  };
  
  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Novo Time
      </button>
      {teams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🎮 Componentes UI">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Componentes Reutilizáveis:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>Logo</code> - Logo responsivo com variações</li>
                    <li>• <code>GameBackground</code> - Fundo gradiente</li>
                    <li>• <code>HUDPlayerStats</code> - HUD do jogador</li>
                    <li>• <code>MatchHeader</code> - Cabeçalho da partida</li>
                    <li>• <code>FloatingShootButton</code> - Botão flutuante</li>
                    <li>• <code>BadgeLevel</code> - Badge de nível</li>
                    <li>• <code>SafeIcon</code> - Wrapper para ícones</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Exemplo SafeIcon
const SafeIcon = ({ icon, name, ...props }) => {
  let IconComponent;
  
  try {
    IconComponent = icon || (name && FiIcons[\`Fi\${name}\`]);
  } catch (e) {
    IconComponent = null;
  }
  
  return IconComponent ? 
    React.createElement(IconComponent, props) : 
    <FiAlertTriangle {...props} />;
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🗄️ Banco de Dados</h2>

            <ExpandableSection title="📊 Schema Principal" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Tabelas Principais:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-400 mb-1">users</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• id (UUID, PK)</li>
                        <li>• name (VARCHAR)</li>
                        <li>• team_heart_id (UUID, FK)</li>
                        <li>• team_defending_id (UUID, FK)</li>
                        <li>• plan (VARCHAR)</li>
                        <li>• total_goals (INTEGER)</li>
                        <li>• gols_current_round (INTEGER)</li>
                        <li>• next_allowed_shot_time (TIMESTAMP)</li>
                        <li>• boost_expires_at (TIMESTAMP)</li>
                        <li>• is_admin (BOOLEAN)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-400 mb-1">teams</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• id (UUID, PK)</li>
                        <li>• name (VARCHAR)</li>
                        <li>• primary_color (VARCHAR)</li>
                        <li>• shield_url (TEXT)</li>
                        <li>• created_at (TIMESTAMP)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <CodeBlock>
{`-- Exemplo de criação da tabela users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  team_heart_id UUID REFERENCES teams(id),
  team_defending_id UUID REFERENCES teams(id),
  plan VARCHAR(20) NOT NULL DEFAULT 'free' 
    CHECK (plan IN ('free', 'monthly', 'annual')),
  total_goals INTEGER DEFAULT 0,
  gols_current_round INTEGER DEFAULT 0,
  next_allowed_shot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  boost_expires_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🏆 Sistema de Campeonatos">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Estrutura de Campeonatos:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>championships</code> - Campeonatos (Liga/Copa)</li>
                    <li>• <code>championship_teams</code> - Times participantes</li>
                    <li>• <code>rounds</code> - Rodadas/partidas</li>
                  </ul>
                </div>
                <CodeBlock>
{`-- Relacionamento championships -> rounds
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  championship_id UUID REFERENCES championships(id) ON DELETE CASCADE,
  team_a_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  score_team_a INTEGER DEFAULT 0,
  score_team_b INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'active', 'finished'))
);`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🔒 Row Level Security (RLS)">
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Todas as tabelas usam RLS para segurança a nível de linha.
                </p>
                <CodeBlock>
{`-- Exemplo de políticas RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Todos podem ver times e campeonatos
CREATE POLICY "Everyone can view teams" ON teams 
  FOR SELECT USING (true);

-- Apenas admins podem gerenciar
CREATE POLICY "Admin can manage teams" ON teams 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = TRUE
    )
  );`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="⚡ Funções Auxiliares">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Funções PostgreSQL:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>generate_league_rounds()</code> - Gera rodadas de liga</li>
                    <li>• <code>generate_cup_rounds()</code> - Gera rodadas de copa</li>
                    <li>• <code>handle_new_user()</code> - Trigger para novos usuários</li>
                    <li>• <code>update_updated_at_column()</code> - Atualiza timestamp</li>
                  </ul>
                </div>
                <CodeBlock>
{`-- Função para gerar rodadas de liga (todos x todos)
CREATE OR REPLACE FUNCTION generate_league_rounds(
  championship_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
  team_ids UUID[];
  rounds_created INTEGER := 0;
BEGIN
  SELECT ARRAY_AGG(team_id) INTO team_ids 
  FROM championship_teams 
  WHERE championship_teams.championship_id = generate_league_rounds.championship_id;
  
  -- Gerar rodadas para cada time vs cada outro time
  FOR i IN 1..array_length(team_ids, 1) LOOP
    FOR j IN (i+1)..array_length(team_ids, 1) LOOP
      INSERT INTO rounds (
        championship_id, team_a_id, team_b_id,
        start_time, end_time, status
      ) VALUES (
        generate_league_rounds.championship_id,
        team_ids[i], team_ids[j],
        start_date + (rounds_created * INTERVAL '1 day'),
        start_date + (rounds_created * INTERVAL '1 day') + INTERVAL '24 hours',
        'scheduled'
      );
      rounds_created := rounds_created + 1;
    END LOOP;
  END LOOP;
  
  RETURN rounds_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
                </CodeBlock>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'hooks':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🪝 Hooks e Utilitários</h2>

            <ExpandableSection title="🔐 useAuth Hook" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="demo" />
                  <span className="text-white font-medium">Hook de Autenticação</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Gerencia autenticação com suporte a modo demo e produção.
                </p>
                <CodeBlock>
{`const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica usuário demo no localStorage
    const checkDemoUser = () => {
      const demoMode = localStorage.getItem('demo-mode') === 'true';
      const userData = localStorage.getItem('demo-user');
      
      if (demoMode && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: parsedUser.id,
          email: parsedUser.email,
          user_metadata: { name: parsedUser.name },
          app_metadata: { isAdmin: parsedUser.isAdmin }
        });
      }
      setLoading(false);
    };

    checkDemoUser();
  }, []);

  const signIn = async (email, password) => {
    // Modo demo: criar usuário mockado
    // Modo produção: usar Supabase Auth
  };

  const signOut = async () => {
    localStorage.removeItem('demo-user');
    localStorage.removeItem('demo-mode');
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🎮 useDemoData Hook">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="completed" />
                  <span className="text-white font-medium">Hook de Dados Demo</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Fornece dados simulados para o modo de demonstração.
                </p>
                <CodeBlock>
{`const useDemoData = () => {
  const [demoData, setDemoData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demo-mode') === 'true';
    const userData = localStorage.getItem('demo-user');
    
    if (demoMode && userData) {
      setIsDemoMode(true);
      setDemoData(JSON.parse(userData));
    }
  }, []);

  const getDemoTeams = () => [
    { id: 'team-1', name: 'Flamengo Digital', primary_color: '#FF0000' },
    // ... mais times
  ];

  const getDemoRounds = () => [
    {
      id: 'round-1',
      team_a: { name: 'Flamengo Digital' },
      team_b: { name: 'Corinthians Virtual' },
      score_team_a: 15,
      score_team_b: 12,
      status: 'active'
    }
  ];

  return {
    isDemoMode,
    demoData,
    getDemoTeams,
    getDemoRounds,
    getDemoRankings,
    clearDemo
  };
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="👤 useUserProfile Hook">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StatusBadge status="partial" />
                  <span className="text-white font-medium">Hook de Perfil</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Busca e gerencia dados do perfil do usuário.
                </p>
                <CodeBlock>
{`const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select(\`
          *,
          team_defending:teams!team_defending_id(*),
          team_heart:teams!team_heart_id(*)
        \`)
        .eq('id', userId)
        .single();

      if (!error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return { profile, loading, refetch: fetchProfile };
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🛠️ Utilitários">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Funções Auxiliares:</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• <code>getLevelInfo()</code> - Calcula nível baseado em gols</li>
                    <li>• <code>formatTimeAgo()</code> - Formata tempo relativo</li>
                    <li>• <code>getStatusBadge()</code> - Retorna badge de status</li>
                    <li>• <code>generateDefaultEndTime()</code> - Gera horário padrão</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Exemplo: Cálculo de nível
const getLevelInfo = (totalGoals) => {
  const levels = [
    { min: 0, max: 9, name: 'Estreante da Várzea', level: 1 },
    { min: 10, max: 19, name: 'Matador da Pelada', level: 2 },
    // ... mais níveis
  ];

  const currentLevel = levels.find(l => 
    totalGoals >= l.min && totalGoals <= l.max
  );
  
  const nextLevel = levels.find(l => 
    l.level === (currentLevel?.level || 0) + 1
  );

  return {
    current: currentLevel || levels[0],
    next: nextLevel,
    progress: nextLevel ? 
      ((totalGoals - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 
      100
  };
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">✅ Funcionalidades Implementadas</h2>

            <ExpandableSection title="🎮 Sistema de Jogo" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">✅ Completo</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Sistema de chutes com cooldown</li>
                      <li>• Partidas de 24 horas</li>
                      <li>• Escolha de times (coração + defesa)</li>
                      <li>• Pontuação em tempo real</li>
                      <li>• Feed de gols ao vivo</li>
                      <li>• Diferentes intervalos por plano</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">🎮 Demo</h4>
                    <ul className="space-y-1 text-gray-300 text-sm">
                      <li>• Simulação de chutes</li>
                      <li>• Dados mockados</li>
                      <li>• Três contas pré-definidas</li>
                      <li>• Funcionalidades visuais</li>
                      <li>• Cooldown simulado</li>
                    </ul>
                  </div>
                </div>
                <CodeBlock>
{`// Sistema de chutes implementado
const handleShoot = async () => {
  if (!canShoot || !currentRound) return;
  
  setShooting(true);
  
  if (isDemoMode) {
    // Demo: simular chute
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Atualizar dados demo
    const updatedData = {
      ...demoData,
      gols_current_round: (demoData.gols_current_round || 0) + 1,
      total_goals: (demoData.total_goals || 0) + 1
    };
    
    localStorage.setItem('demo-user', JSON.stringify(updatedData));
    setCanShoot(false);
    
    // Cooldown baseado no plano
    const cooldownTime = plan === 'free' ? 1200000 : 600000; // 20min ou 10min
    setTimeout(() => setCanShoot(true), cooldownTime);
  } else {
    // Produção: usar Supabase
    const { error } = await supabase
      .from('users')
      .update({
        gols_current_round: profile.gols_current_round + 1,
        total_goals: profile.total_goals + 1,
        next_allowed_shot_time: nextShotTime
      })
      .eq('id', user.id);
  }
  
  setShooting(false);
};`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🏆 Sistema de Gamificação">
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ 10 Níveis Implementados</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div>1. Estreante da Várzea (0-9)</div>
                    <div>2. Matador da Pelada (10-19)</div>
                    <div>3. Craque da Vila (20-49)</div>
                    <div>4. Artilheiro do Bairro (50-99)</div>
                    <div>5. Ídolo Local (100-199)</div>
                    <div>6. Astro Estadual (200-399)</div>
                    <div>7. Maestro Nacional (400-699)</div>
                    <div>8. Bola de Ouro Regional (700-999)</div>
                    <div>9. Lenda do Futebol (1000-1499)</div>
                    <div>10. Imortal das Quatro Linhas (1500+)</div>
                  </div>
                </div>
                <CodeBlock>
{`// Sistema de níveis
const mockLevels = [
  {
    level: 1,
    name: 'Estreante da Várzea',
    minGoals: 0,
    maxGoals: 9,
    color: 'from-gray-400 to-gray-600',
    prize: 'Nenhum prêmio ainda'
  },
  {
    level: 2,
    name: 'Matador da Pelada',
    minGoals: 10,
    maxGoals: 19,
    color: 'from-green-400 to-green-600',
    prize: 'Sorteio de brinde exclusivo'
  },
  // ... mais níveis
];`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="📊 Rankings e Competições">
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ Sistemas de Ranking</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Ranking geral (total de gols)</li>
                    <li>• Ranking da rodada atual</li>
                    <li>• Top 11 artilheiros (formação tática)</li>
                    <li>• Rankings por campeonato</li>
                    <li>• Páginas específicas para cada ranking</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ Sistema de Campeonatos</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Campeonatos tipo Liga (todos x todos)</li>
                    <li>• Campeonatos tipo Copa (eliminatório)</li>
                    <li>• Geração automática de rodadas</li>
                    <li>• Gestão de times participantes</li>
                    <li>• Status de campeonatos (ativo/finalizado)</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="⚙️ Painel Administrativo">
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ CRUD Completo</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Gestão de usuários (visualizar, suspender, excluir)</li>
                    <li>• Gestão de times (criar, editar, excluir)</li>
                    <li>• Gestão de campeonatos (criar, editar, excluir)</li>
                    <li>• Gestão de rodadas (criar, editar, excluir)</li>
                    <li>• Gestão de níveis (criar, editar, excluir)</li>
                    <li>• Dashboard com estatísticas</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">🔒 Controle de Acesso</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Flag is_admin na tabela users</li>
                    <li>• Verificação de permissões</li>
                    <li>• Interface diferenciada para admins</li>
                    <li>• Aba vermelha no menu</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="💳 Sistema de Monetização">
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Estrutura Criada</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Página de loja com produtos</li>
                    <li>• Três planos: Gratuito, Mensal, Anual</li>
                    <li>• Sistema de boosts temporários</li>
                    <li>• Integração com Stripe (estrutura)</li>
                    <li>• Diferentes intervalos de chute</li>
                  </ul>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">❌ Não Implementado</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Processamento real de pagamentos</li>
                    <li>• Webhooks do Stripe</li>
                    <li>• Edge Functions do Supabase</li>
                    <li>• Ativação automática de planos</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'missing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">⚠️ Funcionalidades Pendentes</h2>

            <ExpandableSection title="🔧 Configuração de Produção" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">❌ Crítico - Necessário para Produção</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Configuração real do Supabase</strong> - Substituir mock</li>
                    <li>• <strong>Variáveis de ambiente</strong> - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY</li>
                    <li>• <strong>Executar schema.sql</strong> - Criar tabelas no Supabase</li>
                    <li>• <strong>Configurar RLS</strong> - Políticas de segurança</li>
                    <li>• <strong>Configurar Auth</strong> - Email confirmation, providers</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Substituir em src/config/supabase.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="💳 Sistema de Pagamentos">
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">⚠️ Estrutura Criada - Implementação Pendente</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Stripe Checkout</strong> - Integração real com API</li>
                    <li>• <strong>Webhooks</strong> - Processamento de eventos</li>
                    <li>• <strong>Edge Functions</strong> - create-checkout-session</li>
                    <li>• <strong>Ativação automática</strong> - Planos e boosts</li>
                    <li>• <strong>Renovação de assinaturas</strong> - Lógica de cobrança</li>
                  </ul>
                </div>
                <CodeBlock>
{`// Edge Function necessária: create-checkout-session
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2022-11-15',
});

serve(async (req) => {
  const { priceId, userId, productType } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: productType.includes('boost') ? 'payment' : 'subscription',
    success_url: \`\${req.headers.get('origin')}/success\`,
    cancel_url: \`\${req.headers.get('origin')}/cancel\`,
    metadata: {
      userId,
      productType,
    },
  });

  return new Response(JSON.stringify({ sessionId: session.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
});`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🚀 Funcionalidades Avançadas">
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🔮 Futuras Implementações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-400 mb-1">Social</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Sistema de amigos</li>
                        <li>• Chat entre jogadores</li>
                        <li>• Compartilhamento social</li>
                        <li>• Grupos e ligas privadas</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-400 mb-1">Gamificação</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Conquistas e badges</li>
                        <li>• Eventos especiais</li>
                        <li>• Torneios sazonais</li>
                        <li>• Sistema de recompensas</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-400 mb-1">Técnico</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Notificações push</li>
                        <li>• PWA (Progressive Web App)</li>
                        <li>• Modo offline</li>
                        <li>• Analytics avançado</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-yellow-400 mb-1">UX/UI</h5>
                      <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Temas personalizáveis</li>
                        <li>• Animações avançadas</li>
                        <li>• Tutoriais interativos</li>
                        <li>• Feedback háptico</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🐛 Correções e Melhorias">
              <div className="space-y-4">
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">🔧 Melhorias Recomendadas</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Performance</strong> - Lazy loading, code splitting</li>
                    <li>• <strong>SEO</strong> - Meta tags, sitemap</li>
                    <li>• <strong>Acessibilidade</strong> - ARIA labels, keyboard navigation</li>
                    <li>• <strong>Testes</strong> - Unit tests, integration tests</li>
                    <li>• <strong>Monitoramento</strong> - Error tracking, analytics</li>
                    <li>• <strong>Cache</strong> - Service worker, data caching</li>
                  </ul>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">🐛 Bugs Conhecidos</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Demo Mode</strong> - Dados perdidos ao recarregar</li>
                    <li>• <strong>Responsividade</strong> - Alguns componentes em telas pequenas</li>
                    <li>• <strong>Validação</strong> - Formulários poderiam ter mais validação</li>
                    <li>• <strong>Loading States</strong> - Alguns componentes sem loading</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>
          </div>
        );

      case 'deployment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🚀 Deploy e Configuração</h2>

            <ExpandableSection title="⚙️ Configuração Inicial" defaultExpanded={true}>
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">1. Configurar Supabase</h4>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li>1. Criar projeto no Supabase</li>
                    <li>2. Executar <code>src/database/schema.sql</code></li>
                    <li>3. Executar <code>src/database/admin-schema.sql</code></li>
                    <li>4. Configurar variáveis de ambiente</li>
                    <li>5. Configurar autenticação por email</li>
                  </ol>
                </div>
                <CodeBlock>
{`# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="💳 Configurar Stripe">
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">2. Setup Stripe</h4>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li>1. Criar conta no Stripe</li>
                    <li>2. Configurar produtos e preços</li>
                    <li>3. Criar webhook endpoint</li>
                    <li>4. Implementar Edge Functions</li>
                    <li>5. Configurar variáveis secretas</li>
                  </ol>
                </div>
                <CodeBlock>
{`# Produtos Stripe necessários
- Plano Mensal: R$ 19,90/mês
- Plano Anual: R$ 199,90/ano  
- Boost 24h: R$ 9,90 (pagamento único)
- Boost Semanal: R$ 29,90 (pagamento único)`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🌐 Deploy Frontend">
              <div className="space-y-4">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">3. Deploy (Vercel/Netlify)</h4>
                  <ol className="space-y-2 text-gray-300 text-sm">
                    <li>1. Conectar repositório GitHub</li>
                    <li>2. Configurar build command: <code>npm run build</code></li>
                    <li>3. Configurar output directory: <code>dist</code></li>
                    <li>4. Adicionar variáveis de ambiente</li>
                    <li>5. Configurar domínio customizado</li>
                  </ol>
                </div>
                <CodeBlock>
{`# Build commands
npm install
npm run build

# Environment variables needed:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="📊 Monitoramento">
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">4. Ferramentas Recomendadas</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Sentry</strong> - Error tracking</li>
                    <li>• <strong>Google Analytics</strong> - Web analytics</li>
                    <li>• <strong>Supabase Dashboard</strong> - Database monitoring</li>
                    <li>• <strong>Stripe Dashboard</strong> - Payment monitoring</li>
                    <li>• <strong>Vercel Analytics</strong> - Performance monitoring</li>
                  </ul>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="🔒 Segurança">
              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">5. Checklist de Segurança</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• ✅ RLS habilitado em todas as tabelas</li>
                    <li>• ✅ Políticas de segurança configuradas</li>
                    <li>• ⚠️ Rate limiting implementado</li>
                    <li>• ⚠️ Validação server-side</li>
                    <li>• ⚠️ Sanitização de inputs</li>
                    <li>• ⚠️ HTTPS obrigatório</li>
                    <li>• ⚠️ Headers de segurança</li>
                  </ul>
                </div>
                <CodeBlock>
{`# Headers de segurança recomendados (vercel.json)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}`}
                </CodeBlock>
              </div>
            </ExpandableSection>

            <ExpandableSection title="📈 Performance">
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">6. Otimizações</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• <strong>Code Splitting</strong> - Lazy loading de rotas</li>
                    <li>• <strong>Image Optimization</strong> - Compressão e WebP</li>
                    <li>• <strong>Bundle Analysis</strong> - Análise de tamanho</li>
                    <li>• <strong>Caching</strong> - Service worker e cache headers</li>
                    <li>• <strong>Database Indexing</strong> - Índices otimizados</li>
                  </ul>
                </div>
                <CodeBlock>
{`# Exemplo de lazy loading
const AdminPanel = lazy(() => import('./components/admin'));
const GamificationPage = lazy(() => import('./components/gamification/GamificationPage'));

// Uso com Suspense
<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>`}
                </CodeBlock>
              </div>
            </ExpandableSection>
          </div>
        );

      default:
        return <div>Conteúdo não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="md" variant="full" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiBook} className="inline mr-2" />
            Documentação Técnica
          </h1>
          <p className="text-gray-400">Guia completo para desenvolvedores</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Navegação</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <SafeIcon icon={section.icon} className="text-lg" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;