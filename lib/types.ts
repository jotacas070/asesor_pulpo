export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  created_at: string
}

export interface Normativa {
  id: string
  titulo: string
  contenido: string
  tipo: "ley" | "decreto" | "resolucion" | "circular" | "directiva" | "otro"
  numero?: string
  fecha_publicacion?: string
  vigente: boolean
  categoria_id?: string
  created_at: string
  updated_at: string
}

export interface Consulta {
  id: string
  usuario_id: string
  pregunta: string
  categoria_id?: string
  estado: "pendiente" | "respondida" | "archivada"
  prioridad: "baja" | "normal" | "alta" | "urgente"
  created_at: string
  updated_at: string
  categoria?: Categoria
  respuestas?: Respuesta[]
}

export interface Respuesta {
  id: string
  consulta_id: string
  contenido: string
  normativa_referenciada: string[]
  confianza?: number
  revisada_por?: string
  created_at: string
  updated_at: string
  consulta?: Consulta
}

export interface Perfil {
  id: string
  nombre_completo?: string
  cargo?: string
  institucion?: string
  area?: "abastecimiento" | "finanzas" | "juridico" | "otro"
  rol: "usuario" | "especialista" | "admin"
  created_at: string
  updated_at: string
}
