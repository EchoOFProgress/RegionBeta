"use client";

import { InsightCard } from "@/lib/insight-cards-data";
import InsightCardThumbnail from "./InsightCardThumbnail";

interface InsightGalleryProps {
  cards: InsightCard[];
  onCardSelect: (id: string) => void;
}

export default function InsightGallery({ cards, onCardSelect }: InsightGalleryProps) {
  return (
    <>
      {cards.map((card) => (
        <InsightCardThumbnail
          key={card.id}
          data={card}
          onClick={() => onCardSelect(card.id)}
        />
      ))}
    </>
  );
}
