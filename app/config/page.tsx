"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, FileText, AlertCircle, CheckCircle, ArrowLeft, Lock, Trash2 } from "lucide-react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"

export default function ConfigPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [configuracion, setConfiguracion] = useState({
    carpetaGoogleDrive: "",
    carpetaId: "",
    procesarAutomaticamente: true,
    ultimaActualizacion: null as Date | null,
  })
  const [configIA, setConfigIA] = useState({
    instruccionesSistema:
      "Eres un especialista en compras públicas y normativa de abastecimiento del Estado Peruano. Tu tarea es responder consultas técnicas basándote en la normativa vigente.",
    modelo: "llama-3.3-70b-versatile",
    proveedor: "Groq",
  })
  const [documentos, setDocumentos] = useState([])
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<FileList | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const cargarDocumentos = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("documentos_procesados")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error cargando documentos:", error)
        return
      }

      setDocumentos(data || [])
    } catch (error) {
      console.error("Error de conexión:", error)
    }
  }

  const guardarDocumento = async (documento: any) => {
    try {
      const supabase = createClient()

      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(str)
      }

      const documentoParaDB = {
        nombre: documento.nombre,
        url: documento.url,
        tipo: documento.tipo || "pdf",
        contenido: documento.contenido,
        activo: documento.activo !== undefined ? documento.activo : true,
        procesado: documento.procesado !== undefined ? documento.procesado : true,
        ultimo_procesamiento:
          documento.ultimo_procesamiento ||
          documento.ultimoProcesamiento ||
          documento.fechaProcesamiento ||
          new Date().toISOString(),
        created_at: documento.created_at,
        updated_at: new Date().toISOString(),
      }

      if (documento.id && isValidUUID(documento.id)) {
        documentoParaDB.id = documento.id
      }

      // Remover propiedades undefined
      Object.keys(documentoParaDB).forEach((key) => {
        if (documentoParaDB[key] === undefined) {
          delete documentoParaDB[key]
        }
      })

      const { error } = await supabase.from("documentos_procesados").upsert(documentoParaDB)

      if (error) {
        console.error("Error guardando documento:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Error de conexión:", error)
      return false
    }
  }

  const extraerIdCarpeta = (url: string) => {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : ""
  }

  const procesarArchivos = async () => {
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) {
      setMensaje("Por favor selecciona archivos PDF para procesar")
      return
    }

    if (archivosSeleccionados.length > 50) {
      setMensaje("Máximo 50 documentos permitidos")
      return
    }

    setCargando(true)

    try {
      const formData = new FormData()
      for (let i = 0; i < archivosSeleccionados.length; i++) {
        formData.append("files", archivosSeleccionados[i])
      }

      const response = await fetch("/api/config/procesar-documentos", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setConfiguracion((prev) => ({
          ...prev,
          ultimaActualizacion: new Date(),
        }))

        if (data.documentos) {
          for (const doc of data.documentos) {
            await guardarDocumento(doc)
          }
        }

        await cargarDocumentos()
        setMensaje(`${data.procesados} documentos procesados exitosamente`)
        setArchivosSeleccionados(null)
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setMensaje(data.error || "Error procesando documentos")
      }
    } catch (error) {
      console.error("Error:", error)
      setMensaje("Error procesando documentos: " + (error as Error).message)
    } finally {
      setCargando(false)
    }
  }

  const procesarDocumentos = async () => {
    setCargando(true)
    try {
      const response = await fetch("/api/config/procesar-documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carpetaId: configuracion.carpetaId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMensaje(`Procesados ${data.procesados} documentos exitosamente`)

        const supabase = createClient()
        await supabase
          .from("documentos_procesados")
          .update({
            procesado: true,
            ultimo_procesamiento: new Date().toISOString(),
            contenido: "Contenido procesado automáticamente",
          })
          .neq("id", "00000000-0000-0000-0000-000000000000") // Actualizar todos

        await cargarDocumentos()
      } else {
        setMensaje(data.error || "Error al procesar documentos")
      }
    } catch (error) {
      setMensaje("Error de conexión al procesar documentos")
    } finally {
      setCargando(false)
    }
  }

  const agregarDocumento = async () => {
    if (!archivosSeleccionados || archivosSeleccionados.length === 0) {
      setMensaje("Por favor selecciona archivos PDF para procesar")
      return
    }

    if (archivosSeleccionados.length > 50) {
      setMensaje("Máximo 50 documentos permitidos")
      return
    }

    setCargando(true)

    try {
      const formData = new FormData()
      for (let i = 0; i < archivosSeleccionados.length; i++) {
        formData.append("files", archivosSeleccionados[i])
      }

      const response = await fetch("/api/config/procesar-documentos", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setConfiguracion((prev) => ({
          ...prev,
          ultimaActualizacion: new Date(),
        }))

        if (data.documentos) {
          for (const doc of data.documentos) {
            await guardarDocumento(doc)
          }
        }

        await cargarDocumentos()
        setMensaje(`${data.procesados} documentos procesados exitosamente`)
        setArchivosSeleccionados(null)
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setMensaje(data.error || "Error procesando documentos")
      }
    } catch (error) {
      console.error("Error:", error)
      setMensaje("Error procesando documentos: " + (error as Error).message)
    } finally {
      setCargando(false)
    }
  }

  const eliminarDocumento = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("documentos_procesados").delete().eq("id", id)

      if (error) {
        setMensaje("Error al eliminar documento")
        return
      }

      await cargarDocumentos()
      setMensaje("Documento eliminado permanentemente")
    } catch (error) {
      setMensaje("Error de conexión al eliminar documento")
    }
  }

  const toggleDocumento = async (id: string, activo: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("documentos_procesados").update({ activo: !activo }).eq("id", id)

      if (error) {
        setMensaje("Error al actualizar documento")
        return
      }

      await cargarDocumentos()
    } catch (error) {
      setMensaje("Error de conexión al actualizar documento")
    }
  }

  const cerrarSesionAdmin = () => {
    localStorage.removeItem("admin_session")
    setAutenticado(false)
    window.location.href = "/"
  }

  const guardarConfiguracionIA = async () => {
    try {
      setCargando(true)

      const supabase = createClient()
      const { error } = await supabase.from("configuraciones_ia").upsert(
        {
          clave: "instrucciones_sistema",
          valor: configIA.instruccionesSistema,
          descripcion: "Instrucciones del sistema para la IA",
        },
        {
          onConflict: "clave",
        },
      )

      if (error) {
        console.error("Error guardando en Supabase:", error)
      }

      // También guardar en localStorage como backup
      if (typeof window !== "undefined") {
        localStorage.setItem("config_ia", JSON.stringify(configIA))
      }

      const response = await fetch("/api/config/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configIA),
      })

      if (response.ok) {
        setMensaje("Configuración de IA guardada exitosamente")
      } else {
        setMensaje("Configuración guardada localmente")
      }
    } catch (error) {
      setMensaje("Error de conexión, configuración guardada localmente")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session")
    if (adminSession === "authenticated") {
      setAutenticado(true)

      cargarDocumentos()

      // Cargar configuración de IA
      const configGuardada = localStorage.getItem("config_ia")
      if (configGuardada) {
        setConfigIA(JSON.parse(configGuardada))
      }
    } else {
      window.location.href = "/"
    }
  }, [])

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-blue-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Debes autenticarte desde la página principal para acceder a esta sección</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Button variant="default" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Sistema Principal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Gestiona los documentos base para las consultas</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={cerrarSesionAdmin}>
              <Lock className="h-4 w-4 mr-2" />
              Cerrar Sesión Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mensaje && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="google-drive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración IA</TabsTrigger>
          </TabsList>

          <TabsContent value="google-drive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cargar Documentos PDF</CardTitle>
                <CardDescription>
                  Sube directamente los documentos PDF de normativa que utilizará el sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Instrucciones:</strong>
                    <br />
                    1. Selecciona los archivos PDF de normativa de compras públicas
                    <br />
                    2. Máximo 50 documentos por carga
                    <br />
                    3. Solo se aceptan archivos PDF
                    <br />
                    4. Los documentos se procesarán automáticamente
                    <br />
                    <br />
                    <strong>Importante:</strong> Solo se procesarán los documentos PDF que selecciones. El sistema
                    extraerá el contenido para generar respuestas precisas.
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="block text-sm font-medium mb-2">Seleccionar Archivos PDF</label>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => setArchivosSeleccionados(e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona hasta 50 archivos PDF de normativa de compras públicas
                  </p>
                  {archivosSeleccionados && (
                    <p className="text-sm text-green-600 mt-2">
                      {archivosSeleccionados.length} archivo(s) seleccionado(s)
                    </p>
                  )}
                </div>

                <Button onClick={procesarArchivos} disabled={cargando || !archivosSeleccionados} className="w-full">
                  {cargando ? "Procesando..." : "Procesar Documentos"}
                </Button>

                {configuracion.carpetaId && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Carpeta Configurada</p>
                        <p className="text-xs text-green-600">ID: {configuracion.carpetaId}</p>
                        {configuracion.ultimaActualizacion && (
                          <p className="text-xs text-green-600">
                            Última actualización: {configuracion.ultimaActualizacion.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button onClick={procesarDocumentos} disabled={cargando} size="sm">
                        {cargando ? "Procesando..." : "Procesar Documentos"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos Procesados</CardTitle>
                <CardDescription>Documentos PDF cargados y procesados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {documentos.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay documentos cargados</p>
                    <p className="text-sm text-gray-400">Carga archivos PDF primero</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documentos.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-500" />
                          <div>
                            <h4 className="font-medium">{doc.nombre}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Badge variant={doc.procesado ? "default" : "secondary"}>
                                {doc.procesado ? "Procesado" : "Pendiente"}
                              </Badge>
                              {doc.ultimo_procesamiento && doc.ultimo_procesamiento !== null && (
                                <span>Procesado: {new Date(doc.ultimo_procesamiento).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={doc.activo ? "default" : "secondary"}>
                            {doc.activo ? "Activo" : "Inactivo"}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => toggleDocumento(doc.id, doc.activo)}>
                            {doc.activo ? "Desactivar" : "Activar"}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => eliminarDocumento(doc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de IA</CardTitle>
                <CardDescription>Ajusta cómo la IA procesa y responde las consultas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La IA está configurada para usar Groq con el modelo Llama 3.3 70B para generar respuestas basadas en
                    los documentos configurados.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Modelo de IA</label>
                    <Input value={configIA.modelo} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Proveedor</label>
                    <Input value={configIA.proveedor} disabled />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instrucciones del Sistema</label>
                  <Textarea
                    value={configIA.instruccionesSistema}
                    onChange={(e) => setConfigIA((prev) => ({ ...prev, instruccionesSistema: e.target.value }))}
                    rows={6}
                    placeholder="Ingresa las instrucciones que guiarán las respuestas de la IA..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estas instrucciones determinan cómo la IA interpretará y responderá las consultas de los usuarios.
                  </p>
                </div>

                <Button onClick={guardarConfiguracionIA} disabled={cargando} className="w-full">
                  {cargando ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
