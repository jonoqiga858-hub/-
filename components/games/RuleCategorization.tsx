
import React, { useState, useEffect } from 'react';
import { GameProps } from '../../types';

interface Item {
  id: number;
  icon: string;
  name: string;
  category: 'FOOD' | 'STAT' | 'DAILY';
  price: number;
}

const ITEMS: Item[] = [
  { id: 1, icon: '🍞', name: '面包', category: 'FOOD', price: 12 },
  { id: 2, icon: '🍖', name: '烤肉', category: 'FOOD', price: 68 },
  { id: 3, icon: '🖊️', name: '钢笔', category: 'STAT', price: 4 },
  { id: 4, icon: '📚', name: '笔记本', category: 'STAT', price: 25 },
  { id: 5, icon: '🪥', name: '牙刷', category: 'DAILY', price: 8 },
  { id: 6, icon: '🧴', name: '洗发水', category: 'DAILY', price: 45 },
  { id: 7, icon: '🍕', name: '披萨', category: 'FOOD', price: 45 },
  { id: 8, icon: '🥛', name: '牛奶', category: 'FOOD', price: 5 },
  { id: 9, icon: '📏', name: '尺子', category: 'STAT', price: 3 },
  { id: 10, icon: '✂️', name: '剪刀', category: 'STAT', price: 18 },
];

const RuleCategorization: React.FC<GameProps> = ({ onFinish }) => {
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [selectedCat, setSelectedCat] = useState<'FOOD' | 'STAT' | 'DAILY' | null>(null);
  const [selectedVal, setSelectedVal] = useState<'HIGH' | 'STD' | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const totalRounds = 10;

  useEffect(() => {
    setCurrentItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    setSelectedCat(null);
    setSelectedVal(null);
  }, [round]);

  const handleSubmit = () => {
    if (!currentItem || !selectedCat || !selectedVal) return;
    
    let threshold = 20;
    if (currentItem.category === 'STAT') threshold = 15;
    const actualHigh = currentItem.price > threshold;
    const isValCorrect = (selectedVal === 'HIGH') === actualHigh;
    const isCatCorrect = selectedCat === currentItem.category;

    if (isValCorrect && isCatCorrect) {
      setScore(s => s + 30);
    } else {
      setScore(s => Math.max(0, s - 15));
    }

    if (round >= totalRounds) {
      onFinish(score + (isValCorrect && isCatCorrect ? 30 : 0));
    } else {
      setRound(r => r + 1);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-bottom duration-400">
      <div className="text-center">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">多维逻辑训练</h3>
        <p className="text-[10px] text-slate-500 mb-4 px-4 leading-tight italic">
          判定：[食品/日用品 > ¥20] 或 [文具 > ¥15] 为高价。请选择所属品类及其价值等级。
        </p>
      </div>

      <div className="w-full bg-slate-900 rounded-[32px] p-6 border-2 border-slate-700 shadow-2xl flex flex-col items-center">
        <div className="text-6xl mb-2 animate-bounce">{currentItem?.icon}</div>
        <div className="text-lg font-bold text-white">{currentItem?.name}</div>
        <div className="text-3xl font-black text-emerald-400 mt-1">¥{currentItem?.price}</div>
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2">1. 选择品类</span>
          <div className="grid grid-cols-3 gap-2">
            {(['FOOD', 'STAT', 'DAILY'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`py-3 text-xs font-bold rounded-xl border transition-all ${selectedCat === cat ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {cat === 'FOOD' ? '食品' : cat === 'STAT' ? '文具' : '日用品'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-2">2. 选择价值</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedVal('STD')}
              className={`py-3 text-xs font-bold rounded-xl border transition-all ${selectedVal === 'STD' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              标准
            </button>
            <button
              onClick={() => setSelectedVal('HIGH')}
              className={`py-3 text-xs font-bold rounded-xl border transition-all ${selectedVal === 'HIGH' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              高价
            </button>
          </div>
        </div>

        <button 
          disabled={!selectedCat || !selectedVal}
          onClick={handleSubmit}
          className={`w-full py-4 font-black rounded-2xl transition-all ${(!selectedCat || !selectedVal) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 text-white shadow-lg active:scale-95'}`}
        >
          确认判定 SUBMIT
        </button>
      </div>

      <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
        ROUND {round}/10 | XP: {score}
      </div>
    </div>
  );
};

export default RuleCategorization;
