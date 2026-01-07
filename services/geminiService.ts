
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * 辅助函数：安全获取 API KEY
 * 优先从 window.process.env 获取，这是在 index.html 中定义的 shim
 */
function getSafeApiKey(): string {
  try {
    // @ts-ignore
    return (window.process?.env?.API_KEY) || (process?.env?.API_KEY) || "";
  } catch (e) {
    return "";
  }
}

const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/**
 * 获取游戏结束后的神经反馈
 */
export async function getEncouragement(gameName: string, score: number) {
  const apiKey = getSafeApiKey();
  if (!apiKey) return "同步成功，专注于下个协议。";
  
  // Create a new instance right before use to ensure latest API Key.
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `用户完成了ADHD专注训练“${gameName}”，得分：${score}。给出12字以内的专业、高能量、教练式的反馈（中文）。`,
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "神经反馈已优化，表现出色。🚀";
  } catch (error) {
    return "系统同步完成，专注度显著提升。✨";
  }
}

/**
 * 生成多维注意力报告
 */
export async function getAttentionAnalysis(history: { gameType: string, score: number }[]) {
  const apiKey = getSafeApiKey();
  if (!apiKey) return "无法生成云端报告。当前处于离线增强模式。";
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const summary = history.map(h => `${h.gameType}: ${h.score}`).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下数据：${summary}。作为ADHD专家，给出150字以内的专业分析报告，包含注意力稳定性和生活建议。`,
      config: { temperature: 0.7 }
    });
    return response.text || "数据正在同步，请继续保持。";
  } catch (error) {
    return "分析模块暂时离线，请保持训练规律。";
  }
}

/**
 * 生成严格 7 位数字的听觉任务
 */
export async function generateAuditoryTask() {
  const count = 7; 
  const numbers = Array.from({ length: count }, () => Math.floor(Math.random() * 10));
  const textToSpeak = numbers.map(n => CHINESE_NUMBERS[n]).join(" ");
  
  const apiKey = getSafeApiKey();
  if (!apiKey) return { base64Audio: null, correctSequence: numbers };

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `朗读数字序列：${textToSpeak}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    
    if (!base64Audio) throw new Error("Audio data missing");
    return { base64Audio, correctSequence: numbers };
  } catch (error) {
    console.error("TTS API Error:", error);
    return { base64Audio: null, correctSequence: numbers };
  }
}

export async function getContextItems() {
  const items = [
    { emoji: '🔑', name: '钥匙' }, { emoji: '🚲', name: '自行车' },
    { emoji: '☂️', name: '雨伞' }, { emoji: '🧁', name: '蛋糕' },
    { emoji: '🎒', name: '书包' }, { emoji: '🧤', name: '手套' },
    { emoji: '🎸', name: '吉他' }, { emoji: '🔭', name: '望远镜' },
    { emoji: '📻', name: '收音机' }, { emoji: '🕯️', name: '蜡烛' },
    { emoji: '🧸', name: '玩具熊' }, { emoji: '📸', name: '相机' }
  ];
  return items.sort(() => Math.random() - 0.5).slice(0, 5); 
}
