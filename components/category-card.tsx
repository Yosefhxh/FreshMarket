import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/contexts/categories-context"
import "@/app/category-images.css"

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { title, icon, slug } = category
  const categoryHref = `/category/${slug}`

  return (
    <Link href={categoryHref}>
      <div className="category-card-bg rounded-lg p-6 flex flex-col items-center justify-center text-center h-full hover:bg-green-100 transition-all duration-300 hover:shadow-md">
        <div className="relative w-20 h-20 mb-3 overflow-hidden">
          <Image
            src={icon || "/placeholder.svg"}
            alt={title}
            fill
            className="category-image object-contain drop-shadow-sm"
          />
        </div>
        <h3 className="text-sm font-medium text-gray-800 transition-colors">{title}</h3>
      </div>
    </Link>
  )
}
