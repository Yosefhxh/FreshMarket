"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getUserOrders, deleteOrder } from "@/services/api"
import { Button } from "@/components/ui/button"
import { CancelOrderDialog } from "@/components/cancel-order-dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  total: number
  image?: string
}

interface Order {
  id: string
  attributes: {
    customerName: string
    email: string
    phone: string
    address: string
    zipCode: string
    subtotal: number
    deliveryFee: number
    taxAmount: number
    total: number
    status: "pending" | "processing" | "completed" | "cancelled"
    createdAt: string
    items: OrderItem[]
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean
    orderId: string | null
    orderTotal: number
  }>({
    isOpen: false,
    orderId: null,
    orderTotal: 0,
  })
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return

      try {
        setIsLoading(true)

        // Use the getUserOrders function from services/api.ts
        const data = await getUserOrders(user.id)
        console.log("Orders data:", data)

        // Verificar la estructura de la respuesta
        if (data && data.data) {
          setOrders(data.data)
        } else {
          console.warn("Unexpected response structure:", data)
          setOrders([])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setError(error instanceof Error ? error.message : "Error loading orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const handleCancelOrder = (orderId: string, orderTotal: number) => {
    setCancelDialog({
      isOpen: true,
      orderId,
      orderTotal,
    })
  }

  const confirmCancelOrder = async () => {
    if (!cancelDialog.orderId) return

    try {
      setIsCancelling(true)

      // Eliminar la orden completamente
      await deleteOrder(cancelDialog.orderId)

      // Actualizar la lista de órdenes
      setOrders(orders.filter((order) => order.id !== cancelDialog.orderId))

      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled and removed.",
      })

      setCancelDialog({
        isOpen: false,
        orderId: null,
        orderTotal: 0,
      })
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const closeCancelDialog = () => {
    setCancelDialog({
      isOpen: false,
      orderId: null,
      orderTotal: 0,
    })
  }

  const canCancelOrder = (status: string) => {
    return status === "pending" || status === "processing"
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-500 mb-6">You must be logged in to view your orders.</p>
        <Link href="/auth/login">
          <Button className="bg-green-600 hover:bg-green-700">Sign In</Button>
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 max-w-md mx-auto">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Back to Store</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-green-600 py-4">
        <h1 className="text-2xl font-bold text-white text-center">My Orders</h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-green-600 mb-6">Order History</h2>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have any orders yet</p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">Go Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                    <p className="font-bold">Order Date:</p>
                    <p>
                      {new Date(order.attributes.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                    <p className="font-bold">Total Amount:</p>
                    <p>${order.attributes.total.toFixed(2)}</p>
                  </div>
                  <div className="cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                    <p className="font-bold">Status:</p>
                    <p className="capitalize">{order.attributes.status}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                      View Details
                    </Button>
                    {canCancelOrder(order.attributes.status) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id, order.attributes.total)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CancelOrderDialog
        isOpen={cancelDialog.isOpen}
        onClose={closeCancelDialog}
        onConfirm={confirmCancelOrder}
        isLoading={isCancelling}
        orderTotal={cancelDialog.orderTotal}
      />
    </div>
  )
}
