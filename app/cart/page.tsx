"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react"

export default function CartPage() {
  const { items, addToCart, removeFromCart, clearCart, itemCount } = useCart()

  const totalPrice = items.reduce((total, item) => total + item.price * item.cartQuantity, 0)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <ShoppingBasket className="h-16 w-16 text-gray-400" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-gray-500 mb-4">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <h3 className="font-medium">Product</h3>
                </div>
                <div className="col-span-2 text-center">
                  <h3 className="font-medium">Price</h3>
                </div>
                <div className="col-span-2 text-center">
                  <h3 className="font-medium">Quantity</h3>
                </div>
                <div className="col-span-2 text-right">
                  <h3 className="font-medium">Total</h3>
                </div>
              </div>
            </div>

            {items.map((item) => (
              <div key={item.id} className="p-4 border-b last:border-0">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.cartQuantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addToCart(item)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="font-medium">${(item.price * item.cartQuantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
              onClick={clearCart}
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>

            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(totalPrice * 0.05).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(totalPrice + totalPrice * 0.05).toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" className="w-full">
              <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
