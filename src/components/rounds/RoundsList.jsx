import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiCalendar, FiClock, FiEye, FiPlay, FiPause } = FiIcons

const RoundsList = ({ onSelectRound }) => {
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRounds()
  }, [])

  const fetchRounds = async () => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          team_a:teams!team_a_id(*),
          team_b:teams!team_b_id(*),
          championship:championships(*)
        `)
        .order('start_time', { ascending: false })

      if (!error) {
        setRounds(data)
      }
    } catch (error) {
      console.error('Error fetching rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (round) => {
    const now = new Date()
    const startTime = new Date(round.start_time)
    const endTime = new Date(round.end_time)

    if (now < startTime) {
      return { status: 'upcoming', label: 'Agendada', color: 'bg-blue-600 text-blue-100' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Ativa', color: 'bg-green-600 text-green-100' }
    } else {
      return { status: 'finished', label: 'Encerrada', color: 'bg-gray-600 text-gray-300' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiCalendar} className="inline mr-2" />
            Rodadas
          </h1>
          <p className="text-gray-400">Acompanhe as partidas atuais e futuras</p>
        </motion.div>

        {/* Rounds List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando rodadas...</p>
            </div>
          ) : (
            rounds.map((round, index) => {
              const statusInfo = getStatusInfo(round)
              return (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.status === 'active' && <SafeIcon icon={FiPlay} className="inline mr-1" />}
                        {statusInfo.status === 'finished' && <SafeIcon icon={FiPause} className="inline mr-1" />}
                        {statusInfo.status === 'upcoming' && <SafeIcon icon={FiClock} className="inline mr-1" />}
                        {statusInfo.label}
                      </div>
                      {round.championship && (
                        <span className="text-sm text-gray-400">
                          {round.championship.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onSelectRound(round)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <SafeIcon icon={FiEye} />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">
                            {round.team_a?.name?.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          {round.team_a?.name}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {round.score_team_a} × {round.score_team_b}
                        </div>
                        <p className="text-xs text-gray-400">PLACAR</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-white font-bold">
                            {round.team_b?.name?.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white">
                          {round.team_b?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">
                        Início: {format(new Date(round.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-gray-400">
                        Fim: {format(new Date(round.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}

          {!loading && rounds.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhuma rodada encontrada
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default RoundsList