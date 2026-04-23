"use client";

import React, { useState, useCallback } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, Heart, X, AlertTriangle } from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se vytvořit platební relaci.");
      }
      
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Error fetching client secret:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [amount]);

  const reset = () => {
    setClientSecret(null);
    setLoading(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const stripePromise = getStripe();

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none bg-card shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Podpořit projekt</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Vaše podpora nám pomáhá udržet Region Beta v chodu a vyvíjet nové funkce pro váš osobní růst.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold uppercase mb-1">Chyba při komunikaci se Stripe</p>
                <p className="opacity-80">{error}</p>
                <p className="mt-2 text-xs opacity-60 italic">Zkontrolujte, zda nemáte zapnutý AdBlock a zda je server správně nastaven.</p>
              </div>
            </div>
          )}

          {!clientSecret ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase opacity-50 tracking-wider">Vyberte částku (CZK)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map((val) => (
                    <Button
                      key={val}
                      variant={amount === val ? "default" : "outline"}
                      onClick={() => setAmount(val)}
                      className="font-bold py-6"
                    >
                      {val} Kč
                    </Button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="pl-10 h-12 font-bold text-lg"
                    placeholder="Vlastní částka"
                  />
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                </div>
              </div>

              <Button 
                onClick={fetchClientSecret} 
                className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? "Připravuji..." : "Pokračovat k platbě"}
              </Button>
            </div>
          ) : (
            <div className="mt-2 min-h-[400px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
        
        {clientSecret && (
          <button 
            onClick={reset}
            className="absolute top-4 right-12 p-2 hover:bg-accent rounded-full transition-colors text-xs font-bold uppercase opacity-50 flex items-center gap-1"
          >
            <ArrowLeftIcon size={12} /> Změnit částku
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ArrowLeftIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}
