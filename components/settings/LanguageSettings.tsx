"use client";

import { useLanguage, Language } from "@/lib/language-context";
import { Globe } from "lucide-react";

export default function LanguageSettings() {
  const { language: lang, setLanguage: handleLangChange, t } = useLanguage();

  return (
    <div className="language-settings">
      <div className="language-settings-header">
        <Globe size={18} />
        <span>{t("app.language")}</span>
      </div>
      <div className="language-toggle">
        <button
          className={`lang-btn${lang === "CZ" ? " active" : ""}`}
          onClick={() => handleLangChange("CZ")}
        >
          Čeština
        </button>
        <button
          className={`lang-btn${lang === "EN" ? " active" : ""}`}
          onClick={() => handleLangChange("EN")}
        >
          English
        </button>
      </div>
      <p className="language-note">
        {t("app.language.note")}
      </p>
    </div>
  );
}
