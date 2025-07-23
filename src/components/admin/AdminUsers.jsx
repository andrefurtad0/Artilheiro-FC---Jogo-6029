import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiUsers, FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX, FiChevronLeft, FiChevronRight, FiX, FiSave } = FiIcons

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [teams, setTeams] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    team_heart_id: '',
    team_defending_id: '',
    plan: 'free',
    status: 'active'
  })
  const [showEditModal, setShowEditModal] = useState(false)
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [currentPage, searchTerm, statusFilter])
  
  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      if (!error && data) {
        setTeams(data)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          team_defending:teams!team_defending_id(*),
          team_heart:teams!team_heart_id(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (!error) {
        setUsers(data || [])
        setTotalUsers(count || 0)
        setTotalPages(Math.ceil((count || 0) / itemsPerPage))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (!error) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (!error) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
  
  const handleEditClick = (user) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      team_heart_id: user.team_heart_id || '',
      team_defending_id: user.team_defending_id || '',
      plan: user.plan || 'free',
      status: user.status || 'active'
    })
    setShowEditModal(true)
  }
  
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editFormData.name,
          email: editFormData.email,
          team_heart_id: editFormData.team_heart_id,
          team_defending_id: editFormData.team_defending_id,
          plan: editFormData.plan,
          status: editFormData.status
        })
        .eq('id', editingUser.id)
      
      if (!error) {
        setShowEditModal(false)
        fetchUsers()
      } else {
        console.error('Error updating user:', error)
        alert('Erro ao atualizar usuário: ' + error.message)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Erro ao atualizar usuário')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      suspended: { label: 'Suspenso', color: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
    }

    const config = statusConfig[status] || statusConfig.active

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPlanBadge = (plan) => {
    const planConfig = {
      free: { label: 'Gratuito', color: 'bg-gray-100 text-gray-800' },
      monthly: { label: 'Mensal', color: 'bg-blue-100 text-blue-800' },
      annual: { label: 'Anual', color: 'bg-green-100 text-green-800' }
    }

    const config = planConfig[plan] || planConfig.free

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Usuários</h1>
          <p className="text-gray-400">Gerencie todos os usuários do sistema</p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {totalUsers} usuários
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Times
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Gols
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        <div>❤️ {user.team_heart?.name || 'Nenhum'}</div>
                        <div>🛡️ {user.team_defending?.name || 'Nenhum'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(user.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        <div>Rodada: {user.gols_current_round || 0}</div>
                        <div>Total: {user.total_goals || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiEdit} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          <SafeIcon icon={user.status === 'active' ? FiUserX : FiUserCheck} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-600">
            <div className="text-sm text-gray-400">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiChevronLeft} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiChevronRight} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Editar Usuário</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <SafeIcon icon={FiX} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time do Coração</label>
                <select
                  value={editFormData.team_heart_id}
                  onChange={(e) => setEditFormData({...editFormData, team_heart_id: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Selecione um time</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time Defendido</label>
                <select
                  value={editFormData.team_defending_id}
                  onChange={(e) => setEditFormData({...editFormData, team_defending_id: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Selecione um time</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Plano</label>
                <select
                  value={editFormData.plan}
                  onChange={(e) => setEditFormData({...editFormData, plan: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="free">Gratuito</option>
                  <option value="monthly">Mensal</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <SafeIcon icon={FiSave} className="mr-2" />
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers