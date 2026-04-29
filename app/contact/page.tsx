"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function ContactPage() {
  const { t, language } = useLanguage();

  return (
    <main className="viewport py-10 px-4 sm:py-20 sm:px-6 max-w-4xl mx-auto">
      <header className="mb-10 sm:mb-20 border-b border-primary/10 pb-6 sm:pb-10">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 break-words">
          {language === "EN" ? (
            <>Get in <span className="text-primary">Touch</span></>
          ) : (
            <>Jsme v <span className="text-primary">kontaktu</span></>
          )}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">
          {t("contact.subtitle")}
        </p>
      </header>

      <div className="flex flex-col items-start gap-6 sm:gap-8">
        <div className="flex flex-col items-start gap-2 w-full">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-primary">
            {t("contact.general")}
          </p>
          <p className="text-lg sm:text-2xl font-black lowercase tracking-tighter break-all">
            <a href="mailto:echoofprogress@gmail.com" className="hover:text-primary transition-colors">
              echoofprogress@gmail.com
            </a>
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 pt-6 sm:pt-10 border-t border-primary/5 w-full">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-primary">
            {t("contact.direct_email")}
          </p>
          <p className="text-lg sm:text-2xl font-black lowercase tracking-tighter mb-2 break-all">
            <a href="mailto:mvystavel@seznam.cz" className="hover:text-primary transition-colors">
              mvystavel@seznam.cz
            </a>
          </p>
          <p className="text-sm font-bold opacity-60 italic max-w-xs">
            {t("contact.liam_note")}
          </p>
        </div>
      </div>

      <footer className="mt-16 sm:mt-32 pt-6 sm:pt-10 border-t border-primary/10">
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
