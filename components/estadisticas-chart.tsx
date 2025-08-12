"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface EstadisticasChartProps {
  consultasTotal: number
  consultasRespondidas: number
  consultasPendientes: number
}

export function EstadisticasChart({
  consultasTotal,
  consultasRespondidas,
  consultasPendientes,
}: EstadisticasChartProps) {
  const data = [
    {
      name: "Respondidas",
      value: consultasRespondidas,
      color: "#10b981",
    },
    {
      name: "Pendientes",
      value: consultasPendientes,
      color: "#f59e0b",
    },
    {
      name: "En Proceso",
      value: Math.max(0, consultasTotal - consultasRespondidas - consultasPendientes),
      color: "#3b82f6",
    },
  ].filter((item) => item.value > 0)

  if (consultasTotal === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No hay datos para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
