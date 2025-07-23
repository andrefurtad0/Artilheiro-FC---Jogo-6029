import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMockProfile } from '../hooks/useMockProfile';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import BottomNav from './navigation/BottomNav';
import { mockRounds, mockGoals, mockRankings } from '../config/mockData';

const Dashboard = ({ userId, onNavigate }) => {
  const { profile, loading } = useMockProfile(userId);
  const [canShoot, setCanShoot] = useState(true);
  const [shooting, setShooting] = useState(false);

  // Usar o primeiro round dos dados simulados
  const currentRound = mockRounds[0];

  const handleShoot = async () => {
    if (!canShoot) return;
    
    setShooting(true);
    
    // Simular delay do chute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular cooldown
    setCanShoot(false);
    setTimeout(() => setCanShoot(true), 5000); // 5 segundos de cooldown para demo
    
    setShooting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - Player Stats */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg shadow-yellow-500/30">
                  <span className="text-black font-black text-lg">
                    {profile?.level || 1}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
              </motion.div>
              <div>
                <p className="text-white font-bold text-sm">{profile?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-300">{profile?.level_name || 'Estreante da Várzea'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Current Round Goals */}
              <div className="flex items-center space-x-1 bg-gradient-to-r from-green-600/20 to-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
                <SafeIcon icon={FiIcons.FiTarget} className="text-green-400 text-sm" />
                <span className="text-green-400 font-bold text-sm">
                  {profile?.gols_current_round || 0}
                </span>
              </div>
              
              {/* Total Goals */}
              <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-600/20 to-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
                <SafeIcon icon={FiIcons.FiTrendingUp} className="text-blue-400 text-sm" />
                <span className="text-blue-400 font-bold text-sm">
                  {profile?.total_goals || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32">
        {/* Match Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-6 mx-4 mb-6 mt-6"
        >
          {/* Live indicator */}
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-green-400/20 px-4 py-2 rounded-full border border-green-400/30"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <SafeIcon icon={FiIcons.FiPlay} className="text-green-400 text-sm" />
              <span className="text-green-400 font-bold text-sm">AO VIVO</span>
            </motion.div>
          </div>
          
          {/* Match info */}
          <div className="flex items-center justify-center space-x-6">
            {/* Team A */}
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-blue-400/30 shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-2xl">
                  {currentRound.team_a.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm">{currentRound.team_a.name}</h3>
            </motion.div>
            
            {/* Score */}
            <div className="text-center px-6">
              <div className="text-5xl font-black text-white mb-2 font-mono">
                {currentRound.score_team_a} <span className="text-gray-400">×</span> {currentRound.score_team_b}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                PLACAR
              </div>
            </div>
            
            {/* Team B */}
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-red-400/30 shadow-lg shadow-red-500/30">
                <span className="text-white font-black text-2xl">
                  {currentRound.team_b.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm">{currentRound.team_b.name}</h3>
            </motion.div>
          </div>
          
          {/* Time remaining */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <SafeIcon icon={FiIcons.FiClock} className="text-yellow-400" />
            <span className="text-yellow-400 font-medium text-sm">
              Termina em 22 horas
            </span>
          </div>
        </motion.div>

        {/* Live Feed */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              Feed Ao Vivo
            </h3>
            <SafeIcon icon={FiIcons.FiZap} className="text-yellow-400" />
          </div>
          
          <div className="space-y-2">
            {mockGoals.slice(0, 3).map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-xl p-4 border-l-4 border-l-green-400 shadow-lg border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                      ⚽
                    </motion.div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        <span className="text-green-400">{goal.playerName}</span> marcou pelo{' '}
                        <span className="text-blue-400">{goal.teamName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <SafeIcon icon={FiIcons.FiClock} className="mr-1" />
                    {Math.floor((Date.now() - new Date(goal.timestamp)) / 60000)} min
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Gols Rodada</p>
                <p className="text-2xl font-black text-green-400">
                  {profile?.gols_current_round || 0}
                </p>
              </div>
              <SafeIcon icon={FiIcons.FiTarget} className="text-2xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-blue-400">
                  {profile?.total_goals || 0}
                </p>
              </div>
              <SafeIcon icon={FiIcons.FiTrendingUp} className="text-2xl text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Top Scorers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <SafeIcon icon={FiIcons.FiTrophy} className="text-2xl text-yellow-400" />
            </motion.div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              Top Artilheiros
            </h3>
          </div>
          
          <div className="space-y-3">
            {mockRankings.slice(0, 5).map((scorer, index) => (
              <motion.div
                key={scorer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/30 hover:border-gray-500/50 transition-all"
              >
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      index === 0 ? 'from-yellow-400 to-yellow-600' :
                      index === 1 ? 'from-gray-400 to-gray-600' :
                      index === 2 ? 'from-amber-600 to-amber-800' :
                      'from-gray-600 to-gray-800'
                    } flex items-center justify-center font-black text-sm border-2 border-white/20 shadow-lg`}
                  >
                    {index + 1}
                  </motion.div>
                  
                  {/* Player Info */}
                  <div>
                    <p className="font-bold text-white">{scorer.name}</p>
                    <p className="text-xs text-gray-400">{scorer.team_defending.name}</p>
                  </div>
                </div>
                
                {/* Goals */}
                <div className="flex items-center space-x-2">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className="text-2xl font-black text-green-400"
                  >
                    {scorer.gols_current_round}
                  </motion.span>
                  <SafeIcon icon={FiIcons.FiTarget} className="text-green-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Other Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiIcons.FiPlay} className="text-2xl text-blue-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Outras Partidas
              </h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {mockRounds.slice(1).map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">
                      Ao Vivo
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <SafeIcon icon={FiIcons.FiClock} className="mr-1" />
                    22h restantes
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Team A */}
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-blue-400/30 shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {match.team_a.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white text-xs font-medium truncate">
                      {match.team_a.name}
                    </p>
                  </div>
                  
                  {/* Score */}
                  <div className="text-center px-4">
                    <div className="text-2xl font-black text-white font-mono">
                      {match.score_team_a} × {match.score_team_b}
                    </div>
                  </div>
                  
                  {/* Team B */}
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-red-400/30 shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {match.team_b.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-white text-xs font-medium truncate">
                      {match.team_b.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Shoot Button */}
      <div className="fixed bottom-24 right-6 z-[9999]">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative"
        >
          {/* Glow effect when can shoot */}
          {canShoot && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-lime-400 animate-ping opacity-30" />
          )}
          
          {/* Main button */}
          <motion.button
            onClick={handleShoot}
            disabled={!canShoot || shooting}
            className={`
              relative w-20 h-20 rounded-full font-black text-lg transition-all duration-300 flex items-center justify-center border-2 overflow-hidden shadow-2xl
              ${canShoot && !shooting ? 'bg-gradient-to-br from-green-400 via-lime-400 to-green-500 border-lime-300 text-black cursor-pointer' : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-400 cursor-not-allowed'}
            `}
            whileHover={canShoot && !shooting ? { scale: 1.1, boxShadow: "0 0 30px rgba(34,197,94,0.8)" } : {}}
            whileTap={canShoot && !shooting ? { scale: 0.95 } : {}}
            animate={canShoot && !shooting ? {
              boxShadow: [
                "0 0 20px rgba(34,197,94,0.5)",
                "0 0 40px rgba(34,197,94,0.8)",
                "0 0 20px rgba(34,197,94,0.5)"
              ]
            } : {}}
            transition={{
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { type: "spring", stiffness: 300 }
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-full" />
            
            {/* Button content */}
            <div className="relative z-10">
              {shooting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <SafeIcon icon={FiIcons.FiZap} className="text-2xl" />
                </motion.div>
              ) : canShoot ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-3xl"
                >
                  ⚽
                </motion.div>
              ) : (
                <SafeIcon icon={FiIcons.FiClock} className="text-xl" />
              )}
            </div>
          </motion.button>
          
          {/* Status text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 text-center"
          >
            {shooting ? (
              <motion.p
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-green-400 font-bold text-xs whitespace-nowrap bg-gray-900/90 px-3 py-1.5 rounded-full border border-green-400/30"
              >
                CHUTANDO...
              </motion.p>
            ) : canShoot ? (
              <p className="text-green-400 font-bold text-xs whitespace-nowrap bg-gray-900/90 px-3 py-1.5 rounded-full border border-green-400/30">
                CHUTAR!
              </p>
            ) : (
              <div className="text-center bg-gray-900/90 px-3 py-1.5 rounded-full border border-gray-600/30">
                <p className="text-gray-400 text-xs font-medium whitespace-nowrap">Aguarde</p>
                <p className="text-yellow-400 text-xs font-bold">5s</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="dashboard" onTabChange={onNavigate} />
    </div>
  );
};

export default Dashboard;