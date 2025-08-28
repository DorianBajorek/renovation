# Konfiguracja Google OAuth w Supabase

## Krok 1: Konfiguracja w Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google+ API:
   - Przejdź do "APIs & Services" > "Library"
   - Znajdź "Google+ API" i włącz ją
4. Utwórz OAuth 2.0 credentials:
   - Przejdź do "APIs & Services" > "Credentials"
   - Kliknij "Create Credentials" > "OAuth client ID"
   - Wybierz "Web application"
   - Dodaj autoryzowane URI przekierowania:
     - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (dla development)
5. Zapisz Client ID i Client Secret

## Krok 2: Konfiguracja w Supabase

1. Przejdź do dashboardu Supabase
2. Wybierz swój projekt
3. Przejdź do "Authentication" > "Providers"
4. Znajdź Google i włącz go
5. Wklej Client ID i Client Secret z Google Cloud Console
6. Zapisz zmiany

## Krok 3: Aktualizacja bazy danych

Uruchom plik `database-schema.sql` w Supabase SQL Editor, aby utworzyć schemat bazy danych z obsługą Google OAuth.

## Krok 4: Testowanie

1. Uruchom aplikację lokalnie
2. Przejdź do strony logowania lub rejestracji
3. Kliknij przycisk "Kontynuuj z Google"
4. Zaloguj się przez Google
5. Sprawdź czy zostałeś przekierowany do strony głównej

## Uwagi

- Użytkownicy logujący się przez Google będą mieli `password_hash` ustawiony na `'google_oauth_user'`
- Jeśli użytkownik próbuje zalogować się hasłem do konta Google, otrzyma odpowiedni komunikat błędu
- Wszystkie funkcjonalności aplikacji działają tak samo dla użytkowników Google i zwykłych użytkowników

## Rozwiązywanie problemów

### Błąd "redirect_uri_mismatch"

- Sprawdź czy URI przekierowania w Google Cloud Console jest dokładnie: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
- Upewnij się, że nie ma dodatkowych spacji lub znaków

### Błąd "invalid_client"

- Sprawdź czy Client ID i Client Secret są poprawnie skopiowane
- Upewnij się, że Google+ API jest włączona

### Błąd podczas tworzenia użytkownika

- Sprawdź czy schemat bazy danych został zaktualizowany
- Sprawdź logi w konsoli przeglądarki i w terminalu
