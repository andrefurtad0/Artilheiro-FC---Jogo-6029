import React, {useState} from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const {FiUser, FiPlay, FiShield} = FiIcons;

const DemoLogin = ({onDemoLogin}) => {
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const demoAccounts = [
    {
      id: 'demo-user-1',
      name: 'João Silva',
      email: 'joao@demo.com',
      teamDefending: 'Flamengo Digital',
      teamHeart: 'Flamengo Digital',
      totalGoals: 150,
      golsCurrentRound: 5,
      plan: 'monthly',
      level: 3,
      isAdmin: false
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
      level: 7,
      isAdmin: true
    },
    {
      id: 'demo-user-2',
      name: 'Maria Santos',
      email: 'maria@demo.com',
      teamDefending: 'Palmeiras Cyber',
      teamHeart: 'Palmeiras Cyber',
      totalGoals: 75,
      golsCurrentRound: 3,
      plan: 'free',
      level: 2,
      isAdmin: false
    }
  ];

  const handleDemoLogin = async (account) => {
    setSelectedAccount(account);
    setLoading(true);
    
    try {
      // Simular delay de login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Logging in with demo account:", account);
      
      // Salvar dados demo no localStorage com a flag isAdmin explícita
      localStorage.setItem('demo-user', JSON.stringify(account));
      localStorage.setItem('demo-mode', 'true');
      
      // Chamar callback se fornecido
      if (onDemoLogin) {
        onDemoLogin(account);
      }
      
      // Recarregar a página para aplicar o login
      window.location.reload();
    } catch (error) {
      console.error('Erro no login demo:', error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">⚽ Futebol Digital</h1>
        <p className="text-gray-400">Modo Demo - Escolha uma conta para testar</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {demoAccounts.map((account) => (
          <motion.div
            key={account.id}
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            whileHover={{scale: 1.05}}
            className={`bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 ${
              selectedAccount?.id === account.id ? 'border-green-500' : 'border-transparent'
            }`}
            onClick={() => handleDemoLogin(account)}
          >
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  account.isAdmin ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <SafeIcon icon={account.isAdmin ? FiShield : FiUser} className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {account.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <p>📧 {account.email}</p>
                <p>⚽ {account.teamDefending}</p>
                <p>🎯 {account.totalGoals} gols totais</p>
                <p>🏆 {account.golsCurrentRound} gols na rodada</p>
                <p>📈 Nível {account.level}</p>
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    account.plan === 'free'
                      ? 'bg-gray-100 text-gray-800'
                      : account.plan === 'monthly'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {account.plan === 'free' ? 'Gratuito' : account.plan === 'monthly' ? 'Mensal' : 'Anual'}
                </div>
              </div>
              {account.isAdmin && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium mb-4">
                  👑 Acesso Admin
                </div>
              )}
              <button
                disabled={loading && selectedAccount?.id === account.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  loading && selectedAccount?.id === account.id
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : account.isAdmin
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading && selectedAccount?.id === account.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{rotate: 360}}
                      transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar como Demo'
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        className="bg-gray-800 rounded-2xl shadow-lg p-6"
      >
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
              <li>✅ Painel admin (conta admin)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Limitações Demo:</h4>
            <ul className="space-y-1">
              <li>⚠️ Dados não são salvos permanentemente</li>
              <li>⚠️ Pagamentos desabilitados</li>
              <li>⚠️ Sem autenticação real</li>
              <li>⚠️ Funcionalidades limitadas</li>
              <li>⚠️ Dados são resetados ao recarregar</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoLogin;