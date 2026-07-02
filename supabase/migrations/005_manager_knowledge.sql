-- Manager knowledge: stores answers managers teach Sidekick via SMS replies
CREATE TABLE IF NOT EXISTS manager_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  worker_question TEXT NOT NULL,
  manager_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  source_conversation_id TEXT
);

CREATE INDEX idx_manager_knowledge_company ON manager_knowledge(company_id);

-- Pending learn sessions: tracks when Sidekick is waiting for a manager to teach it
CREATE TABLE IF NOT EXISTS pending_learn_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  manager_phone TEXT NOT NULL,
  worker_phone TEXT NOT NULL,
  original_question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour')
);

CREATE INDEX idx_pending_learn_phone ON pending_learn_sessions(manager_phone, company_id);
