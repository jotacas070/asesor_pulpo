"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Consulta {
  id: string
  pregunta: string
  estado: string
  prioridad: string
  created_at: string
  fecha_respuesta?: string
  profiles?: {
    nombre_completo: string
    email: string
  }
  categorias?: {
    nombre: string
  }
}

export function AdminConsultasManager() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState<string>("all")
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>("all")

  useEffect(() => {
    cargarConsultas()
  }, [])

  const cargarConsultas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/consultas")
      if (response.ok) {
        const data = await response.json()
        setConsultas(data)
      }
    } catch (error) {
      console.error("Error cargando consultas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las consultas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const actualizarEstado = async (consultaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/admin/consultas/${consultaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Estado actualizado correctamente",
        })
        cargarConsultas()
      } else {
        throw new Error("Error actualizando estado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "en_proceso":
        return <AlertCircle className="h-4 w-4" />
      case "respondida":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "en_proceso":
        return <Badge variant="default">En Proceso</Badge>
      case "respondida":
        return (
          <Badge variant="default" className="bg-green-500">
            Respondida
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return <Badge variant="destructive">Alta</Badge>
      case "media":
        return <Badge variant="default">Media</Badge>
      case "baja":
        return <Badge variant="secondary">Baja</Badge>
      default:
        return <Badge variant="outline">{prioridad}</Badge>
    }
  }

  const filteredConsultas = consultas.filter((consulta) => {
    const matchesSearch =
      consulta.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.profiles?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = selectedEstado === "all" || consulta.estado === selectedEstado
    const matchesPrioridad = selectedPrioridad === "all" || consulta.prioridad === selectedPrioridad
    return matchesSearch && matchesEstado && matchesPrioridad
  })

  if (loading) {
    return <div className="text-center py-8">Cargando consultas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar consultas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedEstado} onValueChange={setSelectedEstado}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="respondida">Respondida</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPrioridad} onValueChange={setSelectedPrioridad}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de consultas */}
      <div className="grid gap-4">
        {filteredConsultas.map((consulta) => (
          <Card key={consulta.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{consulta.pregunta}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getEstadoBadge(consulta.estado)}
                    {getPrioridadBadge(consulta.prioridad)}
                    {consulta.categorias && <Badge variant="outline">{consulta.categorias.nombre}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/consulta/${consulta.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p>
                    <strong>Usuario:</strong> {consulta.profiles?.nombre_completo || "Usuario desconocido"}
                  </p>
                  <p>
                    <strong>Email:</strong> {consulta.profiles?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <strong>Creada:</strong> {new Date(consulta.created_at).toLocaleDateString("es-ES")}
                  </p>
                  {consulta.fecha_respuesta && (
                    <p>
                      <strong>Respondida:</strong> {new Date(consulta.fecha_respuesta).toLocaleDateString("es-ES")}
                    </p>
                  )}
                </div>
              </div>

              {consulta.estado !== "respondida" && (
                <div className="flex gap-2 mt-4">
                  {consulta.estado === "pendiente" && (
                    <Button size="sm" variant="outline" onClick={() => actualizarEstado(consulta.id, "en_proceso")}>
                      Marcar en Proceso
                    </Button>
                  )}
                  <Button size="sm" onClick={() => actualizarEstado(consulta.id, "respondida")}>
                    Marcar como Respondida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredConsultas.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron consultas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
