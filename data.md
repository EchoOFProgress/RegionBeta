# Analýza Insight Cards (Taktické kartičky)

Tento dokument slouží jako zadání a technický podklad pro implementaci a správu "Insight Cards" v aplikaci Region Beta.

## Instrukce pro programování (Agent Context)
Při implementaci nebo úpravách systému kartiček (zejména pro agenty jako Claude) dodržujte následující pravidla:

1.  **Zdroj pravdy:** Primární databáze je v `lib/insight-cards-data.ts`. Nikdy nehalucinujte obsah kartiček; vždy čerpejte z tohoto souboru.
2.  **Sémantické párování:** Pro doporučování kartiček používejte `recommender.getRecommendations(userInput)`. Agent by měl sémanticky propojit uživatelské "trápení" s polem `triggers` v datech.
3.  **Stavový management:** Implementujte jasný přechod mezi stavem "Náhled" (Preview) a "Detail". Náhled musí být stručný a akční.
4.  **Komponenty:** Využívejte existující komponenty `InsightCardThumbnail` pro seznamy a `InsightCardDetail` pro plné zobrazení.
5.  **Limitace:** Nezobrazujte uživateli více než 3 doporučené kartičky najednou, aby nedošlo k rozhodovací paralýze.

## Časté chyby a na co si dát pozor
*   **Duplicitní ID:** Pozor na `card-goal-filter`, které se v databázi vyskytuje dvakrát. Při volání ID se ujistěte, že vybíráte správnou variantu nebo duplicitu odstraňte.
*   **Příliš dlouhé náhledy:** Preview, které má více než 2-3 věty, uživatelé přeskakují. Držte se striktně schématu: *Insight -> 2 věty -> Tlačítko*.
*   **Kontextová ztráta:** Při přechodu na detail kartičky zajistěte, aby se uživatel mohl snadno vrátit k rozdělané práci (např. pomocí modálního okna nebo `onBack` callbacku).
*   **Lokalizační nesoulad:** Pokud je aplikace přepnuta do EN, musí se načítat `INSIGHT_CARDS_EN`. Nekombinujte jazyky v rámci jednoho zobrazení.

---

## Jak funguje spouštění kartiček
Kartičky jsou v systému Region Beta spouštěny primárně dvěma způsoby:
1.  **Sémantická analýza (AI Recommender):** Uživatel popíše svou situaci (např. "Ztratil jsem streak"), a AI (Gemini) vybere nejvhodnější kartičky na základě shody s definovanými spouštěči.
2.  **Kontextové doporučení:** V rámci "Next Cards" systému, kde jedna kartička odkazuje na další související témata.

## Postup zobrazení (UI Workflow)
Aby byla zachována přehlednost a uživatel nebyl zahlcen informacemi, zobrazení probíhá v následujících krocích:

1.  **Náhled (Preview):** Zobrazí se pouze **hlavní myšlenka (Insight)** a krátký výtah z analýzy obsahu (maximálně **dvě věty**).
2.  **Interakce:** U náhledu je vždy přítomno tlačítko **"Přejít na kartu"**.
3.  **Detail:** Po kliknutí na tlačítko je uživatel přesměrován na plný detail kartičky, kde najde kompletní vědecký podklad, citace a navazující kroky.

---

## Přehled kartiček a rozšířené případy spouštění

| ID | Název kartičky | Hlavní spouštěče (Rozšířené případy) |
| :--- | :--- | :--- |
| `card-streak` | **Jeden den nevadí. Nepřidávejte druhý.** | • Uživatel ztratil streak (např. 14+ dní).<br>• Pocit, že "všechno je zničeno" kvůli jednomu vynechání.<br>• Uživatel si myslí, že není "ten typ člověka", co u věcí vydrží. |
| `card-goals` | **Lež, která motivuje miliony.** | • Uživatel si nastavuje ambiciózní cíl, ale nemá systém sledování.<br>• Uživatel věří mýtu o "Yale studii z roku 1953".<br>• Cíl je definován vágně bez sociálního závazku. |
| `card-twominute` | **Zabere to dvě minuty. Udělejte to teď.** | • Seznam úkolů je zahlcen drobnostmi (umýt nádobí, odpovědět na mail).<br>• Uživatel si stěžuje, že nemá čas na "velkou práci" kvůli "hašení malých požárů". |
| `card-habits` | **Pravidla pro budování návyků** | • Snaha začít 5 nových návyků najednou.<br>• Návyk je příliš obtížný na start (např. "cvičit 2 hodiny denně").<br>• Prostředí uživatele neobsahuje žádné vizuální spouštěče. |
| `card-discipline-equation` | **Rovnice disciplíny** | • Uživatel obviňuje svůj charakter z lenosti.<br>• "Dnes nemám motivaci."<br>• Proces plnění je nudný nebo obsahuje příliš mnoho překážek (vysoký friction). |
| `card-compounding` | **Cítili jsme, že někam jdeme** | • Pocit, že pokrok je příliš pomalý nebo neviditelný.<br>• Absence výsledků po prvním týdnu diety či cvičení.<br>• Uživatel se vrací k aplikaci po dlouhé pauze. |
| `card-reference-group` | **Pět lidí, se kterými trávíte čas?** | • Okolí uživatele zesměšňuje jeho snahu o změnu.<br>• Pocit, že uživatel do svého současného prostředí "nepatří".<br>• Rozhodování o změně kariéry či životního stylu. |
| `card-regret-minimization` | **Budete si pamatovat toto rozhodnutí?** | • Strach udělat riskantní, ale prospěšné rozhodnutí (např. výpověď).<br>• Váhání mezi večerem u Netflixu a prací na vlastním projektu.<br>• Pocit stagnace ("jsem na stejném místě jako před rokem"). |
| `card-goal-filter` | **Přibližuje mě tohle k cíli?** | • Rozptylování se věcmi, které uživatel ví, že mu nepomáhají.<br>• Nutnost odmítnout sociální pozvání kvůli prioritám.<br>• Analýza každodenních aktivit skrze Hormoziho binární filtr. |

---

## Detailní analýza obsahu (Témata)

### 1. Zvládání selhání (`card-streak`)
*   **Insight:** Lidé, kteří uspěli, neselhávali méně, ale vraceli se rychleji. Průměrně selhali 14x.
*   **Kdy:** Frustrace ze ztráty "čísla" na obrazovce.

### 2. Mýty o cílech (`card-goals`)
*   **Insight:** Zapisování je jen 1. krok; kritická je odpovědnost (accountability) vůči někomu jinému.
*   **Kdy:** Plánování bez konkrétních kroků.

### 3. Překonávání tření (`card-discipline-equation`)
*   **Insight:** Disciplína není vlastnost, ale výsledek rovnice: Důležitost + Potěšení - Tření.
*   **Kdy:** Hledání "vůle" tam, kde stačí upravit prostředí.

### 4. Sociální dynamika (`card-reference-group`)
*   **Insight:** Referenční skupinu si vybíráte tím, čí hlas v hlavě posloucháte, ne s kým sedíte.
*   **Kdy:** Pocit izolace při osobním růstu.

---

## Technické poznámky
*   **Duplicita ID:** ID `card-goal-filter` je v `lib/insight-cards-data.ts` duplikováno.
*   **Lokalizace:** Podpora CZ (`INSIGHT_CARDS_CZ`) a EN (`INSIGHT_CARDS_EN`).
*   **Zdroj dat:** `lib/insight-cards-data.ts` (Next.js) a `Insight_Cards/cards.js` (Legacy).

---
*Zpracováno automaticky asistentem Antigravity pro projekt Region Beta.*
