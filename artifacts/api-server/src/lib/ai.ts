import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("[ai] GEMINI_API_KEY is not set — AI features will return errors until the key is provided");
}

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "missing-key",
});
