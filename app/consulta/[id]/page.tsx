import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import Link from "next/link"
import { RespuestaDisplay } from "@/components/respuesta-display"

interface ConsultaPageProps {
  params: { id: string }
}

export default async function ConsultaPage({ params }: ConsultaPageProps) {
  const supabase = createClient()

  const { data: consulta, error } = await supabase
    .from("consultas")
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion
      ),
      profiles (
        nombre_completo,
        email
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !consulta) {
    notFound()
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Detalle de Consulta</h1>
          <div className="flex gap-2">
            {getEstadoBadge(consulta.estado)}
            {getPrioridadBadge(consulta.prioridad)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Consulta */}
          <Card>
            <CardHeader>
              <CardTitle>Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{consulta.pregunta}</p>
              </div>
            </CardContent>
          </Card>

          {/* Respuesta */}
          <RespuestaDisplay consultaId={consulta.id} estado={consulta.estado} />
        </div>

        {/* Información adicional */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha de consulta</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(consulta.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {consulta.profiles && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Consultante</p>
                    <p className="text-sm text-muted-foreground">{consulta.profiles.nombre_completo}</p>
                    <p className="text-xs text-muted-foreground">{consulta.profiles.email}</p>
                  </div>
                </div>
              )}

              {consulta.categorias && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Categoría</p>
                    <p className="text-sm text-muted-foreground">{consulta.categorias.nombre}</p>
                    {consulta.categorias.descripcion && (
                      <p className="text-xs text-muted-foreground mt-1">{consulta.categorias.descripcion}</p>
                    )}
                  </div>
                </div>
              )}

              {consulta.fecha_respuesta && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de respuesta</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(consulta.fecha_respuesta).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
