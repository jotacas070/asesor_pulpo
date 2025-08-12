"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RespuestaDisplayProps {
  consultaId: string
  estado: string
  onEstadoChange?: (nuevoEstado: string) => void
}

interface Respuesta {
  id: string
  contenido: string
  created_at: string
  generada_automaticamente: boolean
  referencias_normativa: string[]
}

export function RespuestaDisplay({ consultaId, estado, onEstadoChange }: RespuestaDisplayProps) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null)
  const [loading, setLoading] = useState(false)
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    if (estado === "respondida") {
      cargarRespuesta()
    }
  }, [consultaId, estado])

  const cargarRespuesta = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/consultas/${consultaId}/respuesta`)
      if (response.ok) {
        const data = await response.json()
        setRespuesta(data)
      }
    } catch (error) {
      console.error("Error cargando respuesta:", error)
    } finally {
      setLoading(false)
    }
  }

  const generarRespuesta = async () => {
    setGenerando(true)
    try {
      const response = await fetch("/api/generar-respuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consultaId }),
      })

      if (response.ok) {
        const data = await response.json()
        setRespuesta(data.respuesta)
        onEstadoChange?.("respondida")
        toast({
          title: "Respuesta generada",
          description: "La consulta ha sido respondida exitosamente.",
        })
      } else {
        throw new Error("Error generando respuesta")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la respuesta. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setGenerando(false)
    }
  }

  if (estado === "pendiente") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Respuesta Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Esta consulta aún no ha sido respondida. Puedes generar una respuesta automática basada en la normativa
            vigente.
          </p>
          <Button onClick={generarRespuesta} disabled={generando} className="w-full">
            {generando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando respuesta...
              </>
            ) : (
              "Generar Respuesta Automática"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Cargando respuesta...
        </CardContent>
      </Card>
    )
  }

  if (!respuesta) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No se pudo cargar la respuesta.</p>
          <Button variant="outline" onClick={cargarRespuesta} className="w-full mt-4 bg-transparent">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Respuesta
          {respuesta.generada_automaticamente && <Badge variant="secondary">Automática</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{respuesta.contenido}</div>
        </div>

        {respuesta.referencias_normativa.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Referencias normativas consultadas:</p>
            <div className="flex flex-wrap gap-1">
              {respuesta.referencias_normativa.map((ref, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  Ref. {ref}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Respuesta generada el {new Date(respuesta.created_at).toLocaleString("es-ES")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
