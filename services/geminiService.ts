
import { GoogleGenAI, Modality } from "@google/genai";

// 安全获取 API Key，防止 process 未定义导致的崩溃
const apiKey = typeof process !== 'undefined' && process.env?.API_KEY ? process.env.API_KEY : "";
const ai = new GoogleGenAI({ apiKey });

const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/**
 * 获取游戏结束后的神经反馈（鼓励语）
 */
export async function getEncouragement(gameName: string, score: number) {
  if (!apiKey) return "同步成功，专注于下个协议。";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `用户完成了ADHD专注训练“${gameName}”，得分：${score}。
      给出12字以内的专业、高能量、教练式的反馈（中文）。`,
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
  if (!apiKey) return "无法生成云端报告。";
  try {
    const summary = history.map(h => `${h.gameType}: ${h.score}`).join(', ');
    const