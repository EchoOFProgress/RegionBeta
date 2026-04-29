import { geminiClient } from "./gemini-client";
import { Language } from "../language-context";
import { getInsightCards } from "../insight-cards-data";

/**
 * Recommender system for Insight Cards.
 * Takes a user query and returns matching card IDs using Gemini.
 */
export const recommender = {
  async getRecommendations(userInput: string, lang: Language = "CZ", userId?: string): Promise<string[]> {
    // 1. Prepare system context based on existing cards (localized)
    const cards = getInsightCards(lang);
    const cardsContext = cards.map(card => ({
        id: card.id,
        category: card.category,
        title: card.title,
        triggers: card.triggers
    }));

    const systemPromptCZ = `
Jsi elitní psychologický a produktivitní asistent v aplikaci Region Beta.
Tvojí rolí je sémanticky přiřadit nejlepší kartičky s "insightem" k volnému textu uživatele.
Reaguješ na trápení, problémy nebo reporty chování uživatele.

K dispozici máš tuto databázi kartiček (JSON pole):
${JSON.stringify(cardsContext)}

Tvým JEDINÝM úkolem je vrátit seznam ID kartiček (od 0 do 5 kusů), které jsou nejužitečnější k řešení situace uživatele.
Odpověď MUSÍ být výhradně validní JSON pole stringů (ID). Žádný jiný text nesmí být vrácen.
Pokud se nehodí absolutně žádná, vrať prázdné pole [].
Nebuď příliš obecný, vyhodnocuj opravdu klíčové spouštěče.
    `.trim();

    const systemPromptEN = `
You are an elite psychological and productivity assistant in the Region Beta app.
Your role is to semantically match the best "insight" cards to the user's free-text input.
You respond to user struggles, problems, or behavioral reports.

You have the following card database available (JSON array):
${JSON.stringify(cardsContext)}

Your ONLY task is to return a list of card IDs (from 0 to 5 pieces) that are most useful for solving the user's situation.
The response MUST be exclusively a valid JSON array of strings (IDs). No other text must be returned.
If absolutely none fit, return an empty array [].
Don't be too general, evaluate truly key triggers.
    `.trim();

    const systemPrompt = lang === "EN" ? systemPromptEN : systemPromptCZ;

    const responseText = await geminiClient.generateContent(
        systemPrompt,
        userInput,
        userId,
        "recommender"
    );

    const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();

    try {
       const recommendedIds = JSON.parse(cleanJson);
       if (!Array.isArray(recommendedIds)) return [];
       return recommendedIds;
    } catch {
       console.error("Recommender: invalid JSON response:", cleanJson);
       return [];
    }
  }
};
