import React from 'react'
import { motion } from 'framer-motion'
import { useDemoData } from '../../hooks/useDemoData'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import BadgeLevel from '../ui/BadgeLevel'

const { FiTrophy, FiTarget, FiTrendingUp, FiCrown } = FiIcons;

const TopScorers = ({ title = "Top Artilheiros", scorers = [] }) => {
  const { isDemoMode, getDemoRankings } = useDemoData();
  
  // Use demo data if in demo mode and no scorers provided
  const topScorers = scorers.length > 0 ? scorers : [];

  const getRankBadge = (index) => {
    const badges = [
      { icon: FiCrown, color: 'from-yellow-400 to-yellow-600', text: 'text-black' },
      { icon: FiTrophy, color: 'from-gray-400 to-gray-600', text: 'text-white' },
      { icon: FiTrophy, color: 'from-amber-600 to-amber-800', text: 'text-white' },
      { icon: FiTarget, color: 'from-gray-600 to-gray-800', text: 'text-white' },
      { icon: FiTarget, color: 'from-gray-600 to-gray-800', text: 'text-white' }
    ];
    return badges[index] || badges[4];
  };

  // Calculate starting rank number based on the slice
  const startingRank = scorers[0]?.rank || (title.includes('12-20') ? 12 : 1);

  if (topScorers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <SafeIcon icon={FiTrophy} className="text-2xl text-yellow-400" />
          </motion.div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {title}
          </h3>
        </div>
        
        <div className="text-center py-8">
          <SafeIcon icon={FiTarget} className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Nenhum artilheiro ainda</p>
          <p className="text-sm text-gray-500 mt-2">Seja o primeiro a marcar gols nesta rodada!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <SafeIcon icon={FiTrophy} className="text-2xl text-yellow-400" />
        </motion.div>
        <h3 className="text-xl font-black text-white uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {topScorers.map((scorer, index) => {
          const rankBadge = getRankBadge(index);
          const actualRank = startingRank + index;

          return (
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
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankBadge.color} flex items-center justify-center font-black text-sm border-2 border-white/20 shadow-lg`}
                >
                  <span className={rankBadge.text}>{actualRank}</span>
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
                  {scorer.gols_current_round || scorer.total_goals}
                </motion.span>
                <SafeIcon icon={FiTarget} className="text-green-400" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TopScorers;