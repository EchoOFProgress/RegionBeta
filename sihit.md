# Region Beta: Profesionální ekosystém pro rozvoj disciplíny

## 1. Abstrakt (CZ)
Region Beta je inovativní softwarová platforma navržená pro systematické zvyšování osobní produktivity a budování profesní disciplíny prostřednictvím integrace pokročilých psychologických rámců. Systém využívá moderní principy behaviorální vědy k transformaci abstraktních cílů do měřitelných denních rutin. Umělá inteligence (Gemini AI) je v projektu využívána cíleně pro inteligentní doporučení (Recommender) a asistovanou tvorbu obsahu a modulů (Creator). Region Beta poskytuje komplexní operační systém pro osobní růst a efektivní time-management v digitálním věku.

## 2. Abstract (EN)
Region Beta is an innovative software platform designed for systematic enhancement of personal productivity and professional discipline by integrating advanced psychological frameworks. The system employs modern behavioral science principles to transform abstract goals into measurable daily routines. Artificial Intelligence (Gemini AI) is specifically utilized for intelligent recommendations (Recommender) and assisted content/module creation (Creator). Region Beta provides a comprehensive operating system for personal growth and effective time management in the digital age.

---

## 3. Uživatelský manuál (User Manual)

### 3.1. Prvky rozhraní a navigace
Aplikace je rozdělena do modulů přístupných prostřednictvím horní lišty. Každý modul je optimalizován pro specifickou část vašeho rozvojového cyklu.

### 3.2. Správa úkolů (Tasks)
*   **Vytváření**: Klepnutím na "Add Task" otevřete formulář s možností nastavení priority (1-100), odhadu času a energetické náročnosti.
*   **AI Analýza**: Využívá Recommender logiku pro rozklad úkolů na menší kroky nebo identifikaci rizik přímo ve formuláři úkolu.
*   **Kategorizace**: Úkoly lze filtrovat podle kategorií, které si sami definujete.

### 3.3. Sledování návyků (Habits)
*   **Streak logika**: Systém sleduje vaši kontinuitu. Pravidlo "nevynechat dvakrát za sebou" je integrováno do vizuální zpětné vazby.
*   **Analytika (Non-AI)**: Sledujte svůj postup v čase pomocí čistě datových grafů úspěšnosti a nálady, které odrážejí vaši skutečnou aktivitu.

### 3.4. Výzvy (Challenges)
*   **Vytváření**: Můžete si vytvořit vlastní časově omezené výzvy s různými režimy (Hard Mode, Soft Mode, Retry Limit).
*   **Milníky**: Ke každé výzvě lze přidat kontrolní body (milestones) pro sledování dílčích úspěchů.

### 3.5. AI Studio
*   **Recommender**: Nechte si od AI doporučit další kroky na základě vašich aktuálních dat.
*   **Creator**: Vytvářejte obsah nebo plány přímo v aplikaci pomocí Gemini AI.

---

## 4. Technická dokumentace (Technical Documentation)

### 4.1. Architektura systému
Region Beta je vybudována na frameworku **Next.js 14** (App Router) s využitím **TypeScriptu** pro maximální typovou bezpečnost.

### 4.2. UI a design
*   **Designový systém**: Využívá **Radix UI** pro přístupné komponenty a **Lucide React** pro ikonografii.
*   **Theming**: Systém podporuje více než 12 dynamických témat (Cyber, Solar, Aurum, Nike atd.) definovaných pomocí OKLCH barevného prostoru v CSS proměnných.

### 4.3. Datová vrstva a persistence
*   Aplikace aktuálně využívá **LocalStorage** pro lokální persistenci dat, což zaručuje soukromí a okamžitou odezvu.
*   Synchronizace mezi moduly je zajištěna pomocí **React Context API** (AuthProvider, UIProvider, CategoryProvider atd.).

### 4.4. Integrace umělé inteligence
*   Jádro AI tvoří **Google Gemini API**.
*   **API Key Manager**: Bezpečně ukládá API klíče uživatele přímo v prohlížeči.
*   **Rozsah**: AI je striktně omezena na generování doporučení, tvorbu plánů a rozklad úkolů. Veškerá ostatní analytika (grafy, vizualizace návyků) je založena na deterministické práci s daty uživatele.
*   **Pipes**: Systém využívá sadu validátorů vstupů a výstupů (`input-validator.ts`, `output-validator.ts`) pro zajištění kvality generovaných dat.

### 4.5. Bezpečnost a ochrana soukromí
*   Všechna citlivá data (API klíče) jsou šifrována lokálně (AES-256) před uložením do prohlížeče.
*   Aplikace neposílá vaše osobní data (seznamy úkolů) na žádný centrální server, vyjma přímých dotazů na Gemini API.
