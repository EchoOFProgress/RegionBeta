import { geminiClient } from "./gemini-client";
import { validateGeneratedModule, GeneratedModule, OutputValidationResult } from "./output-validator";
import { Language } from "../language-context";

const MODULE_SCHEMA_CZ = `
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

const MODULE_SCHEMA_EN = `
{
  "challenge": {
    "title": "string (short immersive title)",
    "description": "string (motivational description accurately matching user's goal)",
    "duration": "number (length in days, ideally 7-30)",
    "goalType": "daily-completion | total-amount | checklist",
    "difficulty": "number (1-10, how hard it is)"
  },
  "tasks": [
    {
      "title": "string (name of specific task derived from the challenge)",
      "description": "string (optional detail)",
      "type": "checkbox | numeric | timer",
      "timeEstimate": "number (optional time in minutes)"
    }
  ]
}
`.trim();

export const creator = {
  /**
   * Generates a new structured productivity module (Challenge + Tasks) based on user goal.
   */
  async generateModule(userGoal: string, lang: Language = "CZ", userId?: string): Promise<OutputValidationResult<GeneratedModule>> {
    
    const systemPromptCZ = `
Jsi Master Architect v systému produktivity Region Beta.
Uživatel ti popíše svůj cíl, přání nebo vlastnost, kterou chce získat.
Tvým úkolem je navrhnout dokonalý výcvikový modul. Modul se skládá přesně z JEDNÉ Výzvy (Challenge) a 1 až 4 Úkolů (Tasks), které budou výzvu prakticky naplňovat.

Odpověď MUSÍ BÝT V JAZYCE: ČEŠTINA.
Odpověď MUSÍ BÝT STRUKTURNĚ A VŽDY jen a pouze v JSON formátu a to naprosto exaktně podle této definice.
NESMÍŠ psát markdown formátování bloku (\`\`\`json) ani žádný vysvětlující text mimo JSON stavbu!!

TOTO JE SCHÉMA, KTERÉ MUSÍŠ DO PUNTÍKU DODRŽET:
${MODULE_SCHEMA_CZ}

Navrhni řešení tak, aby bylo úderné, brutálně pravdivé, ale profesionální (Region Beta styl). Zvol vhodný goalType podle toho, zda cíl vyžaduje konzistenci každý den (daily-completion) nebo sbírání částek (total-amount).
`.trim();

    const systemPromptEN = `
You are a Master Architect in the Region Beta productivity system.
The user describes their goal, wish, or a trait they want to acquire.
Your task is to design the perfect training module. A module consists of exactly ONE Challenge and 1 to 4 Tasks that will practically fulfill the challenge.

The response MUST BE IN LANGUAGE: ENGLISH.
The response MUST BE STRUCTURAL AND ALWAYS only in JSON format, exactly according to this definition.
You MUST NOT write markdown block formatting (\`\`\`json) or any explanatory text outside the JSON structure!!

THIS IS THE SCHEMA YOU MUST FOLLOW TO THE LETTER:
${MODULE_SCHEMA_EN}

Design the solution to be impactful, brutally honest, but professional (Region Beta style). Choose an appropriate goalType based on whether the goal requires consistency every day (daily-completion) or accumulating amounts (total-amount).
`.trim();

    const systemPrompt = lang === "EN" ? systemPromptEN : systemPromptCZ;

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
        error: error.message || (lang === "EN" ? "An unknown error occurred while generating the challenge." : "Při generování výzvy došlo k neznámé chybě.")
      };
    }
  }
};
