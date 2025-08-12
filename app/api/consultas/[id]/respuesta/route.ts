import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: respuesta, error } = await supabase
      .from("respuestas")
      .select(`
        *,
        consultas (
          pregunta,
          categoria_id,
          categorias (nombre)
        )
      `)
      .eq("consulta_id", params.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: "Respuesta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(respuesta)
  } catch (error) {
    console.error("Error obteniendo respuesta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
