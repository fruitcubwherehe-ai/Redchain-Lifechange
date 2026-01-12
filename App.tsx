
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppScreen, GameState, Habit, Proof } from './types';
import { INITIAL_THEMES, RANKS, XP_PER_RANK, POINTS_PER_COMPLETION, MISS_PENALTY } from './constants';
import MainMenu from './components/MainMenu';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import SplashScreen from './components/SplashScreen';
import WeeklyReview from './components/WeeklyReview';
import VerificationModal from './components/VerificationModal';
import ProofLogView from './components/ProofLogView';
import ProgressView from './components/ProgressView';
import { saveProofImage, deleteProofImage } from './storage';

const STORAGE_KEY = 'REDCHAIN_HABIT_CORE_STATE_V4';

const getLocalDateString = (date: Date = new Date()) => {
  const pad = (num: number) => (num < 10 ? '0' : '') + num;
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      habits: [],
      stats: { points: 0, totalXP: 0, rankIndex: 0 },
      themes: INITIAL_THEMES,
      activeThemeId: 'red',
      proofLog: []
    };
  });
  
  const [isGlitching, setIsGlitching] = useState(false);
  const [showWeeklyBriefing, setShowWeeklyBriefing] = useState(false);
  const [verificationTargetId, setVerificationTargetId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const checkDateAndReset = useCallback(() => {
    const todayStr = getLocalDateString();
    
    setGameState(prev => {
      if (prev.lastCheckDate && prev.lastCheckDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        
        let missedCount = 0;
        prev.habits.forEach(h => {
          if (!h.completedDays.includes(yesterdayStr)) missedCount++;
        });

        if (missedCount > 0) {
          setIsGlitching(true);
          const audio = new Audio('https://www.soundjay.com/communication/static-noise-01.mp3');
          audio.volume = 0.2;
          audio.play().catch(() => {});
          setTimeout(() => setIsGlitching(false), 800);

          const penalty = missedCount * MISS_PENALTY;
          const newTotalXP = Math.max(0, prev.stats.totalXP - penalty);
          const newRankIndex = Math.floor(newTotalXP / XP_PER_RANK);
          const newPoints = Math.max(0, prev.stats.points - penalty);
          
          return {
            ...prev,
            stats: {
              ...prev.stats,
              points: newPoints,
              totalXP: newTotalXP,
              rankIndex: Math.min(newRankIndex, RANKS.length - 1)
            },
            lastCheckDate: todayStr
          };
        } else {
          return { ...prev, lastCheckDate: todayStr };
        }
      } else if (!prev.lastCheckDate) {
        return { ...prev, lastCheckDate: todayStr };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    checkDateAndReset();
    const timer = setInterval(checkDateAndReset, 10000); 
    return () => clearInterval(timer);
  }, [checkDateAndReset]);

  const activeTheme = useMemo(() => 
    gameState.themes.find(t => t.id === gameState.activeThemeId) || INITIAL_THEMES[0],
    [gameState.activeThemeId, gameState.themes]
  );

  const playClick = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/button-20.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  };

  const handleVerification = async (imageData: string) => {
    if (!verificationTargetId) return;
    
    const todayStr = getLocalDateString();
    const habitId = verificationTargetId;
    const proofId = `proof_${Date.now()}`;

    // Save image to IndexedDB instead of localStorage
    await saveProofImage(proofId, imageData);

    setGameState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit || habit.completedDays.includes(todayStr)) return prev;

      const newProof: Proof = { id: proofId, habitId, date: new Date().toISOString() };
      const newHabits = prev.habits.map(h => h.id === habitId ? { ...h, completedDays: [...h.completedDays, todayStr] } : h);
      const newTotalXP = prev.stats.totalXP + 100;
      const newRankIndex = Math.min(Math.floor(newTotalXP / XP_PER_RANK), RANKS.length - 1);

      return {
        ...prev,
        habits: newHabits,
        proofLog: [newProof, ...prev.proofLog],
        stats: {
          ...prev.stats,
          points: prev.stats.points + POINTS_PER_COMPLETION,
          totalXP: newTotalXP,
          rankIndex: newRankIndex
        }
      };
    });

    setVerificationTargetId(null);
    playClick();
  };

  const handleReset = () => {
    setGameState({
      habits: [],
      stats: { points: 0, totalXP: 0, rankIndex: 0 },
      themes: INITIAL_THEMES,
      activeThemeId: 'red',
      proofLog: [],
      lastCheckDate: getLocalDateString()
    });
    setScreen(AppScreen.MENU);
    playClick();
  };

  return (
    <div className={`min-h-screen bg-black text-white relative transition-all duration-500 overflow-x-hidden ${isGlitching ? 'animate-glitch' : ''}`} style={{ '--accent': activeTheme.hex } as any}>
      <AnimatePresence mode="wait">
        {screen === AppScreen.SPLASH && <SplashScreen key="splash" onComplete={() => setScreen(AppScreen.MENU)} />}
        {screen === AppScreen.MENU && <MainMenu key="menu" activeColor={activeTheme.hex} onNavigate={(s) => { playClick(); setScreen(s); }} />}
        {screen === AppScreen.DASHBOARD && (
          <Dashboard 
            key="dashboard"
            gameState={gameState}
            onBack={() => setScreen(AppScreen.MENU)}
            onNavigate={setScreen}
            onToggleHabit={(id) => setVerificationTargetId(id)}
            onAddHabit={(title) => {
              const newHabit: Habit = { id: Math.random().toString(36).substr(2, 9), title, completedDays: [], createdAt: new Date().toISOString() };
              setGameState(prev => ({ ...prev, habits: [newHabit, ...prev.habits] }));
              playClick();
            }}
            onDeleteHabit={(id) => {
              setGameState(prev => ({ 
                ...prev, 
                habits: prev.habits.filter(h => h.id !== id),
                proofLog: prev.proofLog.filter(p => p.habitId !== id)
              }));
              playClick();
            }}
            onGlitch={() => {}}
            onShowWeekly={() => setShowWeeklyBriefing(true)}
            onShowProofLog={() => setScreen(AppScreen.PROOFLOG)}
            isGlitching={isGlitching}
          />
        )}
        {screen === AppScreen.SETTINGS && (
          <Settings 
            key="settings"
            gameState={gameState}
            onBack={() => setScreen(AppScreen.MENU)}
            onUnlock={(themeId) => {
              setGameState(prev => {
                const theme = prev.themes.find(t => t.id === themeId);
                if (!theme || theme.unlocked || prev.stats.points < theme.cost) return prev;
                return {
                  ...prev,
                  stats: { ...prev.stats, points: prev.stats.points - theme.cost },
                  themes: prev.themes.map(t => t.id === themeId ? { ...t, unlocked: true } : t)
                };
              });
              playClick();
            }}
            onSelect={(themeId) => {
              setGameState(prev => ({ ...prev, activeThemeId: themeId }));
              playClick();
            }}
            onReset={handleReset}
          />
        )}
        {screen === AppScreen.PROOFLOG && <ProofLogView key="prooflog" gameState={gameState} onBack={() => setScreen(AppScreen.DASHBOARD)} />}
        {screen === AppScreen.PROGRESS && <ProgressView key="progress" gameState={gameState} onBack={() => setScreen(AppScreen.DASHBOARD)} />}
        {screen === AppScreen.EXIT && (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4" onAnimationComplete={() => setTimeout(() => window.location.reload(), 1000)}>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-1 bg-white/20" />
            <span className="text-xl font-mono tracking-[0.5em] uppercase text-gray-500">System Shutdown</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{verificationTargetId && <VerificationModal onClose={() => setVerificationTargetId(null)} onCapture={handleVerification} accentColor={activeTheme.hex} />}</AnimatePresence>
      <AnimatePresence>{showWeeklyBriefing && <WeeklyReview gameState={gameState} onClose={() => setShowWeeklyBriefing(false)} />}</AnimatePresence>
    </div>
  );
};

export default App;
