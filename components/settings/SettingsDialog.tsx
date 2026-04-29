"use client";

import { useState, useCallback } from "react";
import { User, Monitor, Globe, X } from "lucide-react";
import AccountSettings from "./AccountSettings";
import PageSettings from "./PageSettings";
import LanguageSettings from "./LanguageSettings";
import { useLanguage } from "@/lib/language-context";

interface Theme {
  name: string;
  file: string;
  icon: string;
}

interface SettingsDialogProps {
  themes: Theme[];
  currentThemeFile: string;
  onSelectTheme: (file: string) => void;
  onClose: () => void;
}

type Tab = "account" | "page" | "language";

// Instead of hardcoded constant TABS, calculate it inside the component.

export default function SettingsDialog({
  themes,
  currentThemeFile,
  onSelectTheme,
  onClose,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const { t } = useLanguage();

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account",  label: t("settings.account"),   icon: <User size={16} /> },
    { id: "page",     label: t("settings.page"), icon: <Monitor size={16} /> },
    { id: "language", label: t("settings.language"),  icon: <Globe size={16} /> },
  ];

  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleSelectTheme = useCallback(
    (file: string) => {
      onSelectTheme(file);
    },
    [onSelectTheme]
  );

  return (
    <div className="settings-modal" onClick={handleBackdrop}>
      <div className="settings-modal-content">
        {/* Header */}
        <header className="settings-modal-header">
          <h3 className="settings-modal-title">{t("settings.title")}</h3>
          <button className="settings-close-btn" onClick={onClose} aria-label="Zavřít">
            <X size={22} />
          </button>
        </header>
 
        {/* Tab navigation */}
        <nav className="settings-tabs-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab-btn${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
 
        {/* Tab content */}
        <div className="settings-tab-content">
          {activeTab === "account" && <AccountSettings />}
          {activeTab === "page" && (
            <PageSettings
              themes={themes}
              currentThemeFile={currentThemeFile}
              onSelectTheme={handleSelectTheme}
            />
          )}
          {activeTab === "language" && <LanguageSettings />}
        </div>
      </div>
    </div>
  );
}
