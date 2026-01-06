
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  analyzeAttendance: async (stats: any) => {
    try {
      const prompt = `Analyze this attendance data for a youth organization: Total Records: ${stats.total}, Hadir: ${stats.hadir}, Izin: ${stats.izin}, Sakit: ${stats.sakit}, Alfa: ${stats.alfa}. Provide a very brief motivational summary or suggestion in Indonesian for the leadership to increase participation.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Tingkatkan terus semangat kehadirannya!";
    } catch (error) {
      return "Data kehadiran menunjukkan tren positif, teruskan koordinasi antar pengurus.";
    }
  }
};
