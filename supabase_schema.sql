-- Supabase Schema for Music Chooser Party

-- 1. locales
CREATE TABLE locales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    reproductor_api_key TEXT, -- Optional, for Spotify/SYB
    reproductor_type TEXT, -- e.g., 'spotify', 'youtube'
    auto_aceptar BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. peticiones
CREATE TABLE peticiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    local_id UUID REFERENCES locales(id),
    cancion TEXT NOT NULL,
    artista TEXT NOT NULL,
    caratula TEXT,
    votos INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'aceptada', 'reproducida'
    youtube_url TEXT,
    duration TEXT,
    requested_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. usuarios_admin
CREATE TABLE usuarios_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    local_id UUID REFERENCES locales(id),
    email TEXT UNIQUE NOT NULL,
    -- Passwords should be handled by Supabase Auth ideally, but if storing custom:
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Optional but recommended
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE peticiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as needed)
CREATE POLICY "Locales are viewable by everyone." ON locales FOR SELECT USING (true);
CREATE POLICY "Peticiones are viewable by everyone." ON peticiones FOR SELECT USING (true);
CREATE POLICY "Anyone can insert peticiones." ON peticiones FOR INSERT WITH CHECK (true);
