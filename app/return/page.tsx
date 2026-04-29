"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useLanguage } from "@/lib/language-context";

function ReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "complete" | "error">("loading");
  const [amount, setAmount] = useState<number>(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifySession = async () => {
      try {
        const response = await fetch(`/api/checkout?session_id=${sessionId}`);
        const data = await response.json();

        if (data.status === "complete" || data.status === "succeeded") {
          const processed = storage.load("processed_donations", []);
          if (!processed.includes(sessionId)) {
            const currentTotal = storage.load("collected_donations", 0);
            storage.save("collected_donations", currentTotal + data.amount_total);
            storage.save("processed_donations", [...processed, sessionId]);
          }

          setAmount(data.amount_total);
          setStatus("complete");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <main className="viewport flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-bold uppercase tracking-widest opacity-40">{t("return.verifying")}</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="viewport flex flex-col items-center justify-center min-h-[70vh] px-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">{t("return.error.title")}</h1>
        <p className="opacity-60 mb-8">{t("return.error.text")}</p>
        <Button onClick={() => window.location.href = "/"} variant="outline">
          {t("return.back_home")}
        </Button>
      </main>
    );
  }

  return (
    <main className="viewport flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <CheckCircle2 className="w-20 h-20 text-primary animate-in zoom-in duration-500" />
      </div>
      <h1 className="text-5xl font-black uppercase mb-2 tracking-tighter">{t("return.thank_you")}</h1>
      <p className="text-2xl font-bold text-primary mb-6">+{amount} Kč</p>
      <p className="text-lg opacity-60 mb-10 max-w-md mx-auto">
        {t("return.support_text")}
      </p>
      <Button
        onClick={() => window.location.href = "/"}
        className="h-14 px-8 text-lg font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
      >
        <ArrowLeft size={20} />
        {t("return.back_dashboard")}
      </Button>
    </main>
  );
}

export default function ReturnPage() {
  const { t } = useLanguage();

  return (
    <Suspense fallback={
      <main className="viewport flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-bold uppercase tracking-widest opacity-40">{t("return.loading")}</p>
      </main>
    }>
      <ReturnContent />
    </Suspense>
  );
}
