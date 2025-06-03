"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ShoppingCart, Plus, Minus, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import type { Product } from "@/components/product-card"

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  const router = useRouter()

  // Reset quantity when modal opens with a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
    }
  }, [isOpen, product])

  if (!product) return null

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const totalPrice = product.price * quantity

  const handleAddToCart = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login")
      onClose()
      return
    }

    // Add to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }

    // Show toast notification after adding to cart
    setTimeout(() => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      })
    }, 0)

    onClose()
  }

  const handleAddToWishlist = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login")
      onClose()
      return
    }

    addToWishlist(product)
    onClose()
  }

  const productInWishlist = product ? isInWishlist(product.id) : false

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gray-100 p-8 flex items-center justify-center">
            <div className="relative h-64 w-64">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-gray-600 mt-1">{`Fresh ${product.name} ready to eat`}</p>

            <div className="flex items-center gap-2 mt-4">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="mt-6">
              <p className="font-medium">Quantity ({product.quantity})</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="w-8 h-8 flex items-center justify-center border rounded-md"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center border rounded-md"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="ml-4 font-medium">= ${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center gap-2"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add To Cart
              </Button>

              <Button
                variant="outline"
                className={`flex items-center gap-2 ${productInWishlist ? "text-red-500 border-red-500" : ""}`}
                onClick={handleAddToWishlist}
                disabled={productInWishlist}
              >
                <Heart className={`h-4 w-4 ${productInWishlist ? "fill-red-500" : ""}`} />
                {productInWishlist ? "In Wishlist" : "Wishlist"}
              </Button>
            </div>

            <div className="mt-4 text-sm">
              <span className="font-medium">Category:</span> {product.category || "Vegetables"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
