import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../config/supabase';
import { useToast } from '../ui/Toast';

const { FiMail, FiLock, FiEye, FiEyeOff } = FiIcons;

const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      // Login successful - Auth state will be updated automatically
      showToast('Login realizado com sucesso!', 'success');
    } catch (err) {
      console.error('Login error:', err);
      setError('Email ou senha incorretos.');
      showToast('Falha no login. Verifique suas credenciais.', 'error');
    } finally {
      setLoading(false);
    }
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
            <SafeIcon icon={FiMail} className="absolute left-3 top-3 text-gray-400 text-lg" />
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
            <SafeIcon icon={FiLock} className="absolute left-3 top-3 text-gray-400 text-lg" />
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
              <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
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

export default LoginForm;