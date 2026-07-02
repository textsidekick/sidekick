-- Migration 005: Multilingual support + WhatsApp channel support

-- Companies: default language and preferred messaging channel
ALTER TABLE companies ADD COLUMN IF NOT EXISTS default_language text NOT NULL DEFAULT 'en';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS preferred_channel text NOT NULL DEFAULT 'sms';

-- Conversations: per-conversation language and channel tracking
-- (conversations table may not exist; use questions table which tracks interactions)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS channel text DEFAULT 'sms';

-- Workers: remember detected language preference
ALTER TABLE workers ADD COLUMN IF NOT EXISTS preferred_language text;
