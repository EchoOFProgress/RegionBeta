"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Banknote, Heart, AlertTriangle, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Currency config — 1 USD ≈ 23 CZK (reference rate for display)
const CZK_PER_USD = 23;

// Goal defined in CZK, converted for EN users
const GOAL_CZK = 2000;
const GOAL_USD = Math.round(GOAL_CZK / CZK_PER_USD); // ~87 USD

// Preset amounts per currency
const PRESETS = {
  czk: [100, 250, 500],
  usd: [5, 11, 22],   // ≈ 100 / 250 / 500 Kč
};

const MAX_DONATION = {
  czk: 3000,
  usd: Math.round(3000 / CZK_PER_USD), // ~130 USD
};

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { t, language } = useLanguage();

  const isEn = language === "EN";
  const currency = isEn ? "usd" : "czk";
  const currencyLabel = isEn ? "USD" : "CZK";
  const goalAmount = isEn ? GOAL_USD : GOAL_CZK;
  const maxDonation = isEn ? MAX_DONATION.usd : MAX_DONATION.czk;
  const presets = isEn ? PRESETS.usd : PRESETS.czk;

  const [amount, setAmount] = useState<number>(presets[0]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTotal, setFetchingTotal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);

  // Reset amount when currency changes
  useEffect(() => {
    setAmount(presets[0]);
    setClientSecret(null);
    setError(null);
  }, [currency]);

  const fetchRealTotal = async () => {
    setFetchingTotal(true);
    try {
      const res = await fetch("/api/donations/total");
      const data = await res.json();
      if (isEn && data.totalUSD !== undefined) {
        setCollectedAmount(data.totalUSD);
      } else if (!isEn && data.total !== undefined) {
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
  }, [isOpen, currency]);

  const progressPercentage = Math.min((collectedAmount / goalAmount) * 100, 100);

  const fetchClientSecret = useCallback(async () => {
    if (amount > maxDonation) {
      setError(`${t("donation.contribute_label")} max: ${maxDonation} ${currencyLabel}.`);
      return;
    }
    if (amount <= 0) {
      setError(t("donation.invalid_amount"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await response.json().catch(() => ({ error: t("donation.invalid_data") }));

      if (!response.ok) {
        throw new Error(data.error || t("donation.session_error"));
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Error fetching client secret:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [amount, currency, maxDonation, currencyLabel, t]);

  const handleAmountChange = (val: number) => {
    if (val > maxDonation) {
      setAmount(maxDonation);
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

  // Format amount for display
  const formatAmount = (val: number) =>
    isEn
      ? `$${val}`
      : `${val} Kč`;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 border-none bg-card shadow-2xl">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-tight">
                {t("donation.title")}
              </DialogTitle>
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
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    {t("donation.current_goal")}
                  </span>
                  <span className="text-xl font-black tabular-nums">
                    {isEn ? `$${collectedAmount.toFixed(2)}` : collectedAmount.toLocaleString("cs-CZ")}
                    <span className="text-sm font-bold opacity-40 ml-1">
                      / {isEn ? `$${goalAmount}` : `${goalAmount.toLocaleString("cs-CZ")} Kč`}
                    </span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block">
                    {t("donation.progress_label")}
                  </span>
                  <span className="text-lg font-black text-primary italic">
                    {Math.round(progressPercentage)}%
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
                <p className="font-bold uppercase mb-1">{t("donation.error_title")}</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}

          {!clientSecret ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase opacity-50 tracking-wider">
                  {t("donation.contribute_label")}
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {presets.map((val) => (
                    <Button
                      key={val}
                      variant={amount === val ? "default" : "outline"}
                      onClick={() => setAmount(val)}
                      className="font-bold py-4 sm:py-6 text-sm sm:text-base"
                    >
                      {formatAmount(val)}
                    </Button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    max={maxDonation}
                    className="h-14 font-black text-xl w-full donation-amount-input pl-12 pr-16"
                    placeholder={t("donation.custom_amount")}
                  />
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 opacity-40 text-primary pointer-events-none" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black opacity-20 text-sm">
                    {currencyLabel}
                  </div>
                </div>
                {isEn && (
                  <p className="text-[10px] text-muted-foreground opacity-60 text-center">
                    {t("donation.approx")} {Math.round(amount * CZK_PER_USD)} CZK · Rate: 1 USD = {CZK_PER_USD} CZK
                  </p>
                )}
              </div>

              <Button
                onClick={fetchClientSecret}
                className="w-full h-12 sm:h-16 text-sm sm:text-xl font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] gap-3 shadow-xl shadow-primary/20 group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading || amount <= 0}
              >
                <span className="relative z-10">
                  {loading ? t("donation.preparing") : t("donation.support_btn")}
                </span>
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
            <ArrowLeftIcon size={12} /> {t("donation.change_amount")}
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
