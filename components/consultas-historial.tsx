"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, MessageSquare, CheckCircle, AlertCircle, Eye } from "lucide-react"
import type { Consulta } from "@/lib/types"

interface ConsultasHistorialProps {
  userId: string
}

export default function ConsultasHistorial({ userId }: ConsultasHistorialProps) {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedConsulta, setSelectedConsulta] = useState<string | null>(null)

  useEffect(() => {
    fetchConsultas()
  }, [userId])

  const fetchConsultas = async () => {
    try {
      const response = await fetch(`/api/consultas?usuario_id=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setConsultas(data)
      }
    } catch (error) {
      console.error("Error fetching consultas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "respondida":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Respondida
          </Badge>
        )
      case "pendiente":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "archivada":
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Archivada
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "text-red-600"
      case "alta":
        return "text-orange-600"
      case "normal":
        return "text-blue-600"
      case "baja":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (consultas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay consultas aún</h3>
          <p className="text-gray-600">Realiza tu primera consulta sobre normativa de compras públicas.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {consultas.map((consulta) => (
        <Card key={consulta.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getEstadoBadge(consulta.estado)}
                  <span className={`text-sm font-medium ${getPrioridadColor(consulta.prioridad)}`}>
                    Prioridad: {consulta.prioridad}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {consulta.pregunta.length > 100 ? `${consulta.pregunta.substring(0, 100)}...` : consulta.pregunta}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConsulta(selectedConsulta === consulta.id ? null : consulta.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {selectedConsulta === consulta.id && (
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Consulta completa:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{consulta.pregunta}</p>
                </div>

                {consulta.categoria && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Categoría: </span>
                    <span className="text-sm text-gray-700">{consulta.categoria.nombre}</span>
                  </div>
                )}

                <div className="text-sm text-gray-500">Creada el {formatDate(consulta.created_at)}</div>

                {consulta.respuestas && consulta.respuestas.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Respuesta:</h4>
                    <p className="text-green-800 whitespace-pre-wrap">{consulta.respuestas[0].contenido}</p>
                    {consulta.respuestas[0].confianza && (
                      <div className="mt-2 text-sm text-green-700">
                        Nivel de confianza: {Math.round(consulta.respuestas[0].confianza * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
