import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiAward, FiPlus, FiEdit, FiTrash2, FiSave, FiX } = FiIcons

const AdminLevels = () => {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLevel, setEditingLevel] = useState(null)
  const [formData, setFormData] = useState({
    level_number: '',
    name: '',
    min_goals: '',
    max_goals: '',
    reward_description: ''
  })

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number')

      if (!error) {
        setLevels(data || [])
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const levelData = {
        level_number: parseInt(formData.level_number),
        name: formData.name,
        min_goals: parseInt(formData.min_goals),
        max_goals: parseInt(formData.max_goals),
        reward_description: formData.reward_description
      }
      
      // Validate that min_goals is less than max_goals
      if (levelData.min_goals >= levelData.max_goals) {
        alert('O valor mínimo de gols deve ser menor que o valor máximo!')
        return
      }
      
      // Check for overlapping ranges with other levels
      const overlappingLevel = levels
        .filter(level => level.id !== editingLevel?.id) // Exclude the current level being edited
        .find(level => {
          // Check if the new range overlaps with an existing range
          return (
            (levelData.min_goals >= level.min_goals && levelData.min_goals <= level.max_goals) ||
            (levelData.max_goals >= level.min_goals && levelData.max_goals <= level.max_goals) ||
            (levelData.min_goals <= level.min_goals && levelData.max_goals >= level.max_goals)
          )
        })
      
      if (overlappingLevel) {
        alert(`A faixa de gols se sobrepõe com o nível "${overlappingLevel.name}" (${overlappingLevel.min_goals}-${overlappingLevel.max_goals})`)
        return
      }

      if (editingLevel) {
        const { error: updateError } = await supabase
          .from('levels')
          .update(levelData)
          .eq('id', editingLevel.id)

        if (!updateError) {
          setEditingLevel(null)
        } else {
          throw updateError
        }
      } else {
        // Check if level number already exists
        const { data: existingLevel, error: checkError } = await supabase
          .from('levels')
          .select('id')
          .eq('level_number', levelData.level_number)
          .limit(1)
        
        if (checkError) {
          throw checkError
        }
        
        if (existingLevel && existingLevel.length > 0) {
          alert(`Já existe um nível com o número ${levelData.level_number}!`)
          return
        }
        
        const { error: insertError } = await supabase
          .from('levels')
          .insert([levelData])

        if (insertError) {
          throw insertError
        } else {
          setShowForm(false)
        }
      }

      // Reset form data and fetch updated levels
      setFormData({
        level_number: '',
        name: '',
        min_goals: '',
        max_goals: '',
        reward_description: ''
      })
      fetchLevels()
    } catch (error) {
      console.error('Error saving level:', error)
      alert(`Error saving level: ${error.message}`)
    }
  }

  const handleEdit = (level) => {
    setEditingLevel(level)
    setFormData({
      level_number: level.level_number.toString(),
      name: level.name,
      min_goals: level.min_goals.toString(),
      max_goals: level.max_goals.toString(),
      reward_description: level.reward_description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (levelId) => {
    if (!confirm('Tem certeza que deseja excluir este nível?')) return

    try {
      // First check if there are users at this level
      const levelToDelete = levels.find(level => level.id === levelId)
      if (!levelToDelete) return
      
      const { data: usersAtLevel, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .gte('total_goals', levelToDelete.min_goals)
        .lte('total_goals', levelToDelete.max_goals)
        .limit(1)
      
      if (userCheckError) {
        throw userCheckError
      }
      
      if (usersAtLevel && usersAtLevel.length > 0) {
        alert('Não é possível excluir este nível pois existem usuários nele!')
        return
      }

      const { error } = await supabase
        .from('levels')
        .delete()
        .eq('id', levelId)

      if (!error) {
        fetchLevels()
      } else {
        throw error
      }
    } catch (error) {
      console.error('Error deleting level:', error)
      alert(`Error deleting level: ${error.message}`)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingLevel(null)
    setFormData({
      level_number: '',
      name: '',
      min_goals: '',
      max_goals: '',
      reward_description: ''
    })
  }

  const getLevelBadge = (levelNumber) => {
    const colors = [
      'bg-gray-600',
      'bg-green-600',
      'bg-blue-600',
      'bg-purple-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-orange-600',
      'bg-teal-600'
    ]

    const colorIndex = (levelNumber - 1) % colors.length
    return colors[colorIndex]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Níveis</h1>
          <p className="text-gray-400">Gerencie os níveis de gamificação</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiPlus} />
          <span>Novo Nível</span>
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
              {editingLevel ? 'Editar Nível' : 'Novo Nível'}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SafeIcon icon={FiX} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Número do Nível
                </label>
                <input
                  type="number"
                  value={formData.level_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, level_number: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="1"
                  disabled={editingLevel !== null} // Disable editing level number for existing levels
                />
                {editingLevel && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Número do nível não pode ser alterado
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome do Nível
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  placeholder="Ex: Estreante da Várzea"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gols Mínimos
                </label>
                <input
                  type="number"
                  value={formData.min_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_goals: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Gols Máximos
                </label>
                <input
                  type="number"
                  value={formData.max_goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_goals: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Descrição do Prêmio
              </label>
              <textarea
                value={formData.reward_description}
                onChange={(e) => setFormData(prev => ({ ...prev, reward_description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Ex: Sorteio de brinde"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSave} />
                <span>{editingLevel ? 'Atualizar' : 'Salvar'}</span>
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

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getLevelBadge(level.level_number)}`}>
                    <span className="text-white font-bold text-lg">{level.level_number}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{level.name}</h3>
                    <p className="text-sm text-gray-400">
                      {level.min_goals} - {level.max_goals} gols
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(level)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(level.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                </div>
              </div>
              {level.reward_description && (
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    <strong>Prêmio:</strong> {level.reward_description}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {!loading && levels.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiAward} className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Nenhum nível cadastrado</p>
          <p className="text-gray-500">Clique em "Novo Nível" para começar</p>
        </div>
      )}
    </div>
  )
}

export default AdminLevels