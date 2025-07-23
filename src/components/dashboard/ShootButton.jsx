import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiTarget, FiClock, FiZap } = FiIcons

const ShootButton = ({ canShoot, shooting, timeLeft, onShoot, currentRound }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCircleProgress = () => {
    if (canShoot || !timeLeft) return 0
    // Assuming different cooldown times based on plan
    const totalTime = 1200 // 20 minutes for free plan (in seconds)
    const progress = ((totalTime - timeLeft) / totalTime) * 283 // 283 is circumference
    return Math.max(0, progress)
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Outer glow ring - only when can shoot */}
            {canShoot && currentRound && !shooting && (
              <div className="absolute inset-0 rounded-full animate-pulse bg-green-500/20" 
                   style={{ transform: 'scale(1.3)' }} />
            )}
            
            {/* Progress ring for cooldown */}
            <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className={canShoot ? "text-gray-600" : "text-gray-700"}
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
              onClick={canShoot && currentRound && !shooting ? onShoot : undefined}
              disabled={!canShoot || shooting || !currentRound}
              className={`
                relative w-20 h-20 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center
                ${canShoot && currentRound && !shooting
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 hover:shadow-green-500/70 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
              whileHover={canShoot && currentRound && !shooting ? { scale: 1.05 } : {}}
              whileTap={canShoot && currentRound && !shooting ? { scale: 0.95 } : {}}
            >
              {shooting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <SafeIcon icon={FiZap} className="text-xl" />
                </motion.div>
              ) : canShoot && currentRound ? (
                <SafeIcon icon={FiTarget} className="text-xl" />
              ) : (
                <SafeIcon icon={FiClock} className="text-xl" />
              )}
            </motion.button>

            {/* Sparkle effects - only when can shoot */}
            {canShoot && currentRound && !shooting && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-green-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateY(-50px)`
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
        </div>

        {/* Status text */}
        <div className="text-center mt-3">
          {shooting ? (
            <motion.p 
              className="text-green-400 font-medium text-sm"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              CHUTANDO...
            </motion.p>
          ) : canShoot && currentRound ? (
            <p className="text-green-400 font-medium text-sm">
              CHUTAR AGORA!
            </p>
          ) : timeLeft > 0 ? (
            <div className="text-center">
              <p className="text-gray-500 text-sm font-medium">
                Próximo chute em
              </p>
              <p className="text-gray-400 text-lg font-bold">
                {formatTime(timeLeft)}
              </p>
            </div>
          ) : !currentRound ? (
            <p className="text-gray-500 text-sm">
              Nenhuma partida ativa
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              Aguarde...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShootButton