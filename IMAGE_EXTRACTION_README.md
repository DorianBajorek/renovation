# Funkcjonalność Automatycznego Pobierania Obrazków Produktów

## Opis

Aplikacja została rozszerzona o funkcjonalność automatycznego pobierania obrazków produktów z linków URL. Gdy użytkownik doda link do produktu, system automatycznie próbuje wyciągnąć obrazek z tej strony i wyświetlić go na liście produktów.

## Jak to działa

### 1. Dodawanie produktu z obrazkiem

1. W formularzu dodawania produktu wpisz link do produktu
2. Kliknij przycisk z ikoną aparatu (📷) obok pola linku
3. System automatycznie pobierze stronę i wyciągnie obrazek
4. Obrazek zostanie wyświetlony w podglądzie poniżej
5. Możesz usunąć obrazek klikając czerwony przycisk X

### 2. Edycja produktu

1. W formularzu edycji produktu możesz również pobrać nowy obrazek
2. Kliknij przycisk z ikoną aparatu obok pola linku
3. Nowy obrazek zastąpi poprzedni

### 3. Wyświetlanie obrazków

- Obrazki są wyświetlane na listach produktów (zwykła i pogrupowana)
- Jeśli obrazek nie może być załadowany, wyświetlana jest domyślna ikona produktu
- Obrazki są responsywne i dostosowują się do różnych rozmiarów ekranu

## Techniczne szczegóły

### API Endpoint

- **POST** `/api/products/extract-image`
- Przyjmuje JSON: `{ "url": "https://example.com/product" }`
- Zwraca JSON: `{ "image_url": "https://example.com/image.jpg" }`

### Algorytm ekstrakcji obrazków

1. **Open Graph Image** - sprawdza meta tag `og:image`
2. **Twitter Card Image** - sprawdza meta tag `twitter:image`
3. **Pierwszy duży obrazek** - analizuje wszystkie `<img>` tagi i wybiera odpowiedni

### Filtrowanie obrazków

System pomija:

- Ikony i logo
- Banery reklamowe
- Małe obrazki (prawdopodobnie nie produktowe)

## Migracja bazy danych

Przed użyciem funkcjonalności należy dodać kolumnę `image_url` do tabeli `products`:

```sql
-- Uruchom w SQL Editor w Supabase
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;
```

## Obsługiwane formaty obrazków

- JPG/JPEG
- PNG
- WebP
- GIF
- SVG

## Bezpieczeństwo

- System używa bezpiecznych nagłówków HTTP
- Obrazki są ładowane z zewnętrznych źródeł (CORS)
- Obsługiwane są błędy ładowania obrazków

## Rozwiązywanie problemów

### Obrazek się nie ładuje

1. Sprawdź czy link jest poprawny
2. Upewnij się, że strona jest dostępna publicznie
3. Niektóre strony mogą blokować automatyczne pobieranie

### Błąd "Failed to fetch webpage content"

1. Sprawdź połączenie internetowe
2. Strona może być niedostępna lub blokować boty
3. Spróbuj ponownie za kilka minut

### Obrazek nie jest wyświetlany

1. Sprawdź czy kolumna `image_url` została dodana do bazy danych
2. Sprawdź konsolę przeglądarki pod kątem błędów
3. Upewnij się, że URL obrazka jest poprawny

## Przyszłe ulepszenia

- Cache'owanie obrazków
- Automatyczne skalowanie obrazków
- Wsparcie dla większej liczby formatów
- Ulepszone algorytmy rozpoznawania obrazków produktów
