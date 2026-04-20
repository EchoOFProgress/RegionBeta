# CSS Audit — Region Beta
_Datum: 2026-04-17_

---

## Závěr (TL;DR)

**Část, která funguje profesionálně: Insight Cards modul** — stylovaný přes `public/insight-themes/style.css`.

**Části, které nefungují správně: Task, Habit, Goals, Challenge, Shop moduly** — používají shadcn/ui komponenty, jejichž CSS třídy nejsou definované v `globals.css`.

---

## 1. Kde CSS funguje správně — Insight Cards

**Soubor:** `public/insight-themes/style.css` (888 řádků)

### Proč to funguje

Tento soubor je architektonicky kompletní, samostatný design systém:

| Vlastnost | Implementace |
|---|---|
| CSS Cascade Layers | `@layer reset, core, layout, components, utilities` |
| Barevný systém | OKLCH (moderní, perceptuálně uniformní) s CSS proměnnými |
| Spacing tokeny | `--gap-s: 0.5rem`, `--gap-m: 1rem`, `--gap-l: 2.5rem` |
| Timing tokeny | `--speed-snappy: 150ms`, `--ease-linear: cubic-bezier(0.1, 1, 0.2, 1)` |
| Typografie | `clamp(3rem, 10vw, 4.5rem)` pro responzivní nadpisy |
| Animace | `pistonSlide`, `fadeIn`, `slide-snap`, `spin` — pojmenované, s easing křivkami |
| Responzivita | Media query `min-width: 1024px` s grid-template-areas |
| Pseudo-elementy | `::before` pro dekorativní UI labely (EQUIPMENT_MANIFEST, LOG_SPEC_CLUSTER_01) |
| shadcn přepsání | `[data-slot="button"]`, `[data-slot="card"]`, `[data-slot="dialog-content"]` — cílí na Radix komponenty |
| Hover stavy | Kompletní: scale, border-color, background, color transformace |
| Focus stavy | `focus-within: border-color: var(--accent-orange)` |

### Vizuální identita

- Paleta: černá (`oklch(0%)`) + carbon (`oklch(15%)`) + International Orange (`oklch(60% 0.25 45)`)
- Font: `Roboto Mono` pro UI labely, `Inter` pro obsah
- Styl: Průmyslový, precizní — `.card-thumbnail:hover { transform: translateY(-5px); }`, `[data-slot="button"]:hover { transform: scale(1.02); }`

---

## 2. Kde CSS nefunguje — Aplikační moduly

**Dotčené soubory:**
- `components/task-module.tsx`
- `components/habit-module.tsx`
- `components/goals-module.tsx`
- `components/challenge-module.tsx`
- `components/shop-module.tsx`
- `components/user-dashboard.tsx`

### Hlavní problém

`globals.css` je pouze **manuální Tailwind polyfill** — definuje základní utility třídy (`.flex`, `.grid`, `.p-4`), ale **chybí mu stovky tříd, které moduly používají**.

---

## 3. Konkrétní chybějící třídy (seznam problémů)

### 3.1 Barevné utility — nedefinované

Moduly používají tyto třídy, které `globals.css` neobsahuje:

```
border-primary       bg-primary         text-primary
bg-primary/5         bg-primary/10      border-primary/30
text-destructive     bg-destructive     border-destructive
text-secondary       bg-secondary
border-muted         bg-card            text-card-foreground
focus:border-primary focus:ring-primary
```

**Dopad:** Karty nemají správné barevné zvýraznění, input focus efekty chybí, priority indikátory nejsou viditelné.

### 3.2 Spacing utility — nedefinované

```
space-y-1    space-y-2    space-y-3
space-y-4    space-y-6    space-y-8
space-x-2    space-x-4
```

**Dopad:** Vertikální mezery mezi elementy v modulech jsou 0 nebo závisí na margin, což způsobuje nekonzistentní layout.

### 3.3 Transition & Animation — nedefinované

```
transition-all          transition-colors      transition-opacity
duration-150            duration-200           duration-300
ease-in-out             ease-out
animate-pulse           animate-bounce
hover:scale-105         hover:opacity-80
```

**Dopad:** Interakce jsou "tuhé" — bez hover animací, bez smooth přechodů. Kontrastuje to s plynulostí Insight Cards sekce.

### 3.4 Text utility — nedefinované

```
line-clamp-2     line-clamp-3
text-2xl         text-3xl         text-4xl
tracking-tight   tracking-wider   tracking-widest
leading-tight    leading-relaxed  leading-none
uppercase        lowercase        capitalize
```

**Dopad:** Nadpisy na dashboardu (`text-3xl font-bold` v `user-dashboard.tsx`) nemají správnou velikost. Text se nepřekrývá správně u delších popisků.

### 3.5 Sizing utility — nedefinované

```
w-12    w-16    w-20    w-24    w-32    w-48    w-64
h-2     h-12    h-16    h-48    h-screen
min-w-0         flex-shrink-0    flex-grow-0
max-w-xs        max-w-sm         max-w-md        max-w-lg
```

**Dopad:** Progres bary (`h-2`), avatary (`h-12 w-12`) a width omezení formulářových polí (`w-64`) se nezobrazují správně.

### 3.6 Responzivní breakpointy — nedefinované

`globals.css` definuje třídy jako `.grid-cols-4`, ale **neimplementuje responzivní varianty**. Moduly používají:

```
md:grid-cols-2       lg:grid-cols-4       sm:w-64
md:flex-row          md:items-center      lg:flex-row
sm:flex-col          xl:grid-cols-3
```

**Dopad:** Na mobilních zařízeních se layout nezalomí. Grid zůstane čtyřsloupcový i na úzké obrazovce.

### 3.7 Button varianty — nedefinované

`components/ui/button.tsx` generuje třídy `btn btn-default`, `btn btn-outline`, `btn btn-ghost` atd. pomocí `cva()`. Žádná z těchto tříd **není definována v globals.css**.

```
btn-default       btn-destructive     btn-outline
btn-secondary     btn-ghost           btn-link
btn-size-default  btn-size-sm         btn-size-lg
btn-size-icon     btn-size-icon-sm    btn-size-icon-lg
```

**Poznámka:** `style.css` definuje `[data-slot="button"]` a aplikuje `background: var(--accent-orange)`, ale pouze pro výchozí variantu. Ghost a outline buttony v modulech nemají vlastní styl a vypadají jako plain text.

### 3.8 Tailwind barevná paleta — nedefinována

Moduly a category systém přiřazuje třídy jako:

```
bg-blue-500     bg-green-500     bg-red-500
bg-yellow-500   bg-purple-500    bg-pink-500
text-blue-600   text-green-600   border-blue-300
```

Tyto třídy **vůbec neexistují** v projektu bez Tailwind enginu.

---

## 4. Architekturální problém

```
globals.css          — polyfill ~207 řádků (neúplný)
style.css            — kompletní design systém pro Insight Cards
ostatní moduly       — předpokládají plný Tailwind + CSS variables jako --primary
```

**Tři různé systémy, žádná koherence:**

1. `style.css` — krásný, industriální, černý design
2. `globals.css` + shadcn defaults — světlý, neutrální, neúplný  
3. Dynamické inline styly (`getPriorityColor()`) — JavaScript-driven barvy

---

## 5. Navrhovaná řešení

### Možnost A: Rozšířit globals.css (rychlé, minimální)

Přidat do `globals.css` všechny chybějící třídy. Vhodné pro zachování stávající architektury.

**Co přidat:**
```css
/* Primární barvy (propojení s CSS variables) */
.text-primary { color: hsl(var(--primary)); }
.bg-primary { background-color: hsl(var(--primary)); }
.border-primary { border-color: hsl(var(--primary)); }
.bg-primary\/5 { background-color: hsl(var(--primary) / 0.05); }

/* Space-y utility */
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }

/* Responzivní breakpointy */
@media (min-width: 640px) {
  .sm\:w-64 { width: 16rem; }
  .sm\:flex-col { flex-direction: column; }
}
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .md\:flex-row { flex-direction: row; }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Animate-pulse (chybí, ale je používán) */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* line-clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Transitions */
.transition-all { transition: all 150ms ease; }
.duration-200 { transition-duration: 200ms; }
```

### Možnost B: Nainstalovat Tailwind CSS (doporučeno)

Tailwind 4.x je již v `node_modules` (verze `4.1.16`). Stačí ho aktivovat.

**Kroky:**
1. Přidat do `globals.css`:
   ```css
   @import "tailwindcss";
   ```
2. Odstranit manuální utility třídy z `globals.css` (nahradí je Tailwind)
3. Zachovat vlastní třídy jako `.masthead`, `.nav-item` atd.

**Výhoda:** Okamžitě opraví všechny chybějící utility třídy, responzivní breakpointy a barevnou paletu.

### Možnost C: Sjednotit design do style.css (doporučeno pro vizuální kvalitu)

Přesunout styly modulů do `style.css` s industriální estetikou, aby odpovídaly Insight Cards:

```css
/* V style.css přidat: */
.task-card {
  background: oklch(12% 0.01 260);
  border: 1px solid var(--core-border);
  padding: var(--gap-m);
  transition: border-color var(--speed-snappy);
}

.task-card:hover {
  border-color: var(--accent-orange);
}

.priority-badge {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border: 1px solid currentColor;
}
```

---

## 6. Duplicity a nečistoty v globals.css

Nalezena duplicita — stejný CSS blok je definován dvakrát:

```css
/* globals.css řádky 161-163 a 165-167 — identický kód */
.flex > svg.lucide, .grid > svg.lucide {
  align-self: center;
}
```

Doporučeno: odstranit jeden výskyt.

---

## 7. Prioritizovaný akční plán

| Priorita | Problém | Řešení | Soubor |
|---|---|---|---|
| 🔴 Kritická | Tailwind není nainstalován | Přidat `@import "tailwindcss"` do globals.css | `globals.css` |
| 🔴 Kritická | `--primary` CSS variable není definována | Přidat do `:root` bloku | `globals.css` |
| 🔴 Kritická | `btn-default`, `btn-ghost` atd. nejsou definovány | Doplnit nebo přejít na Tailwind variants | `globals.css` |
| 🟡 Střední | Responzivní breakpointy nefungují | Přidat `@media` bloky nebo Tailwind | `globals.css` |
| 🟡 Střední | `animate-pulse`, `line-clamp-2` chybí | Přidat do globals.css | `globals.css` |
| 🟡 Střední | `space-y-*` třídy chybí | Přidat CSS nebo Tailwind | `globals.css` |
| 🟢 Nízká | Duplicitní SVG pravidlo | Smazat jednu kopii | `globals.css:165-167` |
| 🟢 Nízká | 7 Google Fonts je načteno, většina nevyužita | Auditovat a odstranit nepoužité | `layout.tsx` |
| 🟢 Nízká | Inline styly v komponentách | Přesunout do CSS tříd | moduly |
