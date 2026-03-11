-- Create table for tracking manual backup verification checks
CREATE TABLE IF NOT EXISTS backup_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL, -- 'Success', 'Failure', 'Maintenance'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE backup_verification_logs ENABLE ROW LEVEL SECURITY;

-- Only Admin / Super Admin roles (stored in app_metadata) can manage these logs
DROP POLICY IF EXISTS "Admins can manage backup logs" ON backup_verification_logs;
CREATE POLICY "Admins can manage backup logs" ON backup_verification_logs
  FOR ALL TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'app_role' IN ('Admin', 'Super Admin')
  )
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'app_role' IN ('Admin', 'Super Admin')
  );

COMMENT ON TABLE backup_verification_logs IS 'Internal log for recording manual database backup health checks and recovery tests.';
