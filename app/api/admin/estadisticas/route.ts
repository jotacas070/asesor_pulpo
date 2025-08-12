import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Obtener estadísticas básicas
    const [
      { data: totalConsultas },
      { data: consultasPendientes },
      { data: consultasRespondidas },
      { data: totalUsuarios },
      { data: totalNormativas },
    ] = await Promise.all([
      supabase.from("consultas").select("*", { count: "exact", head: true }),
      supabase.from("consultas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
      supabase.from("consultas").select("*", { count: "exact", head: true }).eq("estado", "respondida"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("normativa").select("*", { count: "exact", head: true }).eq("activa", true),
    ])

    // Consultas de hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const { data: consultasHoy } = await supabase
      .from("consultas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", hoy.toISOString())

    // Consultas de esta semana
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)
    const { data: consultasEstaSemana } = await supabase
      .from("consultas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", inicioSemana.toISOString())

    // Consultas por categoría
    const { data: consultasPorCategoria } = await supabase.from("consultas").select(`
        categorias (
          nombre
        )
      `)

    // Procesar consultas por categoría
    const categoriasCount = consultasPorCategoria?.reduce((acc: any, consulta: any) => {
      const categoria = consulta.categorias?.nombre || "Sin categoría"
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    }, {})

    const consultasPorCategoriaArray = Object.entries(categoriasCount || {}).map(([categoria, count]) => ({
      categoria,
      count: count as number,
    }))

    const estadisticas = {
      totalConsultas: totalConsultas?.count || 0,
      consultasPendientes: consultasPendientes?.count || 0,
      consultasRespondidas: consultasRespondidas?.count || 0,
      totalUsuarios: totalUsuarios?.count || 0,
      totalNormativas: totalNormativas?.count || 0,
      consultasHoy: consultasHoy?.count || 0,
      consultasEstaSemana: consultasEstaSemana?.count || 0,
      consultasPorCategoria: consultasPorCategoriaArray,
      consultasPorMes: [], // Implementar si es necesario
    }

    return NextResponse.json(estadisticas)
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
