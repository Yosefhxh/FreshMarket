"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { createOrder } from "@/services/api"
import { Button } from "@/components/ui/button"

// Validation schema for checkout form
const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(), // Phone is optional
  zip: z.string().min(5, "Zip code must be at least 5 digits"),
  address: z.string().min(5, "Address is required"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { items, itemCount, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  const deliveryFee = 15.0
  const taxRate = 0.09
  const taxAmount = subtotal * taxRate
  const total = subtotal + deliveryFee + taxAmount

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.username || "",
      email: user?.email || "",
      phone: "",
      zip: "",
      address: "",
    },
  })

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!user) {
        throw new Error("You must be logged in to complete checkout")
      }

      // Prepare order data
      const orderData = {
        customer: user.id,
        customerName: data.name,
        email: data.email,
        phone: data.phone || "",
        address: data.address,
        zipCode: data.zip,
        subtotal,
        deliveryFee,
        taxAmount,
        total,
        status: "pending",
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity,
          total: item.price * item.cartQuantity,
          image: item.image,
        })),
      }

      // Create the order
      await createOrder(orderData)

      // Show success toast
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed.",
      })

      // Redirect to success page (don't clear cart here, it will be cleared in success page)
      router.push("/checkout/success")
    } catch (error) {
      console.error("Error processing order:", error)
      const errorMessage = error instanceof Error ? error.message : "Error processing your order"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add products to your cart before proceeding to checkout.</p>
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-green-600 py-4">
        <h1 className="text-2xl font-bold text-white text-center">Checkout</h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">Billing Details</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Phone Number (Optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Complete Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="md:col-span-1">
            <div className="bg-gray-100 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Total Cart ({itemCount})</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Delivery:</span>
                  <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                  <span className="font-bold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button className="w-full bg-[#ffc439] hover:bg-[#f0b82b] text-black font-bold py-3 rounded-md flex items-center justify-center">
                  <Image src="/placeholder.svg?height=24&width=80" alt="PayPal" width={80} height={24} />
                </button>
                <button className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-md">
                  Pay Later
                </button>
                <p className="text-center text-sm text-gray-500 mt-2">Two easy ways to pay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
