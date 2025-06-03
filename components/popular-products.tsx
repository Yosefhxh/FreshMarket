"use client"

import { useEffect, useState } from "react"
import ProductCard, { type Product } from "./product-card"
import { getProducts } from "@/services/api"

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Obteniendo productos...")
        const data = await getProducts()

        if (!data || data.length === 0) {
          console.log("No se encontraron productos")
          setError("No hay productos disponibles")
          return
        }

        console.log(`Se recibieron ${data.length} productos`)

        // Convertir los datos de Supabase al formato esperado por ProductCard
        const formattedProducts = data.map((product) => ({
          id: product.id,
          name: product.name,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
          originalPrice: product.original_price
            ? typeof product.original_price === "string"
              ? Number.parseFloat(product.original_price)
              : product.original_price
            : undefined,
          image: product.image || "/placeholder.svg?height=200&width=200",
          quantity: product.quantity || "1 unidad",
          category: product.category,
        }))

        setProducts(formattedProducts)
      } catch (error) {
        console.error("Error al obtener productos:", error)
        setError("Error al cargar los productos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section id="productos" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-6">Nuestros Productos Populares</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="productos" className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-6">Nuestros Productos Populares</h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="productos" className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-green-600 mb-6">Nuestros Productos Populares</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
