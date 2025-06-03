"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<string | null>(null)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus("error")
      setMessage("Las variables de entorno de Supabase no están configuradas correctamente")
      setDetails(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Configurado" : "No configurado"}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "Configurado" : "No configurado"}`)
      return
    }

    try {
      setStatus("loading")
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("No se pudo inicializar el cliente de Supabase")
      }

      // Intentamos hacer una petición simple a la API
      const { data, error } = await supabase.from("products").select("count")

      if (error) {
        throw error
      }

      setStatus("success")
      setMessage(`Conexión exitosa a ${supabaseUrl}`)
      setDetails(`Se pudo conectar correctamente a la base de datos.`)
    } catch (error) {
      console.error("Error de conexión:", error)
      setStatus("error")
      setMessage(`No se pudo conectar a ${supabaseUrl}`)
      setDetails(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Database className="mr-2 h-5 w-5" /> Prueba de conexión a Supabase
          </h3>
          <p className="text-sm text-gray-500">URL configurada: {supabaseUrl || "No configurada"}</p>
        </div>
        <Button onClick={testConnection} disabled={status === "loading"} className="bg-green-600 hover:bg-green-700">
          {status === "loading" ? "Probando..." : "Probar conexión"}
        </Button>
      </div>

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Conexión exitosa</AlertTitle>
          <AlertDescription className="text-green-700">
            {message}
            {details && <pre className="mt-2 p-2 bg-green-100 rounded text-xs">{details}</pre>}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error de conexión</AlertTitle>
          <AlertDescription className="text-red-700">
            {message}
            {details && <pre className="mt-2 p-2 bg-red-100 rounded text-xs whitespace-pre-wrap">{details}</pre>}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
