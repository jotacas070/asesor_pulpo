-- Crear tabla para configuraciones de IA
CREATE TABLE IF NOT EXISTS public.configuraciones_ia (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clave character varying NOT NULL UNIQUE,
    valor text NOT NULL,
    descripcion text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración por defecto para las instrucciones del sistema
INSERT INTO public.configuraciones_ia (clave, valor, descripcion) 
VALUES (
    'instrucciones_sistema',
    'Eres un asistente especializado en normativa de compras públicas. Tu función es ayudar a especialistas de abastecimiento y finanzas públicas a resolver dudas sobre normativa vigente e institucional. Proporciona respuestas precisas, técnicas y bien fundamentadas, citando siempre la normativa específica que respalda tu respuesta.',
    'Instrucciones del sistema para el modelo de IA'
) ON CONFLICT (clave) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.configuraciones_ia ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura y escritura sin autenticación (para el admin)
CREATE POLICY "Permitir acceso completo a configuraciones" ON public.configuraciones_ia
    FOR ALL USING (true);
