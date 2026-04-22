# Budoucí rozšíření projektu Region Beta 🚀

Tento dokument shrnuje technické návrhy a kroky pro implementaci pokročilých funkcí, které posunou aplikaci z lokálního prototypu na plnohodnotnou produkční platformu.

---

## 1. Reálná databáze (Persistence dat)
Aktuálně aplikace využívá `localStorage` nebo lokální JSON soubory. Pro škálování je nutná robustní databáze.

- **Doporučená technologie:** **Supabase** (PostgreSQL) nebo **Prisma + PlanetScale**.
- **Klíčové kroky:**
    - Návrh schématu: `users`, `tasks`, `habits`, `challenges`, `analytics_logs`.
    - Implementace API rout v Next.js (`/api/...`) pro CRUD operace.
    - Migrace dat: Skript pro přenos stávajících dat z localStorage do DB při prvním přihlášení.
- **Výhoda:** Synchronizace dat mezi zařízeními a možnost sdílení výzev s ostatními uživateli.

---

## 2. Přihlašování pomocí Google účtu (Auth)
Zabezpečený přístup k osobním datům a statistikám.

- **Doporučená technologie:** **NextAuth.js (Auth.js)**.
- **Klíčové kroky:**
    - Nastavení Google Cloud Console (OAuth 2.0 Client ID).
    - Implementace `SessionProvider` v `layout.tsx`.
    - Přidání tlačítka "Sign in with Google" do existujícího Settings modulu.
    - Propojení uživatele v databázi s jeho Google ID.
- **Výhoda:** Rychlá registrace bez nutnosti pamatovat si další heslo a zvýšení důvěryhodnosti.

---

## 3. Email list a odesílání emailů
Udržení uživatelů v kontaktu s jejich progresem.

- **Doporučené technologie:** **Resend** (odesílání) + **React Email** (šablony).
- **Funkce:**
    - **Týdenní reporty:** Automatické shrnutí splněných habitů a progresu v challengích.
    - **Motivační upozornění:** Pokud uživatel 3 dny nesplnil úkol.
    - **Newsletter:** Možnost sbírat emaily pro novinky o "Region Beta".
- **Klíčové kroky:**
    - Cron jobs (pomocí Vercel Cron nebo Upstash) pro spouštění pravidelných reportů.
    - Integrace API pro odběr novinek.

---

## 4. Stripe platby (Monetizace)
Transformace projektu na SaaS (Software as a Service).

- **Doporučená technologie:** **Stripe SDK** + **Stripe Checkout**.
- **Modely monetizace:**
    - **Freemium:** Základní funkce zdarma, pokročilé statistiky a neomezený počet modulů za předplatné.
    - **One-time purchase:** Odemčení prémiových témat (např. "Nike Dynamism") natrvalo.
- **Klíčové kroky:**
    - Nastavení Stripe webhooks pro aktualizaci statusu předplatného v DB.
    - Tvorba "Pricing" stránky nebo sekce v nastavení.
    - Customer Portal pro správu plateb uživatelem.

---

## Technický roadmap (Priorita)
1. **Fáze 1:** DB + Auth (Základ pro vše ostatní).
2. **Fáze 2:** Stripe (Možnost začít generovat zisk).
3. **Fáze 3:** Emailing (Retence uživatelů).

---

> [!TIP]
> Pro začátek doporučuji kombinaci **Supabase + NextAuth**, protože nabízejí nejjednodušší integraci s Next.js a mají štědré "Free tier" tarify pro vývoj.
