"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabaseTest() {
  const [status, setStatus] = useState<string>("Testing connection...")
  const [products, setProducts] = useState<any[]>([])

  const testConnection = async () => {
    try {
      setStatus("Testing Supabase connection...")

      const supabase = getSupabaseClient()

      if (!supabase) {
        setStatus("❌ Failed to create Supabase client")
        return
      }

      setStatus("✅ Supabase client created successfully")

      // Test simple query without authentication
      const { data, error } = await supabase.from("products").select("id, name, price").limit(5)

      if (error) {
        setStatus(`❌ Database error: ${error.message}`)
        console.error("Database error:", error)
        return
      }

      if (data) {
        setProducts(data)
        setStatus(`✅ Successfully fetched ${data.length} products`)
      } else {
        setStatus("⚠️ No products found in database")
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
      console.error("Connection error:", error)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Testing connection to Supabase database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-mono text-sm">{status}</p>
          </div>

          {products.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Sample Products:</h3>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="p-2 bg-white border rounded">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-gray-600 ml-2">${product.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={testConnection} className="w-full">
            Test Connection Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
