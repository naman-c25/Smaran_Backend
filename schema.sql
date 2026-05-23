-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full access to all features and user management')
  ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description) VALUES
  ('user', 'Can manage own memories and profile')
  ON CONFLICT (name) DO NOTHING;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  tags_people TEXT[] DEFAULT '{}',
  tags_topics TEXT[] DEFAULT '{}',
  tags_mood TEXT[] DEFAULT '{}',
  tags_location TEXT[] DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW(),
  date_label VARCHAR(10),
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_tags_people ON memories USING GIN(tags_people);
CREATE INDEX IF NOT EXISTS idx_memories_tags_topics ON memories USING GIN(tags_topics);
CREATE INDEX IF NOT EXISTS idx_memories_tags_mood ON memories USING GIN(tags_mood);
CREATE INDEX IF NOT EXISTS idx_memories_tags_location ON memories USING GIN(tags_location);
CREATE INDEX IF NOT EXISTS idx_memories_date_label ON memories(date_label);
