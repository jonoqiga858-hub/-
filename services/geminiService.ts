
// Add Modality to imports
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * 获取游戏结束后的神经反馈
 */
export async function getEncouragement(gameName: string, score: number) {
  // Always create a new instance right before use to ensure latest API Key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `用户完成了ADHD专注训练“${gameName}”，得分：${score}。给出12字以内的专业、高能量、教练式的反馈（中文）。`,
      config: { temperature: 0.8 }
    });
    // Use .text property directly
    return response.text?.trim() || "神经反馈已优化，表现出色。🚀";
  } catch (error) {
    return "系统同步完成，专注度显著提升。✨";
  }
}

/**
 * 生成多维注意力报告
 */
export async function getAttentionAnalysis(history: { gameType: string, score: number }[]) {
  // Always create a new instance right before use to ensure latest API Key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const summary = history.map(h => `${h.gameType}: ${h.score}`).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析以下数据：${summary}。作为ADHD专家，给出150字以内的专业分析报告，包含注意力稳定性和生活建议。`,
      config: { temperature: 0.7 }
    });
    // Use .text property directly
    return response.text || "数据正在同步，请继续保持。";
  } catch (error) {
    return "分析模块暂时离线，请保持训练规律。";
  }
}

/**
 * 生成听觉训练任务：生成随机数字序列并使用 Gemini TTS 转换为语音
 */
export async function generateAuditoryTask() {
  // Always create a new instance right before use to ensure latest API Key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sequence = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  const prompt = `请清晰地逐个朗读以下7个数字，数字之间稍作停顿：${sequence.join('，')}。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    // Extract audio data from response
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    return {
      base64Audio,
      correctSequence: sequence
    };
  } catch (error) {
    console.error("Auditory task generation failed:", error);
    return null;
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
