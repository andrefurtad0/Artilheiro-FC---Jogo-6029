import { useState, useEffect } from 'react';
import { mockUsers, mockLevels } from '../config/mockData';

export const useMockProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar perfil do usuário a partir dos dados simulados
  const fetchProfile = async () => {
    setLoading(true);
    
    try {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      // Buscar usuário nos dados simulados
      const user = mockUsers.find(u => u.id === userId);
      
      if (user) {
        // Calcular nível do usuário baseado nos gols totais
        const totalGoals = user.total_goals || 0;
        const userLevel = mockLevels.find(
          level => totalGoals >= level.minGoals && totalGoals <= level.maxGoals
        ) || mockLevels[0];
        
        // Criar perfil completo
        const fullProfile = {
          ...user,
          level: userLevel.level,
          level_name: userLevel.name
        };
        
        setProfile(fullProfile);
      } else {
        // Se não encontrar, usar o primeiro usuário simulado (para demo)
        setProfile(mockUsers[0]);
      }
    } catch (error) {
      console.error('Error fetching mock profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return { profile, loading, refetch: fetchProfile };
};