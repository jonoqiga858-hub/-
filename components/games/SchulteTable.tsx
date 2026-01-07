
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../../types';

const TEXT_COLORS = [
  'text-red-400', 'text-blue-400', 'text-emerald-400', 'text-orange-400', 
  'text-pink-400', 'text-purple-400', 'text-yellow-400', 'text-indigo-400'
];

const SchulteTable: React.FC<GameProps> = ({ onFinish }) => {
  const [items, setItems] = useState<{ val: number, color: string }[]>([]);
  const [expected, setExpected] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<number | null>(null);
  const size = 5;

  useEffect(() => {
    const nums = Array.from({ length: size * size }, (_, i) => i + 1);
    const shuffled = nums.sort(() => Math.random() - 0.5).map(n => ({
      val: n,
      color: TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)]
    }));
    setItems(shuffled);

    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Game over on timeout
      const score = Math.floor(((expected - 1) / 25) * 100);
      onFinish(score);
    }
  }, [timeLeft, expected, onFinish]);

  const handleClick = (n: number) => {
    if (n === expected) {
      if (n === size * size) {
        if (timerRef.current) clearInterval(timerRef.current);
        const bonus = timeLeft * 4;
        onFinish(150 + bonus);
      } else {
        setExpected(prev => prev + 1);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">舒尔特方格 (ADULT PRO)</h3>
        <h2 className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          T - {timeLeft}s
        </h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">寻找数字: {expected}</p>
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl">
        {items.map((item) => {
          const isDone = item.val < expected;
          return (
            <button
              key={item.val}
              onClick={() => handleClick(item.val)}
              className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl font-black rounded-xl transition-all
                ${isDone 
                  ? 'bg-slate-950 text-slate-800 pointer-events-none opacity-10' 
                  : `bg-slate-800 ${item.color} hover:bg-slate-700 active:scale-90 border border-white/5`}`}
            >
              {!isDone ? item.val : ''}
            </button>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-600 italic">
        注意：没有任何颜色提示，请全神贯注寻找目标。
      </div>
    </div>
  );
};

export default SchulteTable;
