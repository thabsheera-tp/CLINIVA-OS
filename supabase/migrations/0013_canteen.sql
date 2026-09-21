-- 0013_canteen.sql — Canteen meal orders, menu, kitchen inventory

CREATE TABLE canteen_menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'main_course'
    CHECK (category IN ('breakfast', 'main_course', 'side', 'beverage', 'dessert', 'snack')),
  description     TEXT,
  price           NUMERIC(8, 2),
  is_vegetarian   BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  image_url       TEXT
);

CREATE TABLE meal_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  bed_id          UUID REFERENCES beds(id),
  meal_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_slot       TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  dietary_flag    dietary_flag NOT NULL DEFAULT 'none',
  special_instructions TEXT,
  status          meal_status NOT NULL DEFAULT 'ordered',
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  prepared_at     TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  prepared_by     UUID REFERENCES profiles(id)
);

CREATE TABLE meal_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_order_id   UUID NOT NULL REFERENCES meal_orders(id) ON DELETE CASCADE,
  menu_item_id    UUID NOT NULL REFERENCES canteen_menu_items(id),
  quantity        SMALLINT NOT NULL DEFAULT 1,
  customization   TEXT
);

CREATE TABLE canteen_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  item_name       TEXT NOT NULL,
  unit            TEXT NOT NULL,     -- kg, litre, pieces
  quantity        NUMERIC(8, 2) NOT NULL DEFAULT 0,
  reorder_level   NUMERIC(8, 2) NOT NULL DEFAULT 0,
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX meal_orders_tenant_date_idx ON meal_orders(tenant_id, meal_date);
CREATE INDEX meal_orders_bed_idx ON meal_orders(bed_id, meal_date);

ALTER TABLE meal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canteen_staff_manage_orders" ON meal_orders
  USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('canteen', 'nurse', 'admin')
  );
