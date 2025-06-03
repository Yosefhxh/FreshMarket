"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

export default function CheckoutSuccess() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { removeItemsFromWishlist, isInWishlist } = useWishlist()
  const hasProcessed = useRef(false)
  const [orderNumber] = useState(() => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
  const [removedFromWishlist, setRemovedFromWishlist] = useState<string[]>([])

  useEffect(() => {
    // Prevent the effect from running multiple times
    if (hasProcessed.current || items.length === 0) return

    // Mark as processed
    hasProcessed.current = true

    // Get the purchased item IDs and check which ones are in wishlist
    const purchasedItemIds = items.map((item) => item.id)
    const itemsInWishlist = purchasedItemIds.filter((id) => isInWishlist(id))

    // Store which items were removed from wishlist for display
    setRemovedFromWishlist(itemsInWishlist)

    // Remove purchased items from wishlist if they exist there
    if (itemsInWishlist.length > 0) {
      removeItemsFromWishlist(itemsInWishlist)
    }

    // Clear the cart after processing
    setTimeout(() => {
      clearCart()
    }, 100)
  }, [items, clearCart, removeItemsFromWishlist, isInWishlist])

  // Redirect to home page after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 15000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Order Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your purchase! Your order has been confirmed and will be processed shortly.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Order Number:</p>
            <p className="font-mono text-sm font-medium">{orderNumber}</p>
          </div>

          {removedFromWishlist.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Wishlist Updated</p>
              </div>
              <p className="text-xs text-blue-600">
                {removedFromWishlist.length} item{removedFromWishlist.length > 1 ? "s" : ""} removed from your wishlist
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500">You will receive an email confirmation with your order details.</p>

          <div className="space-y-2 pt-4">
            <Button onClick={() => router.push("/orders")} className="w-full bg-green-600 hover:bg-green-700">
              <ShoppingBag className="w-4 h-4 mr-2" />
              View My Orders
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Continue Shopping
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-4">Redirecting to home page in 15 seconds...</p>
        </CardContent>
      </Card>
    </div>
  )
}
