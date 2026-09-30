-- ==============================================================================
-- 0021_p1_patient_registration.sql
-- P1 Fix #1: Persist Front Desk Patient Registration
-- ==============================================================================
-- Changes:
--   1. generate_tenant_mrn() SECURITY DEFINER helper for atomic MRN generation.
--   2. Fix appointments INSERT RLS: the original front_desk_manage_appts policy
--      used only USING (covers SELECT/UPDATE/DELETE) — add WITH CHECK for INSERT.
-- ==============================================================================

-- ── 1. MRN Generator ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_tenant_mrn(p_tenant_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  v_count  BIGINT;
  v_mrn    TEXT;
BEGIN
  IF p_tenant_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM patients WHERE tenant_id = p_tenant_id;
  ELSE
    SELECT COUNT(*) INTO v_count FROM patients;
  END IF;

  -- Zero-pad to 8 digits; starts at 00000001
  v_mrn := LPAD((v_count + 1)::TEXT, 8, '0');

  RETURN v_mrn;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ── 2. Fix appointments INSERT RLS ─────────────────────────────────────────────
-- The original policy only had USING (applies to SELECT/UPDATE/DELETE).
-- Front desk staff need INSERT access too.  We drop and recreate idempotently.

DROP POLICY IF EXISTS "front_desk_manage_appts" ON appointments;

-- Recreate with both USING (read/update/delete) and WITH CHECK (insert)
CREATE POLICY "front_desk_manage_appts" ON appointments
  FOR ALL
  USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('front_desk', 'admin')
  )
  WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('front_desk', 'admin')
  );

-- ── 3. Fix patients RLS to use SECURITY DEFINER helpers (avoid recursion) ─────
-- The original front_desk_insert_patients policy uses inline subqueries which
-- can trigger the recursion issue fixed in 0020. Replace with helpers.

DROP POLICY IF EXISTS "front_desk_insert_patients" ON patients;

CREATE POLICY "front_desk_insert_patients" ON patients
  FOR INSERT WITH CHECK (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() IN ('front_desk', 'admin', 'doctor')
  );

-- Also fix staff_read_patients policy for consistency
DROP POLICY IF EXISTS "staff_read_patients" ON patients;

CREATE POLICY "staff_read_patients" ON patients
  FOR SELECT USING (
    tenant_id = get_auth_tenant_id()
    AND get_auth_role() != 'patient'
  );
