
import React, { useState, useEffect, useCallback } from 'react';
import { GameProps } from '../../types';

const COLORS = [
  { name: '红色', value: 'red', text: 'text-red-500' },
  { name: '蓝色', value: 'blue', text: 'text-blue-500' },
  { name: '绿色', value: 'green', text: 'text-green-500' },
  { name: '黄色', value: 'yellow', text: 'text-yellow-500' },
  { name: '紫色', value: 'purple', text: 'text-purple-500' },
  { name: '橙色', value: 'orange', text: 'text-orange-500' },
  { name: '粉色', value: 'pink', text: 'text-pink-500' },
  { name: '灰色', value: 'gray', text: 'text-gray-500' },
];

const ColorClash: React.FC<GameProps> = ({ onFinish }) => {
  const [target, setTarget] = useState({ word: '', colorClass: '', colorValue: '', rotation: 0 });
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(12);

  const nextRound = useCallback(() => {
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    const colorIdx = Math.floor(Math.random() * COLORS.length);
    
    setTarget({
      word: COLORS[wordIdx].name,
      colorClass: COLORS[colorIdx].text,
      colorValue: COLORS[colorIdx].value,
      rotation: (Math.random() - 0.5) * 20 // 随机旋转增加干扰
    });

    setOptions([...COLORS].sort(() => Math.random() - 0.5).slice(0, 6)); // 每次随机展示6个选项
  }, []);

  useEffect(() => {
    nextRound();
  }, [nextRound]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(score);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, score, onFinish]);

  const handleChoice = (colorValue: string) => {
    if (colorValue === target.colorValue) {
      setScore(s => s + 15);
      setTimeLeft(t => Math.min(15, t + 0.5)); // 正确奖励一点时间
      nextRound();
    } else {
      setScore(s => Math.max(0, s - 10));
      nextRound();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center">
        <h3 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-tighter">抑制控制训练</h3>
        <div 
          style={{ transform: `rotate(${target.rotation}deg)` }}
          className={`text-6xl font-black p-12 bg-slate-50 rounded-[40px] shadow-inner transition-transform ${target.colorClass}`}
        >
          {target.word}
        </div>
        <p className="mt-4 text-gray-400 font-medium">点击文字显示的【物理颜色】</p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleChoice(opt.value)}
            className="py-4 bg-white hover:bg-indigo-50 border-2 border-gray-100 rounded-2xl font-bold transition-all active:scale-90 shadow-sm text-gray-700"
          >
            {opt.name}
          </button>
        ))}
      </div>

      <div className="flex justify-between w-full px-4 text-sm font-black">
        <div className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">SCORE: {score}</div>
        <div className={`${timeLeft < 4 ? 'text-red-500 animate-pulse' : 'text-gray-400'} bg-gray-50 px-3 py-1 rounded-full uppercase`}>
          Time: {timeLeft.toFixed(0)}s
        </div>
      </div>
    </div>
  );
};

export default ColorClash;
