"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function SetupDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null)
  const [tables, setTables] = useState<{ name: string; exists: boolean }[]>([])

  const checkTables = async () => {
    setIsLoading(true)
    setStatus(null)

    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Lista de tablas que deberían existir
      const requiredTables = ["products", "profiles", "orders", "order_items"]
      const tableStatus = []

      // Verificar cada tabla
      for (const tableName of requiredTables) {
        const { data, error } = await supabase.from(tableName).select("*").limit(1)

        tableStatus.push({
          name: tableName,
          exists: !error,
        })
      }

      setTables(tableStatus)

      const allTablesExist = tableStatus.every((table) => table.exists)

      if (allTablesExist) {
        setStatus({
          message: "All required tables exist in the database.",
          success: true,
        })
      } else {
        setStatus({
          message: "Some tables are missing. Click 'Create Tables' to set up the database.",
          success: false,
        })
      }
    } catch (error) {
      console.error("Error checking tables:", error)
      setStatus({
        message: `Error checking tables: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTables = async () => {
    setIsLoading(true)
    setStatus(null)

    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      // Crear tabla de perfiles si no existe
      if (!tables.find((t) => t.name === "profiles")?.exists) {
        const { error: profilesError } = await supabase.rpc("create_profiles_table")

        if (profilesError && !profilesError.message.includes("already exists")) {
          throw new Error(`Error creating profiles table: ${profilesError.message}`)
        }
      }

      // Crear tabla de productos si no existe
      if (!tables.find((t) => t.name === "products")?.exists) {
        const { error: productsError } = await supabase.rpc("create_products_table")

        if (productsError && !productsError.message.includes("already exists")) {
          throw new Error(`Error creating products table: ${productsError.message}`)
        }
      }

      // Crear tabla de órdenes si no existe
      if (!tables.find((t) => t.name === "orders")?.exists) {
        const { error: ordersError } = await supabase.rpc("create_orders_table")

        if (ordersError && !ordersError.message.includes("already exists")) {
          throw new Error(`Error creating orders table: ${ordersError.message}`)
        }
      }

      // Crear tabla de elementos de orden si no existe
      if (!tables.find((t) => t.name === "order_items")?.exists) {
        const { error: orderItemsError } = await supabase.rpc("create_order_items_table")

        if (orderItemsError && !orderItemsError.message.includes("already exists")) {
          throw new Error(`Error creating order_items table: ${orderItemsError.message}`)
        }
      }

      // Verificar las tablas nuevamente
      await checkTables()

      setStatus({
        message: "Database setup completed successfully!",
        success: true,
      })
    } catch (error) {
      console.error("Error creating tables:", error)
      setStatus({
        message: `Error creating tables: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Check and create the required tables for the grocery store application.</CardDescription>
        </CardHeader>
        <CardContent>
          {status && (
            <Alert className={status.success ? "bg-green-50" : "bg-red-50"} variant="outline">
              <div className="flex items-center gap-2">
                {status.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
              </div>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {tables.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Table Status:</h3>
              <div className="space-y-2">
                {tables.map((table) => (
                  <div key={table.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span className="font-mono text-sm">{table.name}</span>
                    <span className={table.exists ? "text-green-600" : "text-red-600"}>
                      {table.exists ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={checkTables} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Check Tables"}
          </Button>
          <Button onClick={createTables} disabled={isLoading || (tables.length > 0 && tables.every((t) => t.exists))}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Tables"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
