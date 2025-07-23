import React from 'react'
import {motion} from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const {FiHome, FiUsers, FiShield, FiTrophy, FiCalendar, FiAward, FiSettings, FiLogOut, FiArrowLeft} = FiIcons

const AdminSidebar = ({activeSection, onSectionChange, onLogout, onBackToApp}) => {
  const menuItems = [
    {id: 'dashboard', label: 'Dashboard', icon: FiHome},
    {id: 'users', label: 'Usuários', icon: FiUsers},
    {id: 'teams', label: 'Times', icon: FiShield},
    {id: 'championships', label: 'Campeonatos', icon: FiTrophy},
    {id: 'rounds', label: 'Rodadas', icon: FiCalendar},
    {id: 'levels', label: 'Níveis', icon: FiAward}
  ]

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">⚽ Admin Panel</h1>
        <p className="text-sm text-gray-400">Futebol Digital</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors
                  ${activeSection === item.id 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <SafeIcon icon={item.icon} className="text-lg" />
                <span className="font-medium">{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-full bg-green-400 rounded-r-full"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Voltar ao App</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiLogOut} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar