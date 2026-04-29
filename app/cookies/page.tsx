"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function CookiesPage() {
  const { t, language } = useLanguage();

  return (
    <main className="viewport py-20 px-6 max-w-4xl mx-auto">
      <header className="mb-16 border-b border-primary/10 pb-10">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">
          {language === "EN" ? (
            <>Cookie <span className="text-primary">Policy</span></>
          ) : (
            <>Zásady <span className="text-primary">Cookies</span></>
          )}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          {t("cookies.subtitle")}
        </p>
      </header>

      <div className="space-y-12 text-lg leading-relaxed opacity-80">
        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("cookies.what.title")}
          </h2>
          <p>{t("cookies.what.text")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("cookies.how.title")}
          </h2>
          <p>{t("cookies.how.text")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground opacity-100">
            {t("cookies.manage.title")}
          </h2>
          <p>{t("cookies.manage.text")}</p>
        </section>
      </div>

      <footer className="mt-20 pt-10 border-t border-primary/10">
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
