import { apiKeyManager } from "./api-key-manager";
import { aiLogger } from "./logger";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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

    const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

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
  },
};
