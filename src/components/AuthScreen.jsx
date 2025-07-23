import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMockAuth } from '../hooks/useMockAuth';
import * as FiIcons from 'react-icons/fi';
import { mockTeams } from '../config/mockData';

const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useMockAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Para demo, aceitar qualquer email com formato válido
    if (email.includes('@') && password.length > 0) {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Email ou senha incorretos');
      }
    } else {
      setError('Email ou senha inválidos');
    }
    
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <span className="text-3xl">⚽</span>
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
        <p className="text-gray-400 text-sm">Entre para continuar jogando</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <div className="relative">
            <FiIcons.FiMail className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
          <div className="relative">
            <FiIcons.FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 text-lg transition-colors"
            >
              {showPassword ? <FiIcons.FiEyeOff /> : <FiIcons.FiEye />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Entrando...</span>
            </div>
          ) : (
            'Entrar no Jogo'
          )}
        </motion.button>
      </form>

      {/* Toggle */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Não tem conta?{' '}
          <button
            onClick={onToggleForm}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Criar conta
          </button>
        </p>
      </div>
    </motion.div>
  );
};

const RegisterForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamHeartId: '',
    teamDefendingId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useMockAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Para demo, aceitar qualquer registro válido
      if (formData.name && formData.email.includes('@') && formData.password.length >= 6) {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          team_heart_id: formData.teamHeartId || mockTeams[0].id,
          team_defending_id: formData.teamDefendingId || mockTeams[0].id,
        });
      } else {
        throw new Error('Dados inválidos');
      }
    } catch (error) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <span className="text-3xl">⚽</span>
        </motion.div>
        <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
        <p className="text-gray-400 text-sm">Junte-se à competição!</p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
          <div className="relative">
            <FiIcons.FiUser className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              placeholder="Seu nome completo"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <div className="relative">
            <FiIcons.FiMail className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
          <div className="relative">
            <FiIcons.FiLock className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 text-lg transition-colors"
            >
              {showPassword ? <FiIcons.FiEyeOff /> : <FiIcons.FiEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FiIcons.FiHeart className="inline mr-1 text-red-400" /> Time do Coração
          </label>
          <select
            value={formData.teamHeartId}
            onChange={(e) => handleChange('teamHeartId', e.target.value)}
            className="w-full px-3 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
            required
          >
            <option value="">Selecione seu time do coração</option>
            {mockTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FiIcons.FiShield className="inline mr-1 text-green-400" /> Time que vai Defender
          </label>
          <select
            value={formData.teamDefendingId}
            onChange={(e) => handleChange('teamDefendingId', e.target.value)}
            className="w-full px-3 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
            required
          >
            <option value="">Selecione o time para defender</option>
            {mockTeams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Criando conta...</span>
            </div>
          ) : (
            'Começar Partida'
          )}
        </motion.button>
      </form>

      {/* Toggle */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Já tem conta?{' '}
          <button
            onClick={onToggleForm}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Entrar
          </button>
        </p>
      </div>
    </motion.div>
  );
};

const DemoLogin = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);
  
  const demoAccounts = [
    {
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@demo.com',
      teamDefending: 'Flamengo Digital',
      teamHeart: 'Flamengo Digital',
      totalGoals: 150,
      golsCurrentRound: 5,
      plan: 'monthly'
    },
    {
      id: 'demo-admin',
      name: 'Admin Demo',
      email: 'admin@demo.com',
      teamDefending: 'Corinthians Virtual',
      teamHeart: 'Corinthians Virtual',
      totalGoals: 500,
      golsCurrentRound: 12,
      plan: 'annual',
      isAdmin: true
    },
    {
      id: 'user-2',
      name: 'Maria Santos',
      email: 'maria@demo.com',
      teamDefending: 'Palmeiras Cyber',
      teamHeart: 'Palmeiras Cyber',
      totalGoals: 75,
      golsCurrentRound: 3,
      plan: 'free'
    }
  ];

  const handleDemoLogin = async (account) => {
    setLoading(true);
    
    // Simular delay de login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar objeto de usuário demo
    const demoUser = {
      id: account.id,
      email: account.email,
      user_metadata: { name: account.name }
    };
    
    // Salvar dados demo no localStorage
    localStorage.setItem('demo-user', JSON.stringify(account));
    
    onDemoLogin(demoUser, account);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">⚽ Futebol Digital</h1>
        <p className="text-gray-400">Modo Demo - Escolha uma conta para testar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoAccounts.map((account) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => handleDemoLogin(account)}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${account.isAdmin ? 'bg-red-600' : 'bg-green-600'}`}>
                <FiIcons.FiUser className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {account.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <p>📧 {account.email}</p>
                <p>⚽ {account.teamDefending}</p>
                <p>🎯 {account.totalGoals} gols totais</p>
                <p>🏆 {account.golsCurrentRound} gols na rodada</p>
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  account.plan === 'free' ? 'bg-gray-100 text-gray-800' :
                  account.plan === 'monthly' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {account.plan === 'free' ? 'Gratuito' : account.plan === 'monthly' ? 'Mensal' : 'Anual'}
                </div>
              </div>
              {account.isAdmin && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium mb-4">
                  👑 Acesso Admin
                </div>
              )}
              <button
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                  account.isAdmin ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? 'Entrando...' : 'Entrar como Demo'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">ℹ️ Sobre o Modo Demo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="font-semibold text-white mb-2">Funcionalidades Ativas:</h4>
            <ul className="space-y-1">
              <li>✅ Sistema de chutes simulado</li>
              <li>✅ Rankings em tempo real</li>
              <li>✅ Níveis e progressão</li>
              <li>✅ Perfil do usuário</li>
              <li>✅ Visualização de rodadas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Limitações Demo:</h4>
            <ul className="space-y-1">
              <li>⚠️ Dados não são salvos</li>
              <li>⚠️ Pagamentos desabilitados</li>
              <li>⚠️ Sem autenticação real</li>
              <li>⚠️ Admin apenas visual</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AuthScreen = ({ onDemoLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(true);

  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full">
          <div className="text-center mb-8">
            <motion.button
              onClick={() => setIsDemoMode(false)}
              className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-3 rounded-xl text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔐 Login Real
            </motion.button>
          </div>
          <DemoLogin onDemoLogin={onDemoLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-transparent"></div>
        <div className="absolute inset-0 opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="text-center mb-8">
          <motion.button
            onClick={() => setIsDemoMode(true)}
            className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-3 rounded-xl text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎮 Modo Demo
          </motion.button>
        </div>
        
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthScreen;