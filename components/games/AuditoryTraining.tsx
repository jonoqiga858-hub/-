
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { generateAuditoryTask } from '../../services/geminiService';

const AuditoryTraining: React.FC<GameProps> = ({ onFinish }) => {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'PLAYING' | 'RECALL'>('LOADING');
  const [audioData, setAudioData] = useState<{ base64: string, sequence: number[] } | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [glitch, setGlitch] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    loadTask();
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const loadTask = async () => {
    setError(null);
    setStatus('LOADING');
    try {
      const task = await generateAuditoryTask();
      if (task && task.base64Audio) {
        setAudioData({ base64: task.base64Audio, sequence: task.correctSequence });
        setStatus('READY');
      } else {
        setError("神经协议响应超时 (TTS 500)。请重试。");
      }
    } catch (e) {
      setError("网络链路不稳定。");
    }
  };

  const playAudio = async () => {
    if (!audioData) return;
    
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      setStatus('PLAYING');
      
      const binary = atob(audioData.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      // 视觉干扰计时器
      const glitchInterval = setInterval(() => setGlitch(prev => !prev), 150);

      source.onended = () => {
        clearInterval(glitchInterval);
        setGlitch(false);
        setStatus('RECALL');
      };
      source.start();
    } catch (e) {
      setError("音频引擎异常。");
      setStatus('READY');
    }
  };

  const checkAnswer = () => {
    if (!audioData) return;
    const cleanInput = userInput.replace(/\D/g, '');
    const correctStr = audioData.sequence.join('');
    onFinish(cleanInput === correctStr ? 200 : 0);
  };

  if (error) return (
    <div className="text-center space-y-4 py-10 animate-in fade-in">
      <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[40px] text-red-400 font-bold">
        <span className="text-3xl block mb-2">⚠️</span>
        {error}
      </div>
      <button onClick={loadTask} className="w-full py-4 bg-slate-800 text-indigo-400 rounded-2xl font-black uppercase tracking-widest border border-indigo-500/20">
        重新连接 RE-SYNC
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col items-center space-y-8 transition-all duration-75 ${glitch ? 'skew-x-1 scale-105 brightness-150' : ''}`}>
      <div className="text-center space-y-2">
        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">噪声提取训练 v2.0</h3>
        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed italic">
          任务：在视觉粒子风暴的干扰下，捕捉播报的 <span className="text-indigo-400 font-black">7 位随机数字</span>。
        </p>
      </div>

      <div className={`w-64 h-64 rounded-[80px] border border-white/5 flex items-center justify-center bg-slate-900 shadow-2xl relative overflow-hidden transition-all ${glitch ? 'border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.4)]' : ''}`}>
        {/* 背景动态干扰粒子 */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className={`absolute bg-indigo-500 rounded-full ${status === 'PLAYING' ? 'animate-ping' : 'opacity-10'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {status === 'LOADING' && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
              <span className="text-[9px] font-mono text-indigo-400/60 uppercase">Synthesizing...</span>
            </div>
          )}
          {status === 'READY' && (
            <button onClick={playAudio} className="group relative flex flex-col items-center gap-4">
              <div className="w-28 h-28 bg-indigo-600 rounded-[48px] flex items-center justify-center shadow-xl group-active:scale-90 transition-transform">
                 <span className="text-6xl">🎧</span>
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase animate-pulse">点击开始提取信号</span>
            </button>
          )}
          {status === 'PLAYING' && (
            <div className="flex flex-col items-center">
              <span className="text-7xl animate-pulse">👂</span>
              <div className="flex gap-1 mt-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1.5 h-6 bg-indigo-500 animate-bounce" style={{animationDelay: `${i*0.1}s`}} />
                ))}
              </div>
            </div>
          )}
          {status === 'RECALL' && <span className="text-8xl animate-bounce">💬</span>}
        </div>
      </div>

      {status === 'RECALL' && (
        <div className="w-full space-y-4 animate-in slide-in-from-bottom-6">
          <input
            autoFocus
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="输入 7 位数字序列"
            className="w-full py-6 bg-slate-950 border-2 border-slate-800 rounded-[32px] text-center text-5xl font-black text-indigo-500 focus:border-indigo-600 outline-none shadow-inner tracking-[0.2em]"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button 
            disabled={userInput.length < 1}
            onClick={checkAnswer} 
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl active:scale-95 disabled:opacity-50"
          >
            确认提交 SUBMIT
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
         <div className={`w-2 h-2 rounded-full ${status === 'PLAYING' ? 'bg-emerald-500 animate-ping' : 'bg-slate-700'}`} />
         <span className="text-[9px] font-mono text-slate-500 uppercase">Neural Stream: {status}</span>
      </div>
    </div>
  );
};

export default AuditoryTraining;
