import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 })
    }

    const { data: documentos, error } = await supabase
      .from("normativa")
      .select("*")
      .eq("vigente", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo documentos:", error)
      return NextResponse.json({ error: "Error obteniendo documentos" }, { status: 500 })
    }

    return NextResponse.json({ documentos: documentos || [] })
  } catch (error) {
    console.error("Error en GET /api/config/documentos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 })
    }

    const { error } = await supabase.from("normativa").delete().eq("id", id)

    if (error) {
      console.error("Error eliminando documento:", error)
      return NextResponse.json({ error: "Error eliminando documento" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en DELETE /api/config/documentos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
