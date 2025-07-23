import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../config/supabase'
import { format, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiUsers, FiShield, FiTrophy, FiCalendar, FiTrendingUp, FiActivity } = FiIcons

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    activeChampionships: 0,
    activeRounds: 0
  })
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchChartData()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch real stats from Supabase
      const { data: userCount, error: userError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
      
      const { data: teamCount, error: teamError } = await supabase
        .from('teams')
        .select('id', { count: 'exact', head: true })
      
      const { data: activeChampionships, error: champError } = await supabase
        .from('championships')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
      
      const { data: activeRounds, error: roundError } = await supabase
        .from('rounds')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
      
      if (userError || teamError || champError || roundError) {
        console.error('Error fetching stats:', userError || teamError || champError || roundError)
        return
      }

      setStats({
        totalUsers: userCount?.count || 0,
        totalTeams: teamCount?.count || 0,
        activeChampionships: activeChampionships?.count || 0,
        activeRounds: activeRounds?.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchChartData = async () => {
    try {
      const dates = []
      const userCounts = []
      
      // Get the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i))
        const formattedDate = format(date, 'dd/MM', { locale: ptBR })
        dates.push(formattedDate)
        
        // For each day, get the count of users created on that day
        const startDate = date
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        
        const { data, error } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString())
        
        if (error) {
          console.error('Error fetching chart data:', error)
          userCounts.push(0)
        } else {
          userCounts.push(data?.count || 0)
        }
      }
      
      setChartData({ dates, userCounts })
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
          <p className="text-gray-400">Visão geral do sistema</p>
        </div>
        <div className="flex items-center space-x-2 text-green-400">
          <SafeIcon icon={FiActivity} />
          <span className="text-sm">Sistema Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Usuários</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <SafeIcon icon={FiUsers} className="text-3xl text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Times Cadastrados</p>
              <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
            </div>
            <SafeIcon icon={FiShield} className="text-3xl text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Campeonatos Ativos</p>
              <p className="text-3xl font-bold text-white">{stats.activeChampionships}</p>
            </div>
            <SafeIcon icon={FiTrophy} className="text-3xl text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rodadas Ativas</p>
              <p className="text-3xl font-bold text-white">{stats.activeRounds}</p>
            </div>
            <SafeIcon icon={FiCalendar} className="text-3xl text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-6">Novos Usuários nos Últimos 7 Dias</h3>
        <div className="h-[400px] flex items-end justify-between">
          {chartData.userCounts.map((count, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-12 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                style={{ 
                  height: `${Math.max(30, (count / Math.max(...chartData.userCounts, 1)) * 300)}px` 
                }}
              />
              <div className="mt-2 text-xs text-gray-400">{chartData.dates[index]}</div>
              <div className="mt-1 text-sm text-white font-medium">{count}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <SafeIcon icon={FiUsers} className="text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-white">Novo Usuário</p>
              <p className="text-sm text-gray-400">Cadastrar manualmente</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <SafeIcon icon={FiTrophy} className="text-yellow-400" />
            <div className="text-left">
              <p className="font-medium text-white">Novo Campeonato</p>
              <p className="text-sm text-gray-400">Criar competição</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <SafeIcon icon={FiCalendar} className="text-purple-400" />
            <div className="text-left">
              <p className="font-medium text-white">Gerar Rodadas</p>
              <p className="text-sm text-gray-400">Automático</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard