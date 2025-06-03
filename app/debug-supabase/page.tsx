"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, AlertTriangle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

export default function DebugSupabasePage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [details, setDetails] = useState<any>(null)

  const runDiagnostics = async () => {
    setStatus("loading")
    setDetails(null)

    const diagnostics = {
      envVars: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      },
      client: null,
      connection: null,
      tables: {},
    }

    try {
      // 1. Verificar variables de entorno
      console.log("Environment variables:", diagnostics.envVars)

      // 2. Crear cliente
      const supabase = getSupabaseClient()
      diagnostics.client = !!supabase

      if (!supabase) {
        throw new Error("Failed to create Supabase client")
      }

      // 3. Probar conexión básica
      const { data: connectionTest, error: connectionError } = await supabase.from("products").select("count").limit(1)

      if (connectionError) {
        diagnostics.connection = { error: connectionError.message, code: connectionError.code }
      } else {
        diagnostics.connection = { success: true, data: connectionTest }
      }

      // 4. Verificar cada tabla
      const tables = ["products", "profiles", "orders", "order_items"]

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select("*").limit(1)
          diagnostics.tables[table] = {
            exists: !error,
            error: error?.message,
            sampleData: data?.length || 0,
          }
        } catch (err) {
          diagnostics.tables[table] = {
            exists: false,
            error: err instanceof Error ? err.message : "Unknown error",
          }
        }
      }

      setDetails(diagnostics)
      setStatus("success")
    } catch (error) {
      console.error("Diagnostics error:", error)
      setDetails({
        ...diagnostics,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      setStatus("error")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Supabase Connection Diagnostics
          </CardTitle>
          <CardDescription>Comprehensive test of your Supabase configuration and database connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={runDiagnostics}
              disabled={status === "loading"}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {status === "loading" ? "Running Diagnostics..." : "Run Full Diagnostics"}
            </Button>

            {details && (
              <div className="space-y-4">
                {/* Environment Variables */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Environment Variables</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1 font-mono text-sm">
                      <div>Supabase URL: {details.envVars.supabaseUrl || "❌ NOT SET"}</div>
                      <div>Anon Key: {details.envVars.hasAnonKey ? "✅ SET" : "❌ NOT SET"}</div>
                      <div>Key Length: {details.envVars.anonKeyLength} characters</div>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Client Creation */}
                <Alert className={details.client ? "bg-green-50" : "bg-red-50"}>
                  {details.client ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>Supabase Client</AlertTitle>
                  <AlertDescription>
                    {details.client ? "✅ Client created successfully" : "❌ Failed to create client"}
                  </AlertDescription>
                </Alert>

                {/* Connection Test */}
                <Alert className={details.connection?.success ? "bg-green-50" : "bg-red-50"}>
                  {details.connection?.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>Database Connection</AlertTitle>
                  <AlertDescription>
                    {details.connection?.success ? (
                      "✅ Successfully connected to database"
                    ) : (
                      <div>
                        <div>❌ Connection failed</div>
                        {details.connection?.error && (
                          <div className="mt-1 font-mono text-sm bg-red-100 p-2 rounded">
                            Error: {details.connection.error}
                            {details.connection.code && ` (Code: ${details.connection.code})`}
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {/* Tables Status */}
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Database Tables</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      {Object.entries(details.tables).map(([tableName, tableInfo]: [string, any]) => (
                        <div key={tableName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-mono">{tableName}</span>
                          <div className="flex items-center gap-2">
                            {tableInfo.exists ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">{tableInfo.sampleData} records</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-600">{tableInfo.error}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Raw Details */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Raw Diagnostic Data</summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
