-- 0014_audit_log.sql — HIPAA-compliant write-only audit trail
-- All PHI access events are captured via triggers. No manual inserts/updates/deletes.

CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  user_id       UUID,           -- profiles.id (may be null for system actions)
  user_role     user_role,
  action        TEXT NOT NULL,  -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGNOUT'
  resource_type TEXT NOT NULL,  -- table name e.g. 'patients', 'consultations'
  resource_id   UUID,           -- primary key of affected row
  description   TEXT,           -- human-readable summary
  ip_address    INET,
  user_agent    TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS UPDATE/DELETE — log is write-only. Admins can read.
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_audit_logs" ON audit_logs
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Deny all writes from application layer (triggers only)
CREATE POLICY "deny_application_writes" ON audit_logs
  FOR INSERT WITH CHECK (FALSE);

-- Trigger function to log patient record access
CREATE OR REPLACE FUNCTION log_patient_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (tenant_id, user_id, user_role, action, resource_type, resource_id, description)
  SELECT
    NEW.tenant_id,
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    TG_OP || ' on ' || TG_TABLE_NAME || ' for patient ' || NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach to sensitive tables
CREATE TRIGGER audit_consultations AFTER INSERT OR UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION log_patient_access();
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION log_patient_access();
CREATE TRIGGER audit_lab_orders    AFTER INSERT OR UPDATE ON lab_orders    FOR EACH ROW EXECUTE FUNCTION log_patient_access();
