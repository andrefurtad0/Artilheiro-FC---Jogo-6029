import { useState, useEffect } from 'react';

export const useDemoData = () => {
  const [demoData, setDemoData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demo-mode') === 'true';
    const userData = localStorage.getItem('demo-user');
    
    if (demoMode && userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log("Demo data loaded:", parsedData);
        setIsDemoMode(true);
        setDemoData(parsedData);
      } catch (e) {
        console.error('Error parsing demo data:', e);
        // Limpar dados corrompidos
        localStorage.removeItem('demo-user');
        localStorage.removeItem('demo-mode');
        setIsDemoMode(false);
        setDemoData(null);
      }
    }
  }, []);

  const getDemoTeams = () => [
    { id: 'team-1', name: 'Flamengo Digital', primary_color: '#FF0000' },
    { id: 'team-2', name: 'Corinthians Virtual', primary_color: '#000000' },
    { id: 'team-3', name: 'Palmeiras Cyber', primary_color: '#00FF00' },
    { id: 'team-4', name: 'São Paulo FC Online', primary_color: '#FF0000' },
    { id: 'team-5', name: 'Vasco da Gama Net', primary_color: '#000000' },
    { id: 'team-6', name: 'Botafogo Digital', primary_color: '#000000' }
  ];

  const getDemoRounds = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2h atrás
    const endTime = new Date(now.getTime() + 22 * 60 * 60 * 1000); // 22h no futuro
    
    return [
      {
        id: 'round-1',
        team_a_id: 'team-1',
        team_b_id: 'team-2',
        team_a: { 
          id: 'team-1', 
          name: 'Flamengo Digital', 
          primary_color: '#FF0000' 
        },
        team_b: { 
          id: 'team-2', 
          name: 'Corinthians Virtual', 
          primary_color: '#000000' 
        },
        score_team_a: 15,
        score_team_b: 12,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active',
        championship: { name: 'Campeonato Demo 2024' }
      }
    ];
  };

  const getDemoRankings = () => [
    {
      id: 'demo-user-1',
      name: 'João Silva',
      gols_current_round: 5,
      total_goals: 150,
      team_defending: { name: 'Flamengo Digital' }
    },
    {
      id: 'demo-admin',
      name: 'André Furtado',
      gols_current_round: 12,
      total_goals: 500,
      team_defending: { name: 'Corinthians Virtual' }
    },
    {
      id: 'demo-user-2',
      name: 'Maria Santos',
      gols_current_round: 3,
      total_goals: 75,
      team_defending: { name: 'Palmeiras Cyber' }
    }
  ];

  const clearDemo = () => {
    localStorage.removeItem('demo-mode');
    localStorage.removeItem('demo-user');
    setIsDemoMode(false);
    setDemoData(null);
  };

  return { isDemoMode, demoData, getDemoTeams, getDemoRounds, getDemoRankings, clearDemo };
};

export default useDemoData;