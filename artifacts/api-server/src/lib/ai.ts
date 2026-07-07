import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("[ai] OPENAI_API_KEY is not set — AI features will return errors until the key is provided");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing-key",
});
