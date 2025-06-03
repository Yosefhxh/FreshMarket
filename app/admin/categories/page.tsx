"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import CategoryManager from "@/components/category-manager"

export default function AdminCategoriesPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    } else if (!isAdmin) {
      router.push("/access-denied")
    }
  }, [user, isAdmin, router])

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/database">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Category Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CategoryManager onClose={() => {}} />
      </div>
    </div>
  )
}
