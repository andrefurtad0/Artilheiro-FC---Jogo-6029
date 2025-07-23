import React from 'react';
import { motion } from 'framer-motion';
import { useMockProfile } from '../hooks/useMockProfile';
import { useMockAuth } from '../hooks/useMockAuth';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Profile = ({ userId, signOut, clearCache }) => {
  const { profile, loading } = useMockProfile(userId);
  
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      interval: '',
      color: 'from-gray-500 to-gray-600',
      features: [
        'Chutes a cada 20 minutos',
        'Acesso básico aos rankings',
        'Participação em rodadas'
      ],
      current: profile?.plan === 'free'
    },
    {
      id: 'monthly',
      name: 'Mensal',
      price: 'R$ 19,90',
      interval: '/mês',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Chutes a cada 10 minutos',
        'Acesso completo aos rankings',
        'Suporte prioritário',
        'Estatísticas avançadas'
      ],
      current: profile?.plan === 'monthly'
    },
    {
      id: 'annual',
      name: 'Anual',
      price: 'R$ 199,90',
      interval: '/ano',
      color: 'from-green-500 to-green-600',
      features: [
        'Chutes a cada 10 minutos',
        'Todos os recursos premium',
        'Suporte VIP',
        'Desconto de 2 meses',
        'Boosts gratuitos mensais'
      ],
      current: profile?.plan === 'annual'
    }
  ];

  const boosts = [
    {
      id: 'boost_24h',
      name: 'Boost 24h',
      price: 'R$ 9,90',
      description: 'Chutes a cada 5 minutos por 24 horas',
      icon: FiIcons.FiZap,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'boost_week',
      name: 'Boost Semanal',
      price: 'R$ 29,90',
      description: 'Chutes a cada 5 minutos por 7 dias',
      icon: FiIcons.FiCalendar,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar o cache? Isso encerrará sua sessão.')) {
      clearCache();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiIcons.FiUser} className="inline mr-2" />
            Meu Perfil
          </h1>
          <p className="text-gray-400">Suas estatísticas e configurações</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
              <p className="text-gray-400">{profile?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiIcons.FiShield} className="text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Time Defendido</p>
                <p className="font-medium text-white">
                  {profile?.team_defending?.name || 'Nenhum'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiIcons.FiHeart} className="text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Time do Coração</p>
                <p className="font-medium text-white">
                  {profile?.team_heart?.name || 'Nenhum'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Gols na Rodada</h3>
              <SafeIcon icon={FiIcons.FiTarget} className="text-green-400 text-2xl" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {profile?.gols_current_round || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Total de Gols</h3>
              <SafeIcon icon={FiIcons.FiTrendingUp} className="text-blue-400 text-2xl" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {profile?.total_goals || 0}
            </p>
          </div>
        </motion.div>

        {/* Plans Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <SafeIcon icon={FiIcons.FiCreditCard} className="mr-2" />
            Planos Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800 rounded-xl p-6 border-2 transition-all ${
                  plan.current
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className={`w-full h-2 bg-gradient-to-r ${plan.color} rounded-full mb-4`} />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.current && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ATUAL
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.interval}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <SafeIcon icon={FiIcons.FiCheck} className="text-green-400 text-sm" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all bg-gradient-to-r ${plan.color} text-white hover:opacity-90`}
                  >
                    {plan.id === 'free' ? 'Plano Atual' : 'Assinar'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Boosts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <SafeIcon icon={FiIcons.FiZap} className="mr-2" />
            Boosts Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boosts.map((boost, index) => (
              <motion.div
                key={boost.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${boost.color} rounded-full flex items-center justify-center`}
                  >
                    <SafeIcon icon={boost.icon} className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{boost.name}</h3>
                    <p className="text-2xl font-bold text-white">{boost.price}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-4">{boost.description}</p>
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all bg-gradient-to-r ${boost.color} text-white hover:opacity-90`}
                >
                  Comprar Boost
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Nível</h3>
            <SafeIcon icon={FiIcons.FiAward} className="text-yellow-400 text-2xl" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{profile?.level || 1}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{profile?.level_name || 'Estreante'}</p>
              <p className="text-sm text-gray-400">Próximo nível em 100 gols</p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: '45%' }}
            ></div>
          </div>
        </motion.div>

        {/* Logout & Clear Cache Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4"
        >
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
          >
            <SafeIcon icon={FiIcons.FiLogOut} />
            <span>Sair da Conta</span>
          </button>
          
          <button
            onClick={handleClearCache}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors"
          >
            <SafeIcon icon={FiIcons.FiRefreshCw} />
            <span>Limpar Cache</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;