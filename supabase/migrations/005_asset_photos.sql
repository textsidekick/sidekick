-- Asset photos table for equipment photo gallery
CREATE TABLE IF NOT EXISTS asset_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  company_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  issue_description TEXT,
  reported_by_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_photos_asset_id ON asset_photos(asset_id);
CREATE INDEX idx_asset_photos_company_id ON asset_photos(company_id);
CREATE INDEX idx_asset_photos_created_at ON asset_photos(created_at DESC);
