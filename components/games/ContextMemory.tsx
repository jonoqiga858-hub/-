
import React, { useState, useEffect } from 'react';
import { GameProps } from '../../types';
import { getContextItems } from '../../services/geminiService';

const ContextMemory: React.FC<GameProps> = ({ onFinish }) => {
  const [items, setItems] = useState<{emoji: string, name: string}[]>([]);
  const [step, setStep] = useState<'MEMORIZE' | 'STORY' | 'RECALL'>('MEMORIZE');
  const [story, setStory] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<{emoji: string, name: string}[]>([]);

  useEffect(() => {
    const init = async () => {
      const targetItems = await getContextItems();
      setItems(targetItems);
      
      const distractors = [
        {emoji: '🍩', name: '甜甜圈'}, {emoji: '🚗', name: '汽车'}, {emoji: '🛸', name: 'UFO'}, 
        {emoji: '🧸', name: '泰迪熊'}, {emoji: '🧲', name: '磁铁'}, {emoji: '🏮', name: '灯笼'}
      ];
      setAllOptions([...targetItems, ...distractors].sort(() => Math.random() - 0.5));
    };
    init();
  }, []);

  const handleRecall = (emoji: string) => {
    const next = selected.includes(emoji) ? selected.filter(e => e !== emoji) : [...selected, emoji];
    setSelected(next);
  };

  const checkResult = () => {
    const correct = items.every(i => selected.includes(i.emoji));
    const onlyCorrect = selected.length === items.length;
    if (correct && onlyCorrect) onFinish(120);
    else if (correct) onFinish(60);
    else onFinish(0);
  };

  return (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">情景联想记忆</h3>
        <p className="text-xs text-slate-500 mt-1">建立联系，让记忆更稳固</p>
      </div>

      {step === 'MEMORIZE' && (
        <div className="text-center space-y-8 py-4">
          <div className="flex justify-center gap-6">
            {items.map(i => (
              <div key={i.emoji} className="flex flex-col items-center bg-slate-900 p-4 rounded-2xl border-2 border-slate-800">
                <span className="text-5xl">{i.emoji}</span>
                <span className="text-xs text-slate-500 mt-2">{i.name}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setStep('STORY')} className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl">
            记住了，编个故事
          </button>
        </div>
      )}

      {step === 'STORY' && (
        <div className="w-full space-y-4">
          <p className="text-sm text-slate-300">用这三个物品编一个短故事并大声说出来：</p>
          <textarea
            className="w-full h-32 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-white placeholder-slate-600"
            placeholder="例如：我背着书包，打着雨伞，骑着自行车去郊游..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
          />
          <button onClick={() => setStep('RECALL')} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">
            故事讲完了，去复现
          </button>
        </div>
      )}

      {step === 'RECALL' && (
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-3 gap-3">
            {allOptions.map(opt => (
              <button
                key={opt.emoji}
                onClick={() => handleRecall(opt.emoji)}
                className={`p-4 rounded-2xl border-2 transition-all ${selected.includes(opt.emoji) ? 'bg-indigo-600 border-indigo-400 scale-95' : 'bg-slate-900 border-slate-800'}`}
              >
                <span className="text-3xl">{opt.emoji}</span>
              </button>
            ))}
          </div>
          <button onClick={checkResult} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl">
            确认复原项 ({selected.length}/{items.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ContextMemory;
