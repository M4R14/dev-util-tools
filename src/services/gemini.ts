import { GoogleGenAI } from '@google/genai';

let cachedAi: GoogleGenAI | null = null;
let cachedKey = '';

const getAI = (key: string): GoogleGenAI => {
  if (cachedAi && cachedKey === key) return cachedAi;
  cachedAi = new GoogleGenAI({ apiKey: key });
  cachedKey = key;
  return cachedAi;
};

export const askGemini = async (prompt: string, codeSnippet: string, apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error('Gemini API Key is missing. Please set it in settings.');
  }

  const ai = getAI(key);
  const model = 'gemini-3-flash-preview';

  const fullPrompt = `
    You are a world-class senior developer assistant. 
    Help the user with the following request based on their code.
    
    User Request: ${prompt}
    
    Code Snippet:
    \`\`\`
    ${codeSnippet}
    \`\`\`
    
    Provide a concise, helpful, and professional response. If giving code, use markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });
    return response.text;
  } catch (error: unknown) {
    console.error('Gemini Error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get response from AI assistant.',
    );
  }
};
