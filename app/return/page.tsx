"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReturnPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the session status via an API route
      setStatus("complete");
    }
  }, [sessionId]);

  if (status === "complete") {
    return (
      <main className="viewport flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6 animate-bounce" />
        <h1 className="text-4xl font-black uppercase mb-4">Děkujeme!</h1>
        <p className="text-xl opacity-60 mb-8 max-w-md">
          Vaše podpora byla úspěšně přijata. Velmi si toho vážíme a pomáhá nám to Region Beta neustále vylepšovat.
        </p>
        <Button onClick={() => window.location.href = "/"} className="gap-2">
          <ArrowLeft size={18} />
          Zpět na hlavní panel
        </Button>
      </main>
    );
  }

  return (
    <main className="viewport flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 opacity-60">Ověřování platby...</p>
    </main>
  );
}
