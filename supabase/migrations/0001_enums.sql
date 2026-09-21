-- 0001_enums.sql — Cliniva OS shared enum types
-- These enums are shared across all tenant tables and must be created first.

-- Appointment / token status
CREATE TYPE appt_status AS ENUM (
  'scheduled',
  'checked_in',
  'in_consultation',
  'completed',
  'no_show',
  'cancelled'
);

-- Bed occupancy status
CREATE TYPE bed_status AS ENUM (
  'available',
  'occupied',
  'maintenance',
  'reserved'
);

-- Prescription / order line status
CREATE TYPE rx_status AS ENUM (
  'pending',
  'verified',
  'dispensed',
  'cancelled'
);

-- Lab order status
CREATE TYPE lab_order_status AS ENUM (
  'ordered',
  'sample_collected',
  'processing',
  'resulted',
  'reported',
  'cancelled'
);

-- Lab result severity flag (for critical value notifications)
CREATE TYPE lab_severity AS ENUM (
  'normal',
  'low',
  'high',
  'critical_low',
  'critical_high'
);

-- Gender
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- User roles (maps to RLS policies and middleware routing)
CREATE TYPE user_role AS ENUM (
  'doctor',
  'front_desk',
  'nurse',
  'pharmacist',
  'lab_tech',
  'cashier',
  'admin',
  'canteen',
  'patient'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'partial',
  'paid',
  'refunded',
  'waived',
  'insurance_pending'
);

-- Dietary restriction flags
CREATE TYPE dietary_flag AS ENUM (
  'none',
  'vegetarian',
  'vegan',
  'diabetic',
  'low_sodium',
  'low_fat',
  'gluten_free',
  'npo',
  'soft_diet',
  'liquid_only'
);

-- Meal delivery status
CREATE TYPE meal_status AS ENUM (
  'ordered',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);
