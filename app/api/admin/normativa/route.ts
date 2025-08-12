import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: normativas, error } = await supabase
      .from("normativa")
      .select(`
        *,
        categorias (
          nombre
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo normativas:", error)
      return NextResponse.json({ error: "Error obteniendo normativas" }, { status: 500 })
    }

    return NextResponse.json(normativas)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { titulo, tipo, contenido, categoria_id, activa } = await request.json()

    const { data: normativa, error } = await supabase
      .from("normativa")
      .insert({
        titulo,
        tipo,
        contenido,
        categoria_id,
        activa,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creando normativa:", error)
      return NextResponse.json({ error: "Error creando normativa" }, { status: 500 })
    }

    return NextResponse.json(normativa)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
