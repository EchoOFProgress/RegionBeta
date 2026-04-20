"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiKeyManager } from "@/lib/ai/api-key-manager";
import { LogOut, Key, CheckCircle, XCircle, User, Mail, Calendar } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export default function AccountSettings() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "validating" | "ok" | "error">("idle");
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Load saved API key on mount
  useEffect(() => {
    const uid = user?.id ?? "anonymous-local-user";
    apiKeyManager.fetchUserApiKey(uid).then((k) => {
      if (k) setSavedKey(k);
    });
  }, [user?.id]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!clientId || clientId === "YOUR_GOOGLE_OAUTH_CLIENT_ID") return;

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          await loginWithGoogle(response.credential);
        },
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        });
      }
      setGoogleReady(true);
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [clientId, loginWithGoogle]);

  const handleSaveApiKey = async () => {
    const uid = user?.id ?? "anonymous-local-user";
    setKeyStatus("validating");
    const valid = await apiKeyManager.validateGeminiKey(apiKey.trim());
    if (!valid) {
      setKeyStatus("error");
      return;
    }
    setKeyStatus("saving");
    await apiKeyManager.saveUserApiKey(apiKey.trim(), uid);
    setSavedKey(apiKey.trim());
    setApiKey("");
    setKeyStatus("ok");
    setTimeout(() => setKeyStatus("idle"), 2500);
  };

  const handleRemoveApiKey = async () => {
    const uid = user?.id ?? "anonymous-local-user";
    apiKeyManager.removeUserApiKey();
    setSavedKey(null);
    setKeyStatus("idle");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });

  if (!user) {
    return (
      <div className="account-settings">
        <div className="account-not-logged">
          <div className="account-icon-wrap">
            <User size={48} strokeWidth={1.5} />
          </div>
          <h4 className="account-title">Nejsi přihlášen/a</h4>
          <p className="account-subtitle">
            Přihlaš se pomocí Google účtu pro synchronizaci nastavení a API klíče.
          </p>

          {(!clientId || clientId === "YOUR_GOOGLE_OAUTH_CLIENT_ID") ? (
            <div className="account-no-client-id">
              <p>Google Client ID není nakonfigurováno.</p>
              <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
              <p>nastav v souboru <strong>.env.local</strong></p>
            </div>
          ) : (
            <div ref={googleBtnRef} className="google-btn-container" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="account-settings">
      {/* User info card */}
      <div className="account-user-card">
        {user.picture ? (
          <img src={user.picture} alt={user.username} className="account-avatar" />
        ) : (
          <div className="account-avatar-fallback">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="account-user-info">
          <div className="account-user-name">
            <User size={14} />
            <span>{user.username}</span>
          </div>
          <div className="account-user-detail">
            <Mail size={14} />
            <span>{user.email}</span>
          </div>
          <div className="account-user-detail">
            <Calendar size={14} />
            <span suppressHydrationWarning>Člen od {formatDate(user.created_at)}</span>
          </div>
        </div>
      </div>

      <hr className="account-divider" />

      {/* API Key section */}
      <div className="account-section">
        <div className="account-section-title">
          <Key size={16} />
          <span>Gemini API klíč</span>
        </div>

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

      <hr className="account-divider" />

      {/* Logout */}
      <button className="account-logout-btn" onClick={logout}>
        <LogOut size={16} />
        Odhlásit se
      </button>
    </div>
  );
}
