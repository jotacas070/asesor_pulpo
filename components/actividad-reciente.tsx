"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Consulta {
  id: string
  pregunta: string
  estado: string
  created_at: string
  categorias?: {
    nombre: string
  }
}

interface ActividadRecienteProps {
  consultas: Consulta[]
}

export function ActividadReciente({ consultas }: ActividadRecienteProps) {
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "respondida":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pendiente":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "en_proceso":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "respondida":
        return (
          <Badge variant="default" className="bg-green-500">
            Respondida
          </Badge>
        )
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "en_proceso":
        return <Badge variant="default">En Proceso</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (!consultas || consultas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {consultas.map((consulta) => (
            <div key={consulta.id} className="border-l-2 border-blue-200 pl-4">
              <Link href={`/consulta/${consulta.id}`} className="block hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="flex items-start gap-2">
                  {getEstadoIcon(consulta.estado)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{consulta.pregunta}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {consulta.categorias && (
                        <Badge variant="outline" className="text-xs">
                          {consulta.categorias.nombre}
                        </Badge>
                      )}
                      {getEstadoBadge(consulta.estado)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(consulta.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
