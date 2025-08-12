"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [usuario, setUsuario] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Verificar credenciales
    if (usuario === "admin_abas" && clave === "pulpopedia") {
      // Guardar sesión administrativa en localStorage
      localStorage.setItem("admin_session", "authenticated")
      setIsOpen(false)
      router.push("/config")
    } else {
      setError("Credenciales incorrectas")
    }

    setIsLoading(false)
  }

  return (
    <>
      {/* Banner flotante en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acceso Administrativo
              </DialogTitle>
              <DialogDescription>
                Ingresa tus credenciales para acceder a la configuración de documentos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clave">Clave</Label>
                <Input
                  id="clave"
                  type="password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Ingresa tu clave"
                  required
                />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Verificando..." : "Ingresar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
