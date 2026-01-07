
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../../types';

const GridMemory: React.FC<GameProps> = ({ onFinish }) => {
  const gridSize = 4;
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // 当前正在闪烁的方块索引
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'MEMORIZING' | 'PLAYING' | 'WRONG' | 'CORRECT'>('MEMORIZING');
  
  const timerRef = useRef<number | null>(null);

  const startLevel = useCallback((lvl: number) => {
    const newPattern: number[] = [];
    const count = Math.min(lvl + 2, 8); // 初始3个，最高8个
    
    for (let i = 0; i < count; i++) {
      let cell;
      do {
        cell = Math.floor(Math.random() * (gridSize * gridSize));
      } while (i > 0 && cell === newPattern[i - 1]); // 防止连续重复同一格
      newPattern.push(cell);
    }

    setPattern(newPattern);
    setUserInput([]);
    setStatus('MEMORIZING');
    setIsShowing(true);
    
    // 顺序展示逻辑
    let current = 0;
    const showNext = () => {
      if (current < newPattern.length) {
        setActiveIndex(newPattern[current]);
        // 方块亮起时间随等级缩短
        const lightDuration = Math.max(300, 600 - lvl * 40);
        
        setTimeout(() => {
          setActiveIndex(null);
          current++;
          // 方块间隔时间
          timerRef.current = window.setTimeout(showNext, 150);
        }, lightDuration);
      } else {
        setIsShowing(false);
        setStatus('PLAYING');
      }
    };

    // 延迟一秒开始展示，给玩家准备时间
    setTimeout(showNext, 1000);
  }, []);

  useEffect(() => {
    startLevel(level);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [level, startLevel]);

  const handleCellClick = (idx: number) => {
    if (status !== 'PLAYING' || isShowing) return;

    const currentStep = userInput.length;
    if (pattern[currentStep] === idx) {
      // 点击正确
      const nextInput = [...userInput, idx];
      setUserInput(nextInput);
      
      if (nextInput.length === pattern.length) {
        // 完成本关
        setStatus('CORRECT');
        const newScore = score + (level * 25);
        setScore(newScore);
        
        if (level >= 6) {
          setTimeout(() => onFinish(newScore + 100), 600);
        } else {
          setTimeout(() => setLevel(l => l + 1), 800);
        }
      }
    } else {
      // 点击错误
      setStatus('WRONG');
      setActiveIndex(idx); // 高亮错误的那个方块
      setTimeout(() => {
        onFinish(score);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-300">
      <div className="text-center">
        <h3 className="text-sm font-black text-indigo-400 mb-1 uppercase tracking-[0.2em]">工作记忆训练</h3>
        <h2 className="text-xl font-black text-white">
          {status === 'MEMORIZING' && "🚨 注意观察亮起顺序"}
          {status === 'PLAYING' && "👈 请按顺序复原"}
          {status === 'WRONG' && "❌ 序列中断"}
          {status === 'CORRECT' && "✅ 完美复现"}
        </h2>
        <div className="flex justify-center gap-2 mt-2">
            {Array.from({length: 6}).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-950 rounded-[40px] border border-white/5 shadow-2xl relative">
        {Array.from({ length: 16 }).map((_, i) => {
          const isActive = activeIndex === i;
          const isCorrectPart = userInput.includes(i) && pattern.slice(0, userInput.length).includes(i);
          
          let bgColor = 'bg-slate-900';
          if (isActive) {
            bgColor = status === 'WRONG' ? 'bg-red-500' : 'bg-indigo-500';
          } else if (isCorrectPart) {
            bgColor = 'bg-emerald-500/80';
          }

          return (
            <button
              key={i}
              disabled={status !== 'PLAYING'}
              onClick={() => handleCellClick(i)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-150 relative overflow-hidden
                ${bgColor} ${status === 'PLAYING' && !isActive ? 'hover:bg-slate-800 active:scale-90' : ''}
                ${isActive ? 'scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border border-white/5'}
              `}
            >
                {isActive && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
        <div className="flex justify-between w-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Progress</span>
            <span>{userInput.length} / {pattern.length}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-300 ${status === 'WRONG' ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${(userInput.length / pattern.length) * 100}%` }}
            />
        </div>
      </div>
    </div>
  );
};

export default GridMemory;
