-- Kompletny schemat bazy danych dla aplikacji Remotrack z obsługą Google OAuth
-- Ten plik zawiera wszystko - usuwa istniejące tabele i tworzy nowe

-- Usuń istniejące tabele i funkcje
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS project_shares CASCADE;
DROP TABLE IF EXISTS project_permissions CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_room_expenses() CASCADE;
DROP FUNCTION IF EXISTS get_project_expenses() CASCADE;

-- Usuń WSZYSTKIE możliwe wersje funkcji handle_new_user aby uniknąć konfliktów
DROP FUNCTION IF EXISTS handle_new_user(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(CHARACTER VARYING, CHARACTER VARYING, CHARACTER VARYING) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(CHARACTER VARYING(255), CHARACTER VARYING(100), CHARACTER VARYING(100)) CASCADE;

-- Usuń wersję z 4 parametrami która powoduje konflikty
DROP FUNCTION IF EXISTS handle_new_user(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(CHARACTER VARYING, CHARACTER VARYING, CHARACTER VARYING, CHARACTER VARYING) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user(CHARACTER VARYING(255), CHARACTER VARYING(100), CHARACTER VARYING(100), CHARACTER VARYING(255)) CASCADE;

-- Usuń inne możliwe wersje
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Utwórz tabelę użytkowników z obsługą Google OAuth
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL dla użytkowników Google OAuth
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500), -- URL do avataru użytkownika (dla Google OAuth)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utwórz tabelę projektów
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'planning', 'completed')),
  icon VARCHAR(50) DEFAULT 'Home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utwórz tabelę udostępniania projektów
CREATE TABLE project_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_type VARCHAR(20) NOT NULL CHECK (permission_type IN ('read', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, shared_with_id)
);

-- Utwórz tabelę pokoi
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Sofa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utwórz tabelę produktów
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'purchased')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utwórz funkcję do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Utwórz funkcję do obliczania wydatków pokoju
CREATE OR REPLACE FUNCTION get_room_expenses(room_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(price * quantity) 
     FROM products 
     WHERE room_id = room_uuid), 
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Utwórz funkcję do obliczania wydatków projektu
CREATE OR REPLACE FUNCTION get_project_expenses(project_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(p.price * p.quantity) 
     FROM products p
     JOIN rooms r ON p.room_id = r.id
     WHERE r.project_id = project_uuid), 
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Utwórz triggery dla automatycznej aktualizacji updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_shares_updated_at BEFORE UPDATE ON project_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Utwórz indeksy dla lepszej wydajności
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_rooms_project_id ON rooms(project_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_room_id ON products(room_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_project_shares_project_id ON project_shares(project_id);
CREATE INDEX idx_project_shares_shared_with_id ON project_shares(shared_with_id);
CREATE INDEX idx_project_shares_owner_id ON project_shares(owner_id);

-- Dodaj komentarz wyjaśniający obsługę Google OAuth
COMMENT ON COLUMN users.password_hash IS 'Password hash for regular users, NULL or google_oauth_user for Google OAuth users';

-- Opcjonalne: Dodaj przykładowe dane (zakomentowane)
-- INSERT INTO users (email, password_hash, first_name, last_name) VALUES 
--   ('admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJhHm2O', 'Admin', 'User');

-- INSERT INTO projects (user_id, name, description, budget, status) VALUES 
--   ((SELECT id FROM users WHERE email = 'admin@example.com'), 'Mój pierwszy projekt', 'Opis projektu', 50000.00, 'active');

-- Funkcja RPC do obsługi nowych użytkowników Google OAuth
-- Użyj konkretnych typów danych aby uniknąć konfliktów
CREATE OR REPLACE FUNCTION handle_new_user(
  user_email VARCHAR(255),
  user_first_name VARCHAR(100),
  user_last_name VARCHAR(100)
)
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_user RECORD;
  new_user RECORD;
BEGIN
  -- Sprawdź czy użytkownik już istnieje w public.users
  SELECT u.* INTO existing_user FROM users u WHERE u.email = user_email;
  
  IF FOUND THEN
    -- Użytkownik istnieje - zwróć jego dane
    RETURN QUERY SELECT 
      existing_user.id, 
      existing_user.email, 
      existing_user.first_name, 
      existing_user.last_name, 
      existing_user.created_at;
    RETURN;
  END IF;
  
  -- Użytkownik nie istnieje - utwórz nowego
  INSERT INTO users (email, first_name, last_name, password_hash)
  VALUES (user_email, user_first_name, user_last_name, 'google_oauth_user')
  RETURNING users.id, users.email, users.first_name, users.last_name, users.created_at INTO new_user;
  
  RETURN QUERY SELECT 
    new_user.id, 
    new_user.email, 
    new_user.first_name, 
    new_user.last_name, 
    new_user.created_at;
END;
$$;

-- Wyłącz RLS na tabeli users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create function for regular user registration (with password)
CREATE OR REPLACE FUNCTION register_user(
  user_email VARCHAR(255),
  user_password_hash VARCHAR(255),
  user_first_name VARCHAR(100),
  user_last_name VARCHAR(100)
)
RETURNS TABLE (
  id UUID,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  new_user_email VARCHAR(255);
  new_user_first_name VARCHAR(100);
  new_user_last_name VARCHAR(100);
  new_user_created_at TIMESTAMPTZ;
BEGIN
  -- Użytkownik nie istnieje - utwórz nowego z hasłem
  INSERT INTO users (email, password_hash, first_name, last_name)
  VALUES (user_email, user_password_hash, user_first_name, user_last_name)
  RETURNING 
    users.id, 
    users.email, 
    users.first_name, 
    users.last_name, 
    users.created_at 
  INTO 
    new_user_id,
    new_user_email,
    new_user_first_name,
    new_user_last_name,
    new_user_created_at;
  
  RETURN QUERY SELECT 
    new_user_id, 
    new_user_email, 
    new_user_first_name, 
    new_user_last_name, 
    new_user_created_at;
END;
$$;
