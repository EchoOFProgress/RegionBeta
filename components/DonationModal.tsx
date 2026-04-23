"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Banknote, Heart, X, AlertTriangle, Target, TrendingUp, Loader2 } from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(100);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTotal, setFetchingTotal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // REAL LIVE DATA from Stripe API
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const GOAL_AMOUNT = 2000;
  const MAX_DONATION = 3000;

  // Fetch real total from our API
  const fetchRealTotal = async () => {
    setFetchingTotal(true);
    try {
      const res = await fetch("/api/donations/total");
      const data = await res.json();
      if (data.total !== undefined) {
        setCollectedAmount(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch real total:", err);
    } finally {
      setFetchingTotal(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRealTotal();
    }
  }, [isOpen]);

  const progressPercentage = Math.min((collectedAmount / GOAL_AMOUNT) * 100, 100);

  const fetchClientSecret = useCallback(async () => {
    if (amount > MAX_DONATION) {
      setError(`Maximální částka jedné podpory je ${MAX_DONATION} Kč.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json().catch(() => ({ error: "Server vrátil neplatný formát dat." }));
      
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

  const handleAmountChange = (val: number) => {
    if (val > MAX_DONATION) {
      setAmount(MAX_DONATION);
    } else {
      setAmount(Math.max(0, val));
    }
  };

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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Podpora Region Beta</DialogTitle>
            </div>
            
            {/* Fundraising Progress Section */}
            <div className="space-y-3 bg-accent/30 p-4 rounded-xl border border-border/50 relative">
              {fetchingTotal && (
                <div className="absolute top-2 right-2">
                  <Loader2 className="w-3 h-3 animate-spin opacity-40" />
                </div>
              )}
              
              <div className="flex justify-between items-end mb-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-1">
                    Aktuální cíl
                  </span>
                  <span className="text-xl font-black tabular-nums">
                    {collectedAmount.toLocaleString()} <span className="text-sm font-bold opacity-40">/ {GOAL_AMOUNT.toLocaleString()} Kč</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Pokrok</span>
                  <span className="text-lg font-black text-primary italic">
                    {Math.round((collectedAmount / GOAL_AMOUNT) * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-primary/10" />
              </div>
            </div>
          </DialogHeader>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold uppercase mb-1">Chyba</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}

          {!clientSecret ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase opacity-50 tracking-wider">Přispět částkou</label>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map((val) => (
                    <Button
                      key={val}
                      variant={amount === val ? "default" : "outline"}
                      onClick={() => setAmount(val)}
                      className="font-bold py-6 text-base"
                    >
                      {val} Kč
                    </Button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    max={MAX_DONATION}
                    className="h-14 font-black text-xl w-full donation-amount-input"
                    placeholder="Vlastní částka"
                  />
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-40 text-primary pointer-events-none" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black opacity-20 text-sm">CZK</div>
                </div>
              </div>

              <Button 
                onClick={fetchClientSecret} 
                className="w-full h-16 text-xl font-black uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading || amount <= 0}
              >
                <span className="relative z-10">{loading ? "Připravuji..." : "Podpořit"}</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </div>
          ) : (
            <div className="mt-2 min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
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
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
  );
}
