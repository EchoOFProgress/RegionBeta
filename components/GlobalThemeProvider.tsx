"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import SettingsDialog from "@/components/settings/SettingsDialog";
import { useLanguage } from "@/lib/language-context";

const INSIGHT_THEMES = [
  { name: "NIKE_DYNAMISM",   file: "nike.css",       icon: "👟" },
  { name: "AURUM_EDITORIAL", file: "aurum.css",      icon: "⚜️" },
  { name: "CYBER_CRIMSON",   file: "cyber.css",      icon: "👾" },
  { name: "EMBER_COZY",      file: "ember.css",      icon: "🔥" },
  { name: "TOKYO_NEON",      file: "tokyo.css",      icon: "🏮" },
  { name: "INDUSTRIAL_V2.0", file: "style.css",      icon: "⚡" },
  { name: "SWISS_ULTRA",     file: "swiss.css",      icon: "📐" },
  { name: "PREMIUM_FUTURE",  file: "premium.css",    icon: "✨" },
  { name: "SOLAR_MISSION",   file: "solar.css",      icon: "🚀" },
  { name: "BRUTAL_STRENGTH", file: "brutalist.css",  icon: "🔨" },
  { name: "BLUEPRINT_DRAFT", file: "blueprint.css",  icon: "📏" },
  { name: "RETRO_MAC_OS",    file: "retro.css",      icon: "🕹️" },
];

const STORAGE_KEY = "insight-theme";
const LINK_ID = "insight-global-theme-link";

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export default function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  const { t } = useLanguage();
  const [currentThemeFile, setCurrentThemeFile] = useState<string>("brutalist.css");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "brutalist.css";
    setCurrentThemeFile(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `/insight-themes/${currentThemeFile}`;
    localStorage.setItem(STORAGE_KEY, currentThemeFile);
  }, [currentThemeFile, mounted]);

  const handleSelectTheme = useCallback((file: string) => {
    setCurrentThemeFile(file);
  }, []);

  return (
    <>
      <div className="blueprint-overlay" aria-hidden="true" />

      {mounted && (
        <button
          id="global-theme-btn"
          className="theme-switcher settings-fab"
          aria-label={t("settings.aria")}
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="size-5" />
        </button>
      )}

      {isSettingsOpen && (
        <SettingsDialog
          themes={INSIGHT_THEMES}
          currentThemeFile={currentThemeFile}
          onSelectTheme={handleSelectTheme}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {children}
    </>
  );
}
