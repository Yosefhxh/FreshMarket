"use client"

import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/components/product-card"
import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { useCategories } from "@/contexts/categories-context"
import { getProducts } from "@/services/api"

export default function CategoryPage() {
  const params = useParams()
  const { categories, getCategoryBySlug } = useCategories()
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [currentCategory, setCurrentCategory] = useState<any>(null)
  const [normalizedSlug, setNormalizedSlug] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para normalizar nombres de categorías para comparación
  const normalizeCategory = (category: string) => {
    return category.toLowerCase().replace(/[^a-z0-9]/g, "")
  }

  // Función mejorada para verificar si un producto pertenece a la categoría actual
  const belongsToCategory = (product: any, categoryTitle: string) => {
    if (!product.category || !categoryTitle) return false

    const productCategory = normalizeCategory(product.category)
    const normalizedTitle = normalizeCategory(categoryTitle)

    // Mapeo extenso que incluye todas las variantes posibles
    const categoryMappings: Record<string, string[]> = {
      // Vegetables / Verduras
      vegetables: ["vegetables", "vegetable", "verduras", "verdura"],
      verduras: ["vegetables", "vegetable", "verduras", "verdura"],

      // Fruits / Frutas
      fruits: ["fruits", "fruit", "frutas", "fruta"],
      frutas: ["fruits", "fruit", "frutas", "fruta"],

      // Milk & Juice / Lácteos
      milkjuice: ["dairy", "milk", "juice", "beverages", "beverage", "lacteos", "leche"],
      lacteos: ["dairy", "milk", "juice", "beverages", "beverage", "lacteos", "leche"],
      milkandjuice: ["dairy", "milk", "juice", "beverages", "beverage", "lacteos", "leche"],
      lechejugo: ["dairy", "milk", "juice", "beverages", "beverage", "lacteos", "leche"],

      // Bakery / Panadería
      bakery: ["bakery", "bread", "baked", "panaderia", "pan"],
      panaderia: ["bakery", "bread", "baked", "panaderia", "pan"],
      pan: ["bakery", "bread", "baked", "panaderia", "pan"],

      // Personal Care / Cuidado Personal
      personalcare: ["personalcare", "personal", "care", "hygiene", "cuidadopersonal"],
      cuidadopersonal: ["personalcare", "personal", "care", "hygiene", "cuidadopersonal"],

      // Grains / Granos
      grains: ["grains", "grain", "rice", "cereal", "granos", "grano"],
      granos: ["grains", "grain", "rice", "cereal", "granos", "grano"],

      // Chicken & Egg / Carnes & Huevo
      chickenegg: ["meat", "poultry", "chicken", "egg", "eggs", "protein", "carnes", "carne", "huevo"],
      carneshuevo: ["meat", "poultry", "chicken", "egg", "eggs", "protein", "carnes", "carne", "huevo"],
      carneyhuevo: ["meat", "poultry", "chicken", "egg", "eggs", "protein", "carnes", "carne", "huevo"],
      meatpoultry: ["meat", "poultry", "chicken", "egg", "eggs", "protein", "carnes", "carne", "huevo"],
    }

    // Buscar mapeos directos
    let mappings = categoryMappings[normalizedTitle] || []

    // Si no encuentra mapeo directo, buscar por palabras clave
    if (mappings.length === 0) {
      // Buscar en todas las categorías si alguna palabra coincide
      for (const [key, values] of Object.entries(categoryMappings)) {
        if (key.includes(normalizedTitle) || normalizedTitle.includes(key)) {
          mappings = values
          break
        }
        // También buscar en los valores
        for (const value of values) {
          if (value.includes(normalizedTitle) || normalizedTitle.includes(value)) {
            mappings = values
            break
          }
        }
        if (mappings.length > 0) break
      }
    }

    // Si aún no encuentra, usar el título normalizado directamente
    if (mappings.length === 0) {
      mappings = [normalizedTitle]
    }

    // Verificar coincidencias
    const matches = mappings.some((mapping) => {
      const normalizedMapping = normalizeCategory(mapping)
      return productCategory.includes(normalizedMapping) || normalizedMapping.includes(productCategory)
    })

    return matches
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching products for category page...")
        const data = await getProducts()

        if (!data || data.length === 0) {
          console.log("No products found")
          setAllProducts([])
          return
        }

        console.log(`Received ${data.length} products`)

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
          quantity: product.quantity || "1 pc",
          category: product.category || "General",
        }))

        setAllProducts(formattedProducts)
      } catch (error) {
        console.error("Error in fetchProducts:", error)
        setError("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (!params || !params.slug) {
      notFound()
      return
    }

    const slug = typeof params.slug === "string" ? params.slug : params.slug[0]
    setNormalizedSlug(slug)

    // Get category from context
    const category = getCategoryBySlug(slug)
    if (!category) {
      console.error(`Category not found: ${slug}`)
      notFound()
      return
    }

    setCurrentCategory(category)
  }, [params, getCategoryBySlug])

  useEffect(() => {
    if (currentCategory && allProducts.length > 0) {
      // Filtrar productos que pertenecen a la categoría actual
      const categoryProducts = allProducts.filter((product) => belongsToCategory(product, currentCategory.title))

      console.log(`Filtered ${categoryProducts.length} products for category: ${currentCategory.title}`)
      setProducts(categoryProducts)
    }
  }, [currentCategory, allProducts])

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Category header */}
      <div className="bg-green-600 py-4">
        <h1 className="text-3xl font-bold text-white text-center">{currentCategory.title}</h1>
      </div>

      {/* Category navigation - usando las mismas imágenes que la página principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`block ${normalizedSlug === category.slug ? "bg-green-600" : "bg-green-50"} rounded-lg p-4 text-center transition-colors hover:bg-green-100`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative w-12 h-12 mb-2">
                  <Image
                    src={category.icon || "/placeholder.svg"}
                    alt={category.title}
                    fill
                    className="object-contain drop-shadow-sm"
                    style={{
                      mixBlendMode: "multiply",
                      filter: "contrast(1.1) saturate(1.2)",
                    }}
                  />
                </div>
                <h3
                  className={`text-sm font-medium ${normalizedSlug === category.slug ? "text-white" : "text-gray-800"}`}
                >
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-green-600 mb-6">Popular Products</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600">No products available in this category yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Products will appear here when they are added to the "{currentCategory.title}" category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
