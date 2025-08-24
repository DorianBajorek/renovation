-- Clear existing database
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table with user relationship
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'completed')),
  icon VARCHAR(50) DEFAULT 'Home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table with user and project relationships
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Sofa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table with room relationship
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'purchased', 'installed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_rooms_project_id ON rooms(project_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_room_id ON products(room_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- Create unique constraints to prevent duplicates (commented out for now)
-- CREATE UNIQUE INDEX idx_rooms_user_name ON rooms(user_id, name);
-- CREATE UNIQUE INDEX idx_projects_user_name ON projects(user_id, name);

-- Insert sample user
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
  ('test@example.com', '$2b$10$example.hash.here', 'Jan', 'Kowalski');

-- Insert sample projects for the test user
INSERT INTO projects (user_id, name, description, budget, start_date, end_date, status, icon) VALUES
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Remont Mieszkania', 'Kompleksowy remont 3-pokojowego mieszkania', 15000, '2024-01-15', '2024-06-30', 'active', 'Home'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Renowacja Domu', 'Renowacja starego domu jednorodzinnego', 45000, '2024-03-01', '2024-12-31', 'planning', 'Building'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Modernizacja Biura', 'Modernizacja przestrzeni biurowej', 25000, '2024-02-01', '2024-05-15', 'completed', 'Briefcase');

-- Insert sample rooms for the test user (some assigned to projects, some not)
INSERT INTO rooms (user_id, project_id, name, budget, icon) VALUES
  ((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM projects WHERE name = 'Remont Mieszkania' LIMIT 1), 'Salon', 1250, 'Sofa'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM projects WHERE name = 'Remont Mieszkania' LIMIT 1), 'Sypialnia', 870, 'Bed'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM projects WHERE name = 'Remont Mieszkania' LIMIT 1), 'Łazienka', 430, 'Bath'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM projects WHERE name = 'Renowacja Domu' LIMIT 1), 'Kuchnia', 650, 'Utensils'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), NULL, 'Garaż', 1200, 'Car');

-- Insert sample products for the test rooms
INSERT INTO products (room_id, name, description, price, quantity, category, status) VALUES
  ((SELECT id FROM rooms WHERE name = 'Salon' LIMIT 1), 'Sofa 3-osobowa', 'Nowoczesna sofa w kolorze szarym', 2500, 1, 'Meble', 'planned'),
  ((SELECT id FROM rooms WHERE name = 'Salon' LIMIT 1), 'Stolik kawowy', 'Drewniany stolik kawowy', 450, 1, 'Meble', 'purchased'),
  ((SELECT id FROM rooms WHERE name = 'Sypialnia' LIMIT 1), 'Łóżko 160x200', 'Łóżko z szufladami', 1200, 1, 'Meble', 'planned'),
  ((SELECT id FROM rooms WHERE name = 'Sypialnia' LIMIT 1), 'Materac', 'Materac ortopedyczny', 800, 1, 'Wyposażenie', 'purchased'),
  ((SELECT id FROM rooms WHERE name = 'Łazienka' LIMIT 1), 'Umbrella', 'Umbrella pod prysznic', 150, 1, 'Sanitariaty', 'installed'),
  ((SELECT id FROM rooms WHERE name = 'Kuchnia' LIMIT 1), 'Blat kuchenny', 'Blat granitowy 3m', 1800, 1, 'Wykończenie', 'planned');
