"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, FileText, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Normativa {
  id: string
  titulo: string
  tipo: string
  contenido: string
  categoria_id: string
  activa: boolean
  created_at: string
  categorias?: {
    nombre: string
  }
}

interface Categoria {
  id: string
  nombre: string
}

export function AdminNormativaManager() {
  const [normativas, setNormativas] = useState<Normativa[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNormativa, setEditingNormativa] = useState<Normativa | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "",
    contenido: "",
    categoria_id: "",
    activa: true,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      // Cargar normativas
      const normativaResponse = await fetch("/api/admin/normativa")
      if (normativaResponse.ok) {
        const normativaData = await normativaResponse.json()
        setNormativas(normativaData)
      }

      // Cargar categorías
      const categoriasResponse = await fetch("/api/categorias")
      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json()
        setCategorias(categoriasData)
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingNormativa ? `/api/admin/normativa/${editingNormativa.id}` : "/api/admin/normativa"

      const method = editingNormativa ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingNormativa ? "Normativa actualizada correctamente" : "Normativa creada correctamente",
        })
        setIsDialogOpen(false)
        setEditingNormativa(null)
        setFormData({
          titulo: "",
          tipo: "",
          contenido: "",
          categoria_id: "",
          activa: true,
        })
        cargarDatos()
      } else {
        throw new Error("Error en la operación")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la normativa",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (normativa: Normativa) => {
    setEditingNormativa(normativa)
    setFormData({
      titulo: normativa.titulo,
      tipo: normativa.tipo,
      contenido: normativa.contenido,
      categoria_id: normativa.categoria_id,
      activa: normativa.activa,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta normativa?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/normativa/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Normativa eliminada correctamente",
        })
        cargarDatos()
      } else {
        throw new Error("Error eliminando normativa")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la normativa",
        variant: "destructive",
      })
    }
  }

  const filteredNormativas = normativas.filter((normativa) => {
    const matchesSearch =
      normativa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normativa.contenido.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategoria = selectedCategoria === "all" || normativa.categoria_id === selectedCategoria
    return matchesSearch && matchesCategoria
  })

  if (loading) {
    return <div className="text-center py-8">Cargando normativas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar normativas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingNormativa(null)
                setFormData({
                  titulo: "",
                  tipo: "",
                  contenido: "",
                  categoria_id: "",
                  activa: true,
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Normativa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNormativa ? "Editar Normativa" : "Nueva Normativa"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ley">Ley</SelectItem>
                    <SelectItem value="decreto">Decreto</SelectItem>
                    <SelectItem value="resolucion">Resolución</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="guia">Guía</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="contenido">Contenido</Label>
                <Textarea
                  id="contenido"
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  rows={8}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                />
                <Label htmlFor="activa">Normativa activa</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{editingNormativa ? "Actualizar" : "Crear"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de normativas */}
      <div className="grid gap-4">
        {filteredNormativas.map((normativa) => (
          <Card key={normativa.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{normativa.titulo}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{normativa.tipo}</Badge>
                    {normativa.categorias && <Badge variant="secondary">{normativa.categorias.nombre}</Badge>}
                    <Badge variant={normativa.activa ? "default" : "destructive"}>
                      {normativa.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(normativa)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(normativa.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{normativa.contenido}</p>
              <p className="text-xs text-gray-400 mt-2">
                Creada el {new Date(normativa.created_at).toLocaleDateString("es-ES")}
              </p>
            </CardContent>
          </Card>
        ))}

        {filteredNormativas.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron normativas</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
