"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Category {
  id: string
  title: string
  icon: string
  slug: string
}

// Default categories
const defaultCategories: Category[] = [
  { id: "1", title: "Vegetables", icon: "/images/vegetables-icon.png", slug: "vegetables" },
  { id: "2", title: "Fruits", icon: "/images/fruits-icon.png", slug: "fruits" },
  { id: "3", title: "Milk & Juice", icon: "/images/dairy-icon.png", slug: "milk-juice" },
  { id: "4", title: "Bakery", icon: "/images/bakery-icon.png", slug: "bakery" },
  { id: "5", title: "Personal Care", icon: "/images/personal-care-icon.png", slug: "personal-care" },
  { id: "6", title: "Grains", icon: "/images/grains-icon.png", slug: "grains" },
  { id: "7", title: "Chicken & Egg", icon: "/images/meat-icon.png", slug: "chicken-egg" },
]

interface CategoriesContextType {
  categories: Category[]
  addCategory: (category: Omit<Category, "id" | "slug">) => void
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "slug">>) => void
  deleteCategory: (id: string) => void
  getCategoryBySlug: (slug: string) => Category | undefined
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories)

  // Load categories from localStorage on mount
  useEffect(() => {
    const storedCategories = localStorage.getItem("grocery-categories")
    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories))
      } catch (error) {
        console.error("Failed to parse stored categories:", error)
      }
    }
  }, [])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("grocery-categories", JSON.stringify(categories))
  }, [categories])

  // Generate a slug from a title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/\s+&\s+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  const addCategory = (category: Omit<Category, "id" | "slug">) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      slug: generateSlug(category.title),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, categoryUpdate: Partial<Omit<Category, "id" | "slug">>) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === id) {
          const updatedCategory = {
            ...cat,
            ...categoryUpdate,
          }
          // If title is updated, regenerate the slug
          if (categoryUpdate.title) {
            updatedCategory.slug = generateSlug(categoryUpdate.title)
          }
          return updatedCategory
        }
        return cat
      }),
    )
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const getCategoryBySlug = (slug: string) => {
    return categories.find((cat) => cat.slug === slug)
  }

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryBySlug,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
