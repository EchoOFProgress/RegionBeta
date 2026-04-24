import { apiKeyManager } from "./api-key-manager";
import { aiLogger } from "./logger";

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
      console.error("DEBUG: No Gemini API key found.");
      throw new Error("No Gemini API key available.");
    }
    
    console.log("DEBUG: Using Gemini API key, type:", keyUsed, "last 4 chars:", key.slice(-4));

    // Try these models in order
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b'
    ];
    
    const prompt = `${systemPrompt}\n\nUživatelův vstup: ${userInput}`;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      // Try both v1beta and v1 endpoints for each model
      const apiVersions = ['v1beta', 'v1'];
      
      for (const apiVersion of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${key}`;
          
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            
            if (!aiText) continue;

            aiLogger.logRequest({
              type,
              input: userInput,
              output: aiText,
              fallback: false,
              durationMs: Date.now() - startTime,
              keyUsed,
            });

            return aiText;
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(`Model ${modelName} (${apiVersion}) selhal s kódem ${res.status}:`, errData);
            lastError = new Error(`API Error ${res.status}: ${JSON.stringify(errData)}`);
            
            // If we get 429, it's likely we'll get it for other models too, but let's keep trying
          }
        } catch (e) {
          lastError = e;
          console.error(`Chyba při volání ${modelName} (${apiVersion}):`, e);
        }
      }
    }

    throw new Error(
      lastError?.message?.includes("429") 
        ? "Byl překročen limit API klíče (Error 429). Zkuste to prosím za chvíli nebo použijte jiný klíč." 
        : "Nepodařilo se připojit k žádnému z modelů Gemini. Zkontrolujte prosím svůj API klíč."
    );
  },
};
