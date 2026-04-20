# Nepoužívané soubory a složky

Analýza provedena průchodem celého projektu od vstupních bodů (`app/page.tsx`, `app/layout.tsx`) a vysledováním všech importů. Soubory níže nejsou nikde importovány ani referencovány — lze je bezpečně smazat.

---

## Složky (celé)

| Složka | Důvod |
|--------|-------|
| `backup_modules/` | Záložní kopie komponent, žádná není importována |
| `styles/` | Prázdná složka |
| `scratch/` | Vývojové Python skripty, nejsou součástí aplikace |
| `Insight_Cards_React/` | Samostatná Vite+React aplikace, oddělená od Next.js projektu |
| `artifacts/` | Různé artefakty bez vazby na aplikaci |

---

## Komponenty (`components/`)

### AI komponenty
- `components/ai/ApiKeySettings.tsx`

### Auth komponenty
- `components/auth/GoogleLoginButton.tsx`

### Insight Cards
- `components/insight-cards/InsightExpandableCard.tsx`

### UI komponenty (Shadcn — přidány ale nepoužity)
- `components/ui/alert.tsx`
- `components/ui/avatar.tsx`
- `components/ui/calendar.tsx`
- `components/ui/command.tsx`
- `components/ui/field.tsx`
- `components/ui/form.tsx`
- `components/ui/item.tsx`
- `components/ui/popover.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/scroll-area.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/slider.tsx`
- `components/ui/toast.tsx`
- `components/ui/tooltip.tsx`

### Ostatní komponenty
- `components/analytics-dashboard.tsx`
- `components/auth-wrapper.tsx`
- `components/calendar-timebox-integration.tsx`
- `components/calendar-view.tsx`
- `components/calendar-view-enhanced.tsx`
- `components/categories-module.tsx`
- `components/login-form.tsx`
- `components/notification-badge.tsx`
- `components/register-form.tsx`
- `components/SafeHydration.tsx`
- `components/settings-dialog.tsx`
- `components/shop-module.tsx`
- `components/templates-library.tsx`
- `components/theme-provider.tsx`
- `components/time-boxing-module.tsx`
- `components/user-dashboard.tsx`

---

## Knihovny (`lib/`)

- `lib/ai/crypto.ts`
- `lib/ai/gemini-client.ts`
- `lib/ai/input-validator.ts`
- `lib/constants.ts`

---

## Hooky (`hooks/`)

- `hooks/use-mobile.ts`

---

## Dokumentační a ostatní soubory v rootu

Tyto soubory nejsou součástí aplikace, ale slouží jako dokumentace / poznámky:

- `abstract.txt`
- `CSS_AUDIT.md`
- `TECHNICAL_DOCUMENTATION.md`
- `design_systems.md`
- `karticka-analyza.md`
- `pravidla-promptovani.md`
- `productivity_modules_spec.md`
- `sihit.md`

> Tyto soubory aplikaci nijak neovlivňují — smazání je volitelné dle uvážení.

---

## Soubory používané aplikací (pro přehled — NESMAZAT)

Vstupní body a jejich závislosti, které jsou aktivně využívány:

- `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/error.tsx`, `app/global-error.tsx`
- `components/GlobalThemeProvider.tsx`
- `components/task-module.tsx`, `components/habit-module.tsx`, `components/challenge-module.tsx`, `components/goals-module.tsx`
- `components/extended-task-form.tsx`, `components/extended-habit-form.tsx`
- `components/task-analytics-modal.tsx`, `components/habit-analytics-modal.tsx`, `components/challenge-analytics-modal.tsx`
- `components/ai/CreatorPanel.tsx`, `components/ai/RecommenderPanel.tsx`
- `components/insight-cards/InsightCardsModule.tsx`, `InsightGallery.tsx`, `InsightCardDetail.tsx`, `InsightCardThumbnail.tsx`, `InsightThemeModal.tsx`
- `components/ui/` — button, badge, card, checkbox, dialog, input, label, progress, select, switch, tabs, textarea, toaster, use-toast
- `components/project-statistics.tsx`, `components/user-profile.tsx`
- `lib/storage.ts`, `lib/types.ts`, `lib/utils.ts`, `lib/priority-colors.ts`
- `lib/auth-context.tsx`, `lib/category-context.tsx`, `lib/ui-context.tsx`, `lib/notification-context.tsx`
- `lib/notification-service.ts`, `lib/user-preferences.ts`, `lib/insight-cards-data.ts`
- `lib/ai/api-key-manager.ts`, `lib/ai/creator.ts`, `lib/ai/recommender.ts`, `lib/ai/logger.ts`, `lib/ai/output-validator.ts`
- `hooks/use-toast.ts`
- `public/insight-themes/` (všechny CSS témata)
