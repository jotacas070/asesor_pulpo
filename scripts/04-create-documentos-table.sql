-- Crear tabla para documentos procesados
CREATE TABLE IF NOT EXISTS public.documentos_procesados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    url TEXT NOT NULL,
    tipo VARCHAR DEFAULT 'google_drive',
    activo BOOLEAN DEFAULT true,
    procesado BOOLEAN DEFAULT false,
    contenido TEXT,
    ultimo_procesamiento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.documentos_procesados ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (sin autenticación de usuarios)
CREATE POLICY "Permitir todas las operaciones en documentos" ON public.documentos_procesados
    FOR ALL USING (true) WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_documentos_procesados_updated_at 
    BEFORE UPDATE ON public.documentos_procesados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
