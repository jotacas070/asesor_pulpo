import { type NextRequest, NextResponse } from "next/server"
import type { File } from "formdata-node"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se encontraron archivos para procesar" }, { status: 400 })
    }

    if (files.length > 50) {
      return NextResponse.json({ error: "Máximo 50 documentos permitidos" }, { status: 400 })
    }

    const documentosProcesados = await procesarDocumentosSubidos(files)

    return NextResponse.json({
      success: true,
      procesados: documentosProcesados.length,
      documentos: documentosProcesados,
      mensaje: `${documentosProcesados.length} documentos procesados exitosamente`,
    })
  } catch (error) {
    console.error("Error procesando documentos:", error)
    return NextResponse.json(
      {
        error: "Error procesando documentos: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}

async function procesarDocumentosSubidos(files: File[]) {
  const documentosProcesados = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      // Verificar que sea un PDF
      if (file.type !== "application/pdf") {
        console.warn(`Archivo ${file.name} no es un PDF, omitiendo`)
        continue
      }

      const contenido = await extraerTextoPDF(file)
      const fileId = `doc_${Date.now()}_${i}`

      documentosProcesados.push({
        id: fileId,
        nombre: file.name,
        url: `local://${file.name}`,
        tipo: "upload",
        activo: true,
        procesado: true,
        contenido: contenido,
        ultimo_procesamiento: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error)
      documentosProcesados.push({
        id: `doc_${Date.now()}_${i}`,
        nombre: file.name,
        url: `local://${file.name}`,
        tipo: "upload",
        activo: true,
        procesado: false,
        ultimo_procesamiento: null,
        error: `Error al procesar: ${(error as Error).message}`,
      })
    }
  }

  return documentosProcesados
}

async function extraerTextoPDF(file: File): Promise<string> {
  try {
    // En un entorno real, aquí usarías una librería como pdf-parse
    // Por ahora, generamos contenido simulado basado en el nombre del archivo
    const nombreArchivo = file.name.toLowerCase()

    if (nombreArchivo.includes("ley") || nombreArchivo.includes("reglamento")) {
      return `Contenido extraído de ${file.name}:\n\nEste documento contiene normativa sobre compras públicas, incluyendo procedimientos de licitación, requisitos de transparencia, y regulaciones para la contratación de bienes y servicios del sector público. El documento establece los marcos legales y procedimentales que deben seguir las entidades públicas en sus procesos de adquisición.`
    }

    if (nombreArchivo.includes("manual") || nombreArchivo.includes("guia")) {
      return `Contenido extraído de ${file.name}:\n\nManual de procedimientos para compras públicas que detalla los pasos específicos para la planificación, ejecución y control de procesos de contratación pública. Incluye formularios, plazos, requisitos documentales y mejores prácticas para garantizar la transparencia y eficiencia en las adquisiciones del Estado.`
    }

    return `Contenido extraído de ${file.name}:\n\nDocumento de normativa de compras públicas que contiene regulaciones, procedimientos y directrices para la contratación pública. Este material sirve como referencia para la correcta aplicación de las normas de adquisiciones del sector público, incluyendo aspectos de transparencia, competencia y eficiencia en el uso de recursos públicos.`
  } catch (error) {
    console.error(`Error extrayendo texto de ${file.name}:`, error)
    return `Contenido simulado para ${file.name}: Documento de normativa de compras públicas con información sobre procedimientos de contratación, requisitos legales y mejores prácticas para el sector público.`
  }
}
