-- Manager Users table
CREATE TABLE IF NOT EXISTS manager_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manager Sessions table
CREATE TABLE IF NOT EXISTS manager_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES manager_users(id),
  company_id TEXT NOT NULL REFERENCES companies(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_manager_users_username ON manager_users(username);
CREATE INDEX IF NOT EXISTS idx_manager_users_company ON manager_users(company_id);
CREATE INDEX IF NOT EXISTS idx_manager_sessions_token ON manager_sessions(token);
CREATE INDEX IF NOT EXISTS idx_manager_sessions_expires ON manager_sessions(expires_at);
