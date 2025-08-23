-- Clear existing database
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

-- Create rooms table with user relationship
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Sofa',
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
  rooms TEXT[] DEFAULT '{}',
  icon VARCHAR(50) DEFAULT 'Home',
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

-- Create indexes for better performance
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Create unique constraints to prevent duplicates (commented out for now)
-- CREATE UNIQUE INDEX idx_rooms_user_name ON rooms(user_id, name);
-- CREATE UNIQUE INDEX idx_projects_user_name ON projects(user_id, name);

-- Insert sample user
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
  ('test@example.com', '$2b$10$example.hash.here', 'Jan', 'Kowalski');

-- Insert sample data for the test user
INSERT INTO rooms (user_id, name, budget, icon) VALUES
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Salon', 1250, 'Sofa'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Sypialnia', 870, 'Bed'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Łazienka', 430, 'Bath'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Kuchnia', 650, 'Utensils');

INSERT INTO projects (user_id, name, description, budget, start_date, end_date, status, rooms, icon) VALUES
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Remont Mieszkania', 'Kompleksowy remont 3-pokojowego mieszkania', 15000, '2024-01-15', '2024-06-30', 'active', ARRAY['Salon', 'Sypialnia', 'Łazienka', 'Kuchnia'], 'Home'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Renowacja Domu', 'Renowacja starego domu jednorodzinnego', 45000, '2024-03-01', '2024-12-31', 'planning', ARRAY['Salon', 'Sypialnia', 'Łazienka'], 'Building'),
  ((SELECT id FROM users WHERE email = 'test@example.com'), 'Modernizacja Biura', 'Modernizacja przestrzeni biurowej', 25000, '2024-02-01', '2024-05-15', 'completed', ARRAY['Salon', 'Kuchnia'], 'Briefcase');
