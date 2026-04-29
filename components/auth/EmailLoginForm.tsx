"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

export function EmailLoginForm() {
  const { login, register, user, logout } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setSuccessMessage("");

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(
          email,
          password,
          username || email.split("@")[0],
        );
      }

      if (result.success) {
        setStatus("success");
        if (!isLogin && (result as any).message) {
          setSuccessMessage(t("notif.auth_confirm_email"));
        }
      } else {
        setStatus("error");
        setError(result.error || t("auth.error_generic"));
      }
    } catch (err) {
      setStatus("error");
      setError(t("auth.error_unexpected"));
    }
  };

  if (user) {
    return (
      <div className="space-y-4 p-4 border border-primary/10 rounded-xl bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {(user.username || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm">{user.username}</p>
            <p className="text-xs opacity-60">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          {t("auth.logout")}
        </Button>
      </div>
    );
  }

  return (
    <div className="email-login-form space-y-4">
      <div className="flex gap-2 p-1 bg-accent/20 rounded-lg mb-6">
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            isLogin ? "bg-background shadow-sm" : "opacity-50 hover:opacity-100"
          }`}
          onClick={() => {
            setIsLogin(true);
            setError("");
            setSuccessMessage("");
          }}
        >
          {t("auth.sign_in_tab")}
        </button>
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            !isLogin
              ? "bg-background shadow-sm"
              : "opacity-50 hover:opacity-100"
          }`}
          onClick={() => {
            setIsLogin(false);
            setError("");
            setSuccessMessage("");
          }}
        >
          {t("auth.register_tab")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
              {t("auth.name_label")}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                <User size={14} />
              </span>
              <input
                type="text"
                className="w-full bg-background border border-primary/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/40 outline-none transition-colors"
                placeholder={t("auth.name_placeholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
            {t("auth.email_label") || "Email"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
              <Mail size={14} />
            </span>
            <input
              type="email"
              required
              className="w-full bg-background border border-primary/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/40 outline-none transition-colors"
              placeholder={t("auth.email_placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
            {t("auth.password_label")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
              <Lock size={14} />
            </span>
            <input
              type="password"
              required
              className="w-full bg-background border border-primary/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/40 outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive text-xs rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary text-xs rounded-lg animate-in fade-in slide-in-from-top-1">
            <CheckCircle size={14} />
            <span>{successMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full font-bold uppercase tracking-widest"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : isLogin ? (
            t("auth.sign_in_btn")
          ) : (
            t("auth.create_account_btn")
          )}
        </Button>
      </form>
    </div>
  );
}
