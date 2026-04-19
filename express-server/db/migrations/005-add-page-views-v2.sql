CREATE TABLE IF NOT EXISTS page_views_v2 (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'path' TEXT NOT NULL,
    'anon_id' TEXT,
    'user_agent' TEXT,
    'referer' TEXT,
    'ip_hash' TEXT,
    'created_at' TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_v2_created_at ON page_views_v2(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_v2_path ON page_views_v2(path);
CREATE INDEX IF NOT EXISTS idx_page_views_v2_anon_id ON page_views_v2(anon_id);
