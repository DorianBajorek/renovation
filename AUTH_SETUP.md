# System Autoryzacji - Instrukcje Konfiguracji

## Przegląd

System autoryzacji został zaimplementowany z następującymi funkcjonalnościami:

- Rejestracja użytkowników
- Logowanie użytkowników
- Ochrona stron wymagających autoryzacji
- Indywidualne zbiory projektów i pokoi dla każdego użytkownika

## Struktura Bazy Danych

### Tabela `users`

- `id` - UUID (klucz główny)
- `email` - VARCHAR(255) UNIQUE
- `password_hash` - VARCHAR(255) (zahashowane hasło)
- `first_name` - VARCHAR(100)
- `last_name` - VARCHAR(100)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabela `rooms` (zaktualizowana)

- `id` - UUID (klucz główny)
- `user_id` - UUID (klucz obcy do users)
- `name` - VARCHAR(255)
- `budget` - DECIMAL(10,2)
- `icon` - VARCHAR(50)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabela `projects` (zaktualizowana)

- `id` - UUID (klucz główny)
- `user_id` - UUID (klucz obcy do users)
- `name` - VARCHAR(255)
- `description` - TEXT
- `budget` - DECIMAL(10,2)
- `status` - VARCHAR(20) DEFAULT 'active'
- `icon` - VARCHAR(50) DEFAULT 'Home'
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Instalacja i Konfiguracja

### 1. Zależności

Upewnij się, że masz zainstalowane wszystkie zależności:

```bash
npm install
```

### 2. Konfiguracja Bazy Danych

1. Uruchom plik `supabase-schema.sql` w swojej bazie danych Supabase
2. Plik zawiera komendy do czyszczenia istniejącej bazy i tworzenia nowej struktury

### 3. Konfiguracja Supabase

Upewnij się, że plik `src/lib/supabase.ts` zawiera poprawne dane połączenia:

- `supabaseUrl` - URL twojego projektu Supabase
- `supabaseAnonKey` - Klucz anonimowy z ustawień API

## API Endpoints

### Autoryzacja

#### POST `/api/auth/register`

Rejestracja nowego użytkownika

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jan",
  "lastName": "Kowalski"
}
```

#### POST `/api/auth/login`

Logowanie użytkownika

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Projekty

#### GET `/api/projects?userId={userId}`

Pobieranie projektów użytkownika

#### POST `/api/projects`

Tworzenie nowego projektu

```json
{
  "userId": "user-uuid",
  "name": "Nazwa projektu",
  "description": "Opis projektu",
  "budget": 15000,
  "status": "planning",
  "rooms": ["Salon", "Kuchnia"],
  "icon": "Home"
}
```

### Pokoje

#### GET `/api/rooms?userId={userId}`

Pobieranie pokoi użytkownika

#### POST `/api/rooms`

Tworzenie nowego pokoju

```json
{
  "userId": "user-uuid",
  "name": "Salon",
  "budget": 5000,
  "icon": "Sofa"
}
```

## Komponenty

### useAuth Hook

Hook do zarządzania stanem autoryzacji:

```typescript
const { user, loading, login, logout, isAuthenticated } = useAuth();
```

### ProtectedRoute

Komponent do ochrony stron wymagających autoryzacji:

```typescript
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## Bezpieczeństwo

- Hasła są hashowane przy użyciu bcryptjs (12 rund soli)
- Wszystkie endpointy wymagają userId dla operacji na danych
- Dane użytkownika są przechowywane w localStorage (w produkcji zalecane użycie sesji/tokenów)

## Uruchomienie

1. Uruchom serwer deweloperski:

```bash
npm run dev
```

2. Otwórz aplikację w przeglądarce: `http://localhost:3000`

3. Zarejestruj nowe konto lub zaloguj się używając testowego konta:
   - Email: `test@example.com`
   - Hasło: `password123`

## Testowanie

1. Zarejestruj nowe konto
2. Zaloguj się
3. Sprawdź czy możesz dodawać projekty i pokoje
4. Sprawdź czy dane są przypisane do zalogowanego użytkownika
5. Wyloguj się i sprawdź czy strony są chronione

## Uwagi

- W trybie deweloperskim dane są przechowywane w localStorage
- W produkcji zalecane jest użycie sesji lub tokenów JWT
- Hasła są hashowane, ale w produkcji zalecane jest dodatkowe zabezpieczenie (np. rate limiting)
- API endpoints wymagają userId w parametrach - w produkcji powinno to być pobierane z sesji/tokenu

