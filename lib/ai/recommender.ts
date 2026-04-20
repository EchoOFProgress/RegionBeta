import { geminiClient } from "./gemini-client";
import INSIGHT_CARDS from "../insight-cards-data";

/**
 * Recommender system for Insight Cards.
 * Takes a user query and returns matching card IDs using Gemini.
 */
export const recommender = {
  async getRecommendations(userInput: string, userId?: string): Promise<string[]> {
    // 1. Prepare system context based on existing cards
    // We only pass metadata, not the massive descriptions, to save tokens/money.
    const cardsContext = INSIGHT_CARDS.map(card => ({
        id: card.id,
        category: card.category,
        title: card.title,
        triggers: card.triggers
    }));

    const systemPrompt = `
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

    try {
       // 2. Call Gemini
       const responseText = await geminiClient.generateContent(
           systemPrompt, 
           userInput,
           userId,
           "recommender"
       );

       // Clean up backticks in case they appear
       const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
       
       const recommendedIds = JSON.parse(cleanJson);
       
       if (!Array.isArray(recommendedIds)) {
           return [];
       }

       return recommendedIds;
    } catch (error) {
       console.error("Recommender failed:", error);
       return [];
    }
  }
};
