"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

export type Language = "CZ" | "EN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

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
