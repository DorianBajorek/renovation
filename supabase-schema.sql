-- Clear existing database
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS project_shares CASCADE;
DROP TABLE IF EXISTS project_permissions CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_room_expenses() CASCADE;
DROP FUNCTION IF EXISTS get_project_expenses() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (compatible with Supabase Auth)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
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
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  icon VARCHAR(50) DEFAULT 'Home',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_shares table for sharing projects
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

-- Create rooms table with user and project relationships (removed budget field)
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
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
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'purchased')),
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

-- Create function to calculate room expenses
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

-- Create function to calculate project expenses
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

-- Create triggers for updated_at
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

-- Create indexes for better performance
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

-- Create unique constraints to prevent duplicates (commented out for now)
-- CREATE UNIQUE INDEX idx_rooms_user_name ON rooms(user_id, name);
-- CREATE UNIQUE INDEX idx_projects_user_name ON projects(user_id, name);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Rooms policies
CREATE POLICY "Users can view own rooms" ON rooms
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own rooms" ON rooms
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own rooms" ON rooms
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Products policies
CREATE POLICY "Users can view products in own rooms" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = products.room_id 
      AND rooms.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert products in own rooms" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = products.room_id 
      AND rooms.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update products in own rooms" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = products.room_id 
      AND rooms.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete products in own rooms" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = products.room_id 
      AND rooms.user_id::text = auth.uid()::text
    )
  );

-- Project shares policies
CREATE POLICY "Users can view shared projects" ON project_shares
  FOR SELECT USING (
    auth.uid()::text = owner_id::text OR 
    auth.uid()::text = shared_with_id::text
  );

CREATE POLICY "Users can share own projects" ON project_shares
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can update own shares" ON project_shares
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete own shares" ON project_shares
  FOR DELETE USING (auth.uid()::text = owner_id::text);

