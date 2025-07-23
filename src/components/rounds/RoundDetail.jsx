import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import Logo from '../ui/Logo'

const { FiArrowLeft, FiClock, FiTarget, FiUsers } = FiIcons

const RoundDetail = ({ round, onBack }) => {
  const [scorers, setScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (round) {
      fetchScorers()
    }
  }, [round])

  const fetchScorers = async () => {
    try {
      // For demo, generate mock scorers
      const mockScorers = [
        { 
          id: 'scorer-1',
          name: 'João Silva',
          gols_current_round: 5,
          team_defending_id: round.team_a_id,
          team_defending: { name: round.team_a.name }
        },
        { 
          id: 'scorer-2',
          name: 'Maria Santos',
          gols_current_round: 3,
          team_defending_id: round.team_a_id,
          team_defending: { name: round.team_a.name }
        },
        { 
          id: 'scorer-3',
          name: 'Pedro Costa',
          gols_current_round: 2,
          team_defending_id: round.team_b_id,
          team_defending: { name: round.team_b.name }
        },
        { 
          id: 'scorer-4',
          name: 'Ana Oliveira',
          gols_current_round: 4,
          team_defending_id: round.team_b_id,
          team_defending: { name: round.team_b.name }
        }
      ];
      
      setScorers(mockScorers);
      setLoading(false);
      
      // If not demo, would fetch from Supabase
      /*
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          team_defending:teams!team_defending_id(*)
        `)
        .or(`team_defending_id.eq.${round.team_a_id},team_defending_id.eq.${round.team_b_id}`)
        .gt('gols_current_round', 0)
        .order('gols_current_round', { ascending: false })

      if (!error) {
        setScorers(data)
      }
      */
    } catch (error) {
      console.error('Error fetching scorers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (round) => {
    const now = new Date()
    const startTime = new Date(round.start_time)
    const endTime = new Date(round.end_time)

    if (now < startTime) {
      return { status: 'upcoming', label: 'Agendada', color: 'bg-blue-100 text-blue-800' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Ativa', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'finished', label: 'Encerrada', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getTeamScorers = (teamId) => {
    return scorers.filter(scorer => scorer.team_defending_id === teamId)
  }

  const statusInfo = getStatusInfo(round)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-all"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Voltar</span>
        </button>
        <div className={`px-4 py-2 rounded-full text-sm font-medium bg-gray-800 ${statusInfo.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
          {statusInfo.label}
        </div>
      </motion.div>

      <Logo className="mx-auto mb-6" size="sm" variant="shield" />
      
      {/* Match Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-blue-500/30 shadow-lg">
              <span className="text-white font-bold text-2xl">
                {round.team_a?.name?.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{round.team_a?.name}</h2>
          </div>
          <div className="text-center px-4">
            <div className="text-5xl font-bold text-white mb-2 font-mono">
              {round.score_team_a} × {round.score_team_b}
            </div>
            <p className="text-gray-400 uppercase tracking-wider text-xs">PLACAR</p>
          </div>
          <div className="text-center flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-red-500/30 shadow-lg">
              <span className="text-white font-bold text-2xl">
                {round.team_b?.name?.charAt(0)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{round.team_b?.name}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiClock} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              Início: {format(new Date(round.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiClock} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              Fim: {format(new Date(round.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>

        {statusInfo.status === 'active' && (
          <div className="mt-4 text-center">
            <p className="text-lg font-medium text-green-400">
              Tempo restante: {formatDistanceToNow(new Date(round.end_time), { locale: ptBR, addSuffix: true })}
            </p>
          </div>
        )}
      </motion.div>

      {/* Scorers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700"
      >
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white flex items-center">
            <SafeIcon icon={FiTarget} className="mr-2" /> Artilheiros da Partida
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando artilheiros...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
            {/* Team A Scorers */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">
                    {round.team_a?.name?.charAt(0)}
                  </span>
                </div>
                {round.team_a?.name}
              </h4>

              <div className="space-y-3">
                {getTeamScorers(round.team_a_id).map((scorer, index) => (
                  <div key={scorer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-300 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-white">{scorer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-400">
                        {scorer.gols_current_round}
                      </span>
                      <SafeIcon icon={FiTarget} className="text-blue-400" />
                    </div>
                  </div>
                ))}

                {getTeamScorers(round.team_a_id).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum artilheiro ainda
                  </p>
                )}
              </div>
            </div>

            {/* Team B Scorers */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">
                    {round.team_b?.name?.charAt(0)}
                  </span>
                </div>
                {round.team_b?.name}
              </h4>

              <div className="space-y-3">
                {getTeamScorers(round.team_b_id).map((scorer, index) => (
                  <div key={scorer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-300 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-white">{scorer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-red-400">
                        {scorer.gols_current_round}
                      </span>
                      <SafeIcon icon={FiTarget} className="text-red-400" />
                    </div>
                  </div>
                ))}

                {getTeamScorers(round.team_b_id).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum artilheiro ainda
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default RoundDetail