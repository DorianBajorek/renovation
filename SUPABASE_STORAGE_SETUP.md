# Konfiguracja Supabase Storage dla zdjęć pokoi

## 📁 Tworzenie Bucket

### 1. Przejdź do Supabase Dashboard
1. Otwórz swój projekt Supabase
2. Przejdź do **Storage** w menu bocznym
3. Kliknij **New Bucket**

### 2. Utworz Bucket `room-images`
1. **Name**: `room-images`
2. **Public bucket**: ✅ **Zaznacz** (bucket musi być publiczny)
3. **File size limit**: `5242880` (5MB w bajtach)
4. **Allowed MIME types**: `image/jpeg`
5. Kliknij **Save**

## 🔐 Konfiguracja Polityk Dostępu (RLS)

Supabase automatycznie włączy Row Level Security dla bucket. Musisz utworzyć polityki dostępu **OSOBNO dla każdej operacji**.

### 1. Przejdź do Polityk Storage
1. W Storage kliknij na **Policies**
2. Znajdź sekcję **storage.objects**
3. Kliknij **New Policy**

### 2. Dodaj Polityki Krok Po Kroku

**WAŻNE**: Każdą politykę dodaj osobno przez interfejs Supabase!

#### Polityka 1: Upload (INSERT)
**New Policy** → **Custom**
- **Policy name**: `Allow room image uploads`
- **Allowed operation**: `INSERT`
- **Target roles**: `anon` (lub zostaw puste)
- **USING expression**: zostaw puste
- **WITH CHECK expression**:
```sql
bucket_id = 'room-images'
```

#### Polityka 2: Odczyt (SELECT) 
**New Policy** → **Custom**
- **Policy name**: `Allow room image reads`
- **Allowed operation**: `SELECT`  
- **Target roles**: `anon` (lub zostaw puste)
- **USING expression**:
```sql
bucket_id = 'room-images'
```
- **WITH CHECK expression**: zostaw puste

#### Polityka 3: Usuwanie (DELETE)
**New Policy** → **Custom**
- **Policy name**: `Allow room image deletes`
- **Allowed operation**: `DELETE`
- **Target roles**: `anon` (lub zostaw puste)  
- **USING expression**:
```sql
bucket_id = 'room-images'
```
- **WITH CHECK expression**: zostaw puste

### 3. Jeśli nadal nie działa - Uproszczona Wersja

Przejdź do **SQL Editor** i wykonaj:

```sql
-- Usuń wszystkie istniejące polityki dla room-images
DROP POLICY IF EXISTS "Allow room image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow room image reads" ON storage.objects; 
DROP POLICY IF EXISTS "Allow room image deletes" ON storage.objects;

-- Dodaj bardzo proste polityki
CREATE POLICY "room_images_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'room-images');

CREATE POLICY "room_images_select" ON storage.objects  
FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "room_images_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'room-images');
```

## ⚙️ Weryfikacja Konfiguracji

### 1. Sprawdź Bucket
1. Przejdź do **Storage** → **room-images**
2. Sprawdź czy bucket jest oznaczony jako **Public**

### 2. Test Upload
1. Uruchom aplikację
2. Przejdź do dowolnego pokoju
3. Spróbuj dodać zdjęcie przez **Upload**
4. Sprawdź czy zdjęcie pojawia się w Storage

### 3. Sprawdź URL
Publiczne URL-e powinny mieć format:
```
https://kkomsualkaezfvuhonma.supabase.co/storage/v1/object/public/room-images/room-abc123-1234567890-xyz456.jpg
```

## 🚨 Ważne Uwagi

### Bezpieczeństwo
- Bucket jest **publiczny** - każdy z linkiem może zobaczyć zdjęcia
- Pliki są przechowywane z unikalną nazwą (UUID + timestamp)
- Obsługiwane tylko pliki JPG do 5MB

### Ograniczenia
- **Format**: Tylko JPG/JPEG
- **Rozmiar**: Maksymalnie 5MB na plik
- **Nazewnictwo**: Automatyczne (room-{roomId}-{timestamp}-{random}.jpg)

### Troubleshooting
- **403 Błąd uploadu**: Sprawdź polityki Storage
- **404 Błąd obrazka**: Sprawdź czy bucket jest publiczny
- **File too large**: Sprawdź limit rozmiaru w bucket settings

## 🔄 Jeśli coś nie działa

### 1. NAJPROSTSZE ROZWIĄZANIE - Wyłącz RLS
W **SQL Editor** wykonaj:
```sql
-- Wyłącz RLS dla storage.objects (tylko dla room-images)
-- Ta opcja jest najłatwiejsza ale mniej bezpieczna
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### 2. Sprawdź istniejące polityki
W **SQL Editor** sprawdź co masz:
```sql
-- Zobacz wszystkie polityki dla storage
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. Usuń wszystkie polityki i zacznij od nowa
```sql
-- Usuń WSZYSTKIE polityki storage
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP; 
END $$;

-- Dodaj tylko podstawowe polityki
CREATE POLICY "room_images_all" ON storage.objects
FOR ALL USING (bucket_id = 'room-images')
WITH CHECK (bucket_id = 'room-images');
```

### 2. Sprawdź Bucket Settings
- Bucket musi być **Public**
- File size limit: **5242880** (5MB)
- Allowed MIME types: **image/jpeg**

### 3. Sprawdź Network Tab
W Dev Tools sprawdź czy zapytania do Storage zwracają błędy 401/403.
