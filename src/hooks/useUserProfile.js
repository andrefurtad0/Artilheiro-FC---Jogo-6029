import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState([]);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          team_defending:teams!team_defending_id(*),
          team_heart:teams!team_heart_id(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Se o usuário não existe na tabela users, criar um registro básico
        if (error.code === 'PGRST116') {
          console.log("User not found in users table, creating basic profile");
          
          // Buscar primeiro time disponível
          const { data: teams } = await supabase
            .from('teams')
            .select('id')
            .limit(1);
          
          const defaultTeamId = teams?.[0]?.id;
          
          // Criar perfil básico
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              name: 'Novo Usuário',
              email: '', // Será preenchido pelo trigger
              team_heart_id: defaultTeamId,
              team_defending_id: defaultTeamId,
              is_admin: false,
              plan: 'free',
              gols_current_round: 0,
              total_goals: 0,
              next_allowed_shot_time: new Date().toISOString()
            }])
            .select(`
              *,
              team_defending:teams!team_defending_id(*),
              team_heart:teams!team_heart_id(*)
            `)
            .single();
          
          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        }
      } else if (data) {
        console.log("Profile loaded:", data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPlayers = async () => {
    try {
      // Buscar top players da rodada atual (apenas com gols > 0)
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          gols_current_round,
          total_goals,
          team_defending_id,
          team_defending:teams!team_defending_id(*)
        `)
        .gt('gols_current_round', 0)
        .order('gols_current_round', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        setTopPlayers(data);
      } else {
        setTopPlayers([]);
      }
    } catch (error) {
      console.error('Error fetching top players:', error);
      setTopPlayers([]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTopPlayers();
  }, [userId]);

  return {
    profile,
    loading,
    topPlayers,
    refetch: fetchProfile,
    refetchTopPlayers: fetchTopPlayers
  };
};

export default useUserProfile;