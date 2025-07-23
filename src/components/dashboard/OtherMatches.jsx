import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCalendar, FiClock, FiPlay } = FiIcons;

const OtherMatches = ({ userMatches = [] }) => {
  if (!userMatches || userMatches.length === 0) {
    return (
      <div className="text-center py-8">
        <SafeIcon icon={FiCalendar} className="text-4xl text-gray-600 mx-auto mb-2" />
        <p className="text-gray-400">Nenhuma outra partida sua em andamento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userMatches.map((match, index) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
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
              <SafeIcon icon={FiClock} className="mr-1" />
              {match.championship?.name}
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="text-center flex-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 shadow-lg"
                style={{ 
                  backgroundColor: match.team_a?.primary_color || '#3B82F6',
                  borderColor: match.team_a?.primary_color + '30' || '#3B82F630'
                }}
              >
                <span className="text-white font-bold text-sm">
                  {match.team_a?.name?.charAt(0) || "?"}
                </span>
              </div>
              <p className="text-white text-xs font-medium truncate">
                {match.team_a?.name || "Time A"}
              </p>
            </div>

            {/* Score */}
            <div className="text-center px-4">
              <div className="text-2xl font-black text-white font-mono">
                {match.score_team_a || 0} × {match.score_team_b || 0}
              </div>
            </div>

            {/* Team B */}
            <div className="text-center flex-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 border-2 shadow-lg"
                style={{ 
                  backgroundColor: match.team_b?.primary_color || '#EF4444',
                  borderColor: match.team_b?.primary_color + '30' || '#EF444430'
                }}
              >
                <span className="text-white font-bold text-sm">
                  {match.team_b?.name?.charAt(0) || "?"}
                </span>
              </div>
              <p className="text-white text-xs font-medium truncate">
                {match.team_b?.name || "Time B"}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OtherMatches;