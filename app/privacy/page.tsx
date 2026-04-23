"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { language } = useLanguage();

  const isCZ = language === "CZ";

  return (
    <main className="viewport dashboard-viewport py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} />
          <span>{isCZ ? "Zpět na hlavní panel" : "Back to Dashboard"}</span>
        </button>

        <header className="mb-12 border-l-4 border-primary pl-6">
          <h1 className="text-4xl font-black uppercase mb-4 leading-none">
            {isCZ ? "Zásady ochrany soukromí" : "Privacy Policy"}
          </h1>
          <p className="opacity-60 font-mono text-sm">
            {isCZ ? "Poslední aktualizace: 23. dubna 2026" : "Last updated: April 23, 2026"}
          </p>
        </header>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                1. {isCZ ? "Sběr informací" : "Information Collection"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Sbíráme pouze informace nezbytné pro fungování aplikace, jako jsou vaše úkoly, návyky a cíle. Tyto údaje slouží výhradně k vašemu osobnímu rozvoji."
                  : "We only collect information necessary for the application to function, such as your tasks, habits, and goals. This data is used exclusively for your personal development."}
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                2. {isCZ ? "Zabezpečení dat" : "Data Security"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ
                  ? "Vaše data jsou v bezpečí. Používáme moderní šifrovací metody a zabezpečené servery k ochraně vašich informací před neoprávněným přístupem."
                  : "Your data is safe. We use modern encryption methods and secure servers to protect your information from unauthorized access."}
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                3. {isCZ ? "Uchovávání údajů" : "Data Retention"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ
                  ? "Data uchováváme pouze po dobu nezbytně nutnou. Máte právo kdykoliv požádat o smazání svého účtu a všech souvisejících dat."
                  : "We retain data only as long as necessary. You have the right to request the deletion of your account and all associated data at any time."}
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/20 text-center">
          <p className="opacity-40 text-sm italic">
            {isCZ 
              ? "Vaše soukromí je naší prioritou." 
              : "Your privacy is our priority."}
          </p>
        </footer>
      </div>
    </main>
  );
}
