-- 0002_tenants.sql — Multi-tenant clinic registry
-- Each clinic is a "tenant". All other tables reference tenant_id via RLS.

CREATE TABLE clinics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE, -- used in subdomain routing e.g., stjude.cliniva.os
  address      TEXT,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,
  -- Subscription / plan tier
  plan_tier    TEXT NOT NULL DEFAULT 'base'
    CHECK (plan_tier IN ('base', 'premium', 'enterprise')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-clinic feature flags (module on/off toggles, configurable by admin)
CREATE TABLE clinic_settings (
  clinic_id    UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  key          TEXT NOT NULL,          -- e.g. 'module.canteen.enabled', 'queue.max_tokens'
  value        JSONB NOT NULL,         -- flexible: boolean, string, number, object
  updated_by   UUID,                   -- profiles.id of admin who made the change
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (clinic_id, key)
);

-- RLS: Service role bypasses, all other access restricted to tenant-scoped rows
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- Admins of a clinic can read/write their own clinic row
CREATE POLICY "tenant_admin_clinic" ON clinics
  USING (id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_read_clinic_settings" ON clinic_settings
  USING (clinic_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "tenant_admin_write_clinic_settings" ON clinic_settings
  FOR INSERT WITH CHECK (clinic_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
