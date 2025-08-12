-- Crear tabla de categorías para clasificar consultas
CREATE TABLE IF NOT EXISTS categorias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de normativa institucional
CREATE TABLE IF NOT EXISTS normativa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'ley', 'decreto', 'resolucion', 'circular', etc.
  numero VARCHAR(50),
  fecha_publicacion DATE,
  vigente BOOLEAN DEFAULT true,
  categoria_id UUID REFERENCES categorias(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de consultas de usuarios
CREATE TABLE IF NOT EXISTS consultas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  categoria_id UUID REFERENCES categorias(id),
  estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'respondida', 'archivada'
  prioridad VARCHAR(10) DEFAULT 'normal', -- 'baja', 'normal', 'alta', 'urgente'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de respuestas
CREATE TABLE IF NOT EXISTS respuestas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consulta_id UUID REFERENCES consultas(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  normativa_referenciada UUID[] DEFAULT '{}', -- Array de IDs de normativa referenciada
  confianza DECIMAL(3,2), -- Nivel de confianza de la respuesta (0.00 - 1.00)
  revisada_por UUID REFERENCES auth.users(id), -- Usuario que revisó la respuesta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de perfiles de usuario extendidos
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre_completo VARCHAR(255),
  cargo VARCHAR(100),
  institucion VARCHAR(200),
  area VARCHAR(100), -- 'abastecimiento', 'finanzas', 'juridico', etc.
  rol VARCHAR(20) DEFAULT 'usuario', -- 'usuario', 'especialista', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_consultas_usuario_id ON consultas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_consultas_categoria_id ON consultas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_consultas_estado ON consultas(estado);
CREATE INDEX IF NOT EXISTS idx_consultas_created_at ON consultas(created_at);
CREATE INDEX IF NOT EXISTS idx_respuestas_consulta_id ON respuestas(consulta_id);
CREATE INDEX IF NOT EXISTS idx_normativa_categoria_id ON normativa(categoria_id);
CREATE INDEX IF NOT EXISTS idx_normativa_vigente ON normativa(vigente);

-- Habilitar Row Level Security (RLS)
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE normativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para consultas
CREATE POLICY "Los usuarios pueden ver sus propias consultas" ON consultas
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propias consultas" ON consultas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias consultas" ON consultas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas de seguridad para respuestas
CREATE POLICY "Los usuarios pueden ver respuestas a sus consultas" ON respuestas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultas 
      WHERE consultas.id = respuestas.consulta_id 
      AND consultas.usuario_id = auth.uid()
    )
  );

-- Políticas de seguridad para perfiles
CREATE POLICY "Los usuarios pueden ver y actualizar su propio perfil" ON perfiles
  FOR ALL USING (auth.uid() = id);

-- Políticas de seguridad para normativa (lectura pública)
CREATE POLICY "Todos pueden leer normativa vigente" ON normativa
  FOR SELECT USING (vigente = true);

-- Políticas de seguridad para categorías (lectura pública)
CREATE POLICY "Todos pueden leer categorías" ON categorias
  FOR SELECT USING (true);
