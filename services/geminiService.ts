import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSkillQuiz = async (skillName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a 3-question multiple choice quiz to verify basic knowledge of ${skillName}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER }
                },
                required: ['question', 'options', 'correctAnswerIndex']
              }
            }
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback quiz if API fails or key is missing
    return {
      questions: [
        {
          question: `What is a fundamental concept of ${skillName}?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctAnswerIndex: 0
        }
      ]
    };
  }
};
