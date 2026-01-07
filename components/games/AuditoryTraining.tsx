
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { generateAuditoryTask } from '../../services/geminiService';

const AuditoryTraining: React.FC<GameProps> = ({ onFinish }) => {
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'PLAYING' | 'RECALL'>('LOADING');
  const [audioData, setAudioData] = useState<{ base64: string, sequence: number[] } | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [glitchIntensity, setGlitchIntensity] = useState(0); // 0-3
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
        setError("神经协议解析失败，请检查网络链路。");
      }
    } catch (e) {
      setError("系统初始化异常。");
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

      // 强化干扰逻辑：随机震动强度
      const interval = setInterval(() => {
        setGlitchIntensity(Math.floor(Math.random() * 4));
      }, 80);

      source.onended = () => {
        clearInterval(interval);
        setGlitchIntensity(0);
        setStatus('RECALL');
      };
      source.start();
    } catch (e) {
      setError("音频驱动未就绪。");
      setStatus('READY');
    }
  };

  const checkAnswer = () => {
    if (!audioData) return;
    const cleanInput = userInput.replace(/\D/g, '');
    const correctStr = audioData.sequence.join('');
    // 正确给200分，7位数字难度很大
    onFinish(cleanInput === correctStr ? 200 : 0);
  };

  if (error) return (
    <div className="text-center space-y-6 py-10 animate-in fade-in">
      <div className="bg-red-950/30 border border-red-500/50 p-10 rounded-[40px] text-red-400">
        <div className="text-5xl mb-4">🚫</div>
        <p className="font-bold tracking-tight">{error}</p>
      </div>
      <button onClick={loadTask} className="w-full py-5 bg-slate-800 text-white rounded-3xl font-black tracking-widest uppercase hover:bg-slate-700 active:scale-95 transition-all">
        重新校准神经接口
      </button>
    </div>
  );

  return (
    <div className={`flex flex-col items-center space-y-8 w-full ${glitchIntensity > 0 ? 'glitch-active' : 'transition-all duration-300'}`}>
      <div className="text-center space-y-2 px-4">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">超感官提取训练</h3>
        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed italic">
          任务难度：<span className="text-red-400 font-black">EXTREME</span><br/>
          在极高强度视觉干扰中捕捉 <span className="text-white font-black underline decoration-indigo-500">7 位数字</span> 序列。
        </p>
      </div>

      <div className={`w-72 h-72 rounded-[90px] border border-white/5 flex items-center justify-center bg-slate-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden`}>
        {/* 加强版干扰粒子 (60个) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div 
              key={i} 
              className={`absolute rounded-full transition-opacity ${status === 'PLAYING' ? 'opacity-40 animate-pulse' : 'opacity-5'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                backgroundColor: i % 2 === 0 ? '#6366f1' : '#ec4899',
                filter: 'blur(1px)',
                animationDuration: `${0.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {status === 'LOADING' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-[0.3em] uppercase">Loading Sequence...</span>
            </div>
          )}
          
          {status === 'READY' && (
            <button onClick={playAudio} className="group relative flex flex-col items-center gap-6">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 group-hover:bg-indigo-500/40 transition-all" />
              <div className="w-32 h-32 bg-indigo-600 rounded-[56px] flex items-center justify-center shadow-2xl group-active:scale-90 transition-transform relative z-10 border border-white/20">
                 <span className="text-7xl drop-shadow-lg">🎧</span>
              </div>
              <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] relative z-10">启动听觉提取协议</span>
            </button>
          )}

          {status === 'PLAYING' && (
            <div className="flex flex-col items-center">
              <span className="text-8xl animate-bounce">🧬</span>
              <div className="flex gap-2 mt-8">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-2 h-8 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}} />
                ))}
              </div>
            </div>
          )}

          {status === 'RECALL' && (
            <div className="flex flex-col items-center animate-in zoom-in">
              <span className="text-8xl">🧩</span>
              <span className="text-[10px] text-indigo-400 font-black mt-4 tracking-widest uppercase italic">等待回写指令</span>
            </div>
          )}
        </div>
      </div>

      {status === 'RECALL' && (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-8 duration-500 px-2">
          <input
            autoFocus
            type="text"
            pattern="\d*"
            inputMode="numeric"
            placeholder="INPUT 7 DIGITS"
            className="w-full py-8 bg-slate-950 border-2 border-slate-800 rounded-[40px] text-center text-6xl font-black text-indigo-500 focus:border-indigo-500 outline-none shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] tracking-[0.3em] placeholder:text-slate-900 placeholder:text-2xl"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button 
            disabled={userInput.length < 1}
            onClick={checkAnswer} 
            className="w-full py-6 bg-indigo-600 text-white text-xl font-black rounded-[32px] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 active:scale-95 disabled:opacity-30 transition-all"
          >
            完成序列同步 COMPLETE
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 py-4">
         <div className={`w-3 h-3 rounded-full ${status === 'PLAYING' ? 'bg-red-500 animate-ping' : 'bg-slate-800'}`} />
         <span className="text-[10px] font-mono text-slate-600 font-black uppercase tracking-widest">Protocol Sync Status: {status}</span>
      </div>
    </div>
  );
};

export default AuditoryTraining;
