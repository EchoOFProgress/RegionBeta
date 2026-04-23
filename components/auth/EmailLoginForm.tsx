"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailLoginForm() {
  const { login, register, user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, username || email.split("@")[0]);
      }

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error || "Něco se nepovedlo.");
      }
    } catch (err) {
      setStatus("error");
      setError("Neočekávaná chyba.");
    }
  };

  if (user) {
    return (
      <div className="space-y-4 p-4 border border-primary/10 rounded-xl bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm">{user.username}</p>
            <p className="text-xs opacity-60">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          Odhlásit se
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
          onClick={() => setIsLogin(true)}
        >
          Přihlášení
        </button>
        <button
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            !isLogin ? "bg-background shadow-sm" : "opacity-50 hover:opacity-100"
          }`}
          onClick={() => setIsLogin(false)}
        >
          Registrace
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Jméno</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                <Mail size={14} />
              </span>
              <input
                type="text"
                className="w-full bg-background border border-primary/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/40 outline-none transition-colors"
                placeholder="Tvoje jméno"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
              <Mail size={14} />
            </span>
            <input
              type="email"
              required
              className="w-full bg-background border border-primary/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/40 outline-none transition-colors"
              placeholder="email@seznam.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Heslo</label>
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

        <Button
          type="submit"
          className="w-full font-bold uppercase tracking-widest"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : isLogin ? (
            "Přihlásit se"
          ) : (
            "Vytvořit účet"
          )}
        </Button>
      </form>
    </div>
  );
}
