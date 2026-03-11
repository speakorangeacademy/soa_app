-- Centralized System Audit Logging Schema
-- NOTE: audit_logs table already exists with different column names.
-- This script adds the missing columns the app code relies on.

BEGIN;

-- Add missing columns to the existing audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (names differ from what we want) and recreate
DROP POLICY IF EXISTS "Super Admins can insert logs" ON audit_logs;
DROP POLICY IF EXISTS "Super Admins can view all logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role insert" ON audit_logs;
DROP POLICY IF EXISTS "Super Admin select" ON audit_logs;

-- Service role can insert (for server-side logging)
CREATE POLICY "Service role insert" ON audit_logs 
FOR INSERT TO service_role WITH CHECK (true);

-- Super Admins can view logs
CREATE POLICY "Super Admin select" ON audit_logs 
FOR SELECT TO authenticated
USING (auth.jwt() -> 'app_metadata' ->> 'app_role' = 'Super Admin');

COMMIT;
