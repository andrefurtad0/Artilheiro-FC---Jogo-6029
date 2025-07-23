import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiShield, FiPlus, FiEdit, FiTrash2, FiSave, FiX } = FiIcons

const AdminTeams = () => {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    primary_color: '#000000',
    secondary_color: '#FFFFFF',
    shield_url: ''
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTeam) {
        const { error: updateError } = await supabase
          .from('teams')
          .update({
            name: formData.name,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color || '#FFFFFF',
            shield_url: formData.shield_url
          })
          .eq('id', editingTeam.id)

        if (!updateError) {
          setEditingTeam(null)
        } else {
          console.error('Error updating team:', updateError)
          alert(`Error updating team: ${updateError.message}`)
          return
        }
      } else {
        const { error: insertError } = await supabase
          .from('teams')
          .insert([{
            name: formData.name,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color || '#FFFFFF',
            shield_url: formData.shield_url
          }])

        if (insertError) {
          console.error('Error inserting team:', insertError)
          alert(`Error creating team: ${insertError.message}`)
          return
        }
      }

      // Reset form and fetch updated teams
      setFormData({
        name: '',
        primary_color: '#000000',
        secondary_color: '#FFFFFF',
        shield_url: ''
      })
      setShowForm(false)
      fetchTeams()
    } catch (error) {
      console.error('Error saving team:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      primary_color: team.primary_color,
      secondary_color: team.secondary_color || '#FFFFFF',
      shield_url: team.shield_url || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (teamId) => {
    if (!confirm('Tem certeza que deseja excluir este time?')) return

    try {
      // Check if team is being used by any user
      const { data: usersWithTeam, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .or(`team_heart_id.eq.${teamId},team_defending_id.eq.${teamId}`)
        .limit(1)
      
      if (userCheckError) {
        console.error('Error checking team usage:', userCheckError)
        alert('Erro ao verificar se o time está em uso')
        return
      }
      
      if (usersWithTeam && usersWithTeam.length > 0) {
        alert('Este time não pode ser excluído pois está sendo usado por usuários')
        return
      }
      
      // Check if team is in any championship
      const { data: championshipTeams, error: champCheckError } = await supabase
        .from('championship_teams')
        .select('id')
        .eq('team_id', teamId)
        .limit(1)
      
      if (champCheckError) {
        console.error('Error checking team in championships:', champCheckError)
        alert('Erro ao verificar se o time está em campeonatos')
        return
      }
      
      if (championshipTeams && championshipTeams.length > 0) {
        alert('Este time não pode ser excluído pois está participando de campeonatos')
        return
      }

      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (!error) {
        fetchTeams()
      } else {
        console.error('Error deleting team:', error)
        alert(`Error deleting team: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTeam(null)
    setFormData({
      name: '',
      primary_color: '#000000',
      secondary_color: '#FFFFFF',
      shield_url: ''
    })
  }

  const validateShieldUrl = (url) => {
    if (!url) return true
    return url.startsWith('http://') || url.startsWith('https://')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Times</h1>
          <p className="text-gray-400">Gerencie os times fictícios do sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiPlus} />
          <span>Novo Time</span>
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
              {editingTeam ? 'Editar Time' : 'Novo Time'}
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
                Nome do Time
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cor Primária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL do Escudo (opcional)
              </label>
              <input
                type="url"
                value={formData.shield_url}
                onChange={(e) => setFormData(prev => ({ ...prev, shield_url: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="https://example.com/shield.png"
              />
              {formData.shield_url && !validateShieldUrl(formData.shield_url) && (
                <p className="text-red-400 text-sm mt-1">
                  URL inválida. Use um link que comece com http:// ou https://
                </p>
              )}
              {formData.shield_url && validateShieldUrl(formData.shield_url) && (
                <div className="mt-2 flex items-center">
                  <p className="text-sm text-gray-400 mr-2">Prévia:</p>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border border-gray-600">
                    <img 
                      src={formData.shield_url} 
                      alt="Prévia do escudo" 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                        e.target.style.padding = '4px';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSave} />
                <span>{editingTeam ? 'Atualizar' : 'Salvar'}</span>
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

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: team.primary_color }}
                  >
                    {team.shield_url ? (
                      <img
                        src={team.shield_url}
                        alt={team.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.innerHTML = team.name.charAt(0);
                        }}
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {team.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1" 
                          style={{ backgroundColor: team.primary_color }} 
                        />
                        <p className="text-xs text-gray-400">{team.primary_color}</p>
                      </div>
                      {team.secondary_color && (
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-1" 
                            style={{ backgroundColor: team.secondary_color }} 
                          />
                          <p className="text-xs text-gray-400">{team.secondary_color}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiShield} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    ID: {team.id.slice(0, 8)}...
                  </span>
                </div>
                {team.shield_url && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Escudo:</span>
                    <a 
                      href={team.shield_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 truncate max-w-[150px]"
                    >
                      {team.shield_url}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!loading && teams.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiShield} className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Nenhum time cadastrado</p>
          <p className="text-gray-500">Clique em "Novo Time" para começar</p>
        </div>
      )}
    </div>
  )
}

export default AdminTeams