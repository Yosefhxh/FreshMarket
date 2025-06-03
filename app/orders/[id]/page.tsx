"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getOrder, deleteOrder } from "@/services/api"
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean
    orderTotal: number
  }>({
    isOpen: false,
    orderTotal: 0,
  })
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchOrder() {
      if (!user) return

      try {
        setIsLoading(true)

        // Use the getOrder function from services/api.ts
        const data = await getOrder(params.id)
        console.log("Order data:", data)

        // Verificar la estructura de la respuesta
        if (data && data.data) {
          setOrder(data.data)
        } else {
          console.warn("Unexpected response structure:", data)
          setError("Order not found or invalid response format")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        setError(error instanceof Error ? error.message : "Error loading order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [user, params.id])

  const handleCancelOrder = () => {
    if (!order) return
    setCancelDialog({
      isOpen: true,
      orderTotal: order.attributes.total,
    })
  }

  const confirmCancelOrder = async () => {
    if (!order) return

    try {
      setIsCancelling(true)

      // Eliminar la orden completamente
      await deleteOrder(order.id)

      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled and removed.",
      })

      // Redirigir a la página de órdenes
      router.push("/orders")
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
        <p className="text-gray-500 mb-6">You must be logged in to view order details.</p>
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
        <p>Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 max-w-md mx-auto">
          <p className="font-medium">Error</p>
          <p>{error || "Order not found"}</p>
        </div>
        <Link href="/orders">
          <Button className="bg-green-600 hover:bg-green-700">Back to My Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-green-600 py-4">
        <h1 className="text-2xl font-bold text-white text-center">Order Details</h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-600">Order #{order.id.substring(0, 8)}</h2>
          {canCancelOrder(order.attributes.status) && (
            <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
        </div>

        {/* Order Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-bold">Order Date:</p>
              <p>
                {new Date(order.attributes.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="font-bold">Total Amount:</p>
              <p>${order.attributes.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-bold">Status:</p>
              <p className="capitalize">{order.attributes.status}</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg p-4 border mb-6">
          <h3 className="text-xl font-bold mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-bold">Name:</p>
              <p>{order.attributes.customerName}</p>
            </div>
            <div>
              <p className="font-bold">Email:</p>
              <p>{order.attributes.email}</p>
            </div>
            <div>
              <p className="font-bold">Phone:</p>
              <p>{order.attributes.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="font-bold">Address:</p>
              <p>
                {order.attributes.address}, {order.attributes.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-xl font-bold">Order Items</h3>
          </div>
          <div className="divide-y">
            {order.attributes.items && Array.isArray(order.attributes.items) ? (
              order.attributes.items.map((item, index) => (
                <div key={index} className="p-4 flex items-center">
                  <div className="w-20 h-20 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p>Quantity: {item.quantity}</p>
                    <p className="font-bold">Total: ${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No items found for this order</div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-4 border mb-6">
          <h3 className="text-xl font-bold mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.attributes.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>${order.attributes.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.attributes.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${order.attributes.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/orders">
            <Button className="bg-green-600 hover:bg-green-700">Back to Orders</Button>
          </Link>
        </div>
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
