import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Simulación de contenido extraído de PDFs de Google Drive
const contenidoDocumentos = {
  "1": `LEY DE CONTRATACIONES DEL ESTADO

TÍTULO I - DISPOSICIONES GENERALES

Artículo 1.- Objeto de la Ley
La presente Ley establece las normas orientadas a maximizar el valor de los recursos públicos que se invierten y a promover la actuación bajo el enfoque de gestión por resultados en las contrataciones de bienes, servicios en general, consultorías y obras, de tal manera que estas se efectúen en forma oportuna y bajo las mejores condiciones de precio y calidad, permitan el cumplimiento de los fines públicos y tengan una repercusión positiva en las condiciones de vida de los ciudadanos.

Artículo 2.- Ámbito de aplicación
Se encuentran comprendidas en los alcances de la presente Ley las Entidades públicas que realicen contrataciones de bienes, servicios en general, consultorías y obras, con independencia de la fuente de financiamiento y del régimen jurídico bajo el cual se constituyan, tales como:
a) El Gobierno Nacional, los Gobiernos Regionales y los Gobiernos Locales y sus respectivas dependencias.
b) Las empresas del Estado de derecho público o privado, ya sean de propiedad del Gobierno Nacional, Regional o Local.`,

  "2": `REGLAMENTO DE LA LEY DE CONTRATACIONES DEL ESTADO

TÍTULO I - DISPOSICIONES GENERALES

Artículo 1.- Objeto
El presente Reglamento tiene por objeto desarrollar las disposiciones de la Ley de Contrataciones del Estado, estableciendo las normas reglamentarias que regulan los procesos de contratación de bienes, servicios en general, consultorías y obras.

Artículo 2.- Principios que rigen las contrataciones
Los procesos de contratación se rigen por los siguientes principios:
a) Libertad de concurrencia: Las Entidades promueven el libre acceso y participación de proveedores en los procesos de contratación que realicen, debiendo evitarse exigencias y formalidades costosas e innecesarias.
b) Igualdad de trato: Todos los proveedores deben tener las mismas oportunidades para formular sus ofertas.`,

  "3": `DIRECTIVAS DEL ORGANISMO SUPERVISOR DE LAS CONTRATACIONES DEL ESTADO (OSCE)

DIRECTIVA N° 001-2019-OSCE/CD
"Participación de proveedores en consorcio en las contrataciones del Estado"

1. FINALIDAD
Establecer disposiciones para la participación de proveedores constituidos en consorcio en los procesos de selección convocados por las Entidades.

2. ALCANCE
La presente directiva es de aplicación obligatoria para todas las Entidades comprendidas en el ámbito de aplicación de la Ley de Contrataciones del Estado.

3. BASE LEGAL
- Ley N° 30225, Ley de Contrataciones del Estado
- Decreto Supremo N° 344-2018-EF, Reglamento de la Ley de Contrataciones del Estado`,
}

function buscarContextoRelevante(consulta: string): string {
  const palabrasClave = consulta.toLowerCase().split(" ")
  let contextoRelevante = ""

  // Buscar en todos los documentos
  Object.entries(contenidoDocumentos).forEach(([id, contenido]) => {
    const contenidoLower = contenido.toLowerCase()

    // Si encuentra palabras clave relevantes, incluir ese documento
    const coincidencias = palabrasClave.filter(
      (palabra) => palabra.length > 3 && contenidoLower.includes(palabra),
    ).length

    if (coincidencias > 0) {
      contextoRelevante += contenido + "\n\n"
    }
  })

  // Si no encuentra contexto específico, usar todos los documentos
  if (!contextoRelevante) {
    contextoRelevante = Object.values(contenidoDocumentos).join("\n\n")
  }

  return contextoRelevante
}

async function obtenerInstruccionesSistema(): Promise<string> {
  try {
    // En el cliente, las instrucciones se guardan en localStorage
    // En el servidor, usamos las instrucciones por defecto o las que se hayan configurado
    return `Eres un especialista en compras públicas y normativa de abastecimiento del Estado Peruano. Tu tarea es responder consultas técnicas basándote en la normativa vigente.

INSTRUCCIONES ESPECÍFICAS:
1. Proporciona respuestas claras, precisas y técnicamente correctas
2. Cita específicamente los artículos o secciones normativas relevantes
3. Si la normativa disponible no cubre completamente la consulta, indícalo claramente
4. Usa un lenguaje profesional pero accesible para especialistas en abastecimiento
5. Estructura tu respuesta con puntos claros cuando sea apropiado
6. Si hay procedimientos específicos, detállalos paso a paso
7. Siempre menciona la fuente normativa específica (Ley, Reglamento, Directiva)
8. Si necesitas información adicional, sugiere dónde buscarla`
  } catch (error) {
    // Fallback a instrucciones por defecto
    return "Eres un especialista en compras públicas y normativa de abastecimiento del Estado Peruano. Tu tarea es responder consultas técnicas basándote en la normativa vigente."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { consulta, categoria } = await request.json()

    if (!consulta) {
      return NextResponse.json({ error: "Consulta requerida" }, { status: 400 })
    }

    const contextoNormativa = buscarContextoRelevante(consulta)
    const instruccionesSistema = await obtenerInstruccionesSistema()

    const prompt = `${instruccionesSistema}

CONSULTA DEL USUARIO:
"${consulta}"

CATEGORÍA: ${categoria || "General"}

NORMATIVA RELEVANTE DISPONIBLE:
${contextoNormativa}

RESPUESTA:`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      maxTokens: 1200,
      temperature: 0.2,
    })

    return NextResponse.json({
      success: true,
      respuesta: text,
      contextoUsado: contextoNormativa.length > 0,
      documentosConsultados: Object.keys(contenidoDocumentos).length,
    })
  } catch (error) {
    console.error("Error generando respuesta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
