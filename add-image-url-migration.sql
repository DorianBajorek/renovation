-- Migracja: Dodanie kolumny image_url do tabeli products
-- Uruchom ten skrypt w swojej bazie danych Supabase

-- Dodaj kolumnę image_url do tabeli products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Dodaj komentarz do kolumny
COMMENT ON COLUMN products.image_url IS 'URL do obrazka produktu automatycznie pobranego z linku';

-- Opcjonalnie: Dodaj indeks dla lepszej wydajności zapytań
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url) WHERE image_url IS NOT NULL;
