-- Cross-plant learning: anonymized failure patterns
CREATE TABLE IF NOT EXISTS failure_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_type text NOT NULL,
  manufacturer text,
  model text,
  failure_category text,
  symptoms text,
  root_cause text,
  fix_applied text,
  repair_time_minutes integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_failure_patterns_equipment ON failure_patterns(equipment_type);
CREATE INDEX IF NOT EXISTS idx_failure_patterns_mfg ON failure_patterns(equipment_type, manufacturer);
