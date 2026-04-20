# Technická dokumentace: Region Beta Ecosystem

## 1. Přehled projektu (Project Overview)
**Region Beta** je pokročilý operační systém pro osobní produktivitu, navržený k překonání prokrastinace prostřednictvím integrace behaviorální vědy, gamifikace a umělé inteligence. Název odkazuje na "Region Beta Paradox" – psychologický fenomén, kde se lidé lépe vyrovnávají s intenzivními problémy než s mírnými. Systém je navržen tak, aby transformoval mírné cíle do intenzivních, zvladatelných struktur.

### Klíčové pilíře:
- **Modularita**: Samostatné, ale propojené moduly pro různé typy aktivit.
- **Privacy-First**: Veškerá uživatelská data zůstávají v lokálním úložišti (LocalStorage).
- **Aesthetic Excellence**: Dynamický designový systém s 12+ profesionálními tématy.
- **AI-Assistance**: Cílená integrace Google Gemini pro plánování a analýzu.

---

## 2. Architektura a Technologický Stack

### Jádro systému:
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) – zajišťuje rychlost, SEO a moderní routování.
- **Jazyk**: [TypeScript](https://www.typescriptlang.org/) – striktní typování pro eliminaci runtime chyb.
- **Runtime**: Node.js v18+.

### UI a Frontend:
- **Knihovny komponent**: [Radix UI](https://www.radix-ui.com/) (bezbariérovost), [Lucide React](https://lucide.dev/) (ikony).
- **Stylování**: Vanilla CSS s využitím moderních proměnných a **OKLCH** barevného prostoru pro precizní barvy.
- **Stav aplikace**: [React Context API](https://react.dev/reference/react/useContext) – distribuovaný stav napříč aplikací (Auth, UI, Category, Notification).

### Data a Validace:
- **Persistence**: `window.localStorage` pro uživatelská data a nastavení.
- **Validace**: [Zod](https://zod.dev/) – validace schémat pro AI výstupy a formuláře.
- **Datum a čas**: [date-fns](https://date-fns.org/) – manipulace s časovými úseky a streaky.

---

## 3. Design Systém a Theming

Region Beta využívá unikátní systém dynamických témat založený na CSS proměnných.

### Mechanismus témat:
- **GlobalThemeProvider**: React komponenta obalující aplikaci, která injektuje vybrané CSS soubory z `/public/insight-themes/`.
- **OKLCH Barvy**: Využití barevného formátu `oklch(L C H)`, který zaručuje konzistentní vnímaný jas napříč barvami.
- **Seznam témat**:
    1.  **Cyber**: Neonová modrá a tma (high-tech).
    2.  **Solar**: Teplé, přírodní odstíny (energie).
    3.  **Aurum**: Luxusní černá a zlatá.
    4.  **Swiss**: Minimalistický, funkční design (Bauhaus styl).
    5.  **Brutalist**: Raw, surový betonový vzhled.
    6.  **Nike**: Sportovní, high-contrast barvy.
    7.  ... a další (Blueprint, Ember, Premium, Retro, Tokyo).

---

## 4. Funkční Moduly

### 4.1. Task Module (Úkoly)
- **Vlastnosti**: Priorita (1-100), energetická náročnost, odhad času, kategorie.
- **Logika**: Automatické řazení podle priority a deadline. Možnost "rozpadu" úkolu pomocí AI.

### 4.2. Habit Module (Návyky)
- **Logika série (Streak)**: Sleduje dny po sobě, podporuje pravidlo "nevynechat dvakrát".
- **Typy**: Binární (splněno/nesplněno), číselné (hodnoty), checklistové.
- **Resetování**: Automatické denní, týdenní nebo měsíční resetování stavu.

### 4.3. Challenge Module (Výzvy)
- **Režimy**:
    - **Soft Mode**: Povoluje chyby, sleduje zotavení.
    - **Hard Mode**: Jedna chyba znamená konec výzvy.
- **Analytika**: Pace calculator – výpočet potřebného tempa pro dokončení cíle.

### 4.4. Goal Module (Cíle)
- **Nadřazená struktura**: Možnost propojit více úkolů, návyků a výzev k jednomu cíli.
- **Progress Tracking**: Agregovaný progress bar ze všech připojených modulů.

---

## 5. Integrace Umělé Inteligence (Gemini AI)

AI je do Region Beta integrována jako tichý společník pro kognitivní úlevu uživatele.

### Architektura AI vrstvy (`lib/ai/`):
- **Gemini Client**: Wrapper pro Google Generative AI SDK se správou chyb.
- **Recommender**: Analyzuje uživatelská data a navrhuje priority pro daný den.
- **Creator**: Generuje detailní akční plány, rozkládá složité úkoly na atomické kroky.
- **Bezpečnost**:
    - **API Key Manager**: Šifrování klíče uživatele pomocí **AES-256** před uložením do LocalStorage.
    - **Validators**: `input-validator.ts` čistí citlivá data před odesláním; `output-validator.ts` kontroluje integritu JSON odpovědí od AI.

---

## 6. Správa Dat a Bezpečnost

### Persistence:
- Data jsou uložena pod klíči jako `region-beta-tasks`, `region-beta-habits` atd.
- **Kryptografie**: Citlivá data (šifrovací klíče, API klíče) jsou chráněna lokálním heslem uživatele, které není nikde ukládáno v surové podobě.

### Bezpečnostní wrapper:
- `AuthWrapper` a `SafeHydration`: Komponenty zajišťující, že se data načtou až na straně klienta, čímž se předchází "hydration" chybám Next.js a úniku dat do HTML.

---

## 7. Vývojové pokyny

### Příkazy:
- `npm run dev`: Spuštění vývojového serveru na portu 3001.
- `npm run build`: Sestavení produkční verze.
- `npm run lint`: Statická analýza kódu.

### Struktura adresářů:
- `app/`: Routování a stránky.
- `components/`: React komponenty rozdělené podle modulů.
- `lib/`: Business logika, AI, utility a typy.
- `public/`: Statické soubory a globální CSS témata.
- `styles/`: Komponentově specifické styly.

---
**Region Beta Technical Documentation v1.0** — *Prepared for EchoOFProgress*
