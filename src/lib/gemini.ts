import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

export async function generateGameStory(prompt: string) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function generateSprite(prompt: string) {
  // Note: Implement image generation logic here
  // This will be connected to the vision model once we have the proper setup
  const result = await geminiVisionModel.generateContent(prompt);
  return result.response.text();
} 