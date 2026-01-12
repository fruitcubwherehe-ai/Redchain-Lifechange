
import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GameState, ColorTheme } from '../types';
import { ChevronLeft, Lock, Check, Trash2, ShieldAlert, X, Zap } from 'lucide-react';
import { RESET_STRING, getRankData, RANKS } from '../constants';

interface SettingsProps {
  gameState: GameState;
  onBack: () => void;
  onUnlock: (id: string) => void;
  onSelect: (id: string) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ gameState, onBack, onUnlock, onSelect, onReset }) => {
  const activeColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const currentRankName = RANKS[gameState.stats.rankIndex];
  const { color: rankColor, Icon: RankIcon } = getRankData(currentRankName);

  const iconVariants: Variants = {
    initial: (custom: any) => ({
      filter: custom?.isSelected ? 'grayscale(0%) brightness(100%)' : 'grayscale(100%) brightness(40%)',
      scale: 1,
      boxShadow: custom?.isSelected ? `0 0 20px ${activeColor}44` : '0 0 0px transparent',
    }),
    hover: (custom: any) => ({
      filter: 'grayscale(0%) brightness(120%)',
      scale: 1.2,
      boxShadow: `0 0 30px ${custom?.hex}88`,
      transition: { 
        type: 'spring' as const, 
        stiffness: 300, 
        damping: 15 
      }
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col pb-32"
    >
      <header className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="p-3 border border-[#1A1A1A] rounded-xl hover:bg-white/5 transition-colors group"
        >
          <ChevronLeft size={20} className="text-gray-500 group-hover:text-white transition-colors" />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">System Vault</h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">Advanced Optimization Terminal</p>
        </div>
      </header>

      <div className="bg-[#050505] border border-[#1A1A1A] rounded-[24px] p-8 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-10" style={{ backgroundColor: activeColor }} />
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={10} style={{ color: activeColor }} />
              Mesh Credits
            </p>
          </div>
          <p className="text-3xl font-mono font-bold" style={{ color: activeColor }}>
            {gameState.stats.points.toLocaleString()}
          </p>
        </div>

        <div className="hidden md:block h-10 w-px bg-[#1A1A1A]" />
        
        <div className="text-right relative z-10 w-full md:w-auto">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
            Active Rank
            <RankIcon size={10} style={{ color: rankColor }} />
          </p>
          <p className="text-xl font-bold uppercase tracking-tight" style={{ color: rankColor }}>
            {currentRankName.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-12">
        <h2 className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2">Progressive Skins</h2>
        {gameState.themes.map((theme) => {
          const isSelected = gameState.activeThemeId === theme.id;
          const canAfford = gameState.stats.points >= theme.cost;
          
          return (
            <motion.button
              key={theme.id}
              disabled={!theme.unlocked && !canAfford}
              onClick={() => theme.unlocked ? onSelect(theme.id) : onUnlock(theme.id)}
              initial="initial"
              whileHover="hover"
              custom={{ isSelected, hex: theme.hex }}
              className={`relative flex items-center justify-between p-6 border rounded-[22px] transition-all group overflow-hidden ${
                isSelected 
                  ? 'bg-white/5 border-white/20' 
                  : 'bg-black border-[#1A1A1A] hover:border-white/10 hover:bg-white/[0.01]'
              } ${!theme.unlocked && !canAfford ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
            >
              <motion.div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(circle at 20px 50%, ${theme.hex}, transparent 70%)` }}
              />

              <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                  <motion.div 
                    variants={iconVariants}
                    className="w-12 h-12 rounded-2xl relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: theme.hex }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                    {!theme.unlocked && (
                      <Lock size={16} className="text-black/40 relative z-10" />
                    )}
                  </motion.div>
                  
                  {!theme.unlocked && canAfford && (
                    <motion.div 
                      className="absolute -inset-1 border border-white/10 rounded-2xl"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="text-left">
                  <h3 className="font-bold uppercase tracking-[0.15em] text-sm group-hover:text-white transition-colors">{theme.name}</h3>
                  <p className="text-[9px] text-gray-500 uppercase font-mono mt-1 group-hover:text-gray-400 transition-colors">
                    {theme.unlocked ? 'Registry Unlocked' : `Requirement: ${theme.cost.toLocaleString()} CR`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                {!theme.unlocked ? (
                  <div className="flex items-center gap-3">
                    {canAfford ? (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] text-green-500 font-bold uppercase tracking-widest border border-green-500/30 px-3 py-1.5 rounded-xl bg-green-500/5 backdrop-blur-sm"
                      >
                        Acquire
                      </motion.span>
                    ) : (
                      <Lock size={14} className="text-gray-700" />
                    )}
                  </div>
                ) : isSelected ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-1.5 bg-white/10 rounded-full border border-white/10"
                  >
                    <Check size={14} style={{ color: activeColor }} />
                  </motion.div>
                ) : (
                  <span className="text-[9px] text-gray-800 uppercase tracking-widest group-hover:text-gray-400 transition-colors font-bold">Deploy</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 border-t border-[#1A1A1A]">
        <button 
          onClick={() => setShowResetModal(true)}
          className="w-full py-5 border border-red-950/30 rounded-[20px] bg-red-950/5 text-red-600/60 uppercase tracking-[0.5em] font-bold text-[10px] hover:bg-red-600/10 hover:text-red-500 transition-all flex items-center justify-center gap-3 active:scale-98"
        >
          <Trash2 size={14} />
          Wipe Neural History
        </button>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#050505] border border-red-900/30 rounded-[40px] p-10 flex flex-col items-center text-center shadow-[0_0_100px_rgba(255,0,0,0.1)]"
            >
              <div className="w-20 h-20 bg-red-600/10 border border-red-600/20 rounded-full flex items-center justify-center mb-8">
                <ShieldAlert size={40} className="text-red-600" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Security Override</h2>
              <p className="text-xs text-red-500 uppercase tracking-widest font-mono mb-8 opacity-60">Permanent Data Erase Requested</p>
              
              <div className="bg-black/50 border border-[#1A1A1A] p-6 rounded-2xl mb-8 w-full text-left">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Verification Challenge:</p>
                <p className="font-mono text-[11px] text-gray-400 select-none bg-white/[0.02] p-4 rounded-xl border border-white/5 mb-6 italic">
                  "{RESET_STRING}"
                </p>
                
                <input 
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type verification string..."
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-5 py-4 focus:outline-none focus:border-red-600/50 transition-all font-mono text-xs placeholder:text-gray-800"
                />
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => { setShowResetModal(false); setResetConfirmText(''); }}
                  className="flex-1 py-4 border border-[#1A1A1A] rounded-2xl text-gray-500 uppercase tracking-widest font-bold text-[10px] hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  disabled={resetConfirmText !== RESET_STRING}
                  onClick={() => {
                    onReset();
                    setShowResetModal(false);
                    setResetConfirmText('');
                  }}
                  className={`flex-1 py-4 rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all ${
                    resetConfirmText === RESET_STRING 
                      ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:scale-105 active:scale-95' 
                      : 'bg-[#111] text-gray-800 cursor-not-allowed'
                  }`}
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
