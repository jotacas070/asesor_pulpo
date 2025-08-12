"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConsultaFormProps {
  userId?: string
}

export default function ConsultaForm({ userId }: ConsultaFormProps) {
  const [pregunta, setPregunta] = useState("")
  const [categoria, setCategoria] = useState("")
  const [prioridad, setPrioridad] = useState("normal")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [respuesta, setRespuesta] = useState("")

  const categorias = [
    { value: "procesos-licitacion", label: "Procesos de Licitación" },
    { value: "contratacion-directa", label: "Contratación Directa" },
    { value: "marco-normativo", label: "Marco Normativo" },
    { value: "evaluacion-ofertas", label: "Evaluación de Ofertas" },
    { value: "contratos-ejecucion", label: "Contratos y Ejecución" },
    { value: "recursos-reclamos", label: "Recursos y Reclamos" },
    { value: "registro-proveedores", label: "Registro de Proveedores" },
    { value: "aspectos-financieros", label: "Aspectos Financieros" },
    { value: "transparencia", label: "Transparencia" },
    { value: "casos-especiales", label: "Casos Especiales" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pregunta.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa tu pregunta" })
      return
    }

    setIsLoading(true)
    setMessage(null)
    setRespuesta("")

    try {
      const response = await fetch("/api/generar-respuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consulta: pregunta.trim(),
          categoria,
          prioridad,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al generar la respuesta")
      }

      const data = await response.json()

      setMessage({ type: "success", text: "Respuesta generada exitosamente" })
      setRespuesta(data.respuesta)
    } catch (error) {
      setMessage({ type: "error", text: "Error al generar la respuesta. Inténtalo nuevamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const nuevaConsulta = () => {
    setPregunta("")
    setCategoria("")
    setPrioridad("normal")
    setRespuesta("")
    setMessage(null)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría (Opcional)</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select value={prioridad} onValueChange={setPrioridad}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pregunta">Tu Consulta</Label>
          <Textarea
            id="pregunta"
            placeholder="Describe tu consulta sobre normativa de compras públicas. Por ejemplo: '¿Cuáles son los requisitos para una licitación pública de servicios de consultoría por un monto de $50 millones?'"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            rows={6}
            className="resize-none"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">Sé específico en tu consulta para obtener una respuesta más precisa.</p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Consejos para una mejor consulta:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Incluye el contexto específico de tu situación</li>
                  <li>Menciona montos, plazos o características relevantes</li>
                  <li>Especifica si es para bienes, servicios o obras</li>
                  <li>Indica si hay alguna urgencia o situación especial</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || !pregunta.trim()} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando respuesta...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generar Respuesta
              </>
            )}
          </Button>

          {respuesta && (
            <Button type="button" variant="outline" onClick={nuevaConsulta}>
              Nueva Consulta
            </Button>
          )}
        </div>
      </form>

      {respuesta && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800">Respuesta Generada:</h3>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{respuesta}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
