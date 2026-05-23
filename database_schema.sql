-- VaiComigo! schema operacional inicial
-- Supabase/Postgres. Regras criticas devem ser chamadas por Edge Functions/RPC,
-- nunca decididas apenas pelo frontend.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE app_role AS ENUM ('passenger', 'driver', 'admin');
CREATE TYPE ride_status AS ENUM (
  'requested',
  'accepted',
  'driver_arrived',
  'started',
  'completed',
  'cancelled'
);
CREATE TYPE payment_method AS ENUM ('cash', 'driver_pix');
CREATE TYPE wallet_transaction_type AS ENUM (
  'ride_platform_fee',
  'driver_recharge',
  'manual_adjustment',
  'refund',
  'chargeback'
);
CREATE TYPE fraud_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL CHECK (char_length(state) = 2),
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  center_lat NUMERIC(9,6) NOT NULL,
  center_lng NUMERIC(9,6) NOT NULL,
  service_radius_km NUMERIC(8,2) NOT NULL CHECK (service_radius_km > 0),
  base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
  price_per_km NUMERIC(10,2) NOT NULL CHECK (price_per_km >= 0),
  price_per_min NUMERIC(10,2) NOT NULL CHECK (price_per_min >= 0),
  platform_fee_percent NUMERIC(5,2) NOT NULL CHECK (platform_fee_percent >= 0 AND platform_fee_percent <= 40),
  max_stops INTEGER NOT NULL DEFAULT 3 CHECK (max_stops BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'passenger',
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  lgpd_deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'blocked', 'rejected')),
  vehicle_model TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_color TEXT,
  vehicle_seats INTEGER NOT NULL CHECK (vehicle_seats BETWEEN 1 AND 7),
  pix_key TEXT,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT -30,
  billing_cycle_days INTEGER NOT NULL DEFAULT 7 CHECK (billing_cycle_days BETWEEN 1 AND 31),
  blocked_reason TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  default_city_id UUID REFERENCES cities(id),
  rating NUMERIC(3,2) NOT NULL DEFAULT 5 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id),
  passenger_id UUID NOT NULL REFERENCES passengers(id),
  driver_id UUID REFERENCES drivers(id),
  status ride_status NOT NULL DEFAULT 'requested',
  payment_method payment_method NOT NULL,
  origin GEOGRAPHY(POINT, 4326) NOT NULL,
  destination GEOGRAPHY(POINT, 4326) NOT NULL,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  route_geometry JSONB NOT NULL,
  quoted_distance_km NUMERIC(8,2) NOT NULL CHECK (quoted_distance_km > 0),
  quoted_duration_min INTEGER NOT NULL CHECK (quoted_duration_min > 0),
  quoted_price NUMERIC(10,2) NOT NULL CHECK (quoted_price >= 0),
  platform_fee NUMERIC(10,2) NOT NULL CHECK (platform_fee >= 0),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id),
  actor_user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created',
    'accepted',
    'driver_arrived',
    'started',
    'completed',
    'cancelled',
    'payment_confirmed',
    'rated'
  )),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  ride_id UUID REFERENCES rides(id),
  type wallet_transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance_before NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE driver_recharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  pix_txid TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE financial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  ride_id UUID REFERENCES rides(id),
  wallet_transaction_id UUID REFERENCES wallet_transactions(id),
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  actor_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ride_id UUID REFERENCES rides(id),
  event_type TEXT NOT NULL,
  severity fraud_severity NOT NULL DEFAULT 'low',
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id),
  driver_id UUID REFERENCES drivers(id),
  passenger_id UUID REFERENCES passengers(id),
  flag_type TEXT NOT NULL,
  severity fraud_severity NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id),
  reporter_user_id UUID NOT NULL REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cities_active ON cities (is_active);
CREATE INDEX idx_drivers_city_status ON drivers (city_id, status);
CREATE INDEX idx_rides_city_status ON rides (city_id, status);
CREATE INDEX idx_rides_origin ON rides USING GIST (origin);
CREATE INDEX idx_rides_destination ON rides USING GIST (destination);
CREATE INDEX idx_wallet_transactions_driver_created ON wallet_transactions (driver_id, created_at DESC);
CREATE INDEX idx_security_logs_created ON security_logs (created_at DESC);
CREATE INDEX idx_fraud_flags_open ON fraud_flags (created_at DESC) WHERE resolved_at IS NULL;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND is_blocked = false
      AND lgpd_deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION apply_ride_platform_fee(p_ride_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver_id UUID;
  v_fee NUMERIC(10,2);
  v_before NUMERIC(12,2);
  v_after NUMERIC(12,2);
  v_transaction_id UUID;
BEGIN
  SELECT driver_id, platform_fee INTO v_driver_id, v_fee
  FROM rides
  WHERE id = p_ride_id AND status = 'completed'
  FOR UPDATE;

  IF v_driver_id IS NULL THEN
    RAISE EXCEPTION 'Corrida sem motorista ou nao concluida.';
  END IF;

  SELECT wallet_balance INTO v_before
  FROM drivers
  WHERE id = v_driver_id
  FOR UPDATE;

  v_after := v_before - v_fee;

  UPDATE drivers
  SET wallet_balance = v_after,
      status = CASE WHEN v_after < credit_limit THEN 'blocked' ELSE status END,
      blocked_reason = CASE WHEN v_after < credit_limit THEN 'Saldo abaixo do limite de credito.' ELSE blocked_reason END,
      updated_at = now()
  WHERE id = v_driver_id;

  INSERT INTO wallet_transactions (
    driver_id,
    ride_id,
    type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    v_driver_id,
    p_ride_id,
    'ride_platform_fee',
    -v_fee,
    v_before,
    v_after,
    'Taxa da plataforma descontada apos corrida concluida.'
  )
  RETURNING id INTO v_transaction_id;

  INSERT INTO financial_audit_logs (
    driver_id,
    ride_id,
    wallet_transaction_id,
    action,
    before_data,
    after_data
  ) VALUES (
    v_driver_id,
    p_ride_id,
    v_transaction_id,
    'apply_ride_platform_fee',
    jsonb_build_object('wallet_balance', v_before),
    jsonb_build_object('wallet_balance', v_after)
  );

  RETURN v_transaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_wallet_transaction_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Transacoes financeiras sao imutaveis. Use ajuste, estorno ou recarga.';
END;
$$;

CREATE TRIGGER wallet_transactions_no_update
BEFORE UPDATE OR DELETE ON wallet_transactions
FOR EACH ROW EXECUTE FUNCTION prevent_wallet_transaction_mutation();

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active cities are readable" ON cities
FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "admins manage cities" ON cities
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "users read own profile" ON users
FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "users update own safe profile" ON users
FOR UPDATE USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "admins manage users" ON users
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "drivers read own driver row" ON drivers
FOR SELECT USING (user_id = current_user_id() OR is_admin());

CREATE POLICY "admins manage drivers" ON drivers
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "passengers read own row" ON passengers
FOR SELECT USING (user_id = current_user_id() OR is_admin());

CREATE POLICY "passengers manage own row" ON passengers
FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

CREATE POLICY "ride participants read rides" ON rides
FOR SELECT USING (
  is_admin()
  OR passenger_id IN (SELECT id FROM passengers WHERE user_id = current_user_id())
  OR driver_id IN (SELECT id FROM drivers WHERE user_id = current_user_id())
);

CREATE POLICY "passengers create requested rides" ON rides
FOR INSERT WITH CHECK (
  status = 'requested'
  AND passenger_id IN (SELECT id FROM passengers WHERE user_id = current_user_id())
);

CREATE POLICY "ride participants read events" ON ride_events
FOR SELECT USING (
  is_admin()
  OR ride_id IN (
    SELECT id FROM rides WHERE
      passenger_id IN (SELECT id FROM passengers WHERE user_id = current_user_id())
      OR driver_id IN (SELECT id FROM drivers WHERE user_id = current_user_id())
  )
);

CREATE POLICY "drivers read own wallet transactions" ON wallet_transactions
FOR SELECT USING (
  is_admin()
  OR driver_id IN (SELECT id FROM drivers WHERE user_id = current_user_id())
);

CREATE POLICY "drivers read own recharges" ON driver_recharges
FOR SELECT USING (
  is_admin()
  OR driver_id IN (SELECT id FROM drivers WHERE user_id = current_user_id())
);

CREATE POLICY "admins manage financial tables" ON driver_recharges
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admins read audit logs" ON financial_audit_logs
FOR SELECT USING (is_admin());

CREATE POLICY "admins read security logs" ON security_logs
FOR SELECT USING (is_admin());

CREATE POLICY "admins manage fraud flags" ON fraud_flags
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "users create reports" ON reports
FOR INSERT WITH CHECK (reporter_user_id = current_user_id());

CREATE POLICY "users read own reports" ON reports
FOR SELECT USING (reporter_user_id = current_user_id() OR is_admin());

INSERT INTO cities (
  id,
  name,
  state,
  slug,
  is_active,
  center_lat,
  center_lng,
  service_radius_km,
  base_price,
  price_per_km,
  price_per_min,
  platform_fee_percent,
  max_stops
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Padre Paraiso',
  'MG',
  'padre-paraiso-mg',
  true,
  -17.073900,
  -41.508100,
  12,
  7.00,
  1.30,
  0.25,
  15.00,
  3
) ON CONFLICT (slug) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  center_lat = EXCLUDED.center_lat,
  center_lng = EXCLUDED.center_lng,
  service_radius_km = EXCLUDED.service_radius_km,
  base_price = EXCLUDED.base_price,
  price_per_km = EXCLUDED.price_per_km,
  price_per_min = EXCLUDED.price_per_min,
  platform_fee_percent = EXCLUDED.platform_fee_percent,
  max_stops = EXCLUDED.max_stops;
