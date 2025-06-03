"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, Trash2, Heart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeFromCart } = useCart()
  const { addToWishlist, isInWishlist } = useWishlist()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Evitar errores de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.cartQuantity, 0)

  const handleCheckout = () => {
    onClose()
    router.push("/checkout")
  }

  const moveToWishlist = (item: any) => {
    // Primero eliminamos del carrito
    removeFromCart(item.id)

    // Luego añadimos a la lista de deseos si no está ya
    if (!isInWishlist(item.id)) {
      addToWishlist(item)
      toast({
        title: "Moved to wishlist",
        description: `${item.name} has been moved to your wishlist`,
      })
    }
  }

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-green-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Cart</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex border-b pb-4">
                  <div className="w-24 h-24 relative flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveToWishlist(item)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Move to wishlist"
                          title="Move to wishlist"
                        >
                          <Heart className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">Quantity {item.cartQuantity}</p>
                    <p className="font-medium text-gray-900 mt-1">$ {(item.price * item.cartQuantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-lg">Subtotal</span>
            <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md"
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
