import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import Logo from '../ui/Logo'

const { FiUser, FiShield, FiHeart, FiTarget, FiTrendingUp, FiAward, FiClock, FiZap, FiShoppingCart, FiCalendar } = FiIcons

const Profile = () => {
  const { user } = useAuth()
  const { profile, loading } = useUserProfile(user?.id)

  const getLevelInfo = (totalGoals) => {
    const levels = [
      { min: 0, max: 9, name: 'Estreante da Várzea', level: 1 },
      { min: 10, max: 19, name: 'Matador da Pelada', level: 2 },
      { min: 20, max: 49, name: 'Craque da Vila', level: 3 },
      { min: 50, max: 99, name: 'Artilheiro do Bairro', level: 4 },
      { min: 100, max: 199, name: 'Ídolo Local', level: 5 },
      { min: 200, max: 399, name: 'Astro Estadual', level: 6 },
      { min: 400, max: 699, name: 'Maestro Nacional', level: 7 },
      { min: 700, max: 999, name: 'Bola de Ouro Regional', level: 8 },
      { min: 1000, max: 1499, name: 'Lenda do Futebol', level: 9 },
      { min: 1500, max: 999999, name: 'Imortal das Quatro Linhas', level: 10 }
    ]

    const currentLevel = levels.find(l => totalGoals >= l.min && totalGoals <= l.max)
    const nextLevel = levels.find(l => l.level === (currentLevel?.level || 0) + 1)

    return {
      current: currentLevel || levels[0],
      next: nextLevel,
      progress: nextLevel ? ((totalGoals - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100
    }
  }

  const getPlanInfo = (plan) => {
    const plans = {
      free: { name: 'Gratuito', color: 'bg-gray-700 text-gray-300' },
      monthly: { name: 'Mensal', color: 'bg-blue-600 text-blue-100' },
      annual: { name: 'Anual', color: 'bg-green-600 text-green-100' }
    }
    return plans[plan] || plans.free
  }

  const isBoostActive = () => {
    if (!profile?.boost_expires_at) return false
    return new Date(profile.boost_expires_at) > new Date()
  }

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
      icon: FiZap,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'boost_week',
      name: 'Boost Semanal',
      price: 'R$ 29,90',
      description: 'Chutes a cada 5 minutos por 7 dias',
      icon: FiCalendar,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Logo className="mx-auto mb-6" size="md" variant="full" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  const levelInfo = getLevelInfo(profile?.total_goals || 0)
  const planInfo = getPlanInfo(profile?.plan || 'free')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Logo className="mx-auto mb-4" size="sm" variant="fc" />
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiUser} className="inline mr-2" />
            Meu Perfil
          </h1>
          <p className="text-gray-400">Suas estatísticas e conquistas</p>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiShield} className="text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Time Defendido</p>
                <p className="font-medium text-white">
                  {profile?.team_defending?.name || 'Nenhum'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiHeart} className="text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Time do Coração</p>
                <p className="font-medium text-white">
                  {profile?.team_heart?.name || 'Nenhum'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plan and Boost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Plano Atual</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${planInfo.color}`}>
              {planInfo.name}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Boost Status</h3>
            {isBoostActive() ? (
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiZap} className="text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-green-400">Boost Ativo</p>
                  <p className="text-xs text-gray-400">
                    Expira em: {format(new Date(profile.boost_expires_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiClock} className="text-gray-400" />
                <p className="text-sm text-gray-400">Nenhum boost ativo</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats - Garantir que mostra 0 se não houver dados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Gols na Rodada</h3>
              <SafeIcon icon={FiTarget} className="text-green-400 text-2xl" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {profile?.gols_current_round || 0}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Total de Gols</h3>
              <SafeIcon icon={FiTrendingUp} className="text-blue-400 text-2xl" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {profile?.total_goals || 0}
            </p>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Nível Atual</h3>
            <SafeIcon icon={FiAward} className="text-yellow-400 text-2xl" />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Nível {levelInfo.current.level}: {levelInfo.current.name}
              </span>
              {levelInfo.next && (
                <span className="text-sm text-gray-400">
                  Próximo: {levelInfo.next.name}
                </span>
              )}
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${levelInfo.progress}%` }}
              ></div>
            </div>

            {levelInfo.next && (
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>{profile?.total_goals || 0} gols</span>
                <span>{levelInfo.next.min} gols</span>
              </div>
            )}
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-yellow-400 mb-2">Prêmios do Nível Atual:</h4>
            <p className="text-sm text-gray-300">
              {levelInfo.current.level === 1 && "Nenhum prêmio ainda"}
              {levelInfo.current.level === 2 && "Sorteio de brinde"}
              {levelInfo.current.level === 3 && "Cupom de boost"}
              {levelInfo.current.level === 4 && "Sorteio R$50 em boost"}
              {levelInfo.current.level === 5 && "Sorteio de camisa"}
              {levelInfo.current.level === 6 && "Sorteio de ticket"}
              {levelInfo.current.level === 7 && "Gift Card R$100"}
              {levelInfo.current.level === 8 && "Sorteio de prêmio exclusivo"}
              {levelInfo.current.level === 9 && "Sorteio mensal de camisa"}
              {levelInfo.current.level === 10 && "Sorteio anual de viagem"}
            </p>
          </div>
        </motion.div>

        {/* Plans Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <SafeIcon icon={FiShoppingCart} className="mr-2" />
              Planos Disponíveis
            </h2>
          </div>

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <SafeIcon icon={FiZap} className="mr-2" />
              Boosts Disponíveis
            </h2>
          </div>

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
                  <div className={`w-12 h-12 bg-gradient-to-br ${boost.color} rounded-full flex items-center justify-center`}>
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
      </div>
    </div>
  )
}

export default Profile