
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps } from '../../types';

const EMOJI_SETS = [
  { base: '🕙', odd: '🕙' }, // 这个其实没区别，换更难的
  { base: '🌑', odd: '🌚' },
  { base: '🫓', odd: '🥯' },
  { base: '🌿', odd: '🌱' },
  { base: '🧶', odd: '🧵' },
  { base: '👔', odd: '👕' },
  { base: '🍐', odd: '🥑' },
  { base: '🪑', odd: '🛋️' },
  { base: '🧁', odd: '🍰' },
  { base: '🔋', odd: '🪫' },
];

const RapidFind: React.FC<GameProps> = ({ onFinish }) => {
  const [grid, setGrid] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const totalRounds = 12;

  const generateRound = useCallback(() => {
    const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
    const size = 36; // 6x6 矩阵
    const newGrid = Array(size).fill(set.base);
    const targetIdx = Math.floor(Math.random() * size);
    newGrid[targetIdx] = set.odd;
    setGrid(newGrid);
    setOddIndex(targetIdx);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    generateRound();
  }, [round, generateRound]);

  const handleSelect = (idx: number) => {
    if (idx === oddIndex) {
      const reactionTime = (Date.now() - startTime) / 1000;
      const roundScore = Math.max(5, Math.floor(30 - reactionTime * 5));
      setScore(s => s + roundScore);
      
      if (round >= totalRounds) {
        onFinish(score + roundScore);
      } else {
        setRound(r => r + 1);
      }
    } else {
      setScore(s => Math.max(0, s - 10)); // 错误惩罚更重
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-right duration-400">
      <div className="text-center">
        <h3 className="text-sm font-bold text-indigo-400 mb-1 uppercase tracking-tighter">视觉搜索 & 扫视训练</h3>
        <h2 className="text-xl font-black text-gray-800">找出那个不同的！</h2>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">进度: {round}/{totalRounds}</p>
      </div>

      <div className="grid grid-cols-6 gap-1.5 bg-slate-100 p-3 rounded-[32px] border-4 border-white shadow-xl">
        {grid.map((emoji, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="w-10 h-10 sm:w-12 sm:h-12 text-2xl flex items-center justify-center rounded-xl bg-white hover:bg-indigo-50 transition-all active:scale-75 shadow-sm"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-lg font-black text-indigo-600">SCORE: {score}</div>
      </div>
    </div>
  );
};

export default RapidFind;
