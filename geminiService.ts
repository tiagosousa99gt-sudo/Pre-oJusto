
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartShoppingSuggestions(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O usuário está procurando por: "${query}". Como assistente de compras de supermercado, sugira 3 categorias de produtos ou marcas específicas que podem interessar a ele. Retorne em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{"suggestions": []}').suggestions as string[];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
