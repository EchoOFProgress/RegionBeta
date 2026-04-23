"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "CZ" | "EN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  CZ: {
    // Shared Form Fields
    "Description": "Popis",
    "Habit Type": "Typ návyku",
    "Frequency": "Frekvence",
    "Reminders": "Upozornění",
    "Reset Schedule": "Plán resetu",
    "Color & Icon": "Barva & Ikona",
    "Time Window": "Časové okno",
    "Add options": "Přidat možnosti",
    "Habit Name": "Název návyku",
    "e.g., Morning meditation, Read 30 minutes...": "např. Ranní meditace, Čtení 30 minut...",
    "Task Title": "Název úkolu",
    "What needs to be done?": "Co je třeba udělat?",
    "Priority (1–100)": "Priorita (1–100)",
    "Due Date": "Termín",
    "Reminder": "Upozornění",
    "Time Estimate (minutes)": "Odhadovaný čas (minuty)",
    "Time Block": "Časový blok",
    "Tags": "Štítky",
    "Recurring": "Opakování",
    "Link Goal": "Propojit cíl",
    "Dependencies": "Závislosti",
    "Create Habit": "Vytvořit návyk",
    "Create Task": "Vytvořit úkol",
    "Cancel": "Zrušit",
    "Add details...": "Přidat detaily...",
    "1–33 Low · 34–66 Medium · 67–100 High": "1–33 Nízká · 34–66 Střední · 67–100 Vysoká",
    "Select date": "Vybrat datum",
    "Enable reminder": "Zapnout upozornění",
    "e.g. 30": "např. 30",
    "Type a tag...": "Napište štítek...",
    "Add": "Přidat",
    "Select a goal": "Vybrat cíl",
    "Time Estimate": "Odhadovaný čas",
    "days remaining": "dní zbývá",
    "Starts in:": "Začíná za:",
    "Daily Pace:": "Denní tempo:",
    "Target:": "Cíl:",
    "day": "den",
    "Expected:": "Očekáváno:",
    "Actual:": "Skutečnost:",
    "Behind:": "Pozadu:",
    "Ahead:": "Napřed:",
    "Current Streak:": "Aktuální série:",
    "Best:": "Nejlepší:",
    "goal:": "cíl:",
    "days": "dní",
    "ahead": "Napřed",
    "behind": "Pozadu",
    "on track": "Podle plánu",
    "Upcoming": "Nadcházející",
    "Active": "Aktivní",
    "Failed": "Selhání",
    "No milestones set": "Žádné milníky nebyly nastaveny",
    "Daily Tasks": "Denní úkoly",
    "Add daily task...": "Přidat denní úkol...",
    "Add details about this habit...": "Přidejte detaily k tomuto návyku...",
    "Goal Tracking": "Sledování cílů",
    "Select Days": "Vybrat dny",
    "Sun": "Ne",
    "Mon": "Po",
    "Tue": "Út",
    "Wed": "St",
    "Thu": "Čt",
    "Fri": "Pá",
    "Sat": "So",
    "Daily Completion": "Denní plnění",
    "Total Amount": "Celkové množství",
    "Points": "Body",
    "Hard Mode — Challenge ends on first fail": "Hard mód — Výzva končí při prvním selhání",
    "Soft Mode — Track failures only": "Soft mód — Pouze zaznamenávat selhání",
    "Retry Limit — Max failures allowed": "Limit pokusů — Maximální počet selhání",
    "Maximum failures allowed": "Maximální počet povolených selhání",
    "Easy": "Lehké",
    "Hard": "Těžké",
    "Target": "Terč",
    "Book": "Kniha",
    "Dumbbell": "Činka",
    "Calendar": "Kalendář",
    "Award": "Ocenění",
    "Trending Up": "Stoupající trend",

    // Challenge Create Form
    "Challenge Title": "Název výzvy",
    "Duration (days)": "Trvání (dny)",
    "Goal Type": "Typ cíle",
    "Failure Mode": "Režim selhání",
    "Start Date": "Datum začátku",
    "Difficulty": "Náročnost",
    "Color": "Barva",
    "Icon": "Ikona",
    "Create Challenge": "Vytvořit výzvu",
    "e.g., Morning Routine Master": "např. Ranní rutina",
    "What's the goal of this challenge?": "Jaký je cíl této výzvy?",

    // Project Statistics
    "Days": "Dny",
    "days in": "dní uběhlo",
    "Tasks": "Úkoly",
    "Daily Pace Needed": "Požadované denní tempo",
    "unit/day": "jednotek/den",
    "To reach your goal by": "Abyste dosáhli cíle do",
    "you need to maintain this average daily progress.": "musíte udržet toto průměrné tempo.",
    "Cumulative Progress": "Celkový pokrok",
    "Milestones Progress": "Pokrok milníků",
    "Completed": "Dokončeno",
    "ACHIEVED": "DOSAŽENO",
    "PENDING": "ČEKÁ",
    "No milestones defined for this challenge.": "Pro tuto výzvu nebyly určeny žádné milníky.",
    "Daily Progress Logs": "Záznamy o postupu",
    "Date": "Datum",
    "Added": "Přidáno",
    "Note": "Poznámka",
    "No logs recorded yet. Start by adding progress!": "Žádné záznamy. Začněte přidávat svůj postup!",
    
    // Forms Drops
    "Done / Not Done": "Splněno / Nesplněno",
    "Numeric Goal (e.g. 30 min)": "Číselný cíl (např. 30 min)",
    "Checklist (multiple items)": "Odrážkový seznam",
    "Goal Mode": "Režim cíle",
    "At least": "Alespoň",
    "Less than": "Méně než",
    "Exactly": "Přesně",
    "Any value": "Jakákoliv hodnota",
    "Target Value": "Cílová hodnota",
    "From": "Od",
    "To": "Do",
    "Start": "Začátek",
    "End": "Konec",
    "Pattern": "Vzorec",
    "Daily": "Denně",
    "Weekly": "Týdně",
    "Monthly": "Měsíčně",
    "Yearly": "Ročně",
    "Every (N)": "Každých (N)",
    "End Date (optional)": "Datum konce (volitelné)",
    "No end date": "Bez data konce",

    // Navigation
    "nav.tasks": "Úkoly",
    "nav.habits": "Návyky",
    "nav.challenges": "Výzvy",
    "nav.goals": "Cíle",
    "nav.insight": "Znalosti",
    "nav.ai": "AI Studio",
    "Add Module": "Přidej modul",
    "New Task": "Nový úkol",
    "New Habit": "Nový návyk",
    "New Challenge": "Nová výzva",
    "New Goal": "Nový cíl",
    "Select What to Add": "Vyberte, co chcete přidat",
    "Task Added!": "Úkol přidán!",
    "Habit Created!": "Návyk vytvořen!",
    "Challenge Added!": "Výzva přidána!",
    "Goal Added!": "Cíl přidán!",
    
    // Settings
    "settings.title": "NASTAVENÍ",
    "settings.account": "AI Klíč",
    "settings.page": "Nastavení stránky",
    "settings.language": "Nastavení jazyka",
    "app.language": "Jazyk aplikace",
    "app.language.note": "Aplikace preferuje jazyk podle vaší lokace/prohlížeče.",
    
    // Tasks
    "Search tasks...": "Hledat úkoly...",
    "Priority": "Priorita",
    "Creation Date": "Datum vytvoření",
    "Manual Order": "Vlastní pořadí",
    "Add Task": "Přidat úkol",
    "Create New Task": "Vytvořit nový úkol",
    "No active tasks. Add your first task to get started!": "Žádné aktivní úkoly. Přidejte svůj první úkol a začněte!",
    "Completed Tasks": "Dokončené úkoly",
    "Initializing Task Engine...": "Načítám úkoly...",
    
    // Habits
    "Search habits...": "Hledat návyky...",
    "Streak": "Série (Streak)",
    "Name": "Název",
    "Add Habit": "Přidat návyk",
    "Add New Habit": "Přidat nový návyk",
    "Your Habits": "Vaše návyky",
    "Reset Day": "Resetovat den",
    "No habits yet. Add your first habit to start building streaks!": "Zatím žádné návyky. Přidejte svůj první návyk a budujte sérii!",
    "Establishing Habit Trackers...": "Načítám sekci návyků...",
    
    // Challenges
    "Search challenges...": "Hledat výzvy...",
    "Progress": "Pokrok",
    "Title": "Název",
    "Manual": "Vlastní",
    "Add Challenge": "Přidat výzvu",
    "Create Custom Challenge": "Vytvořit vlastní výzvu",
    "Your Challenges": "Vaše výzvy",
    "No challenges yet. Create your first challenge to get started!": "Žádné výzvy. Vytvořte první výzvu a začněte se rozvíjet!",
    
    // Goals
    "Search goals...": "Hledat cíle...",
    "Sort by Progress": "Řadit podle pokroku",
    "Sort by Title": "Řadit podle názvu",
    "Sort by Created": "Řadit podle data vytvoření",
    "Add Goal": "Přidat cíl",
    "Create New Goal": "Vytvořit nový cíl",
    "Goal Title *": "Název cíle *",
    "Target Date": "Cílový termín",
    "Create Goal": "Vytvořit cíl",
    "Edit Goal": "Upravit cíl",
    "Save Changes": "Uložit změny",
    "items completed": "splněných kroků",
    "Created:": "Vytvořeno:",
    "No goals yet. Create your first long-term goal to get started!": "Zatím žádné dlouhodobé cíle. Vytvořte si první a začněte!",
    "Visualizing Achievement Matrix...": "Načítám cíle...",
    
    // Recommender Panel (Currently in Czech, translated to EN)
    "AI Recommender": "AI Poradce",
    "Popište mi, co se právě děje. Analyzuji situaci a nabídnu příslušnou taktickou kartičku.": "Popište mi, co se právě děje. Analyzuji situaci a nabídnu příslušnou taktickou kartičku.",
    "Příklad: Ztratil jsem svůj 14 denní streak a teď se mi vůbec nechce pokračovat.": "Příklad: Ztratil jsem svůj 14 denní streak a teď se mi vůbec nechce pokračovat.",
    "Probíhá analýza...": "Probíhá analýza...",
    "Analyzovat situaci": "Analyzovat situaci",
    "Doporučené strategie:": "Doporučené strategie: ",
    // Insight Cards
    "← Zpět do galerie": "← Zpět do galerie",
    "Zdroje:": "Zdroje:",
    "Navazující:": "Navazující:",
    "footer.tos": "Obchodní podmínky",
    "footer.privacy": "Ochrana soukromí",
    "footer.cookies": "Cookies",
    "footer.contact": "Kontakt",
    "footer.about": "O nás",
    "footer.support": "Podpořit",
    "footer.copyright": "© 2026 Region Beta. Všechna práva vyhrazena.",
  },
  EN: {
    // Navigation
    "nav.tasks": "Tasks",
    "nav.habits": "Habits",
    "nav.challenges": "Challenges",
    "nav.goals": "Goals",
    "nav.insight": "Insight",
    "nav.ai": "AI Studio",
    "Add Module": "Add Module",
    "New Task": "New Task",
    "New Habit": "New Habit",
    "New Challenge": "New Challenge",
    "New Goal": "New Goal",
    "Select What to Add": "Select What to Add",
    "Task Added!": "Task Added!",
    "Habit Created!": "Habit Created!",
    "Challenge Added!": "Challenge Added!",
    "Goal Added!": "Goal Added!",
    
    // Settings
    "settings.title": "SETTINGS",
    "settings.account": "AI Key",
    "settings.page": "Page Settings",
    "settings.language": "Language Settings",
    "app.language": "App Language",
    "app.language.note": "The app prioritizes language based on your location/browser locale.",
    
    // Tasks
    "Search tasks...": "Search tasks...",
    "Priority": "Priority",
    "Due Date": "Due Date",
    "Creation Date": "Creation Date",
    "Manual Order": "Manual Order",
    "Add Task": "Add Task",
    "Create New Task": "Create New Task",
    "No active tasks. Add your first task to get started!": "No active tasks. Add your first task to get started!",
    "Completed Tasks": "Completed Tasks",
    "Initializing Task Engine...": "Initializing Task Engine...",
    
    // Habits
    "Search habits...": "Search habits...",
    "Streak": "Streak",
    "Name": "Name",
    "Add Habit": "Add Habit",
    "Add New Habit": "Add New Habit",
    "Your Habits": "Your Habits",
    "Reset Day": "Reset Day",
    "No habits yet. Add your first habit to start building streaks!": "No habits yet. Add your first habit to start building streaks!",
    "Establishing Habit Trackers...": "Establishing Habit Trackers...",

    // Challenges
    "Search challenges...": "Search challenges...",
    "Progress": "Progress",
    "Title": "Title",
    "Manual": "Manual",
    "Add Challenge": "Add Challenge",
    "Create Custom Challenge": "Create Custom Challenge",
    "Your Challenges": "Your Challenges",
    "No challenges yet. Create your first challenge to get started!": "No challenges yet. Create your first challenge to get started!",

    // Goals
    "Search goals...": "Search goals...",
    "Sort by Progress": "Sort by Progress",
    "Sort by Title": "Sort by Title",
    "Sort by Created": "Sort by Created",
    "Add Goal": "Add Goal",
    "Create New Goal": "Create New Goal",
    "Goal Title *": "Goal Title *",
    "Description": "Description",
    "Target Date": "Target Date",
    "Create Goal": "Create Goal",
    "Edit Goal": "Edit Goal",
    "Cancel": "Cancel",
    "Add details...": "Add details...",
    "1–33 Low · 34–66 Medium · 67–100 High": "1–33 Low · 34–66 Medium · 67–100 High",
    "Select date": "Select date",
    "Enable reminder": "Enable reminder",
    "e.g. 30": "e.g. 30",
    "Type a tag...": "Type a tag...",
    "Add": "Add",
    "Select a goal": "Select a goal",
    "Time Estimate (minutes)": "Time Estimate (minutes)",
    "Time Block": "Time Block",
    "Date": "Date",
    "Link Goal": "Link Goal",
    "Time Estimate": "Time Estimate",
    "Tags": "Tags",
    "days remaining": "days remaining",
    "Starts in:": "Starts in:",
    "Daily Pace:": "Daily Pace:",
    "Target:": "Target:",
    "day": "day",
    "Expected:": "Expected:",
    "Actual:": "Actual:",
    "Behind:": "Behind:",
    "Ahead:": "Ahead:",
    "Current Streak:": "Current Streak:",
    "Best:": "Best:",
    "goal:": "goal:",
    "days": "days",
    "ahead": "ahead",
    "behind": "behind",
    "on track": "on track",
    "Upcoming": "Upcoming",
    "Active": "Active",
    "Failed": "Failed",
    "No milestones set": "No milestones set",
    "Daily Tasks": "Daily Tasks",
    "Add daily task...": "Add daily task...",
    "Recurring": "Recurring",
    "Dependencies": "Dependencies",
    "Add details about this habit...": "Add details about this habit...",
    "Goal Tracking": "Goal Tracking",
    "Select Days": "Select Days",
    "Sun": "Sun",
    "Mon": "Mon",
    "Tue": "Tue",
    "Wed": "Wed",
    "Thu": "Thu",
    "Fri": "Fri",
    "Sat": "Sat",
    "Daily Completion": "Daily Completion",
    "Total Amount": "Total Amount",
    "Checklist": "Checklist",
    "Points": "Points",
    "Hard Mode — Challenge ends on first fail": "Hard Mode — Challenge ends on first fail",
    "Soft Mode — Track failures only": "Soft Mode — Track failures only",
    "Retry Limit — Max failures allowed": "Retry Limit — Max failures allowed",
    "Maximum failures allowed": "Maximum failures allowed",
    "Easy": "Easy",
    "Hard": "Hard",
    "Target": "Target",
    "Book": "Book",
    "Dumbbell": "Dumbbell",
    "Calendar": "Calendar",
    "Award": "Award",
    "Trending Up": "Trending Up",
    "Create Task": "Create Task",
    "Task Title": "Task Title",
    "What needs to be done?": "What needs to be done?",
    "Priority (1–100)": "Priority (1–100)",
    "Reminder": "Reminder",
    "Pattern": "Pattern",
    "Daily": "Daily",
    "Weekly": "Weekly",
    "Monthly": "Monthly",
    "Yearly": "Yearly",
    "Every (N)": "Every (N)",
    "End Date (optional)": "End Date (optional)",
    "No end date": "No end date",
    "Start": "Start",
    "End": "End",
    "Save Changes": "Save Changes",
    "items completed": "items completed",
    "Created:": "Created:",
    "No goals yet. Create your first long-term goal to get started!": "No goals yet. Create your first long-term goal to get started!",
    "Visualizing Achievement Matrix...": "Visualizing Achievement Matrix...",
    
    // Recommender Panel (Original was CZ, translate to EN here natively)
    "AI Recommender": "AI Recommender",
    "Popište mi, co se právě děje. Analyzuji situaci a nabídnu příslušnou taktickou kartičku.": "Describe what is happening. I will analyze the situation and offer a relevant tactical insight card.",
    "Příklad: Ztratil jsem svůj 14 denní streak a teď se mi vůbec nechce pokračovat.": "Example: I lost my 14-day streak and I don't feel like continuing.",
    "Probíhá analýza...": "Analyzing...",
    "Analyzovat situaci": "Analyze Situation",
    "Doporučené strategie:": "Recommended strategies:",

    // Insight Cards
    "← Zpět do galerie": "← Back to gallery",
    "Zdroje:": "Sources:",
    "Navazující:": "Related:",
    "footer.tos": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.cookies": "Cookie Settings",
    "footer.contact": "Contact",
    "footer.about": "About Us",
    "footer.support": "Support",
    "footer.copyright": "© 2026 Region Beta. All rights reserved.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("CZ");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("app_language") as Language;
    if (saved && (saved === "CZ" || saved === "EN")) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("cs") || browserLang.startsWith("sk")) {
        setLanguageState("CZ");
      } else {
        setLanguageState("EN");
      }
    }

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () => window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_language", lang);
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
  };

  const t = (key: string): string => {
    if (!mounted) return translations["CZ"][key] || key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
