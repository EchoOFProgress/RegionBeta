"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Lightbulb } from "lucide-react";
import { evaluateInsightTriggers, CARD_POLICIES } from "@/lib/insight-card-triggers";
import { getInsightCards, InsightCard } from "@/lib/insight-cards-data";
import InsightCardPreview from "./InsightCardPreview";
import InsightCardDetail from "./InsightCardDetail";
import { useLanguage } from "@/lib/language-context";

const LS_KEY = "insight_read_ts";

function loadReadTimestamps(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveReadTimestamp(cardId: string) {
  const ts = loadReadTimestamps();
  ts[cardId] = Date.now();
  localStorage.setItem(LS_KEY, JSON.stringify(ts));
}

function isCardBlocked(cardId: string, ts: Record<string, number>): boolean {
  const lastRead = ts[cardId];
  if (lastRead === undefined) return false;

  const policy = CARD_POLICIES[cardId];
  if (!policy || policy.type === "once") return true;
  return Date.now() - lastRead < policy.days * 86_400_000;
}

interface TriggeredInsightBarProps {
  tasks: any[];
  habits: any[];
  goals: any[];
}

export function TriggeredInsightBar({ tasks, habits, goals }: TriggeredInsightBarProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<InsightCard | null>(null);
  // Bump this to force re-evaluation after a card is dismissed
  const [readVersion, setReadVersion] = useState(0);

  const cards = getInsightCards(language);
  const triggeredIds = evaluateInsightTriggers({ tasks, habits, goals });

  const readTs = loadReadTimestamps();
  const unreadCards = triggeredIds
    .filter(id => !isCardBlocked(id, readTs))
    .map(id => cards.find(c => c.id === id))
    .filter((c): c is InsightCard => c !== undefined);

  // readVersion referenced so React re-renders when it changes
  void readVersion;

  const handleCloseDetail = useCallback(() => {
    if (selectedCard) {
      saveReadTimestamp(selectedCard.id);
      setReadVersion(v => v + 1);
    }
    setSelectedCard(null);
  }, [selectedCard]);

  const handleNavigate = (title: string) => {
    const card = cards.find(c => title.startsWith(c.title));
    if (card) setSelectedCard(card);
  };

  return (
    <>
      <div className="triggered-bar">
        <button
          className="triggered-bar-header"
          onClick={() => setIsOpen(p => !p)}
          aria-expanded={isOpen}
        >
          <span className="triggered-bar-icon">
            <Lightbulb size={14} />
          </span>
          <span className="triggered-bar-label">
            {t("Taktické kartičky pro vaši situaci")}
          </span>
          {unreadCards.length > 0 && (
            <span className="triggered-bar-count">{unreadCards.length}</span>
          )}
          <span className="triggered-bar-chevron">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="triggered-bar-cards">
            {unreadCards.length === 0 ? (
              <p className="triggered-bar-empty">{t("insight.no_cards")}</p>
            ) : (
              unreadCards.map(card => (
                <InsightCardPreview
                  key={card.id}
                  data={card}
                  onOpen={() => setSelectedCard(card)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedCard} onOpenChange={open => !open && handleCloseDetail()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {selectedCard && (
            <InsightCardDetail
              data={selectedCard}
              onBack={handleCloseDetail}
              onNavigate={handleNavigate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
