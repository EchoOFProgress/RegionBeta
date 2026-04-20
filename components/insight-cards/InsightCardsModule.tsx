"use client";

import { useState, useCallback, useEffect } from "react";
import INSIGHT_CARDS from "@/lib/insight-cards-data";
import InsightGallery from "./InsightGallery";
import InsightCardDetail from "./InsightCardDetail";

export default function InsightCardsModule() {
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  const handleCardSelect = useCallback((id: string) => {
    setCurrentCardId(id);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentCardId(null);
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
          <InsightCardDetail data={currentCard} onBack={handleBack} />
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
