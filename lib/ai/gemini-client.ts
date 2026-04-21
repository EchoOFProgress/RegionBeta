import { apiKeyManager } from "./api-key-manager";
import { aiLogger } from "./logger";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-preview-04-17",
];

export const geminiClient = {
  async generateContent(
    systemPrompt: string,
    userInput: string,
    userId?: string,
    type: "recommender" | "creator" = "creator"
  ): Promise<string> {
    const startTime = Date.now();
    const { key, type: keyUsed } = await apiKeyManager.getEffectiveApiKey(userId);

    if (!key) {
      throw new Error("No Gemini API key available.");
    }

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userInput }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };

    for (const model of GEMINI_MODELS) {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.status === 429 || response.status === 404) {
        console.warn(`Gemini model ${model} unavailable (${response.status}), trying next...`);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      aiLogger.logRequest({
        type,
        input: userInput,
        output: text,
        fallback: !text,
        durationMs: Date.now() - startTime,
        keyUsed,
      });

      return text;
    }

    throw new Error("QUOTA_EXCEEDED");
  },
};
