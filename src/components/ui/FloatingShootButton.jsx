import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiZap, FiClock, FiTarget } = FiIcons

const FloatingShootButton = ({ canShoot, shooting, timeLeft, onShoot, currentMatch }) => {
  const [showCelebration, setShowCelebration] = useState(false)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleShoot = async () => {
    if (canShoot && currentMatch && !shooting) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
      await onShoot()
    }
  }

  const getCircleProgress = () => {
    if (canShoot || !timeLeft) return 0
    const totalTime = 1200 // 20 minutes default
    const progress = ((totalTime - timeLeft) / totalTime) * 283
    return Math.max(0, progress)
  }

  return (
    <>
      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
          >
            {/* GOL Text */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: [0, 1.5, 1.2], y: [50, -20, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-8xl font-black text-yellow-400 drop-shadow-2xl mb-8"
              style={{ textShadow: '0 0 20px rgba(251,191,36,0.8)' }}
            >
              GOL!
            </motion.div>

            {/* Soccer Ball Animation */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 2, 1.5], rotate: [0, 360, 720], y: [-100, 0, -50] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute text-6xl"
            >
              ⚽
            </motion.div>

            {/* Fireworks/Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 18) * (100 + Math.random() * 100),
                  y: Math.sin(i * 18) * (100 + Math.random() * 100),
                }}
                transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: ['#FFD700', '#FF6B35', '#00FF00', '#FF1493', '#00BFFF'][i % 5]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed bottom-24 right-6 z-[9999]">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative"
        >
          {/* Glow effect when can shoot */}
          {canShoot && currentMatch && !shooting && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-lime-400 animate-ping opacity-30" />
          )}

          {/* Progress ring */}
          <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-700"
            />
            {!canShoot && timeLeft > 0 && (
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-500"
                strokeDasharray="283"
                strokeDashoffset={283 - getCircleProgress()}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            )}
          </svg>

          {/* Main button */}
          <motion.button
            onClick={handleShoot}
            disabled={!canShoot || shooting || !currentMatch}
            className={`
              relative w-20 h-20 rounded-full font-black text-lg transition-all duration-300 flex items-center justify-center border-2 overflow-hidden shadow-2xl
              ${canShoot && currentMatch && !shooting
                ? 'bg-gradient-to-br from-green-400 via-lime-400 to-green-500 border-lime-300 text-black cursor-pointer'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-400 cursor-not-allowed'}
            `}
            whileHover={canShoot && currentMatch && !shooting ? { scale: 1.1, boxShadow: "0 0 30px rgba(34,197,94,0.8)" } : {}}
            whileTap={canShoot && currentMatch && !shooting ? { scale: 0.95 } : {}}
            animate={canShoot && currentMatch && !shooting ? {
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
                  <SafeIcon icon={FiZap} className="text-2xl" />
                </motion.div>
              ) : canShoot && currentMatch ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-3xl"
                >
                  ⚽
                </motion.div>
              ) : (
                <SafeIcon icon={FiClock} className="text-xl" />
              )}
            </div>
          </motion.button>

          {/* Status text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 text-center w-32"
            style={{ width: '120px' }} // Aumentando a largura para garantir que o texto caiba
          >
            {shooting ? (
              <motion.p
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-green-400 font-bold text-xs whitespace-nowrap bg-gray-900/90 px-3 py-1.5 rounded-full border border-green-400/30"
              >
                CHUTANDO...
              </motion.p>
            ) : timeLeft > 0 ? (
              <div className="text-center bg-gray-900/90 px-3 py-1.5 rounded-full border border-gray-600/30">
                <p className="text-gray-400 text-xs font-medium whitespace-nowrap">Próximo em</p>
                <p className="text-yellow-400 text-xs font-bold">{formatTime(timeLeft)}</p>
              </div>
            ) : !currentMatch ? (
              <p className="text-gray-500 text-xs bg-gray-900/90 px-3 py-1.5 rounded-full border border-gray-600/30 whitespace-nowrap">
                Sem partida
              </p>
            ) : (
              <p className="text-green-400 text-xs bg-gray-900/90 px-3 py-1.5 rounded-full border border-green-400/30 whitespace-nowrap">
                CHUTAR AGORA!
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default FloatingShootButton