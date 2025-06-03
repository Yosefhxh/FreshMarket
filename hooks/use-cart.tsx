"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode, useCallback } from "react"
import type { Product } from "@/components/product-card"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface CartItem extends Product {
  quantity: string
  cartQuantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  itemCount: number
  showToast: (product: Product, action: "add" | "remove") => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  const isInitialMount = useRef(true)

  // Function to show toast - moved outside of render to avoid setState during render
  const showToast = (product: Product, action: "add" | "remove") => {
    // We'll implement this in a separate useEffect to avoid the error
    // This is just a placeholder function to include in the context
  }

  // Load cart from localStorage on client side
  useEffect(() => {
    if (typeof window === "undefined") return

    if (!user) {
      setItems([])
      setItemCount(0)
      return
    }

    try {
      const savedCart = localStorage.getItem(`cart-${user.id}`)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
        setItemCount(parsedCart.reduce((total: number, item: CartItem) => total + item.cartQuantity, 0))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [user])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!user) return

    try {
      localStorage.setItem(`cart-${user.id}`, JSON.stringify(items))
      setItemCount(items.reduce((total, item) => total + item.cartQuantity, 0))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items, user])

  const addToCart = (product: Product) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login")
      return
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)

      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
        )
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevItems, { ...product, cartQuantity: 1 }]
      }
    })

    // We'll handle toast notifications separately
  }

  const removeFromCart = (productId: string) => {
    if (!user) return // Don't remove from cart if user is not authenticated

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId)

      if (existingItem && existingItem.cartQuantity > 1) {
        // If quantity > 1, decrease quantity
        return prevItems.map((item) =>
          item.id === productId ? { ...item, cartQuantity: item.cartQuantity - 1 } : item,
        )
      } else {
        // If quantity is 1, remove item
        return prevItems.filter((item) => item.id !== productId)
      }
    })
  }

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, itemCount, showToast }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
