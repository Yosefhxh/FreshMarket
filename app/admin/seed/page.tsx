"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

// Productos de ejemplo para insertar en la base de datos
const sampleProducts = [
  {
    name: "Cauliflower 1 pc",
    price: 3,
    original_price: 4,
    image: "/images/products/cauliflower.png",
    quantity: "1 pc",
    category: "Vegetables",
  },
  {
    name: "Fresh Orange 6 pcs",
    price: 5,
    image: "/images/products/oranges.png",
    quantity: "6 pcs",
    category: "Fruits",
  },
  {
    name: "Red Carrot Vegetables",
    price: 4.99,
    original_price: 5.99,
    image: "/images/products/carrots.png",
    quantity: "250g",
    category: "Vegetables",
  },
  {
    name: "Pineapple Queen 1 pc",
    price: 2.98,
    image: "/images/products/pineapple.png",
    quantity: "1 pc",
    category: "Fruits",
  },
  {
    name: "Green Bell Pepper 500g",
    price: 3.49,
    original_price: 3.99,
    image: "/images/products/green-peppers.png",
    quantity: "500g",
    category: "Vegetables",
  },
  {
    name: "Mango Maaza Juice",
    price: 1.99,
    image: "/images/products/maaza.png",
    quantity: "1L",
    category: "Beverages",
  },
  {
    name: "Fresh Coriander Bunch",
    price: 0.99,
    image: "/images/products/coriander.png",
    quantity: "1 bunch",
    category: "Vegetables",
  },
  {
    name: "Organic Lemons 4 pcs",
    price: 2.49,
    image: "/images/products/lemons.png",
    quantity: "4 pcs",
    category: "Fruits",
  },
]

export default function SeedDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const seedProducts = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const supabase = createServerSupabaseClient()

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      // Insertar productos de ejemplo
      const { data, error: insertError } = await supabase.from("products").insert(sampleProducts).select()

      if (insertError) {
        throw insertError
      }

      setResult(`Successfully added ${data?.length || 0} products to the database.`)
      toast({
        title: "Success",
        description: `Added ${data?.length || 0} products to the database`,
      })
    } catch (err) {
      console.error("Error seeding products:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Seed Database</h1>

        <div className="space-y-4">
          <p className="text-gray-600">
            This will add sample products to your database. This is useful if you're starting with an empty database or
            want to add more test data.
          </p>

          <Button onClick={seedProducts} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Adding Products..." : "Add Sample Products"}
          </Button>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
          {result && <div className="p-3 bg-green-50 text-green-700 rounded-md">{result}</div>}
        </div>
      </div>
    </div>
  )
}
