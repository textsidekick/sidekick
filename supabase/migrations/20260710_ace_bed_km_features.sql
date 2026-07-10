-- ============================================================
-- ACE BED / KM PIVOT: SOP Versioning, Training Paths, Departments
-- ============================================================

-- 1. Departments table (cross-department support)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#C96442',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- 2. Add department_id to workers (optional FK)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS department_name TEXT;

-- 3. SOPs table with full versioning
CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  -- Identity (all versions share the same slug within a company)
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  -- Content
  content TEXT NOT NULL,
  -- Versioning
  version_number INT NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','deprecated')),
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en',
  category TEXT,
  -- Authoring
  created_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(content,''))
  ) STORED
);

-- Ensure only one "current" version per slug per company
CREATE UNIQUE INDEX IF NOT EXISTS sops_current_slug_company_idx
  ON sops(company_id, slug)
  WHERE is_current = TRUE AND status = 'active';

-- Full-text search index
CREATE INDEX IF NOT EXISTS sops_search_idx ON sops USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS sops_company_idx ON sops(company_id);
CREATE INDEX IF NOT EXISTS sops_slug_company_idx ON sops(company_id, slug);

-- 4. Training paths
CREATE TABLE IF NOT EXISTS training_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT, -- e.g. "new production worker", "quality inspector"
  estimated_days INT DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS training_paths_company_idx ON training_paths(company_id);

-- 5. Training path steps (ordered learning modules)
CREATE TABLE IF NOT EXISTS training_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_path_id UUID NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  step_order INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- The actual learning content (delivered over SMS)
  sop_id UUID REFERENCES sops(id) ON DELETE SET NULL, -- optional linked SOP
  quiz_questions JSONB DEFAULT '[]', -- simple Q&A quiz
  required_before_next BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_minutes INT DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(training_path_id, step_order)
);

-- 6. Worker training progress
CREATE TABLE IF NOT EXISTS worker_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_phone TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  training_path_id UUID NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed','paused')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  step_completions JSONB DEFAULT '{}', -- {stepId: completedAt}
  notes TEXT,
  assigned_by TEXT,
  UNIQUE(worker_phone, training_path_id)
);

CREATE INDEX IF NOT EXISTS wtp_company_idx ON worker_training_progress(company_id);
CREATE INDEX IF NOT EXISTS wtp_worker_idx ON worker_training_progress(worker_phone);

-- 7. Custom terminology / glossary
CREATE TABLE IF NOT EXISTS company_terminology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  aliases TEXT[] DEFAULT '{}', -- alternative names for this term
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, term)
);

CREATE INDEX IF NOT EXISTS terminology_company_idx ON company_terminology(company_id);

-- 8. SOP access log (for KM analytics)
CREATE TABLE IF NOT EXISTS sop_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  worker_phone TEXT,
  worker_name TEXT,
  channel TEXT NOT NULL DEFAULT 'sms', -- 'sms','dashboard','api'
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sop_access_log_sop_idx ON sop_access_log(sop_id);
CREATE INDEX IF NOT EXISTS sop_access_log_company_idx ON sop_access_log(company_id);
