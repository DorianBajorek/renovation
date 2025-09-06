# 🔧 Debug Supabase Storage - Krok po kroku

## Problem: Polityki Storage nie działają

### Krok 1: Sprawdź jakie polityki masz obecnie
W **SQL Editor** wklej i wykonaj:
```sql
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
```

### Krok 2: Sprawdź czy bucket istnieje i jest publiczny
```sql
SELECT * FROM storage.buckets WHERE name = 'room-images';
```
**Wynik powinien pokazać**: `public = true`

### Krok 3: Usuń WSZYSTKIE polityki i zacznij od nowa
```sql
-- Usuń wszystkie polityki storage (może być dużo)
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP; 
END $$;
```

### Krok 4: Dodaj jedną prostą politykę na wszystko
```sql
CREATE POLICY "room_images_full_access" ON storage.objects
FOR ALL 
USING (bucket_id = 'room-images')
WITH CHECK (bucket_id = 'room-images');
```

### Krok 5: Sprawdź czy polityka została dodana
```sql
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname = 'room_images_full_access';
```

## Jeśli nadal nie działa - PLAN B

### Opcja 1: Wyłącz RLS kompletnie (najmniej bezpieczne, ale działa)
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### Opcja 2: Sprawdź ustawienia bucket dokładnie
```sql
-- Pokaż wszystkie szczegóły bucket
SELECT id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'room-images';
```

**Sprawdź czy**:
- `public = true`
- `file_size_limit = 5242880` (5MB) lub `null`
- `allowed_mime_types` zawiera `image/jpeg` lub jest `null`

### Opcja 3: Sprawdź w Network Tab przeglądarki
1. Otwórz Dev Tools (F12)
2. Przejdź do **Network**
3. Spróbuj uploadować plik
4. Szukaj zapytania do `/storage/v1/object/room-images/...`
5. Sprawdź status code:
   - **403**: Problem z politykami
   - **413**: Plik za duży
   - **400**: Nieprawidłowy typ pliku
   - **401**: Problem z autoryzacją

## Test Upload przez SQL

Możesz przetestować storage bezpośrednio:
```sql
-- Test czy możesz dodać rekord do storage.objects
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES ('room-images', 'test-file.jpg', null, '{}');

-- Usuń test
DELETE FROM storage.objects 
WHERE bucket_id = 'room-images' AND name = 'test-file.jpg';
```

## Kontakt z błędem

Jeśli nic nie pomaga, sprawdź **Logs** w Supabase:
1. Przejdź do **Logs** w dashboard
2. Filtruj po **Storage**  
3. Spróbuj uploadować plik
4. Zobacz co pokazuje w logach
