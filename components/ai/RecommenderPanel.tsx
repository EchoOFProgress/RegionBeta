"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { recommender } from "@/lib/ai/recommender";
import { aiLogger, AILogEntry } from "@/lib/ai/logger";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Sparkles, Brain, AlertTriangle } from "lucide-react";
import InsightCardsData, { InsightCard } from "@/lib/insight-cards-data";
import InsightCardThumbnail from "@/components/insight-cards/InsightCardThumbnail";
import InsightCardDetail from "@/components/insight-cards/InsightCardDetail";

export function RecommenderPanel() {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedCardIds, setRecommendedCardIds] = useState<string[]>([]);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [history, setHistory] = useState<AILogEntry[]>([]);
  const [selectedCard, setSelectedCard] = useState<InsightCard | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Load local history on mount
    setHistory(aiLogger.getLogs().filter(l => l.type === "recommender"));
  }, []);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setFallbackMode(false);
    setErrorText("");
    setRecommendedCardIds([]);

    try {
      const cardIds = await recommender.getRecommendations(input, user?.id);
      
      if (cardIds.length === 0) {
         setFallbackMode(true);
      } else {
         setRecommendedCardIds(cardIds);
      }
      
      // Update history list visually
      setHistory(aiLogger.getLogs().filter(l => l.type === "recommender"));
    } catch (error: any) {
      setErrorText(error.message || "Dosšlo k problému při analýze.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const matchedCards = InsightCardsData.filter(card => recommendedCardIds.includes(card.id));

  return (
    <div className="space-y-6 flex flex-col h-full bg-card p-6 rounded-lg border border-border">
      <div className="space-y-2">
         <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Recommender
         </h2>
         <p className="text-muted-foreground">Popište mi, co se právě děje. Analyzuji situaci a nabídnu příslušnou taktickou kartičku.</p>
      </div>

      <div className="space-y-3">
         <Textarea 
            placeholder="Příklad: Ztratil jsem svůj 14 denní streak a teď se mi vůbec nechce pokračovat."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
            disabled={isAnalyzing}
         />
         <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !input.trim()}
            className="w-full gap-2"
         >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAnalyzing ? "Probíhá analýza..." : "Analyzovat situaci"}
         </Button>
      </div>

      <div className="pt-4 flex-1">
          {errorText && (
             <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                 <p className="text-sm">{errorText}</p>
             </div>
          )}

          {fallbackMode && !errorText && (
             <div className="bg-muted p-4 rounded-md border border-border">
                <p className="text-sm text-center italic">
                   "Tento problém jsme zaznamenali. Naši vývojáři se na něj brzy zaměří."
                </p>
             </div>
          )}

          {matchedCards.length > 0 && (
             <div className="space-y-4">
                 <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Doporučené strategie:</h3>
                 <div className="grid gap-4 sm:grid-cols-2">
                     {matchedCards.map(card => (
                        <div key={card.id} className="pointer-events-auto h-full flex transform transition-transform hover:scale-[1.02]">
                            <InsightCardThumbnail data={card} onClick={() => setSelectedCard(card)} />
                        </div>
                     ))}
                 </div>
             </div>
          )}

          <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
              {selectedCard && (
                <InsightCardDetail data={selectedCard} onBack={() => setSelectedCard(null)} />
              )}
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
}
