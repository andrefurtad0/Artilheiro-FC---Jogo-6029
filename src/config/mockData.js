// Dados simulados para usar no modo offline/demo
export const mockUsers = [
  {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@demo.com',
    gols_current_round: 12,
    total_goals: 150,
    team_defending: {
      id: 'team-1',
      name: 'Flamengo Digital',
      primary_color: '#E53935'
    },
    team_heart: {
      id: 'team-1',
      name: 'Flamengo Digital',
      primary_color: '#E53935'
    },
    level: 5,
    plan: 'monthly',
    boost_expires_at: new Date(Date.now() + 3600000).toISOString()
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    email: 'maria@demo.com',
    gols_current_round: 8,
    total_goals: 75,
    team_defending: {
      id: 'team-3',
      name: 'Palmeiras Cyber',
      primary_color: '#2E7D32'
    },
    team_heart: {
      id: 'team-3',
      name: 'Palmeiras Cyber',
      primary_color: '#2E7D32'
    },
    level: 3,
    plan: 'free'
  },
  {
    id: 'admin',
    name: 'Admin Demo',
    email: 'admin@demo.com',
    gols_current_round: 24,
    total_goals: 500,
    team_defending: {
      id: 'team-2',
      name: 'Corinthians Virtual',
      primary_color: '#212121'
    },
    team_heart: {
      id: 'team-2',
      name: 'Corinthians Virtual',
      primary_color: '#212121'
    },
    level: 7,
    plan: 'annual',
    is_admin: true
  }
];

export const mockTeams = [
  {
    id: 'team-1',
    name: 'Flamengo Digital',
    primary_color: '#E53935'
  },
  {
    id: 'team-2',
    name: 'Corinthians Virtual',
    primary_color: '#212121'
  },
  {
    id: 'team-3',
    name: 'Palmeiras Cyber',
    primary_color: '#2E7D32'
  },
  {
    id: 'team-4',
    name: 'São Paulo FC',
    primary_color: '#E53935'
  },
  {
    id: 'team-5',
    name: 'Vasco da Gama',
    primary_color: '#212121'
  },
  {
    id: 'team-6',
    name: 'Santos FC',
    primary_color: '#FFFFFF'
  },
  {
    id: 'team-7',
    name: 'Botafogo Digital',
    primary_color: '#212121'
  },
  {
    id: 'team-8',
    name: 'Grêmio Digital',
    primary_color: '#1565C0'
  }
];

export const mockRounds = [
  {
    id: 'round-1',
    championship_id: 'champ-1',
    championship: { name: 'Campeonato Digital 2025' },
    team_a_id: 'team-1',
    team_b_id: 'team-2',
    team_a: mockTeams.find(t => t.id === 'team-1'),
    team_b: mockTeams.find(t => t.id === 'team-2'),
    score_team_a: 15,
    score_team_b: 12,
    start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 22).toISOString(),
    status: 'active'
  },
  {
    id: 'round-2',
    championship_id: 'champ-1',
    championship: { name: 'Campeonato Digital 2025' },
    team_a_id: 'team-3',
    team_b_id: 'team-4',
    team_a: mockTeams.find(t => t.id === 'team-3'),
    team_b: mockTeams.find(t => t.id === 'team-4'),
    score_team_a: 8,
    score_team_b: 10,
    start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 22).toISOString(),
    status: 'active'
  },
  {
    id: 'round-3',
    championship_id: 'champ-1',
    championship: { name: 'Campeonato Digital 2025' },
    team_a_id: 'team-5',
    team_b_id: 'team-6',
    team_a: mockTeams.find(t => t.id === 'team-5'),
    team_b: mockTeams.find(t => t.id === 'team-6'),
    score_team_a: 5,
    score_team_b: 5,
    start_time: new Date(Date.now() + 3600000 * 24).toISOString(),
    end_time: new Date(Date.now() + 3600000 * 48).toISOString(),
    status: 'scheduled'
  }
];

export const mockGoals = [
  {
    id: 'goal-1',
    playerName: 'João Silva',
    teamName: 'Flamengo Digital',
    timestamp: new Date(Date.now() - 60000)
  },
  {
    id: 'goal-2',
    playerName: 'Maria Santos',
    teamName: 'Palmeiras Cyber',
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: 'goal-3',
    playerName: 'Admin Demo',
    teamName: 'Corinthians Virtual',
    timestamp: new Date(Date.now() - 180000)
  },
  {
    id: 'goal-4',
    playerName: 'Carlos Pereira',
    teamName: 'São Paulo FC',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: 'goal-5',
    playerName: 'Ana Oliveira',
    teamName: 'Vasco da Gama',
    timestamp: new Date(Date.now() - 300000)
  }
];

export const mockRankings = [
  {
    id: 'top-1',
    name: 'Roberto Mendes',
    gols_current_round: 5,
    total_goals: 1800,
    team_defending: { name: 'Flamengo Digital' }
  },
  {
    id: 'top-2',
    name: 'Carlos Eduardo',
    gols_current_round: 4,
    total_goals: 1480,
    team_defending: { name: 'São Paulo FC' }
  },
  {
    id: 'top-3',
    name: 'Ricardo Silva',
    gols_current_round: 3,
    total_goals: 1100,
    team_defending: { name: 'Palmeiras Cyber' }
  },
  {
    id: 'top-4',
    name: 'Marcos Oliveira',
    gols_current_round: 4,
    total_goals: 950,
    team_defending: { name: 'Corinthians Virtual' }
  },
  {
    id: 'top-5',
    name: 'Fernando Costa',
    gols_current_round: 3,
    total_goals: 870,
    team_defending: { name: 'Vasco da Gama' }
  },
  {
    id: 'user-1',
    name: 'João Silva',
    gols_current_round: 12,
    total_goals: 750,
    team_defending: { name: 'Flamengo Digital' }
  },
  {
    id: 'top-7',
    name: 'Lucas Martins',
    gols_current_round: 2,
    total_goals: 720,
    team_defending: { name: 'Santos FC' }
  },
  {
    id: 'admin',
    name: 'Admin Demo',
    gols_current_round: 24,
    total_goals: 680,
    team_defending: { name: 'Corinthians Virtual' }
  },
  {
    id: 'top-9',
    name: 'Paulo Ferreira',
    gols_current_round: 1,
    total_goals: 650,
    team_defending: { name: 'Internacional Virtual' }
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    gols_current_round: 8,
    total_goals: 620,
    team_defending: { name: 'Palmeiras Cyber' }
  },
  {
    id: 'top-11',
    name: 'Thiago Moreira',
    gols_current_round: 1,
    total_goals: 590,
    team_defending: { name: 'Cruzeiro Cyber' }
  },
  {
    id: 'top-12',
    name: 'Henrique Dias',
    gols_current_round: 1,
    total_goals: 580,
    team_defending: { name: 'Grêmio Digital' }
  },
  {
    id: 'top-13',
    name: 'Rafael Almeida',
    gols_current_round: 1,
    total_goals: 560,
    team_defending: { name: 'Atlético-MG Online' }
  },
  {
    id: 'top-14',
    name: 'Bruno Cardoso',
    gols_current_round: 1,
    total_goals: 540,
    team_defending: { name: 'Fluminense Virtual' }
  },
  {
    id: 'top-15',
    name: 'Gustavo Ribeiro',
    gols_current_round: 0,
    total_goals: 520,
    team_defending: { name: 'Botafogo Digital' }
  }
];

export const mockLevels = [
  {
    level: 1,
    name: 'Estreante da Várzea',
    minGoals: 0,
    maxGoals: 9,
    color: 'from-gray-400 to-gray-600',
    prize: 'Nenhum prêmio ainda',
    description: 'Comece sua jornada no futebol digital'
  },
  {
    level: 2,
    name: 'Matador da Pelada',
    minGoals: 10,
    maxGoals: 19,
    color: 'from-green-400 to-green-600',
    prize: 'Sorteio de brinde exclusivo',
    description: 'Mostre seu talento na várzea digital'
  },
  {
    level: 3,
    name: 'Craque da Vila',
    minGoals: 20,
    maxGoals: 49,
    color: 'from-blue-400 to-blue-600',
    prize: 'Cupom de boost + 24h',
    description: 'Seja reconhecido no seu bairro virtual'
  },
  {
    level: 4,
    name: 'Artilheiro do Bairro',
    minGoals: 50,
    maxGoals: 99,
    color: 'from-purple-400 to-purple-600',
    prize: 'Sorteio R$50 em boost',
    description: 'Domine as partidas locais'
  },
  {
    level: 5,
    name: 'Ídolo Local',
    minGoals: 100,
    maxGoals: 199,
    color: 'from-yellow-400 to-yellow-600',
    prize: 'Sorteio de camisa oficial',
    description: 'Seja adorado pela torcida digital'
  },
  {
    level: 6,
    name: 'Astro Estadual',
    minGoals: 200,
    maxGoals: 399,
    color: 'from-red-400 to-red-600',
    prize: 'Sorteio de ticket VIP',
    description: 'Alcance a fama estadual'
  },
  {
    level: 7,
    name: 'Maestro Nacional',
    minGoals: 400,
    maxGoals: 699,
    color: 'from-pink-400 to-pink-600',
    prize: 'Gift Card R$100',
    description: 'Seja reconhecido nacionalmente'
  },
  {
    level: 8,
    name: 'Bola de Ouro Regional',
    minGoals: 700,
    maxGoals: 999,
    color: 'from-indigo-400 to-indigo-600',
    prize: 'Sorteio de prêmio exclusivo',
    description: 'Entre para a elite do futebol digital'
  },
  {
    level: 9,
    name: 'Lenda do Futebol',
    minGoals: 1000,
    maxGoals: 1499,
    color: 'from-amber-400 to-amber-600',
    prize: 'Sorteio mensal de camisa',
    description: 'Torne-se uma lenda viva'
  },
  {
    level: 10,
    name: 'Imortal das Quatro Linhas',
    minGoals: 1500,
    maxGoals: 999999,
    color: 'from-orange-400 to-orange-600',
    prize: 'Sorteio anual de viagem',
    description: 'Alcance a imortalidade no futebol digital'
  }
];