import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import { format, isAfter, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiCalendar, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiPlay, FiPause, FiChevronDown, FiChevronUp, FiInfo, FiLoader } = FiIcons

const AdminRounds = () => {
  const [rounds, setRounds] = useState([])
  const [championships, setChampionships] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRound, setEditingRound] = useState(null)
  const [formData, setFormData] = useState({
    championship_id: '',
    team_a_id: '',
    team_b_id: '',
    start_time: '',
    end_time: '',
    status: 'scheduled'
  })
  const [expandedRound, setExpandedRound] = useState(null)
  const [matches, setMatches] = useState({})
  const [loadingMatches, setLoadingMatches] = useState({})
  const [advancingRound, setAdvancingRound] = useState(false)

  useEffect(() => {
    fetchRounds()
    fetchChampionships()
    fetchTeams()
  }, [])

  const fetchRounds = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          championship:championships(*)
        `)
        .order('start_time', { ascending: false })

      if (!error) {
        setRounds(data || [])
      }
    } catch (error) {
      console.error('Error fetching rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChampionships = async () => {
    try {
      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (!error) {
        setChampionships(data || [])
      }
    } catch (error) {
      console.error('Error fetching championships:', error)
    }
  }

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')

      if (!error) {
        setTeams(data || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchMatchesForRound = async (roundId) => {
    setLoadingMatches(prev => ({ ...prev, [roundId]: true }))
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team_a:teams!team_a_id(*),
          team_b:teams!team_b_id(*)
        `)
        .eq('round_id', roundId)
        .order('match_number', { ascending: true, nullsLast: true })

      if (!error) {
        setMatches(prev => ({ ...prev, [roundId]: data || [] }))
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoadingMatches(prev => ({ ...prev, [roundId]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Check if dates are valid
      const startTime = new Date(formData.start_time)
      const endTime = new Date(formData.end_time)
      
      if (isNaN(startTime) || isNaN(endTime)) {
        alert('Datas inválidas')
        return
      }
      
      if (isBefore(endTime, startTime)) {
        alert('A data de fim deve ser após a data de início')
        return
      }
      
      // Check if there's already a round in this time period
      const { data: existingRounds, error: checkError } = await supabase
        .from('rounds')
        .select('id')
        .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`)
        .not('id', 'eq', editingRound?.id || '')
      
      if (checkError) {
        throw checkError
      }
      
      if (existingRounds && existingRounds.length > 0) {
        alert('Já existe uma rodada neste período. Escolha outras datas.')
        return
      }

      const roundData = {
        championship_id: formData.championship_id,
        team_a_id: formData.team_a_id,
        team_b_id: formData.team_b_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        status: formData.status
      }

      if (editingRound) {
        const { error: updateError } = await supabase
          .from('rounds')
          .update(roundData)
          .eq('id', editingRound.id)

        if (!updateError) {
          setEditingRound(null)
        } else {
          throw updateError
        }
      } else {
        const { error: insertError } = await supabase
          .from('rounds')
          .insert([roundData])

        if (insertError) {
          throw insertError
        }
      }

      // Reset form data and fetch updated rounds
      setFormData({
        championship_id: '',
        team_a_id: '',
        team_b_id: '',
        start_time: '',
        end_time: '',
        status: 'scheduled'
      })
      setShowForm(false)
      fetchRounds()
    } catch (error) {
      console.error('Error saving round:', error)
      alert(`Error saving round: ${error.message}`)
    }
  }

  const handleEdit = (round) => {
    setEditingRound(round)
    setFormData({
      championship_id: round.championship_id,
      team_a_id: round.team_a_id,
      team_b_id: round.team_b_id,
      start_time: format(new Date(round.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(new Date(round.end_time), "yyyy-MM-dd'T'HH:mm"),
      status: round.status
    })
    setShowForm(true)
  }

  const handleDelete = async (roundId) => {
    if (!confirm('Tem certeza que deseja excluir esta rodada?')) return

    try {
      // Check if there are active matches
      const { data: activeMatches, error: checkError } = await supabase
        .from('matches')
        .select('id')
        .eq('round_id', roundId)
        .eq('status', 'active')
        .limit(1)
      
      if (checkError) {
        throw checkError
      }
      
      if (activeMatches && activeMatches.length > 0) {
        alert('Não é possível excluir uma rodada com partidas ativas!')
        return
      }
      
      // Delete matches first
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .eq('round_id', roundId)
      
      if (matchesError) {
        throw matchesError
      }
      
      // Then delete the round
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)

      if (!error) {
        fetchRounds()
      } else {
        throw error
      }
    } catch (error) {
      console.error('Error deleting round:', error)
      alert(`Error deleting round: ${error.message}`)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingRound(null)
    setFormData({
      championship_id: '',
      team_a_id: '',
      team_b_id: '',
      start_time: '',
      end_time: '',
      status: 'scheduled'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: 'Agendada', color: 'bg-blue-100 text-blue-800', icon: FiCalendar },
      active: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: FiPlay },
      finished: { label: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: FiPause }
    }

    const config = statusConfig[status] || statusConfig.scheduled

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <SafeIcon icon={config.icon} className="text-xs" />
        <span>{config.label}</span>
      </span>
    )
  }

  const generateDefaultEndTime = (startTime) => {
    if (!startTime) return ''
    
    const start = new Date(startTime)
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000) // 24 hours later
    return format(end, "yyyy-MM-dd'T'HH:mm")
  }

  const toggleRoundDetails = (roundId) => {
    if (expandedRound === roundId) {
      setExpandedRound(null)
    } else {
      setExpandedRound(roundId)
      if (!matches[roundId]) {
        fetchMatchesForRound(roundId)
      }
    }
  }

  const advanceRound = async (championship_id) => {
    if (!confirm('Tem certeza que deseja avançar manualmente para a próxima rodada?')) return
    
    setAdvancingRound(true)
    
    try {
      const { data, error } = await supabase.rpc('force_next_round', {
        championship_name: championship_id // Passing the championship_id
      })
      
      if (error) {
        throw error
      }
      
      alert(data.message || 'Rodada avançada com sucesso')
      fetchRounds()
    } catch (error) {
      console.error('Error advancing round:', error)
      alert(`Erro ao avançar rodada: ${error.message}`)
    } finally {
      setAdvancingRound(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Rodadas</h1>
          <p className="text-gray-400">Gerencie as rodadas dos campeonatos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiPlus} />
          <span>Nova Rodada</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {editingRound ? 'Editar Rodada' : 'Nova Rodada'}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campeonato
              </label>
              <select
                value={formData.championship_id}
                onChange={(e) => setFormData(prev => ({ ...prev, championship_id: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Selecione um campeonato</option>
                {championships.map(championship => (
                  <option key={championship.id} value={championship.id}>
                    {championship.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time A
                </label>
                <select
                  value={formData.team_a_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_a_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Selecione o Time A</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time B
                </label>
                <select
                  value={formData.team_b_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_b_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Selecione o Time B</option>
                  {teams
                    .filter(team => team.id !== formData.team_a_id)
                    .map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data/Hora de Início
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => {
                    const newStartTime = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      start_time: newStartTime,
                      end_time: prev.end_time || generateDefaultEndTime(newStartTime)
                    }))
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data/Hora de Fim
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="scheduled">Agendada</option>
                <option value="active">Ativa</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSave} />
                <span>{editingRound ? 'Atualizar' : 'Salvar'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Rounds List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          rounds.map((round, index) => (
            <motion.div
              key={round.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiCalendar} className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {round.championship?.name} - Rodada {round.round_number}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(round.status)}
                  <button
                    onClick={() => handleEdit(round)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(round.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCalendar} className="text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Início: {format(new Date(round.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiCalendar} className="text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Fim: {format(new Date(round.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <button
                  onClick={() => toggleRoundDetails(round.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={expandedRound === round.id ? FiChevronUp : FiChevronDown} />
                  <span>{expandedRound === round.id ? 'Esconder Partidas' : 'Ver Partidas'}</span>
                </button>
                {round.status === 'active' && (
                  <button
                    onClick={() => advanceRound(round.championship?.id)}
                    disabled={advancingRound}
                    className={`flex items-center space-x-2 px-4 py-2 ${
                      advancingRound ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white rounded-lg transition-colors`}
                  >
                    {advancingRound ? (
                      <>
                        <SafeIcon icon={FiLoader} className="animate-spin" />
                        <span>Avançando...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiPlay} />
                        <span>Avançar Rodada</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Expanded matches section */}
              {expandedRound === round.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 border-t border-gray-700 pt-4"
                >
                  {loadingMatches[round.id] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    </div>
                  ) : matches[round.id] && matches[round.id].length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Partidas da Rodada</h4>
                      {matches[round.id].map((match) => (
                        <div key={match.id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: match.team_a?.primary_color || '#ccc' }} />
                              <span className="text-sm text-white">{match.team_a?.name}</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                              {match.score_team_a} × {match.score_team_b}
                            </span>
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: match.team_b?.primary_color || '#ccc' }} />
                              <span className="text-sm text-white">{match.team_b?.name}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {getStatusBadge(match.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <SafeIcon icon={FiInfo} className="text-gray-500 text-2xl mx-auto mb-2" />
                      <p className="text-gray-500">Nenhuma partida encontrada para esta rodada</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {!loading && rounds.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCalendar} className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Nenhuma rodada cadastrada</p>
          <p className="text-gray-500">Clique em "Nova Rodada" para começar</p>
        </div>
      )}
    </div>
  )
}

export default AdminRounds