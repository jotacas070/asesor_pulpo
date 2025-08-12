-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Procesos de Licitación', 'Consultas sobre procedimientos de licitación pública'),
  ('Contratación Directa', 'Consultas sobre contratación directa y sus excepciones'),
  ('Marco Normativo', 'Consultas sobre leyes y reglamentos de compras públicas'),
  ('Evaluación de Ofertas', 'Consultas sobre criterios y procesos de evaluación'),
  ('Contratos y Ejecución', 'Consultas sobre administración y ejecución de contratos'),
  ('Recursos y Reclamos', 'Consultas sobre procedimientos de impugnación'),
  ('Registro de Proveedores', 'Consultas sobre inscripción y habilitación de proveedores'),
  ('Aspectos Financieros', 'Consultas sobre presupuesto y aspectos económicos'),
  ('Transparencia', 'Consultas sobre publicidad y transparencia en procesos'),
  ('Casos Especiales', 'Consultas sobre situaciones particulares o excepcionales')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar normativa básica de ejemplo
INSERT INTO normativa (titulo, contenido, tipo, numero, fecha_publicacion, categoria_id) VALUES
  (
    'Ley de Compras Públicas',
    'Ley que regula los procedimientos de contratación pública, estableciendo los principios de transparencia, eficiencia, competencia y responsabilidad en el uso de recursos públicos.',
    'ley',
    '19.886',
    '2003-07-30',
    (SELECT id FROM categorias WHERE nombre = 'Marco Normativo' LIMIT 1)
  ),
  (
    'Reglamento de la Ley de Compras Públicas',
    'Reglamento que desarrolla los procedimientos específicos para la aplicación de la Ley de Compras Públicas, incluyendo montos, plazos y requisitos técnicos.',
    'decreto',
    '250',
    '2004-03-27',
    (SELECT id FROM categorias WHERE nombre = 'Marco Normativo' LIMIT 1)
  ),
  (
    'Directiva sobre Licitaciones Públicas',
    'Directiva que establece los procedimientos específicos para la realización de licitaciones públicas, incluyendo bases técnicas y criterios de evaluación.',
    'directiva',
    'ChileCompra N°1',
    '2004-08-01',
    (SELECT id FROM categorias WHERE nombre = 'Procesos de Licitación' LIMIT 1)
  )
ON CONFLICT DO NOTHING;
