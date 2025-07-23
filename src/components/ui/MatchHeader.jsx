import React from 'react'
import {motion} from 'framer-motion'
import {formatDistanceToNow} from 'date-fns'
import {ptBR} from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const {FiClock, FiPlay} = FiIcons

const MatchHeader = ({match}) => {
  if (!match) return null

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 p-6 mb-6"
    >
      {/* Live indicator */}
      <div className="flex items-center justify-center mb-4">
        <motion.div
          animate={{scale: [1, 1.1, 1]}}
          transition={{repeat: Infinity, duration: 2}}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-green-400/20 px-4 py-2 rounded-full border border-green-400/30"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <SafeIcon icon={FiPlay} className="text-green-400 text-sm" />
          <span className="text-green-400 font-bold text-sm">AO VIVO</span>
        </motion.div>
      </div>

      {/* Match info */}
      <div className="flex items-center justify-center space-x-6">
        {/* Team A */}
        <motion.div
          whileHover={{scale: 1.05}}
          className="text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 shadow-lg"
            style={{
              backgroundColor: match.team_a?.primary_color || '#3B82F6',
              borderColor: match.team_a?.primary_color + '50' || '#3B82F650'
            }}
          >
            <span className="text-white font-black text-2xl">
              {match.team_a?.name?.charAt(0)}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm">{match.team_a?.name}</h3>
        </motion.div>

        {/* Score */}
        <div className="text-center px-6">
          <div className="text-5xl font-black text-white mb-2 font-mono">
            {match.score_team_a}
            <span className="text-gray-400">×</span>
            {match.score_team_b}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            PLACAR
          </div>
        </div>

        {/* Team B */}
        <motion.div
          whileHover={{scale: 1.05}}
          className="text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 shadow-lg"
            style={{
              backgroundColor: match.team_b?.primary_color || '#EF4444',
              borderColor: match.team_b?.primary_color + '50' || '#EF444450'
            }}
          >
            <span className="text-white font-black text-2xl">
              {match.team_b?.name?.charAt(0)}
            </span>
          </div>
          <h3 className="text-white font-bold text-sm">{match.team_b?.name}</h3>
        </motion.div>
      </div>

      {/* Time remaining */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <SafeIcon icon={FiClock} className="text-yellow-400" />
        <span className="text-yellow-400 font-medium text-sm">
          Termina {formatDistanceToNow(
            new Date(match.round?.end_time),
            {locale: ptBR, addSuffix: true}
          )}
        </span>
      </div>

      {/* Championship name */}
      <div className="text-center mt-3">
        <span className="text-gray-400 text-xs uppercase tracking-wider">
          {match.championship?.name} - Rodada {match.round?.round_number}
        </span>
      </div>
    </motion.div>
  )
}

export default MatchHeader