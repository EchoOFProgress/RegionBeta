"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  return (
    <main className="viewport py-10 px-4 sm:py-20 sm:px-6 max-w-4xl mx-auto">
      <header className="mb-10 sm:mb-16 border-b border-primary/10 pb-6 sm:pb-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 break-words">
          {language === "EN" ? (
            <>Privacy <span className="text-primary">Policy</span></>
          ) : (
            <>Ochrana <span className="text-primary">soukromí</span></>
          )}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          {t("privacy.subtitle")}
        </p>
      </header>

      <div className="space-y-8 sm:space-y-12 text-base sm:text-lg leading-relaxed opacity-80">
        <section className="space-y-4">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("privacy.priority.title")}
          </h2>
          <p>{t("privacy.priority.text")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("privacy.collection.title")}
          </h2>
          <p>{t("privacy.collection.text")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("privacy.security.title")}
          </h2>
          <p>{t("privacy.security.text")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("privacy.rights.title")}
          </h2>
          <p>{t("privacy.rights.text")}</p>
        </section>
      </div>

      <footer className="mt-12 sm:mt-20 pt-6 sm:pt-10 border-t border-primary/10">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
        >
          {t("nav.back")}
        </Link>
      </footer>
    </main>
  );
}
