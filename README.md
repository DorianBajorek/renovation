# Remonto - Aplikacja do Planowania Remontów

Aplikacja webowa do planowania i zarządzania projektami remontowymi, z możliwością dodawania pokoi, produktów i śledzenia budżetu.

## Funkcje

- 🔐 **Autentykacja** - Logowanie i rejestracja z hasłem lub Google OAuth
- 📋 **Projekty** - Tworzenie i zarządzanie projektami remontowymi
- 🏠 **Pokoje** - Dodawanie pokoi do projektów
- 🛒 **Produkty** - Dodawanie produktów do pokoi z cenami i kategoriami
- 💰 **Budżet** - Śledzenie wydatków na pokoje i projekty
- 👥 **Udostępnianie** - Udostępnianie projektów innym użytkownikom
- 📱 **Responsywny design** - Działa na wszystkich urządzeniach

## Technologie

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Autentykacja**: Supabase Auth z Google OAuth
- **Styling**: Tailwind CSS z custom design system

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repository-url>
cd renovation
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:

```bash
cp env.example .env.local
```

4. Wypełnij zmienne w `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Skonfiguruj bazę danych:

   - Przejdź do [Supabase Dashboard](https://supabase.com/dashboard)
   - Utwórz nowy projekt
   - W SQL Editor wykonaj zawartość pliku `supabase-schema.sql`

6. Skonfiguruj Google OAuth (opcjonalnie):

   - Postępuj zgodnie z instrukcjami w `GOOGLE_OAUTH_SETUP.md`

7. Uruchom aplikację:

```bash
npm run dev
```

## Autentykacja

Aplikacja obsługuje dwa sposoby autentykacji:

### 1. Email i hasło

- Rejestracja z email i hasłem
- Logowanie z email i hasłem
- Potwierdzenie email po rejestracji

### 2. Google OAuth

- Logowanie i rejestracja przez Google
- Automatyczne pobieranie danych profilu
- Bezpieczne przekierowania OAuth

## Struktura bazy danych

### Tabele główne:

- **users** - Dane użytkowników
- **projects** - Projekty remontowe
- **rooms** - Pokoje w projektach
- **products** - Produkty w pokojach
- **project_shares** - Udostępnianie projektów

### Funkcje:

- **get_room_expenses()** - Oblicza wydatki na pokój
- **get_project_expenses()** - Oblicza wydatki na projekt

## Bezpieczeństwo

- Row Level Security (RLS) włączone dla wszystkich tabel
- Polityki dostępu oparte na ID użytkownika
- Bezpieczne przekierowania OAuth
- Walidacja danych po stronie klienta i serwera

## Rozwój

### Struktura katalogów:

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── auth/           # Auth callback
│   ├── login/          # Login page
│   ├── register/       # Register page
│   └── ...
├── components/         # Reusable components
├── hooks/             # Custom hooks
├── lib/               # Utilities and services
└── types/             # TypeScript types
```

### Dodawanie nowych funkcji:

1. Utwórz komponenty w `src/components/`
2. Dodaj strony w `src/app/`
3. Zaktualizuj typy w `src/types/`
4. Dodaj polityki RLS jeśli potrzebne

## Deployment

Aplikacja może być wdrożona na:

- Vercel (zalecane)
- Netlify
- Dowolny hosting z obsługą Next.js

## Licencja

MIT License - zobacz plik LICENSE dla szczegółów.
