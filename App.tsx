
import React, { useState, useEffect, useCallback } from 'react';
import { GameType } from './types';
import { getEncouragement, getAttentionAnalysis } from './services/geminiService';
import ColorClash from './components/games/ColorClash';
import GridMemory from './components/games/GridMemory';
import SchulteTable from './components/games/SchulteTable';
import RuleCategorization from './components/games/RuleCategorization';
import AuditoryTraining from './components/games/AuditoryTraining';
import ContextMemory from './components/games/ContextMemory';

const GAME_METADATA: Record<GameType, { title: string, icon: string, desc: string }> = {
  [GameType.COLOR_CLASH]: { title: '抑制控制', icon: '🎨', desc: '训练反应抑制与抗干扰能力' },
  [GameType.GRID_MEMORY]: { title: '空间记忆', icon: '🧩', desc: '增强工作记忆与序列复现' },
  [GameType.SCHULTE_TABLE]: { title: '视觉搜索', icon: '🔢', desc: '提升专注力稳定性' },
  [GameType.RULE_CATEGORIZATION]: { title: '逻辑分类', icon: '⚖️', desc: '多维规则判断执行' },
  [GameType.AUDITORY_ATTENTION]: { title: '听觉信号', icon: '🎧', desc: '强干扰下的信息提取' },
  [GameType.CONTEXT_MEMORY]: { title: '情景联想', icon: '📖', desc: '建立叙事联想巩固记忆' },
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED' | 'ANALYSIS'>('IDLE');
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [isRandomMode, setIsRandomMode] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ gameType: string, score: number }[]>([]);

  const games = Object.values(GameType);

  const startRandomGame = useCallback(() => {
    setIsRandomMode(true);
    let next: GameType;
    do {
      next = games[Math.floor(Math.random() * games.length)];
    } while (next === currentGame && games.length > 1);
    
    setCurrentGame(next);
    setGameState('PLAYING');
  }, [currentGame, games]);

  const startSpecificGame = (game: GameType) => {
    setIsRandomMode(false);
    setCurrentGame(game);
    setGameState('PLAYING');
  };

  const handleNextAction = () => {
    if (isRandomMode) {
      startRandomGame();
    } else {
      setGameState('PLAYING'); // 重玩当前
    }
  };

  const handleGameFinish = async (score: number) => {
    const newHistory = [...history, { gameType: currentGame || 'Unknown', score }];
    setHistory(newHistory);
    setTotalScore(prev => prev + score);
    setStreak(prev => prev + 1);
    setGameState('FINISHED');
    setIsLoading(true);

    const gameTitle = GAME_METADATA[currentGame!]?.title || "专项训练";
    const msg = await getEncouragement(gameTitle, score);
    setFeedback(msg);
    setIsLoading(false);
  };

  const showFinalAnalysis = async () => {
    setGameState('ANALYSIS');
    setIsLoading(true);
    const report = await getAttentionAnalysis(history);
    setAnalysisReport(report);
    setIsLoading(false);
  };

  const renderGame = () => {
    switch (currentGame) {
      case GameType.COLOR_CLASH: return <ColorClash onFinish={handleGameFinish} difficulty={streak} />;
      case GameType.GRID_MEMORY: return <GridMemory onFinish={handleGameFinish} difficulty={streak} />;
      case GameType.SCHULTE_TABLE: return <SchulteTable onFinish={handleGameFinish} difficulty={streak} />;
      case GameType.RULE_CATEGORIZATION: return <RuleCategorization onFinish={handleGameFinish} difficulty={streak} />;
      case GameType.AUDITORY_ATTENTION: return <AuditoryTraining onFinish={handleGameFinish} difficulty={streak} />;
      case GameType.CONTEXT_MEMORY: return <ContextMemory onFinish={handleGameFinish} difficulty={streak} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500">
      {/* HUD HEADER */}
      <div className="fixed top-6 w-full flex justify-between px-8 max-w-5xl z-50 pointer-events-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">NeuroFocus Protocol v5.0</span>
          </div>
          <span className="text-[9px] text-slate-600 font-mono mt-0.5 tracking-tighter">ENVIRONMENT: ADULT_ADHD // SYNC: ACTIVE</span>
        </div>
        <div className="flex gap-10">
          <div className="text-right">
            <span className="block text-[10px] text-slate-600 font-bold uppercase tracking-widest">Efficiency</span>
            <span className="text-2xl font-black text-white tabular-nums">{totalScore}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-600 font-bold uppercase tracking-widest">Modules</span>
            <span className="text-2xl font-black text-emerald-500 tabular-nums">{streak}</span>
          </div>
        </div>
      </div>

      <main className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 sm:p-10 rounded-[64px] shadow-[0_40px_120px_-10px_rgba(0,0,0,0.7)] relative z-10 my-20">
        {gameState === 'IDLE' && (
          <div className="space-y-10 py-2">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">专注力神经实验室</h1>
              <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                启动随机任务流，对抗执行功能障碍。每个任务完成后将自动进入下一个随机挑战。
              </p>
            </div>

            <button
              onClick={startRandomGame}
              className="group relative w-full py-7 bg-indigo-600 text-white text-xl font-black rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-4">🚀 启动随机任务流</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => startSpecificGame(game)}
                  className="flex flex-col items-start p-4 bg-slate-950/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 transition-all text-left group"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{GAME_METADATA[game].icon}</span>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{GAME_METADATA[game].title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'PLAYING' && renderGame()}

        {gameState === 'FINISHED' && (
          <div className="text-center space-y-12 animate-in zoom-in duration-300">
            <div className="space-y-2">
              <div className="text-8xl mb-6">🧠</div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">神经突触已建立</h2>
              <p className="text-slate-600 text-[10px] font-mono tracking-[0.4em] uppercase">Synaptic Connection Verified</p>
            </div>
            
            <div className="p-10 bg-slate-950/80 rounded-[48px] border border-white/5 min-h-[140px] flex items-center justify-center shadow-inner">
              {isLoading ? (
                <div className="animate-pulse text-indigo-400 font-black tracking-widest">PROCESSING...</div>
              ) : (
                <p className="text-xl text-indigo-300 font-bold italic leading-relaxed">"{feedback}"</p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleNextAction}
                className="w-full py-6 bg-white text-slate-900 text-xl font-black rounded-[28px] shadow-2xl transition-all active:scale-95 hover:bg-slate-100"
              >
                {isRandomMode ? '下一个随机协议 NEXT' : '再次练习本模块 AGAIN'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGameState('IDLE')} className="py-4 bg-slate-800 text-slate-400 text-[10px] font-black uppercase rounded-2xl">返回终端</button>
                <button onClick={showFinalAnalysis} className="py-4 bg-indigo-900/30 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase rounded-2xl">综合评估</button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'ANALYSIS' && (
          <div className="text-center space-y-8 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-3xl font-black text-white italic tracking-tight">专注力神经图谱报告</h2>
            <div className="p-8 bg-slate-950/90 rounded-[40px] border border-white/5 text-left text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
              {isLoading ? "正在生成认知分析报告..." : analysisReport}
            </div>
            <button
              onClick={() => { setGameState('IDLE'); setStreak(0); setTotalScore(0); setHistory([]); }}
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl active:scale-95"
            >
              启动新训练会话 RESTART
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
