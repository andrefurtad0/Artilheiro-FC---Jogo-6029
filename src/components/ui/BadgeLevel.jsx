import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiAward, FiStar, FiTrophy } = FiIcons

const BadgeLevel = ({ level, size = 'md', showName = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  }

  const getBadgeIcon = (levelNumber) => {
    if (levelNumber <= 3) return FiStar
    if (levelNumber <= 6) return FiAward
    return FiTrophy
  }

  const getBadgeColor = (levelNumber) => {
    const colors = [
      'from-gray-400 to-gray-600',     // 1
      'from-green-400 to-green-600',   // 2
      'from-blue-400 to-blue-600',     // 3
      'from-purple-400 to-purple-600', // 4
      'from-yellow-400 to-yellow-600', // 5
      'from-red-400 to-red-600',       // 6
      'from-pink-400 to-pink-600',     // 7
      'from-indigo-400 to-indigo-600', // 8
      'from-orange-400 to-orange-600', // 9
      'from-amber-400 to-amber-600'    // 10
    ]
    return colors[(levelNumber - 1) % colors.length]
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex flex-col items-center"
    >
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${getBadgeColor(level)} rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg relative`}>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full"></div>
        
        <span className="text-white font-black z-10">
          {level}
        </span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      
      {showName && size !== 'sm' && (
        <span className="text-xs text-gray-300 mt-1 font-medium">
          Nível {level}
        </span>
      )}
    </motion.div>
  )
}

export default BadgeLevel