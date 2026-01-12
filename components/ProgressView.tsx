
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameState } from '../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ProgressViewProps {
  gameState: GameState;
  onBack: () => void;
}

const ProgressView: React.FC<ProgressViewProps> = ({ gameState, onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const activeColor = gameState.themes.find(t => t.id === gameState.activeThemeId)?.hex || '#FF0000';

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const getCompletionLevel = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const completedCount = gameState.habits.filter(h => h.completedDays.includes(dateStr)).length;
    if (gameState.habits.length === 0) return 0;
    return completedCount / gameState.habits.length;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-6 max-w-4xl mx-auto flex flex-col">
      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 border border-[#1A1A1A] rounded-xl hover:bg-white/5 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black uppercase tracking-widest">{monthName} {year}</h1>
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.4em]">Temporal Mastery Tracker</p>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 border border-[#1A1A1A] rounded-lg hover:bg-white/5"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-2 border border-[#1A1A1A] rounded-lg hover:bg-white/5"><ChevronRight size={16} /></button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-4 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[9px] uppercase font-bold text-gray-700 tracking-widest">{d}</div>
        ))}
        {blanks.map(b => <div key={`b-${b}`} />)}
        {days.map(d => {
          const level = getCompletionLevel(d);
          return (
            <div key={d} className="aspect-square border border-[#1A1A1A] rounded-xl flex items-center justify-center relative group">
              <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors">{d}</span>
              <div 
                className="absolute inset-1 rounded-lg pointer-events-none transition-all duration-500" 
                style={{ backgroundColor: activeColor, opacity: level * 0.8, filter: `blur(${level > 0 ? 5 : 0}px)` }} 
              />
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-8 border border-[#1A1A1A] rounded-[30px] bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <Calendar size={20} style={{ color: activeColor }} />
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Total Monthly Discipline</p>
            <p className="text-2xl font-black">SYNCING ANALYTICS...</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressView;
