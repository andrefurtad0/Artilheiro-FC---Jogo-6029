import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const BottomNav=({activeTab,onTabChange,isAdmin})=> {
  const tabs=[ 
    {id: 'dashboard',label: 'Início',icon: FiIcons.FiHome},
    {id: 'rankings',label: 'Rankings',icon: FiIcons.FiTrophy},
    {id: 'rounds',label: 'Rodadas',icon: FiIcons.FiCalendar},
    {id: 'gamification',label: 'Níveis',icon: FiIcons.FiAward},
    {id: 'profile',label: 'Perfil',icon: FiIcons.FiUser}
  ];

  // Add admin tab if user is admin
  if (isAdmin) {
    tabs.splice(4,0,{
      id: 'admin',
      label: 'Admin',
      icon: FiIcons.FiSettings
    });
  }

  return (
    <motion.div
      initial={{y: 100}}
      animate={{y: 0}}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-800/90 backdrop-blur-md border-t border-gray-700/50 z-30"
    >
      <div className="container mx-auto px-2">
        <div className="flex justify-around py-2">
          {tabs.map((tab)=> (
            <motion.button
              key={tab.id}
              onClick={()=> onTabChange(tab.id)}
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.95}}
              className={`
                flex flex-col items-center py-2 px-2 rounded-xl transition-all relative
                ${activeTab===tab.id 
                  ? 'text-green-400' 
                  : 'text-gray-400 hover:text-gray-300'
                }
                ${tab.id==='admin' ? 'text-red-400' : ''}
              `}
            >
              {activeTab===tab.id && (
                <motion.div
                  layoutId="activeGlow"
                  className={`absolute inset-0 rounded-xl border ${
                    tab.id==='admin' 
                      ? 'bg-red-400/10 border-red-400/30' 
                      : 'bg-green-400/10 border-green-400/30'
                  }`}
                />
              )}
              
              <motion.div
                animate={activeTab===tab.id ? {scale: [1,1.2,1]} : {}}
                transition={{duration: 0.3}}
              >
                <SafeIcon 
                  icon={tab.icon} 
                  className={`text-lg mb-1 ${
                    activeTab===tab.id 
                      ? tab.id==='admin' ? 'text-red-400' : 'text-green-400'
                      : tab.id==='admin' ? 'text-red-400' : ''
                  }`} 
                />
              </motion.div>
              
              <span className={`text-xs font-medium ${tab.id==='admin' ? 'text-red-400' : ''}`}>
                {tab.label}
              </span>
              
              {activeTab===tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 rounded-full shadow-lg ${
                    tab.id==='admin' 
                      ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-red-400/50'
                      : 'bg-gradient-to-r from-green-400 to-lime-400 shadow-green-400/50'
                  }`}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BottomNav;