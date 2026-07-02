CREATE TABLE IF NOT EXISTS roi_emails_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  roi_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  questions_count INTEGER NOT NULL DEFAULT 0,
  email_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, week_start)
);
