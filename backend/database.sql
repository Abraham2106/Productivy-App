-- ============================================================
-- Productivity App — Database Schema (Sprint 1)
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE task_type AS ENUM ('BASE', 'ADDITIONAL');

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  task_type task_type NOT NULL DEFAULT 'BASE',
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  sleep_hours FLOAT,
  phone_minutes INTEGER,
  study_minutes INTEGER,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS score_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_score_id UUID REFERENCES daily_scores(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  points INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  frequency_7d INTEGER NOT NULL DEFAULT 0,
  frequency_30d INTEGER NOT NULL DEFAULT 0,
  classification TEXT CHECK (classification IN ('positive', 'negative', 'neutral')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_patterns_user ON habit_patterns(user_id);
