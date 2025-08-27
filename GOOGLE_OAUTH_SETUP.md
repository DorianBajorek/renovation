# Konfiguracja Google OAuth w Supabase

## Krok 1: Konfiguracja Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google+ API:
   - Przejdź do "APIs & Services" > "Library"
   - Wyszukaj "Google+ API" i włącz ją

## Krok 2: Utwórz OAuth 2.0 Client ID

1. Przejdź do "APIs & Services" > "Credentials"
2. Kliknij "Create Credentials" > "OAuth 2.0 Client IDs"
3. Wybierz "Web application"
4. Wypełnij formularz:
   - **Name**: Remonto App (lub dowolna nazwa)
   - **Authorized JavaScript origins**:
     ```
     https://kkomsualkaezfvuhonma.supabase.co
     http://localhost:3000 (dla development)
     ```
   - **Authorized redirect URIs**:
     ```
     https://kkomsualkaezfvuhonma.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (dla development)
     ```
5. Kliknij "Create"
6. Zapisz **Client ID** i **Client Secret**

## Krok 3: Konfiguracja Supabase

1. Przejdź do [Supabase Dashboard](https://supabase.com/dashboard)
2. Wybierz swój projekt
3. Przejdź do "Authentication" > "Providers"
4. Znajdź "Google" i kliknij "Enable"
5. Wypełnij pola:
   - **Client ID**: Wklej Client ID z Google Cloud Console
   - **Client Secret**: Wklej Client Secret z Google Cloud Console
6. Kliknij "Save"

## Krok 4: Aktualizacja bazy danych

Uruchom zaktualizowany schemat bazy danych:

```sql
-- Wykonaj zawartość pliku supabase-schema.sql w Supabase SQL Editor
```

## Krok 5: Testowanie

1. Uruchom aplikację: `npm run dev`
2. Przejdź do `/login` lub `/register`
3. Kliknij "Kontynuuj z Google" lub "Zarejestruj się z Google"
4. Powinieneś zostać przekierowany do Google OAuth
5. Po zalogowaniu zostaniesz przekierowany z powrotem do aplikacji

## Rozwiązywanie problemów

### Błąd "redirect_uri_mismatch"

- Sprawdź czy URI przekierowania w Google Cloud Console dokładnie pasuje do tego w Supabase
- Upewnij się, że używasz HTTPS w produkcji

### Błąd "invalid_client"

- Sprawdź czy Client ID i Client Secret są poprawnie skopiowane
- Upewnij się, że Google+ API jest włączona

### Błąd "access_denied"

- Sprawdź czy aplikacja jest w trybie "Testing" lub "Production" w Google Cloud Console
- Dodaj swój email jako test user jeśli aplikacja jest w trybie "Testing"

## Zmienne środowiskowe (opcjonalnie)

Możesz dodać zmienne środowiskowe do `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kkomsualkaezfvuhonma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Bezpieczeństwo

- Nigdy nie udostępniaj Client Secret publicznie
- Używaj HTTPS w produkcji
- Regularnie rotuj klucze
- Monitoruj logi autoryzacji w Supabase Dashboard
