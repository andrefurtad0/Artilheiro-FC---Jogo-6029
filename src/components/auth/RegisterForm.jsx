import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../config/supabase';
import { useToast } from '../ui/Toast';

const { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiShield, FiTarget } = FiIcons;

const RegisterForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamHeartId: '',
    teamDefendingId: ''
  });
  const [teams, setTeams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (!error) {
        setTeams(data || []);
      } else {
        console.error('Error fetching teams:', error);
        showToast('Erro ao carregar times. Tente novamente.', 'error');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      showToast('Erro ao carregar times. Tente novamente.', 'error');
    }
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          showToast('Por favor, informe seu nome', 'warning');
          return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          showToast('Por favor, informe um email válido', 'warning');
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          showToast('A senha deve ter pelo menos 6 caracteres', 'warning');
          return false;
        }
        return true;
      case 2:
        if (!formData.teamDefendingId) {
          showToast('Por favor, selecione um time para defender!', 'warning');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) {
      if (validateStep(step)) {
        setStep(step + 1);
      }
      return;
    }

    // Se não tiver escolhido time do coração, usa o time de defesa
    const finalTeamHeartId = formData.teamHeartId || formData.teamDefendingId;

    setLoading(true);
    setError('');

    try {
      console.log('Iniciando registro...', {
        email: formData.email,
        name: formData.name,
        teamHeartId: finalTeamHeartId,
        teamDefendingId: formData.teamDefendingId
      });

      // Criar usuário com metadados corretos
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            team_heart_id: finalTeamHeartId,
            team_defending_id: formData.teamDefendingId
          }
        }
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('Registro bem-sucedido:', data);
      showToast('Conta criada com sucesso! Entrando...', 'success');

      // Aguardar um momento para o sistema processar
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message.includes('Password')) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('secondary_color')) {
        errorMessage = 'Erro interno do sistema. Tente novamente em alguns instantes.';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <span className="text-4xl">⚽</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Comece Sua Jornada</h2>
              <p className="text-gray-400 text-sm">Passo 1: Seus dados básicos</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3 text-gray-400 text-lg" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400 text-lg" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <div className="relative">
                  <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                    <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/20"
              >
                <SafeIcon icon={FiTarget} className="text-white text-4xl" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Escolha Seu Time!</h2>
              <p className="text-gray-300 text-sm mb-4">Este será o time que você defenderá em campo</p>
              <div className="bg-green-700/20 p-3 rounded-lg border border-green-600/30 mb-2">
                <p className="text-green-400 text-sm">Com este time você marcará gols e participará do ranking!</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto py-2">
                {teams.map(team => (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, teamDefendingId: team.id }))}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all border-2
                      ${formData.teamDefendingId === team.id 
                        ? 'bg-gray-700 border-green-500 shadow-lg shadow-green-500/20' 
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: team.primary_color }}
                      >
                        <span className="text-white font-bold text-lg">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white font-medium">{team.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-center text-sm text-gray-400">
                Selecione o time que você vai defender nas partidas
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-6">
              <motion.div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <SafeIcon icon={FiHeart} className="text-white text-3xl" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Time do Coração</h2>
              <p className="text-gray-400 text-xs mb-4">(Opcional) Este time não afeta sua jogabilidade</p>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto py-2">
                {teams.map(team => (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData(prev => ({ ...prev, teamHeartId: team.id }))}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-all border
                      ${formData.teamHeartId === team.id 
                        ? 'bg-gray-700 border-red-400' 
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: team.primary_color }}
                      >
                        <span className="text-white font-bold text-xs">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-white text-sm">{team.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-center text-sm text-gray-400">
                <p className="mb-2">Não encontra seu time favorito?</p>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, teamHeartId: formData.teamDefendingId }))}
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Usar mesmo time de defesa
                </button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
    >
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

      {/* Progress Indicator */}
      <div className="flex justify-between mb-6 px-2">
        {[1, 2, 3].map(stepNumber => (
          <div key={stepNumber} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === stepNumber 
                ? 'bg-green-500 text-white' 
                : step > stepNumber 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-800 text-gray-400'
            }`}>
              {step > stepNumber ? <SafeIcon icon={FiIcons.FiCheck} /> : stepNumber}
            </div>
            {stepNumber !== 3 && (
              <div className={`h-1 w-16 mt-4 -ml-4 ${
                step > stepNumber ? 'bg-green-500' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {renderStep()}

        <div className="mt-6 flex space-x-3">
          {step > 1 && (
            <motion.button
              type="button"
              onClick={() => setStep(step - 1)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
            >
              Voltar
            </motion.button>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Processando...</span>
              </div>
            ) : (
              step === 3 ? 'Criar Conta' : 'Continuar'
            )}
          </motion.button>
        </div>

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
      </form>
    </motion.div>
  );
};

export default RegisterForm;