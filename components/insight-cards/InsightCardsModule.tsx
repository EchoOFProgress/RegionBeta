"use client";

import { useState, useCallback, useEffect } from "react";
import { getInsightCards } from "@/lib/insight-cards-data";
import { useLanguage } from "@/lib/language-context";
import InsightGallery from "./InsightGallery";
import InsightCardDetail from "./InsightCardDetail";

export default function InsightCardsModule() {
  const { language } = useLanguage();
  const INSIGHT_CARDS = getInsightCards(language);

  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  const handleCardSelect = useCallback((id: string) => {
    setCurrentCardId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCardNavigate = useCallback((title: string) => {
    // Find card by exact title or starting title (to handle suffixes)
    const card = INSIGHT_CARDS.find((c) => title.startsWith(c.title));
    if (card) {
      handleCardSelect(card.id);
    }
  }, [handleCardSelect, INSIGHT_CARDS]);

  const handleBack = useCallback(() => {
    setCurrentCardId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const currentCard = currentCardId
    ? INSIGHT_CARDS.find((c) => c.id === currentCardId) || null
    : null;

  useEffect(() => {
    if (currentCardId) {
      document.body.classList.add("is-detail-view");
    } else {
      document.body.classList.remove("is-detail-view");
    }
  }, [currentCardId]);

  return (
    <div className="insight-module-wrapper">
      <section
        id="insight-cards-section"
        className={`insight-container ${
          currentCard ? "detail-active" : "gallery-grid"
        }`}
      >
        {currentCard ? (
          <InsightCardDetail
            data={currentCard}
            onBack={handleBack}
            onNavigate={handleCardNavigate}
          />
        ) : (
          <InsightGallery
            cards={INSIGHT_CARDS}
            onCardSelect={handleCardSelect}
          />
        )}
      </section>
    </div>
  );
}
