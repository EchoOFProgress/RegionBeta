import { geminiClient } from "./gemini-client";
import { validateGeneratedModule, GeneratedModule, OutputValidationResult } from "./output-validator";

const MODULE_SCHEMA = `
{
  "challenge": {
    "title": "string (krátký pohlcující název)",
    "description": "string (motivační popis přesně odpovídající cíli uživatele)",
    "duration": "number (délka ve dnech, ideálně 7-30)",
    "goalType": "daily-completion | total-amount | checklist",
    "difficulty": "number (1-10, jak je to těžké)"
  },
  "tasks": [
    {
      "title": "string (název konkrétního úkolu vycházejícího z výzvy)",
      "description": "string (volitelně detail)",
      "type": "checkbox | numeric | timer",
      "timeEstimate": "number (volitelně čas v minutách)"
    }
  ]
}
`.trim();

export const creator = {
  /**
   * Generates a new structured productivity module (Challenge + Tasks) based on user goal.
   */
  async generateModule(userGoal: string, userId?: string): Promise<OutputValidationResult<GeneratedModule>> {
    
    const systemPrompt = `
Jsi Master Architect v systému produktivity Region Beta.
Uživatel ti popíše svůj cíl, přání nebo vlastnost, kterou chce získat.
Tvým úkolem je navrhnout dokonalý výcvikový modul. Modul se skládá přesně z JEDNÉ Výzvy (Challenge) a 1 až 4 Úkolů (Tasks), které budou výzvu prakticky naplňovat.

Odpovíš STRUKTURNĚ A VŽDY jen a pouze v JSON formátu a to naprosto exaktně podle této definice.
NESMÍŠ psát markdown formátování bloku (\`\`\`json) ani žádný vysvětlující text mimo JSON stavbu!!

TOTO JE SCHÉMA, KTERÉ MUSÍŠ DO PUNTÍKU DODRŽET:
${MODULE_SCHEMA}

Navrhni řešení tak, aby bylo úderné, brutálně pravdivé, ale profesionální (Region Beta styl). Zvol vhodný goalType podle toho, zda cíl vyžaduje konzistenci každý den (daily-completion) nebo sbírání částek (total-amount).
`.trim();

    try {
      const resultText = await geminiClient.generateContent(
        systemPrompt,
        userGoal,
        userId,
        "creator"
      );

      // Pass it through our secure backend validator
      const validationResult = validateGeneratedModule(resultText);
      return validationResult;

    } catch (error: any) {
      return {
        valid: false,
        error: error.message || "Při generování výzvy došlo k neznámé chybě."
      };
    }
  }
};
