"use client";

import { useEffect, useState } from "react";
import { apiKeyManager } from "@/lib/ai/api-key-manager";
import { Key, CheckCircle, XCircle, User as UserIcon } from "lucide-react";
import { EmailLoginForm } from "../auth/EmailLoginForm";
import { useLanguage } from "@/lib/language-context";

export default function AccountSettings() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "validating" | "ok" | "error">("idle");

  useEffect(() => {
    apiKeyManager.fetchUserApiKey().then((k) => {
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
    await apiKeyManager.saveUserApiKey(apiKey.trim());
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

  const saveBtnLabel =
    keyStatus === "validating"
      ? t("account.validating")
      : keyStatus === "saving"
      ? t("account.saving")
      : t("account.save");

  return (
    <div className="account-settings space-y-10">
      <div className="account-section">
        <div className="account-section-title">
          <UserIcon size={16} />
          <span>{t("account.title")}</span>
        </div>
        <EmailLoginForm />
      </div>

      <div className="border-t border-primary/10 pt-8"></div>

      <div className="account-section">
        <div className="account-section-title">
          <Key size={16} />
          <span>{t("account.gemini_title")}</span>
        </div>

        <p className="account-subtitle mb-4">{t("account.gemini_desc")}</p>

        {savedKey ? (
          <div className="api-key-saved">
            <CheckCircle size={16} className="api-key-ok-icon" />
            <span className="api-key-masked">{t("account.saved_key_prefix")} {savedKey.slice(0, 8)}••••••••</span>
            <button className="api-key-remove-btn" onClick={handleRemoveApiKey}>
              {t("account.remove")}
            </button>
          </div>
        ) : (
          <p className="api-key-none">{t("account.no_key")}</p>
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
            {saveBtnLabel}
          </button>
        </div>

        {keyStatus === "ok" && (
          <div className="api-key-feedback api-key-feedback--ok">
            <CheckCircle size={14} /> {t("account.key_saved")}
          </div>
        )}
        {keyStatus === "error" && (
          <div className="api-key-feedback api-key-feedback--error">
            <XCircle size={14} /> {t("account.key_invalid")}
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border opacity-50 text-xs">
        <p>
          {t("account.get_key_prefix")}{" "}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">
            Google AI Studio
          </a>.
        </p>
      </div>
    </div>
  );
}
