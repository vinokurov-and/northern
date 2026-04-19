CREATE TABLE IF NOT EXISTS cta_events (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'cta_id' TEXT NOT NULL,
    'path' TEXT,
    'anon_id' TEXT,
    'user_agent' TEXT,
    'referer' TEXT,
    'ip_hash' TEXT,
    'created_at' TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cta_events_created_at ON cta_events(created_at);
CREATE INDEX IF NOT EXISTS idx_cta_events_cta_id ON cta_events(cta_id);
