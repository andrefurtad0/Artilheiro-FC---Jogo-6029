import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../config/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import HUDPlayerStats from '../ui/HUDPlayerStats';
import MatchHeader from '../ui/MatchHeader';
import LiveFeed from './LiveFeed';
import TopScorers from './TopScorers';
import OtherMatches from './OtherMatches';
import FloatingShootButton from '../ui/FloatingShootButton';
import AllStarTeam from './AllStarTeam';

const { FiTarget, FiPlus, FiCheck, FiClock, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading, topPlayers } = useUserProfile(user?.id);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [userMatches, setUserMatches] = useState([]);
  const [canShoot, setCanShoot] = useState(false);
  const [nextShotTime, setNextShotTime] = useState(null);
  const [shooting, setShooting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recentGoals, setRecentGoals] = useState([]);

  // Carregar partidas do usuário e verificar se pode chutar
  useEffect(() => {
    if (!user || !profile) return;

    const fetchUserMatches = async () => {
      try {
        // Buscar partidas ativas onde o usuário defende um dos times
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            round:rounds(*),
            championship:championships(*),
            team_a:teams!team_a_id(*),
            team_b:teams!team_b_id(*)
          `)
          .eq('status', 'active')
          .or(`team_a_id.eq.${profile.team_defending_id},team_b_id.eq.${profile.team_defending_id}`);

        if (!error && data && data.length > 0) {
          setUserMatches(data);
          // Definir a primeira partida como atual
          setCurrentMatch(data[0]);
        } else {
          setUserMatches([]);
          setCurrentMatch(null);
        }
      } catch (error) {
        console.error('Error fetching user matches:', error);
      }
    };

    const checkCanShoot = async () => {
      const now = new Date();
      const nextAllowedTime = new Date(profile.next_allowed_shot_time);

      if (now >= nextAllowedTime) {
        setCanShoot(true);
        setNextShotTime(null);
        setTimeLeft(0);
      } else {
        setCanShoot(false);
        setNextShotTime(nextAllowedTime);

        // Calcular tempo restante em segundos
        const diff = Math.max(0, (nextAllowedTime - now) / 1000);
        setTimeLeft(Math.floor(diff));

        // Atualizar contador a cada segundo
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(timer);
              setCanShoot(true);
              return 0;
            }
            return newTime;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    };

    const fetchRecentGoals = async () => {
      try {
        // Buscar gols recentes da partida atual
        if (currentMatch) {
          const { data, error } = await supabase
            .from('goals')
            .select(`
              *,
              user:users(name),
              team:teams(name)
            `)
            .eq('match_id', currentMatch.id)
            .order('scored_at', { ascending: false })
            .limit(5);

          if (!error && data) {
            setRecentGoals(data.map(goal => ({
              id: goal.id,
              playerName: goal.user.name,
              teamName: goal.team.name,
              timestamp: goal.scored_at
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching recent goals:', error);
      }
    };

    fetchUserMatches();
    checkCanShoot();
    fetchRecentGoals();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      fetchUserMatches();
      fetchRecentGoals();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, profile, currentMatch?.id]);

  // Função para realizar o chute
  const handleShoot = async () => {
    if (!canShoot || !currentMatch || shooting) return;

    setShooting(true);
    try {
      // Usar a função do banco para processar o chute
      const { data, error } = await supabase.rpc('process_user_shot', {
        p_user_id: user.id,
        p_match_id: currentMatch.id
      });

      if (error) {
        console.error('Error processing shot:', error);
        alert('Erro ao processar chute: ' + error.message);
        return;
      }

      if (!data.success) {
        alert('Erro: ' + data.error);
        return;
      }

      // Atualizar estado local
      setCanShoot(false);
      setNextShotTime(new Date(data.next_shot_time));
      setTimeLeft(data.cooldown_minutes * 60);

      // Iniciar contador regressivo
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            setCanShoot(true);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      // Recarregar dados da partida
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error during shoot:', error);
      alert('Erro interno durante o chute');
    } finally {
      setShooting(false);
    }
  };

  // Calcular nível do usuário
  const getLevelInfo = (totalGoals) => {
    const levels = [
      { min: 0, max: 9, name: 'Estreante da Várzea', level: 1 },
      { min: 10, max: 19, name: 'Matador da Pelada', level: 2 },
      { min: 20, max: 49, name: 'Craque da Vila', level: 3 },
      { min: 50, max: 99, name: 'Artilheiro do Bairro', level: 4 },
      { min: 100, max: 199, name: 'Ídolo Local', level: 5 },
      { min: 200, max: 399, name: 'Astro Estadual', level: 6 },
      { min: 400, max: 699, name: 'Maestro Nacional', level: 7 },
      { min: 700, max: 999, name: 'Bola de Ouro Regional', level: 8 },
      { min: 1000, max: 1499, name: 'Lenda do Futebol', level: 9 },
      { min: 1500, max: 999999, name: 'Imortal das Quatro Linhas', level: 10 }
    ];

    const currentLevel = levels.find(l => totalGoals >= l.min && totalGoals <= l.max) || levels[0];
    const nextLevel = levels.find(l => l.level === (currentLevel?.level || 0) + 1);
    return { current: currentLevel, next: nextLevel };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(profile?.total_goals || 0);

  return (
    <div className="space-y-6 pb-32">
      {/* HUD com estatísticas do jogador */}
      <div className="pt-20">
        <HUDPlayerStats profile={profile} level={levelInfo} />
      </div>

      {/* Cabeçalho da partida atual */}
      <div className="mt-6">
        {currentMatch ? (
          <MatchHeader match={currentMatch} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-6 mx-4 mb-6"
          >
            <div className="text-center py-8">
              <SafeIcon icon={FiClock} className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">Nenhuma partida ativa</p>
              <p className="text-sm text-gray-500 mt-2">Aguarde o início da próxima rodada</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Feed de gols ao vivo */}
      {recentGoals.length > 0 && (
        <LiveFeed goals={recentGoals} />
      )}

      {/* Time dos artilheiros - apenas da partida atual */}
      {currentMatch && topPlayers.length > 0 && (
        <AllStarTeam topScorers={topPlayers.filter(player => 
          player.team_defending_id === currentMatch.team_a_id || player.team_defending_id === currentMatch.team_b_id
        )} />
      )}

      {/* Ranking de artilheiros da partida */}
      <div className="container mx-auto px-4">
        {currentMatch && topPlayers.length > 0 ? (
          <TopScorers 
            title={`Artilheiros: ${currentMatch.team_a.name} vs ${currentMatch.team_b.name}`}
            scorers={topPlayers.filter(player => 
              player.team_defending_id === currentMatch.team_a_id || player.team_defending_id === currentMatch.team_b_id
            ).slice(0, 5)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center space-x-3 mb-6">
              <SafeIcon icon={FiIcons.FiTrophy} className="text-2xl text-yellow-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Artilheiros da Partida
              </h3>
            </div>
            <div className="text-center py-8">
              <SafeIcon icon={FiTarget} className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">Nenhum gol marcado ainda</p>
              <p className="text-sm text-gray-500 mt-2">Seja o primeiro a marcar nesta partida!</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Outras partidas do usuário */}
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <SafeIcon icon={FiIcons.FiPlay} className="mr-2 text-blue-400" />
            Suas Outras Partidas
          </h3>
          <OtherMatches userMatches={userMatches.filter(m => m.id !== currentMatch?.id)} />
        </div>
      </div>

      {/* Botão flutuante de chute */}
      <FloatingShootButton 
        canShoot={canShoot} 
        shooting={shooting} 
        timeLeft={timeLeft} 
        onShoot={handleShoot}
        currentMatch={currentMatch} 
      />
    </div>
  );
};

export default Dashboard;