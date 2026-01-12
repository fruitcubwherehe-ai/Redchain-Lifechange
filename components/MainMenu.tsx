
import React from 'react';
import { motion } from 'framer-motion';
import { AppScreen } from '../types';
import { Play, Settings, X } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: AppScreen) => void;
  activeColor: string;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, activeColor }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 transition-all duration-1000" 
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${activeColor}22 0%, transparent 70%), radial-gradient(circle at 0% 0%, ${activeColor}11 0%, transparent 50%)` 
        }} 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col gap-5 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h1 
            className="text-6xl font-black tracking-tighter mb-2"
            style={{ color: activeColor, textShadow: `0 0 30px ${activeColor}33` }}
          >
            CORE
          </motion.h1>
          <p className="text-gray-600 uppercase tracking-[0.4em] text-[9px] font-medium">
            Neuro-Chain Optimization System
          </p>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={() => onNavigate(AppScreen.DASHBOARD)}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          className="group relative h-16 w-full border border-white/5 rounded-[22px] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex items-center justify-center transition-all hover:border-white/10"
        >
          <div className="flex items-center gap-4 text-white uppercase tracking-[0.4em] font-bold text-sm">
            <Play size={16} fill={activeColor} className="text-transparent transition-transform group-hover:scale-110" />
            <span>Play</span>
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={() => onNavigate(AppScreen.SETTINGS)}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          className="group relative h-16 w-full border border-white/5 rounded-[22px] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex items-center justify-center transition-all hover:border-white/10"
        >
          <div className="flex items-center gap-4 text-white uppercase tracking-[0.4em] font-bold text-sm">
            <Settings size={16} className="text-gray-400 group-hover:text-white transition-all group-hover:rotate-45" />
            <span>Settings</span>
          </div>
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={() => onNavigate(AppScreen.EXIT)}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,68,68,0.05)' }}
          whileTap={{ scale: 0.98 }}
          className="group relative h-16 w-full border border-white/5 rounded-[22px] bg-white/[0.02] backdrop-blur-xl overflow-hidden flex items-center justify-center transition-all hover:border-red-500/20"
        >
          <div className="flex items-center gap-4 text-white uppercase tracking-[0.4em] font-bold text-sm">
            <X size={16} className="text-gray-500 group-hover:text-red-500 transition-all" />
            <span>Exit</span>
          </div>
        </motion.button>

        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-[8px] text-gray-700 uppercase tracking-widest font-mono">
            Encrypted Session Link Active
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
