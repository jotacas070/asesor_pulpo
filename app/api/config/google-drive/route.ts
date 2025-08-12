import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { carpetaId, carpetaUrl } = await request.json()

    if (!carpetaId) {
      return NextResponse.json({ error: "ID de carpeta requerido" }, { status: 400 })
    }

    // Simular obtención de archivos de Google Drive
    // En producción, aquí usarías la Google Drive API
    const documentosSimulados = [
      {
        id: "1",
        nombre: "Ley de Contrataciones del Estado.pdf",
        url: `https://drive.google.com/file/d/1ABC123/view`,
        tipo: "google_drive",
        activo: true,
        procesado: false,
        ultimoProcesamiento: null,
      },
      {
        id: "2",
        nombre: "Reglamento de la Ley de Contrataciones.pdf",
        url: `https://drive.google.com/file/d/2DEF456/view`,
        tipo: "google_drive",
        activo: true,
        procesado: false,
        ultimoProcesamiento: null,
      },
      {
        id: "3",
        nombre: "Directivas OSCE.pdf",
        url: `https://drive.google.com/file/d/3GHI789/view`,
        tipo: "google_drive",
        activo: true,
        procesado: false,
        ultimoProcesamiento: null,
      },
    ]

    return NextResponse.json({
      success: true,
      carpetaId,
      documentos: documentosSimulados,
      mensaje: "Carpeta configurada exitosamente",
    })
  } catch (error) {
    console.error("Error configurando Google Drive:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
