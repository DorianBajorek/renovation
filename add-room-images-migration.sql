-- Migracja: Dodanie kolumny visualization_images do tabeli rooms
-- Uruchom ten skrypt w SQL Editor w Supabase

-- Dodaj kolumnę visualization_images do tabeli rooms
-- Używamy TEXT[] (array of text) do przechowywania wielu URL-ów obrazków
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS visualization_images TEXT[];

-- Dodaj komentarz do kolumny
COMMENT ON COLUMN rooms.visualization_images IS 'Array URL-ów do zdjęć wizualizacji pokoju (JPG)';

-- Opcjonalnie: Dodaj indeks dla lepszej wydajności zapytań
-- Index typu GIN dla lepszej obsługi operacji na arrayach
CREATE INDEX IF NOT EXISTS idx_rooms_visualization_images ON rooms USING GIN(visualization_images) WHERE visualization_images IS NOT NULL;
