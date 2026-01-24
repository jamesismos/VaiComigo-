-- Habilitar PostGIS para geolocalização
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabela de usuários (integrando com Clerk, mas armazenando dados extras)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL, -- ID do Clerk
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('passenger', 'driver')) DEFAULT 'passenger',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de viagens
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin GEOMETRY(POINT, 4326) NOT NULL, -- Ponto de origem (lat, lng)
  destination GEOMETRY(POINT, 4326) NOT NULL, -- Ponto de destino
  origin_address TEXT,
  destination_address TEXT,
  status TEXT CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'requested',
  fare DECIMAL(10,2),
  distance_km DECIMAL(5,2),
  duration_min INTEGER,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de localizações em tempo real (para rastreamento)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  location GEOMETRY(POINT, 4326) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance em geolocalização
CREATE INDEX idx_rides_origin ON rides USING GIST (origin);
CREATE INDEX idx_rides_destination ON rides USING GIST (destination);
CREATE INDEX idx_locations_location ON locations USING GIST (location);
CREATE INDEX idx_locations_timestamp ON locations (timestamp);

-- Políticas de segurança (RLS) - exemplo básico
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem seus próprios dados
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Para rides: passageiros e motoristas veem suas viagens
CREATE POLICY "Rides access" ON rides FOR SELECT USING (
  auth.uid()::text = (SELECT clerk_id FROM users WHERE id = rides.passenger_id) OR
  auth.uid()::text = (SELECT clerk_id FROM users WHERE id = rides.driver_id)
);

-- Inserir dados de exemplo
INSERT INTO users (clerk_id, email, name, role) VALUES
('clerk_user_1', 'motorista@example.com', 'João Motorista', 'driver'),
('clerk_user_2', 'passageiro@example.com', 'Maria Passageira', 'passenger');

-- Exemplo de viagem (use coordenadas reais)
INSERT INTO rides (driver_id, passenger_id, origin, destination, origin_address, destination_address, fare) VALUES
((SELECT id FROM users WHERE clerk_id = 'clerk_user_1'), (SELECT id FROM users WHERE clerk_id = 'clerk_user_2'),
 ST_GeomFromText('POINT(-23.5505 -46.6333)', 4326), -- São Paulo
 ST_GeomFromText('POINT(-22.9068 -43.1729)', 4326), -- Rio de Janeiro
 'São Paulo, SP', 'Rio de Janeiro, RJ', 150.00);