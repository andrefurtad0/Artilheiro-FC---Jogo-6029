import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useDemoData } from '../../hooks/useDemoData';
import { supabase } from '../../config/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { mockLevels } from '../../config/mockData';

const { FiAward, FiUsers, FiTrophy, FiGift, FiChevronRight, FiX } = FiIcons;

const GamificationPage = () => {
  const { user } = useAuth();
  const { isDemoMode, demoData } = useDemoData();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelRanking, setLevelRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userCounts, setUserCounts] = useState({});
  
  // Use demo data if available
  const profile = isDemoMode ? demoData : null;
  
  // Determina o nível atual do usuário
  const getCurrentLevel = (totalGoals) => {
    return mockLevels.find(level => 
      totalGoals >= level.minGoals && totalGoals <= level.maxGoals
    ) || mockLevels[0];
  };
  
  // Calcula o progresso para o próximo nível
  const getLevelProgress = (totalGoals, currentLevel) => {
    const nextLevel = mockLevels.find(l => l.level === currentLevel.level + 1);
    if (!nextLevel) return 100;
    
    const progress = ((totalGoals - currentLevel.minGoals) / (nextLevel.minGoals - currentLevel.minGoals)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Buscar contagem real de usuários por nível
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        // Inicializar contagens com zero
        const counts = {};
        mockLevels.forEach(level => {
          counts[level.level] = 0;
        });
        
        // Buscar contagem real do Supabase
        const { data, error } = await supabase
          .from('users')
          .select('total_goals');
          
        if (!error && data) {
          // Contar usuários por nível
          data.forEach(user => {
            const level = getCurrentLevel(user.total_goals).level;
            counts[level] = (counts[level] || 0) + 1;
          });
        }
        
        setUserCounts(counts);
      } catch (error) {
        console.error('Erro ao buscar contagem de usuários:', error);
        // Definir valores zerados em caso de erro
        const emptyCounts = {};
        mockLevels.forEach(level => {
          emptyCounts[level.level] = 0;
        });
        setUserCounts(emptyCounts);
      }
    };
    
    fetchUserCounts();
  }, []);

  const handleLevelClick = async (level) => {
    setSelectedLevel(level);
    setLoading(true);
    
    try {
      // Buscar usuários reais deste nível
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          name, 
          total_goals,
          team_defending:teams!team_defending_id(name)
        `)
        .gte('total_goals', level.minGoals)
        .lte('total_goals', level.maxGoals)
        .order('total_goals', { ascending: false })
        .limit(5);
        
      if (!error && data && data.length > 0) {
        setLevelRanking(data);
      } else {
        // Se não houver dados, definir array vazio
        setLevelRanking([]);
      }
    } catch (error) {
      console.error('Erro ao buscar ranking do nível:', error);
      setLevelRanking([]);
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = getCurrentLevel(profile?.totalGoals || 0);
  const progress = getLevelProgress(profile?.totalGoals || 0, currentLevel);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiAward} className="inline mr-2" />
            Sistema de Níveis
          </h1>
          <p className="text-gray-400">Evolua, ganhe prêmios e torne-se uma lenda</p>
        </motion.div>

        {/* Current Level Card - ESPAÇAMENTO CORRIGIDO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentLevel.color} flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">{currentLevel.level}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{currentLevel.name}</h2>
                <p className="text-gray-400">{currentLevel.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Seus gols</p>
              <p className="text-2xl font-bold text-green-400">{profile?.totalGoals || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-green-400">
                {profile?.totalGoals || 0} / {mockLevels[currentLevel.level]?.minGoals || '∞'} gols
              </span>
              <span className="text-xs font-semibold text-green-400">{Math.round(progress)}%</span>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${currentLevel.color}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Levels Grid - ESPAÇAMENTO CORRIGIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockLevels.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLevelClick(level)}
              className={`bg-gray-800 rounded-xl p-6 border border-gray-700 cursor-pointer transition-all hover:shadow-xl ${
                currentLevel.level === level.level ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                    <span className="text-xl font-bold text-white">{level.level}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{level.name}</h3>
                    <p className="text-sm text-gray-400">
                      {level.minGoals} - {level.maxGoals} gols
                    </p>
                  </div>
                </div>
                <SafeIcon icon={FiChevronRight} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} className="text-blue-400" />
                  <span className="text-gray-400">
                    {userCounts[level.level] || 0} jogadores
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiGift} className="text-purple-400" />
                  <span className="text-gray-400">Prêmio disponível</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Level Ranking Modal */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedLevel.color} flex items-center justify-center`}>
                      <span className="text-xl font-bold text-white">{selectedLevel.level}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedLevel.name}</h3>
                      <p className="text-sm text-gray-400">Ranking dos Artilheiros</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-gray-400" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Prize Info */}
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                    <h4 className="flex items-center text-lg font-bold text-white mb-2">
                      <SafeIcon icon={FiGift} className="text-purple-400 mr-2" />
                      Prêmio da Temporada
                    </h4>
                    <p className="text-gray-300">{selectedLevel.prize}</p>
                  </div>

                  {/* Ranking List */}
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : levelRanking.length > 0 ? (
                      levelRanking.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index < 3
                                ? [
                                    'bg-yellow-500',
                                    'bg-gray-400',
                                    'bg-amber-600',
                                  ][index]
                                : 'bg-gray-600'
                            }`}>
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-bold text-white">{player.name}</p>
                              <p className="text-sm text-gray-400">{player.team_defending?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <SafeIcon icon={FiTrophy} className="text-yellow-400" />
                            <span className="text-xl font-bold text-white">
                              {player.total_goals}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <SafeIcon icon={FiUsers} className="text-4xl text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">Nenhum jogador neste nível ainda</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationPage;