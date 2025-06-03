"use client"

import { useCategories } from "@/contexts/categories-context"
import CategoryCard from "@/components/category-card"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useState } from "react"
import CategoryManager from "@/components/category-manager"

export default function CategorySection() {
  const { categories } = useCategories()
  const { user, isAdmin } = useAuth()
  const [isManagingCategories, setIsManagingCategories] = useState(false)

  return (
    <section id="categorias" className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-600">Comprar por Categoría</h2>
        {isAdmin && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsManagingCategories(!isManagingCategories)}
          >
            {isManagingCategories ? (
              <>
                <Settings className="h-4 w-4" /> Terminar Edición
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" /> Gestionar Categorías
              </>
            )}
          </Button>
        )}
      </div>

      {isManagingCategories && isAdmin ? (
        <CategoryManager onClose={() => setIsManagingCategories(false)} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  )
}
