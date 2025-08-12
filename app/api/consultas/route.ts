import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { pregunta, categoria, prioridad = "normal" } = body

    if (!pregunta?.trim()) {
      return NextResponse.json({ error: "La pregunta es requerida" }, { status: 400 })
    }

    // Buscar la categoría por nombre si se proporcionó
    let categoria_id = null
    if (categoria) {
      const { data: categoriaData } = await supabase
        .from("categorias")
        .select("id")
        .ilike("nombre", `%${categoria.replace("-", " ")}%`)
        .single()

      categoria_id = categoriaData?.id
    }

    // Insertar la consulta
    const { data: consulta, error: insertError } = await supabase
      .from("consultas")
      .insert({
        usuario_id: user.id,
        pregunta: pregunta.trim(),
        categoria_id,
        prioridad,
        estado: "pendiente",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting consulta:", insertError)
      return NextResponse.json({ error: "Error al crear la consulta" }, { status: 500 })
    }

    return NextResponse.json({ success: true, consulta })
  } catch (error) {
    console.error("Error in POST /api/consultas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const usuario_id = searchParams.get("usuario_id")

    if (usuario_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener consultas del usuario con sus respuestas y categorías
    const { data: consultas, error } = await supabase
      .from("consultas")
      .select(`
        *,
        categoria:categorias(*),
        respuestas(*)
      `)
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching consultas:", error)
      return NextResponse.json({ error: "Error al obtener las consultas" }, { status: 500 })
    }

    return NextResponse.json(consultas || [])
  } catch (error) {
    console.error("Error in GET /api/consultas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
