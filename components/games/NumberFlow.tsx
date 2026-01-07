
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../../types';

interface NumberItem {
  val: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NumberFlow: React.FC<GameProps> = ({ onFinish }) => {
  const [numbers, setNumbers] = useState<NumberItem[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [startTime] = useState(Date.now());
  const maxNumber = 24; // 增加到24个
  const requestRef = useRef<number>(null);

  const generatePositions = useCallback(() => {
    const items: NumberItem[] = [];
    for (let i = 1; i <= maxNumber; i++) {
      items.push({
        val: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.15, // 缓慢漂移
        vy: (Math.random() - 0.5) * 0.15
      });
    }
    setNumbers(items);
  }, []);

  useEffect(() => {
    generatePositions();
  }, [generatePositions]);

  // 动画循环：让数字动起来
  const animate = useCallback(() => {
    setNumbers(prev => prev.map(n => {
      let nextX = n.x + n.vx;
      let nextY = n.y + n.vy;
      let nextVx = n.vx;
      let nextVy = n.vy;

      if (nextX < 5 || nextX > 95) nextVx *= -1;
      if (nextY < 5 || nextY > 95) nextVy *= -1;

      return { ...n, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
    }));
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleClick = (val: number) => {
    if (val === nextExpected) {
      if (val === maxNumber) {
        const timeTaken = (Date.now() - startTime) / 1000;
        const score = Math.max(0, Math.floor(200 - timeTaken * 2));
        onFinish(score);
      } else {
        setNextExpected(prev => prev + 1);
      }
    } else {
      // 错误点击惩罚
      setNextExpected(prev => prev); // 不变，但可以加个视觉闪烁
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-4 text-center">
        <h3 className="text-sm font-bold text-indigo-400 mb-1 uppercase tracking-tighter">持续注意力训练</h3>
        <h2 className="text-xl font-black text-gray-800">目标数字: <span className="text-pink-500 text-3xl">{nextExpected}</span></h2>
        <p className="text-xs text-gray-400 mt-1 uppercase">寻找并依次点击 1 到 {maxNumber}</p>
      </div>

      <div className="relative w-full h-[460px] bg-slate-900 rounded-[40px] overflow-hidden border-8 border-slate-800 shadow-2xl">
        {/* 背景噪点模拟 */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="grid grid-cols-10 h-full w-full">
            {Array.from({length: 100}).map((_, i) => <div key={i} className="border border-white/20" />)}
          </div>
        </div>

        {numbers.map((num) => {
          const isClicked = num.val < nextExpected;
          const isTarget = num.val === nextExpected;
          
          return (
            <button
              key={num.val}
              disabled={isClicked}
              onClick={() => handleClick(num.val)}
              style={{
                left: `${num.x}%`,
                top: `${num.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-sm transition-shadow
                ${isClicked 
                  ? 'bg-slate-800 text-slate-700 border-none opacity-20' 
                  : isTarget
                    ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] z-10 scale-110'
                    : 'bg-white text-slate-800 shadow-lg hover:scale-110'}`}
            >
              {num.val}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NumberFlow;
