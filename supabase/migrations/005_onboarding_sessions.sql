-- SMS-based onboarding sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  phone TEXT PRIMARY KEY,
  step INT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  company_id UUID
);
