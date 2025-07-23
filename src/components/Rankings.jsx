import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { mockRankings } from '../config/mockData';
import SafeIcon from '../common/SafeIcon';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedChampionship, setSelectedChampionship] = useState(null);
  const [showChampionshipSelector, setShowChampionshipSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedRanking, setExpandedRanking] = useState(false);
  const [rankings, setRankings] = useState([]);

  // Mock championships data - replace with real data from Supabase
  const championships = [
    {
      id: 'champ-1',
      name: 'Campeonato Digital 2025',
      status: 'active',
      type: 'league'
    },
    {
      id: 'champ-2', 
      name: 'Copa dos Campeões 2024',
      status: 'finished',
      type: 'cup'
    },
    {
      id: 'champ-3',
      name: 'Liga Brasileira Virtual 2024',
      status: 'finished', 
      type: 'league'
    }
  ];

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      const extendedRankings = [
        ...mockRankings,
        {
          id: 'user-5',
          name: 'Roberto Mendes',
          gols_current_round: 5,
          total_goals: 1800,
          team_defending: { name: 'Flamengo Digital' }
        },
        {
          id: 'user-6',
          name: 'Carlos Eduardo',
          gols_current_round: 4,
          total_goals: 1480,
          team_defending: { name: 'São Paulo FC' }
        },
        {
          id: 'user-7',
          name: 'Ricardo Silva',
          gols_current_round: 3,
          total_goals: 1100,
          team_defending: { name: 'Palmeiras Cyber' }
        },
        {
          id: 'user-8',
          name: 'Marcos Oliveira',
          gols_current_round: 4,
          total_goals: 950,
          team_defending: { name: 'Corinthians Virtual' }
        },
        {
          id: 'user-9',
          name: 'Fernando Costa',
          gols_current_round: 3,
          total_goals: 870,
          team_defending: { name: 'Vasco da Gama' }
        },
        {
          id: 'user-10',
          name: 'Gabriel Santos',
          gols_current_round: 2,
          total_goals: 750,
          team_defending: { name: 'Botafogo Digital' }
        },
        {
          id: 'user-11',
          name: 'Lucas Martins',
          gols_current_round: 2,
          total_goals: 720,
          team_defending: { name: 'Santos FC' }
        },
        {
          id: 'user-12',
          name: 'Henrique Dias',
          gols_current_round: 1,
          total_goals: 680,
          team_defending: { name: 'Grêmio Digital' }
        },
        {
          id: 'user-13',
          name: 'Paulo Ferreira',
          gols_current_round: 1,
          total_goals: 650,
          team_defending: { name: 'Internacional Virtual' }
        },
        {
          id: 'user-14',
          name: 'Mateus Lima',
          gols_current_round: 1,
          total_goals: 620,
          team_defending: { name: 'Fluminense Virtual' }
        },
        {
          id: 'user-15',
          name: 'Thiago Moreira',
          gols_current_round: 1,
          total_goals: 590,
          team_defending: { name: 'Cruzeiro Cyber' }
        }
      ];
      
      // Sort by total goals for general ranking
      extendedRankings.sort((a, b) => b.total_goals - a.total_goals);
      setRankings(extendedRankings);
      setLoading(false);
    }, 800);
  }, []);

  const tabs = [
    { id: 'general', label: 'Geral', icon: FiIcons.FiTrendingUp },
    { id: 'championship', label: 'Campeonato', icon: FiIcons.FiAward }
  ];

  const getRankingTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'Ranking Geral de Artilheiros';
      case 'championship':
        return selectedChampionship 
          ? `Artilheiros: ${selectedChampionship.name}` 
          : 'Selecione um Campeonato';
      default:
        return 'Ranking';
    }
  };

  const getRankingData = () => {
    if (activeTab === 'championship' && selectedChampionship) {
      // In a real app, you would filter based on championship
      // For demo, we'll just return a subset of the data
      return rankings.slice(0, 10).map(player => ({
        ...player,
        total_goals: Math.floor(player.total_goals * 0.7) // Simulate different championship stats
      }));
    }
    
    return rankings;
  };

  const handleChampionshipSelect = (championship) => {
    setSelectedChampionship(championship);
    setShowChampionshipSelector(false);
  };

  const visibleRankings = expandedRanking ? getRankingData() : getRankingData().slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiIcons.FiTrophy} className="inline mr-2" />
            Rankings
          </h1>
          <p className="text-gray-400">Os maiores artilheiros da competição</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-gray-800 rounded-2xl shadow-lg p-2 mb-4 border border-gray-700"
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'championship' && !selectedChampionship) {
                    setShowChampionshipSelector(true);
                  }
                }}
                className={`
                  flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                <SafeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Championship Selector */}
        {activeTab === 'championship' && (
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="mb-4"
          >
            <button
              onClick={() => setShowChampionshipSelector(!showChampionshipSelector)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
            >
              <div>
                <p className="text-sm text-gray-400">Campeonato Selecionado</p>
                <p className="text-white font-medium">
                  {selectedChampionship ? selectedChampionship.name : 'Selecione um campeonato'}
                </p>
              </div>
              <motion.div
                animate={{rotate: showChampionshipSelector ? 180 : 0}}
                transition={{duration: 0.2}}
              >
                <SafeIcon icon={FiIcons.FiChevronDown} className="text-gray-400" />
              </motion.div>
            </button>

            {/* Championship Dropdown */}
            <AnimatePresence>
              {showChampionshipSelector && (
                <motion.div
                  initial={{opacity: 0, y: -10, scale: 0.95}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  exit={{opacity: 0, y: -10, scale: 0.95}}
                  transition={{duration: 0.2}}
                  className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-gray-300">Campeonatos Disponíveis</p>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {championships.map((championship) => (
                      <motion.button
                        key={championship.id}
                        onClick={() => handleChampionshipSelect(championship)}
                        whileHover={{backgroundColor: 'rgba(55, 65, 81, 0.5)'}}
                        className="w-full p-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{championship.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                championship.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {championship.status === 'active' ? 'Ativo' : 'Finalizado'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                championship.type === 'league'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {championship.type === 'league' ? 'Liga' : 'Copa'}
                              </span>
                            </div>
                          </div>
                          
                          {selectedChampionship?.id === championship.id && (
                            <SafeIcon icon={FiIcons.FiCheck} className="text-green-400" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Rankings List */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {getRankingTitle()}
              </h2>
              
              {activeTab === 'championship' && selectedChampionship && (
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedChampionship.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedChampionship.status === 'active' ? 'Ativo' : 'Finalizado'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando rankings...</p>
            </div>
          ) : activeTab === 'championship' && !selectedChampionship ? (
            <div className="p-8 text-center">
              <SafeIcon icon={FiIcons.FiAward} className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-2">Selecione um Campeonato</p>
              <p className="text-gray-500">Escolha um campeonato para ver o ranking</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {visibleRankings.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{opacity: 0, x: -20}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: index * 0.05}}
                  className="p-4 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Position Badge */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-gray-200' : 
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400' : 
                          'bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500'}
                      `}>
                        {index < 3 ? (
                          <SafeIcon icon={FiIcons.FiTrophy} className={`text-lg ${index === 0 ? 'text-white' : ''}`} />
                        ) : (
                          <span className="text-lg">{index + 1}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white text-lg">{user.name}</p>
                          <p className="text-sm text-gray-400">
                            {user.team_defending?.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {activeTab === 'general' ? user.total_goals.toLocaleString() : user.gols_current_round.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">gols</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {getRankingData().length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <SafeIcon icon={FiIcons.FiUsers} className="text-6xl mx-auto mb-4" />
                  <p className="text-xl mb-2">Nenhum dado encontrado</p>
                  <p>Não há jogadores neste ranking ainda</p>
                </div>
              )}
              
              {/* Show more/less button */}
              {getRankingData().length > 10 && (
                <div className="p-4 text-center">
                  <button 
                    onClick={() => setExpandedRanking(!expandedRanking)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <span>{expandedRanking ? 'Mostrar Menos' : 'Ver Ranking Completo'}</span>
                    <SafeIcon 
                      icon={expandedRanking ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} 
                      className="text-white"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Rankings;