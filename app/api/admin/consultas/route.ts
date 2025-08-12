import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: consultas, error } = await supabase
      .from("consultas")
      .select(`
        *,
        profiles (
          nombre_completo,
          email
        ),
        categorias (
          nombre
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo consultas:", error)
      return NextResponse.json({ error: "Error obteniendo consultas" }, { status: 500 })
    }

    return NextResponse.json(consultas)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
