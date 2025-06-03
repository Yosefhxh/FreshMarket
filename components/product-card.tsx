"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { Heart, Plus } from "lucide-react"
import ProductDetailModal from "./product-detail-modal"

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: string
  category: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    addToCart(product)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <Card
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2 right-2 ${isWishlisted ? "text-red-500" : "text-gray-400"} hover:text-red-500`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.quantity}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>

              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddToCart}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductDetailModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
