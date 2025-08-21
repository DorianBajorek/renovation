-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Sofa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO rooms (name, budget, icon) VALUES
  ('Salon', 1250, 'Sofa'),
  ('Sypialnia', 870, 'Bed'),
  ('Łazienka', 430, 'Bath'),
  ('Kuchnia', 650, 'Utensils');

INSERT INTO projects (name, description, budget, start_date, end_date, status, rooms, icon) VALUES
  ('Remont Mieszkania', 'Kompleksowy remont 3-pokojowego mieszkania', 15000, '2024-01-15', '2024-06-30', 'active', ARRAY['Salon', 'Sypialnia', 'Łazienka', 'Kuchnia'], 'Home'),
  ('Renowacja Domu', 'Renowacja starego domu jednorodzinnego', 45000, '2024-03-01', '2024-12-31', 'planning', ARRAY['Salon', 'Sypialnia', 'Łazienka'], 'Building'),
  ('Modernizacja Biura', 'Modernizacja przestrzeni biurowej', 25000, '2024-02-01', '2024-05-15', 'completed', ARRAY['Salon', 'Kuchnia'], 'Briefcase');
