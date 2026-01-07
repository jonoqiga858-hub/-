
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps } from '../../types';

const GridMemory: React.FC<GameProps> = ({ onFinish }) => {
  const gridSize = 4; // 升级为4x4
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(true);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const startLevel = useCallback((lvl: number) => {
    const newPattern: number[] = [];
    const count = Math.min(lvl + 3, 10); // 成人需要更长的序列
    while (newPattern.length < count) {
      const cell = Math.floor(Math.random() * (gridSize * gridSize));
      // 允许重复，但不能连续重复，增加顺序记忆难度
      if (newPattern[newPattern.length - 1] !== cell) {
        newPattern.push(cell);
      }
    }
    setPattern(newPattern);
    setUserInput([]);
    setIsShowing(true);

    const displayTime = Math.max(800, 2000 - (lvl * 150)); // 速度越来越快
    setTimeout(() => {
      setIsShowing(false);
    }, displayTime);
  }, []);

  useEffect(() => {
    startLevel(level);
  }, [level, startLevel]);

  const handleCellClick = (idx: number) => {
    if (isShowing) return;

    const currentStep = userInput.length;
    if (pattern[currentStep] === idx) {
      const nextInput = [...userInput, idx];
      setUserInput(nextInput);
      
      if (nextInput.length === pattern.length) {
        setScore(s => s + (level * 25));
        if (level >= 6) {
            onFinish(score + 100);
        } else {
            setTimeout(() => setLevel(l => l + 1), 500);
        }
      }
    } else {
      onFinish(score);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in zoom-in duration-300">
      <div className="text-center">
        <h3 className="text-sm font-bold text-indigo-400 mb-1 uppercase tracking-tighter">工作记忆训练 (4x4)</h3>
        <h2 className="text-xl font-black text-gray-800">
          {isShowing ? "注意观察出现顺序" : "按【顺序】复原路径"}
        </h2>
        <p className="text-xs text-gray-400 mt-1">难度等级: {level}/6</p>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-100 rounded-[32px] border-4 border-white shadow-xl">
        {Array.from({ length: 16 }).map((_, i) => {
          // 在展示模式下，只有当前序号对应的格子高亮，或者全部闪烁？
          // 这里采用按顺序亮起（简单版展示所有，但在成人版我们要提高要求）
          const isCurrentlyShowing = isShowing && pattern.includes(i);
          const isCorrect = !isShowing && userInput.includes(i) && pattern.slice(0, userInput.length).includes(i);

          return (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl cursor-pointer transition-all duration-200
                ${isCurrentlyShowing ? 'bg-indigo-500 scale-95 shadow-inner' : 
                  isCorrect ? 'bg-emerald-400' : 'bg-white hover:bg-indigo-50 shadow-sm'}`}
            />
          );
        })}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${(userInput.length / pattern.length) * 100}%` }}
            />
        </div>
        <span className="text-xs font-bold text-indigo-600">{userInput.length}/{pattern.length}</span>
      </div>
    </div>
  );
};

export default GridMemory;
