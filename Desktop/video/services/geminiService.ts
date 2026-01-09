
import { GoogleGenAI } from "@google/genai";
import { Assessment, VideoEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIInsights = async (entry: VideoEntry, assessments: Assessment[]) => {
  const judgeFeedback = assessments.map(a => `- ${a.judgeName}: ${a.comment}`).join('\n');
  const scoresSummary = assessments.map(a => {
    // Fixed by explicitly typing reduce parameters to resolve unknown type error
    const avg = (Object.values(a.scores) as number[]).reduce((acc: number, val: number) => acc + val, 0) / Object.values(a.scores).length;
    return `- ${a.judgeName} memberikan rata-rata ${avg.toFixed(1)}`;
  }).join('\n');

  const prompt = `
    Analisis feedback juri untuk tim video "${entry.teamName}".
    
    Data Skor:
    ${scoresSummary}
    
    Komentar Juri:
    ${judgeFeedback}
    
    Tugas: Berikan ringkasan eksekutif (3-4 kalimat) tentang kekuatan utama video ini dan 1 area spesifik yang perlu diperbaiki berdasarkan masukan juri tersebut. Gunakan bahasa Indonesia yang profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};
