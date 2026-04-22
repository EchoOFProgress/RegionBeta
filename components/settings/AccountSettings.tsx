"use client";

import { useEffect, useState } from "react";
import { apiKeyManager } from "@/lib/ai/api-key-manager";
import { Key, CheckCircle, XCircle } from "lucide-react";

export default function AccountSettings() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "validating" | "ok" | "error">("idle");

  const LOCAL_USER_ID = "anonymous-local-user";

  // Load saved API key on mount
  useEffect(() => {
    apiKeyManager.fetchUserApiKey(LOCAL_USER_ID).then((k) => {
      if (k) setSavedKey(k);
    });
  }, []);

  const handleSaveApiKey = async () => {
    setKeyStatus("validating");
    const valid = await apiKeyManager.validateGeminiKey(apiKey.trim());
    if (!valid) {
      setKeyStatus("error");
      return;
    }
    setKeyStatus("saving");
    await apiKeyManager.saveUserApiKey(apiKey.trim(), LOCAL_USER_ID);
    setSavedKey(apiKey.trim());
    setApiKey("");
    setKeyStatus("ok");
    setTimeout(() => setKeyStatus("idle"), 2500);
  };

  const handleRemoveApiKey = async () => {
    apiKeyManager.removeUserApiKey();
    setSavedKey(null);
    setKeyStatus("idle");
  };

  return (
    <div className="account-settings">
      {/* API Key section */}
      <div className="account-section">
        <div className="account-section-title">
          <Key size={16} />
          <span>Gemini API klíč</span>
        </div>

        <p className="account-subtitle mb-4">
          Zadej svůj vlastní API klíč pro Gemini, aby AI funkce fungovaly pod tvým vlastním limitem. Tvůj klíč je uložen pouze lokálně ve tvém prohlížeči.
        </p>

        {savedKey ? (
          <div className="api-key-saved">
            <CheckCircle size={16} className="api-key-ok-icon" />
            <span className="api-key-masked">Uložený klíč: {savedKey.slice(0, 8)}••••••••</span>
            <button className="api-key-remove-btn" onClick={handleRemoveApiKey}>
              Odebrat
            </button>
          </div>
        ) : (
          <p className="api-key-none">Žádný vlastní klíč — používá se výchozí developer klíč.</p>
        )}

        <div className="api-key-input-row">
          <input
            type="password"
            className="api-key-input"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            className="api-key-save-btn"
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || keyStatus === "validating" || keyStatus === "saving"}
          >
            {keyStatus === "validating" ? "Ověřuji..." : keyStatus === "saving" ? "Ukládám..." : "Uložit"}
          </button>
        </div>

        {keyStatus === "ok" && (
          <div className="api-key-feedback api-key-feedback--ok">
            <CheckCircle size={14} /> Klíč byl úspěšně uložen.
          </div>
        )}
        {keyStatus === "error" && (
          <div className="api-key-feedback api-key-feedback--error">
            <XCircle size={14} /> Klíč není platný. Zkontroluj ho a zkus znovu.
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border opacity-50 text-xs">
        <p>Pro získání klíče zdarma navštivte <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a>.</p>
      </div>
    </div>
  );
}
