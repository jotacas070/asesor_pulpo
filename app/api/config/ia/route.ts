import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { instruccionesSistema, modelo, proveedor } = await request.json()

    if (!instruccionesSistema) {
      return NextResponse.json({ error: "Instrucciones del sistema requeridas" }, { status: 400 })
    }

    // En una aplicación real, aquí guardarías en base de datos
    // Por ahora, confirmamos que se recibió la configuración
    console.log("Nueva configuración de IA:", {
      instruccionesSistema,
      modelo,
      proveedor,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Configuración de IA actualizada exitosamente",
      config: {
        instruccionesSistema,
        modelo,
        proveedor,
      },
    })
  } catch (error) {
    console.error("Error guardando configuración de IA:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Devolver configuración actual (en una app real vendría de base de datos)
    const configDefault = {
      instruccionesSistema:
        "Eres un especialista en compras públicas y normativa de abastecimiento del Estado Peruano. Tu tarea es responder consultas técnicas basándote en la normativa vigente.",
      modelo: "llama-3.3-70b-versatile",
      proveedor: "Groq",
    }

    return NextResponse.json({
      success: true,
      config: configDefault,
    })
  } catch (error) {
    console.error("Error obteniendo configuración de IA:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
