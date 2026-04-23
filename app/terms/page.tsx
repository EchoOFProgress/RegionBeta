"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ArrowLeft, Shield, FileText, Gavel, AlertCircle } from "lucide-react";

export default function TermsOfService() {
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
            {isCZ ? "Obchodní podmínky" : "Terms of Service"}
          </h1>
          <p className="opacity-60 font-mono text-sm">
            {isCZ ? "Poslední aktualizace: 23. dubna 2026" : "Last updated: April 23, 2026"}
          </p>
        </header>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                1. {isCZ ? "Úvodní ustanovení" : "Introduction"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ 
                  ? "Vítejte v Region Beta. Tyto obchodní podmínky upravují vaše používání naší aplikace a služeb. Přístupem k aplikaci souhlasíte s tím, že budete vázáni těmito podmínkami."
                  : "Welcome to Region Beta. These terms of service govern your use of our application and services. By accessing the app, you agree to be bound by these terms."}
              </p>
              <p>
                {isCZ
                  ? "Region Beta je nástroj pro osobní rozvoj, sledování úkolů, návyků a dosahování cílů pomocí metodiky 'Knowing YOUR destination'."
                  : "Region Beta is a tool for personal development, tracking tasks, habits, and achieving goals using the 'Knowing YOUR destination' methodology."}
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                2. {isCZ ? "Uživatelské účty" : "User Accounts"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ
                  ? "Pro plné využití funkcí aplikace může být vyžadováno vytvoření účtu. Jste zodpovědní za udržení důvěrnosti vašich přihlašovacích údajů a za veškeré aktivity, které se pod vaším účtem odehrají."
                  : "To fully utilize the application's features, account creation may be required. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account."}
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                3. {isCZ ? "Pravidla používání" : "Usage Rules"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ
                  ? "Službu nesmíte používat k žádnému nezákonnému nebo neoprávněnému účelu. Souhlasíte s tím, že nebudete narušovat provoz aplikace ani se pokoušet o neoprávněný přístup k našim systémům."
                  : "You may not use the service for any illegal or unauthorized purpose. You agree not to disrupt the application's operation or attempt unauthorized access to our systems."}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{isCZ ? "Respektujte autorská práva k obsahu 'Insight Cards'." : "Respect copyrights for 'Insight Cards' content."}</li>
                <li>{isCZ ? "Nemanipulujte s daty jiných uživatelů." : "Do not manipulate other users' data."}</li>
                <li>{isCZ ? "Nepoužívejte automatizované systémy pro vytěžování dat." : "Do not use automated systems for data mining."}</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-primary" size={24} />
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                4. {isCZ ? "Omezení odpovědnosti" : "Limitation of Liability"}
              </h2>
            </div>
            <div className="space-y-4 opacity-80 leading-relaxed">
              <p>
                {isCZ
                  ? "Region Beta je poskytována 'tak, jak je'. Neneseme odpovědnost za žádné přímé či nepřímé škody vzniklé používáním nebo nemožností používat naši aplikaci."
                  : "Region Beta is provided 'as is'. We are not liable for any direct or indirect damages resulting from the use or inability to use our application."}
              </p>
              <p>
                {isCZ
                  ? "Všechny rady a strategie obsažené v taktických kartách jsou pouze informativní povahy."
                  : "All advice and strategies contained in tactical cards are for informational purposes only."}
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-border/20 text-center">
          <p className="opacity-40 text-sm italic">
            {isCZ 
              ? "Děkujeme, že pomáháte stavět Region Beta." 
              : "Thank you for helping us build Region Beta."}
          </p>
        </footer>
      </div>
    </main>
  );
}
