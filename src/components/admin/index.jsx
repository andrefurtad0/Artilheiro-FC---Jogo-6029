import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDemoData } from '../../hooks/useDemoData'
import { supabase } from '../../config/supabase'
import AdminSidebar from './AdminSidebar'
import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers'
import AdminTeams from './AdminTeams'
import AdminChampionships from './AdminChampionships'
import AdminRounds from './AdminRounds'
import AdminLevels from './AdminLevels'

const AdminPanel = ({ onBackToApp }) => {
  const { user, signOut } = useAuth()
  const { isDemoMode, demoData } = useDemoData()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [user, isDemoMode, demoData])

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      // Check if in demo mode
      if (isDemoMode && demoData) {
        console.log("Demo admin check:", demoData)
        setIsAdmin(demoData.isAdmin === true)
        setLoading(false)
        return
      }
      
      // Check real Supabase user
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        
      if (!error && data) {
        setIsAdmin(data.is_admin || false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const handleBackToApp = () => {
    if (onBackToApp) {
      onBackToApp()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-gray-400 mb-4">Você não tem permissão para acessar esta área.</p>
          <button
            onClick={handleBackToApp}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />
      case 'users':
        return <AdminUsers />
      case 'teams':
        return <AdminTeams />
      case 'championships':
        return <AdminChampionships />
      case 'rounds':
        return <AdminRounds />
      case 'levels':
        return <AdminLevels />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        onBackToApp={handleBackToApp}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default AdminPanel