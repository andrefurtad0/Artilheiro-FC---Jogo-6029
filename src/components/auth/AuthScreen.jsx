import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { supabase } from '../../config/supabase';
import Logo from '../ui/Logo';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import DemoLogin from './DemoLogin';
import { useToast } from '../ui/Toast';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { showToast } = useToast();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Reset any form errors
    if (isLogin) {
      showToast('Vamos criar sua conta!', 'info');
    } else {
      showToast('Bem-vindo de volta!', 'info');
    }
  };

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
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6" size="lg" variant="full" />
        </div>

        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LoginForm onToggleForm={toggleForm} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <RegisterForm onToggleForm={toggleForm} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;