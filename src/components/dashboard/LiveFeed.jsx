import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiTarget, FiClock, FiZap } = FiIcons

const LiveFeed = ({ goals }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - new Date(timestamp)
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes < 1) return 'agora'
    if (minutes === 1) return '1 min'
    return `${minutes} min`
  }

  if (!goals || goals.length === 0) return null

  return (
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
        <SafeIcon icon={FiZap} className="text-yellow-400" />
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {goals.slice(0, 3).map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300
              }}
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
                  <SafeIcon icon={FiClock} className="mr-1" />
                  {formatTimeAgo(goal.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default LiveFeed