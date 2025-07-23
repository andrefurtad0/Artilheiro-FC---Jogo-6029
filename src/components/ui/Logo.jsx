import React from 'react';
import {motion} from 'framer-motion';

const Logo = ({className = "", size = "md", variant = "full"}) => {
  const sizes = {
    sm: {shield: "h-8", text: "h-6"},
    md: {shield: "h-12", text: "h-8"},
    lg: {shield: "h-16", text: "h-12"},
    xl: {shield: "h-24", text: "h-16"}
  };

  const logoSizes = sizes[size] || sizes.md;

  // For responsive designs
  const showFull = variant === "full";
  const showFC = variant === "fc";
  const showShieldOnly = variant === "shield";

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      transition={{type: "spring", stiffness: 300, damping: 20}}
    >
      {/* Shield/Brasão - Usando emoji como fallback */}
      <motion.div
        whileHover={{scale: 1.05, transition: {duration: 0.3}}}
        className="relative"
      >
        <div className={`${logoSizes.shield} w-auto flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-green-400 shadow-lg`}>
          <span className="text-white font-bold text-2xl">⚽</span>
        </div>
      </motion.div>

      {/* Text Logo */}
      {(showFull || showFC) && !showShieldOnly && (
        <motion.div
          className="ml-3"
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
        >
          {showFull && (
            <div className="flex flex-col">
              <span className={`font-black text-green-500 tracking-widest leading-none ${
                size === 'sm' ? 'text-lg' : 
                size === 'md' ? 'text-xl' : 
                size === 'lg' ? 'text-2xl' : 'text-3xl'
              }`}>
                ARTILHEIRO
              </span>
              <span className={`font-bold text-gray-400 tracking-wider leading-none ${
                size === 'sm' ? 'text-xs' : 
                size === 'md' ? 'text-sm' : 
                size === 'lg' ? 'text-base' : 'text-lg'
              }`}>
                DIGITAL
              </span>
            </div>
          )}
          {showFC && !showFull && (
            <span className={`font-black text-green-500 tracking-widest ${
              size === 'sm' ? 'text-lg' : 
              size === 'md' ? 'text-xl' : 
              size === 'lg' ? 'text-2xl' : 'text-3xl'
            }`}>
              FC
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Logo;