import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiTrophy, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiUsers, FiLoader, FiCalendar } = FiIcons

const AdminChampionships = () => {
  const [championships, setChampionships] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChampionship, setEditingChampionship] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'league',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    selectedTeams: []
  })
  const [generatingMatches, setGeneratingMatches] = useState(false)

  useEffect(() => {
    fetchChampionships()
    fetchTeams()
  }, [])

  const fetchChampionships = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('championships')
        .select(`
          *,
          championship_teams (
            team:teams (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (!error) {
        setChampionships(data || [])
      }
    } catch (error) {
      console.error('Error fetching championships:', error)
    } finally {
      setLoading(false)
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

  const findNextAvailableDate = async () => {
    try {
      // Find the latest end date of any active championship
      const { data, error } = await supabase
        .from('rounds')
        .select('end_time')
        .order('end_time', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('Error finding next available date:', error)
        return new Date()
      }
      
      if (data && data.length > 0) {
        // Add one day to the latest end date
        const latestEndDate = new Date(data[0].end_time)
        latestEndDate.setDate(latestEndDate.getDate() + 1)
        return latestEndDate
      } else {
        // If no rounds exist, use tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow
      }
    } catch (error) {
      console.error('Error finding next available date:', error)
      return new Date()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar número de times
    if (formData.type === 'league' && formData.selectedTeams.length !== 10 && formData.selectedTeams.length !== 20) {
      alert('Ligas devem ter exatamente 10 ou 20 times')
      return
    }

    if (formData.type === 'cup' && formData.selectedTeams.length !== 8 && formData.selectedTeams.length !== 16) {
      alert('Copas devem ter exatamente 8 ou 16 times')
      return
    }

    setGeneratingMatches(true)
    
    try {
      let championshipId
      let startDate = new Date(formData.start_date)
      
      if (!startDate || isNaN(startDate.getTime())) {
        // If invalid date, find next available date
        startDate = await findNextAvailableDate()
      }

      if (editingChampionship) {
        const { error: updateError } = await supabase
          .from('championships')
          .update({
            name: formData.name,
            type: formData.type,
            status: formData.status,
            start_date: startDate.toISOString()
          })
          .eq('id', editingChampionship.id)

        if (!updateError) {
          championshipId = editingChampionship.id

          // Delete existing team relationships
          await supabase
            .from('championship_teams')
            .delete()
            .eq('championship_id', championshipId)
        } else {
          throw updateError
        }
      } else {
        const { data, error: insertError } = await supabase
          .from('championships')
          .insert([{
            name: formData.name,
            type: formData.type,
            status: formData.status,
            start_date: startDate.toISOString(),
            current_round: 1
          }])
          .select()

        if (!insertError && data) {
          championshipId = data[0].id
        } else {
          throw insertError
        }
      }

      // Insert team relationships
      if (championshipId && formData.selectedTeams.length > 0) {
        const teamRelations = formData.selectedTeams.map(teamId => ({
          championship_id: championshipId,
          team_id: teamId
        }))

        const { error: teamRelationError } = await supabase
          .from('championship_teams')
          .insert(teamRelations)

        if (teamRelationError) {
          throw teamRelationError
        }

        // Generate matches automatically after creating the championship
        if (formData.type === 'league') {
          // Generate league matches
          const { error: genError } = await supabase.rpc('generate_league_tournament', {
            championship_id: championshipId,
            start_date: startDate.toISOString()
          })

          if (genError) {
            console.error('Error generating league matches:', genError)
            alert(`Erro ao gerar jogos da liga: ${genError.message}`)
          }
        } else {
          // Generate cup matches
          const { error: genError } = await supabase.rpc('generate_cup_tournament', {
            championship_id: championshipId,
            start_date: startDate.toISOString()
          })

          if (genError) {
            console.error('Error generating cup matches:', genError)
            alert(`Erro ao gerar jogos da copa: ${genError.message}`)
          }
        }
      }

      setShowForm(false)
      setEditingChampionship(null)
      setFormData({
        name: '',
        type: 'league',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        selectedTeams: []
      })
      
      fetchChampionships()
    } catch (error) {
      console.error('Error saving championship:', error)
      alert(`Erro ao salvar campeonato: ${error.message}`)
    } finally {
      setGeneratingMatches(false)
    }
  }

  const handleEdit = (championship) => {
    setEditingChampionship(championship)
    
    // Format the start date if it exists
    let formattedStartDate = new Date().toISOString().split('T')[0]
    if (championship.start_date) {
      const date = new Date(championship.start_date)
      if (!isNaN(date.getTime())) {
        formattedStartDate = date.toISOString().split('T')[0]
      }
    }
    
    setFormData({
      name: championship.name,
      type: championship.type,
      status: championship.status,
      start_date: formattedStartDate,
      selectedTeams: championship.championship_teams.map(ct => ct.team.id)
    })
    setShowForm(true)
  }

  const handleDelete = async (championshipId) => {
    if (!confirm('Tem certeza que deseja excluir este campeonato?')) return

    try {
      // Check if there are active rounds
      const { data: activeRounds, error: checkError } = await supabase
        .from('rounds')
        .select('id')
        .eq('championship_id', championshipId)
        .eq('status', 'active')
        .limit(1)
      
      if (checkError) {
        throw checkError
      }
      
      if (activeRounds && activeRounds.length > 0) {
        alert('Não é possível excluir um campeonato com rodadas ativas!')
        return
      }
      
      // Delete all related data in the correct order
      // 1. Delete matches
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .eq('championship_id', championshipId)
      
      if (matchesError) {
        throw matchesError
      }
      
      // 2. Delete rounds
      const { error: roundsError } = await supabase
        .from('rounds')
        .delete()
        .eq('championship_id', championshipId)
      
      if (roundsError) {
        throw roundsError
      }
      
      // 3. Delete championship teams
      const { error: teamsError } = await supabase
        .from('championship_teams')
        .delete()
        .eq('championship_id', championshipId)
      
      if (teamsError) {
        throw teamsError
      }
      
      // 4. Finally delete the championship
      const { error } = await supabase
        .from('championships')
        .delete()
        .eq('id', championshipId)

      if (!error) {
        fetchChampionships()
      } else {
        throw error
      }
    } catch (error) {
      console.error('Error deleting championship:', error)
      alert(`Erro ao excluir campeonato: ${error.message}`)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingChampionship(null)
    setFormData({
      name: '',
      type: 'league',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      selectedTeams: []
    })
  }

  const handleTeamToggle = (teamId) => {
    setFormData(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter(id => id !== teamId)
        : [...prev.selectedTeams, teamId]
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      finished: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
      scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' }
    }

    const config = statusConfig[status] || statusConfig.active

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      league: { label: 'Liga', color: 'bg-blue-100 text-blue-800' },
      cup: { label: 'Copa', color: 'bg-purple-100 text-purple-800' }
    }

    const config = typeConfig[type] || typeConfig.league

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getTeamRequirementText = (type) => {
    if (type === 'league') {
      return 'Liga deve ter 10 ou 20 times';
    } else {
      return 'Copa deve ter 8 ou 16 times';
    }
  }

  const isValidTeamCount = (type, count) => {
    if (type === 'league') {
      return count === 10 || count === 20;
    } else {
      return count === 8 || count === 16;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Campeonatos</h1>
          <p className="text-gray-400">Gerencie campeonatos e competições</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiPlus} />
          <span>Novo Campeonato</span>
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
              {editingChampionship ? 'Editar Campeonato' : 'Novo Campeonato'}
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
                Nome do Campeonato
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    // Reset selected teams when changing type to avoid invalid counts
                    setFormData(prev => ({
                      ...prev,
                      type: e.target.value,
                      selectedTeams: []
                    }))
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="league">Liga (Pontos Corridos)</option>
                  <option value="cup">Copa (Mata-mata)</option>
                </select>
                <p className="mt-1 text-xs text-yellow-400">
                  {getTeamRequirementText(formData.type)}
                </p>
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
                  <option value="active">Ativo</option>
                  <option value="scheduled">Agendado</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data de Início
                </label>
                <div className="relative">
                  <SafeIcon icon={FiCalendar} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full pl-10 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Times Participantes
                </label>
                <span className={`text-xs font-medium ${
                  isValidTeamCount(formData.type, formData.selectedTeams.length)
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}>
                  {formData.selectedTeams.length} selecionados
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {teams.map(team => (
                  <label
                    key={team.id}
                    className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedTeams.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.primary_color }}
                    />
                    <span className="text-sm text-white">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={
                  generatingMatches || 
                  !isValidTeamCount(formData.type, formData.selectedTeams.length)
                }
                className={`flex items-center space-x-2 px-4 py-2 ${
                  generatingMatches || !isValidTeamCount(formData.type, formData.selectedTeams.length)
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors`}
              >
                {generatingMatches ? (
                  <>
                    <SafeIcon icon={FiLoader} className="animate-spin" />
                    <span>Gerando Jogos...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSave} />
                    <span>{editingChampionship ? 'Atualizar' : 'Salvar'}</span>
                  </>
                )}
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

      {/* Championships List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          championships.map((championship, index) => (
            <motion.div
              key={championship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiTrophy} className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{championship.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeBadge(championship.type)}
                      {getStatusBadge(championship.status)}
                      <span className="text-sm text-gray-400">
                        Rodada: {championship.current_round || 1} / {championship.total_rounds || '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(championship)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(championship.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <SafeIcon icon={FiUsers} className="text-gray-400" />
                <span className="text-sm text-gray-400">
                  {championship.championship_teams.length} times participantes
                </span>
                {championship.start_date && (
                  <span className="text-sm text-gray-400 ml-4">
                    <SafeIcon icon={FiCalendar} className="inline mr-1" />
                    Início: {new Date(championship.start_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {championship.championship_teams.map(ct => (
                  <div
                    key={ct.team.id}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-full"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ct.team.primary_color }}
                    />
                    <span className="text-sm text-white">{ct.team.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!loading && championships.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiTrophy} className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Nenhum campeonato cadastrado</p>
          <p className="text-gray-500">Clique em "Novo Campeonato" para começar</p>
        </div>
      )}
    </div>
  )
}

export default AdminChampionships