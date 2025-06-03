"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Product } from "@/components/product-card"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  removeItemsFromWishlist: (productIds: string[]) => void
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [itemCount, setItemCount] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  const isInitialMount = useRef(true)

  // Load wishlist from localStorage on client side
  useEffect(() => {
    if (typeof window === "undefined") return

    if (!user) {
      setItems([])
      setItemCount(0)
      return
    }

    try {
      const savedWishlist = localStorage.getItem(`wishlist-${user.id}`)
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist)
        setItems(parsedWishlist)
        setItemCount(parsedWishlist.length)
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage:", error)
    }
  }, [user])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (!user) return

    try {
      localStorage.setItem(`wishlist-${user.id}`, JSON.stringify(items))
      setItemCount(items.length)
    } catch (error) {
      console.error("Failed to save wishlist to localStorage:", error)
    }
  }, [items, user])

  const addToWishlist = (product: Product) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (items.some((item) => item.id === product.id)) {
      toast({
        title: "Already in wishlist",
        description: `${product.name} is already in your wishlist`,
      })
      return
    }

    setItems((prevItems) => [...prevItems, product])

    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist`,
    })
  }

  const removeFromWishlist = (productId: string) => {
    if (!user) return

    const productToRemove = items.find((item) => item.id === productId)

    setItems((prevItems) => prevItems.filter((item) => item.id !== productId))

    if (productToRemove) {
      toast({
        title: "Removed from wishlist",
        description: `${productToRemove.name} has been removed from your wishlist`,
      })
    }
  }

  const removeItemsFromWishlist = (productIds: string[]) => {
    if (!user || productIds.length === 0) return

    const removedItems = items.filter((item) => productIds.includes(item.id))

    setItems((prevItems) => prevItems.filter((item) => !productIds.includes(item.id)))

    if (removedItems.length > 0) {
      toast({
        title: "Items removed from wishlist",
        description: `${removedItems.length} purchased item${removedItems.length > 1 ? "s" : ""} removed from your wishlist`,
      })
    }
  }

  const clearWishlist = () => {
    setItems([])
  }

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        removeItemsFromWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
