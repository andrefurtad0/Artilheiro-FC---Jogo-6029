import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } = FiIcons;

export const ToastContext = React.createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto remove after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => React.useContext(ToastContext);

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ id, message, type, onClose }) => {
  const [progress, setProgress] = useState(100);
  const duration = 5000; // Default duration

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return FiCheckCircle;
      case 'error': return FiAlertCircle;
      case 'warning': return FiAlertTriangle;
      case 'info': return FiInfo;
      default: return FiInfo;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success': return 'from-green-500 to-green-600';
      case 'error': return 'from-red-500 to-red-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'info': return 'from-blue-500 to-blue-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden w-full"
    >
      <div className="p-4 flex">
        <div className={`flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center`}>
          <SafeIcon icon={getIcon()} className="text-white" />
        </div>
        
        <div className="flex-1 pr-2">
          <p className="text-white">{message}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white focus:outline-none"
        >
          <SafeIcon icon={FiX} />
        </button>
      </div>
      
      {/* Progress bar */}
      <div 
        className={`h-1 ${getColor()} transition-all duration-100 ease-linear`}
        style={{ width: `${progress}%` }}
      />
    </motion.div>
  );
};

export default Toast;