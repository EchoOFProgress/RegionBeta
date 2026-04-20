"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

type Lang = "CZ" | "EN";

export default function LanguageSettings() {
  const [lang, setLang] = useState<Lang>("CZ");

  return (
    <div className="language-settings">
      <div className="language-settings-header">
        <Globe size={18} />
        <span>Jazyk aplikace</span>
      </div>
      <div className="language-toggle">
        <button
          className={`lang-btn${lang === "CZ" ? " active" : ""}`}
          onClick={() => setLang("CZ")}
        >
          🇨🇿 Čeština
        </button>
        <button
          className={`lang-btn${lang === "EN" ? " active" : ""}`}
          onClick={() => setLang("EN")}
        >
          🇬🇧 English
        </button>
      </div>
      <p className="language-note">Překlad jazyků bude přidán brzy.</p>
    </div>
  );
}
