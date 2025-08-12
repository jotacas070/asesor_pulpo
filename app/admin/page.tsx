import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings, FileText, MessageSquare, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminNormativaManager } from "@/components/admin-normativa-manager"
import { AdminConsultasManager } from "@/components/admin-consultas-manager"
import { AdminEstadisticas } from "@/components/admin-estadisticas"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    redirect("/auth/login")
  }

  // Verificar si el usuario es administrador
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()

  if (!profile || profile.rol !== "admin") {
    redirect("/")
  }

  // Obtener estadísticas generales
  const [{ data: totalConsultas }, { data: consultasPendientes }, { data: totalNormativa }, { data: totalUsuarios }] =
    await Promise.all([
      supabase.from("consultas").select("*", { count: "exact", head: true }),
      supabase.from("consultas").select("*", { count: "exact", head: true }).eq("estado", "pendiente"),
      supabase.from("normativa").select("*", { count: "exact", head: true }).eq("activa", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="bg-slate-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
                <p className="text-sm text-gray-600">Gestión del Sistema de Consultas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalConsultas?.count || 0}</p>
                  <p className="text-sm text-gray-600">Total Consultas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{consultasPendientes?.count || 0}</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalNormativa?.count || 0}</p>
                  <p className="text-sm text-gray-600">Normativas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{totalUsuarios?.count || 0}</p>
                  <p className="text-sm text-gray-600">Usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <Tabs defaultValue="consultas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="normativa">Normativa</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="consultas">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Consultas</CardTitle>
                <CardDescription>
                  Administra todas las consultas del sistema, revisa respuestas y modera contenido.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminConsultasManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="normativa">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Normativa</CardTitle>
                <CardDescription>
                  Administra los documentos normativos que utiliza el sistema para generar respuestas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminNormativaManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Sistema</CardTitle>
                <CardDescription>Visualiza métricas de uso, rendimiento y tendencias del sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminEstadisticas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>Configura parámetros generales del sistema y gestiona usuarios.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Configuración del sistema próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
