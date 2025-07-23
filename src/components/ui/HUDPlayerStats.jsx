import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import Logo from './Logo'

const { FiTrophy, FiTarget, FiZap, FiAward, FiTrendingUp } = FiIcons

const HUDPlayerStats = ({ profile, level }) => {
  const getLevelProgress = () => {
    if (!level.next) return 100
    const current = profile?.total_goals || 0
    const min = level.current.min
    const max = level.next.min
    return Math.min(100, ((current - min) / (max - min)) * 100)
  }

  const isBoostActive = () => {
    if (!profile?.boost_expires_at) return false
    return new Date(profile.boost_expires_at) > new Date()
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md border-b border-gray-700/50"
      style={{ paddingBottom: '10px' }}
    >
      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo in small size for mobile */}
          <div className="md:hidden">
            <Logo size="sm" variant="shield" />
          </div>

          {/* Level Badge */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-lg shadow-yellow-500/30">
                <span className="text-black font-black text-lg">
                  {level.current.level}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{profile?.name}</p>
              <p className="text-xs text-gray-300">{level.current.name}</p>
            </div>
          </motion.div>

          {/* Logo for desktop */}
          <div className="hidden md:block">
            <Logo size="sm" variant="fc" />
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4">
            {/* Current Round Goals */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-green-600/20 to-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
              <SafeIcon icon={FiTarget} className="text-green-400 text-sm" />
              <span className="text-green-400 font-bold text-sm">
                {profile?.gols_current_round || 0}
              </span>
            </div>

            {/* Total Goals */}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-600/20 to-blue-500/20 px-3 py-1.5 rounded-full border border-blue-500/30">
              <SafeIcon icon={FiTrendingUp} className="text-blue-400 text-sm" />
              <span className="text-blue-400 font-bold text-sm">
                {profile?.total_goals || 0}
              </span>
            </div>

            {/* Boost indicator */}
            {isBoostActive() && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30"
              >
                <SafeIcon icon={FiZap} className="text-yellow-400 text-sm" />
                <span className="text-yellow-400 font-bold text-xs">BOOST</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {level.next && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getLevelProgress()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-sm shadow-yellow-500/50"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">
                Nível {level.current.level}
              </span>
              <span className="text-xs text-gray-400">
                {profile?.total_goals || 0} / {level.next.min} gols
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default HUDPlayerStats