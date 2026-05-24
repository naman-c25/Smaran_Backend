-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop old tables if exist (fresh start)
DROP TABLE IF EXISTS memory_connections CASCADE;
DROP TABLE IF EXISTS memories CASCADE;

-- Main memories table
CREATE TABLE memories (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_text          TEXT NOT NULL,
    summary           TEXT,
    people            TEXT[] DEFAULT '{}',
    topics            TEXT[] DEFAULT '{}',
    mood              TEXT,
    location          TEXT[] DEFAULT '{}',
    date_label        TEXT,
    recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds  INT,
    embedding         vector(768),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Connections between memories (pattern detection)
CREATE TABLE memory_connections (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_a         UUID REFERENCES memories(id) ON DELETE CASCADE,
    memory_b         UUID REFERENCES memories(id) ON DELETE CASCADE,
    connection_type  TEXT,
    pattern          TEXT,
    insight          TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON memories USING GIN(people);
CREATE INDEX ON memories USING GIN(topics);
CREATE INDEX ON memories (user_id);
CREATE INDEX ON memories (date_label);