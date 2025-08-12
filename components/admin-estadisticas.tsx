"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, MessageSquare, FileText, Clock } from "lucide-react"

interface Estadisticas {
  totalConsultas: number
  consultasPendientes: number
  consultasRespondidas: number
  totalUsuarios: number
  totalNormativas: number
  consultasHoy: number
  consultasEstaSemana: number
  consultasPorCategoria: Array<{
    categoria: string
    count: number
  }>
  consultasPorMes: Array<{
    mes: string
    count: number
  }>
}

export function AdminEstadisticas() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/estadisticas")
      if (response.ok) {
        const data = await response.json()
        setEstadisticas(data)
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>
  }

  if (!estadisticas) {
    return <div className="text-center py-8">No se pudieron cargar las estadísticas</div>
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoy</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.consultasHoy}</div>
            <p className="text-xs text-muted-foreground">+{estadisticas.consultasEstaSemana} esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.totalConsultas > 0
                ? Math.round((estadisticas.consultasRespondidas / estadisticas.totalConsultas) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.consultasRespondidas} de {estadisticas.totalConsultas} consultas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">Tiempo promedio de respuesta</p>
          </CardContent>
        </Card>
      </div>

      {/* Consultas por categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estadisticas.consultasPorCategoria.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">{item.categoria}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / estadisticas.totalConsultas) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total de Usuarios</span>
              </div>
              <span className="font-semibold">{estadisticas.totalUsuarios}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-sm">Normativas Activas</span>
              </div>
              <span className="font-semibold">{estadisticas.totalNormativas}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Total de Consultas</span>
              </div>
              <span className="font-semibold">{estadisticas.totalConsultas}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Consultas Pendientes</span>
              </div>
              <span className="font-semibold">{estadisticas.consultasPendientes}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Gráficos de actividad próximamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
