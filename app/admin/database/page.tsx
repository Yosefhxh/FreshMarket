"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Database, ShieldAlert, Plus, Pencil, Trash2, Check, X, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function DatabaseAdminPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = getSupabaseClient()

  // Estados para gestión de productos
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteProductOpen, setIsDeleteProductOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    original_price: "",
    quantity: "",
    category: "",
    image: "",
    description: "",
  })

  // Estados para gestión de órdenes
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("pending")

  // Redirigir si el usuario no está autenticado o no es administrador
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    } else if (!isAdmin) {
      router.push("/access-denied")
    }
  }, [user, isAdmin, router])

  // Cargar datos según la pestaña activa
  useEffect(() => {
    async function fetchData() {
      if (!user || !isAdmin) return

      setLoading(true)
      setError(null)

      try {
        let query = supabase.from(activeTab).select("*")

        // Aplicar búsqueda si hay un término
        if (searchTerm) {
          // Adaptar la búsqueda según la tabla
          switch (activeTab) {
            case "products":
              query = query.ilike("name", `%${searchTerm}%`)
              break
            case "profiles":
              query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
              break
            case "orders":
              query = query.or(`customer_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
              break
            case "order_items":
              query = query.ilike("name", `%${searchTerm}%`)
              break
          }
        }

        // Ordenar según la tabla
        switch (activeTab) {
          case "products":
            query = query.order("name")
            break
          case "profiles":
            query = query.order("username")
            break
          case "orders":
            query = query.order("created_at", { ascending: false })
            break
          case "order_items":
            query = query.order("name")
            break
        }

        // Limitar a 100 registros para evitar problemas de rendimiento
        query = query.limit(100)

        const { data: result, error: queryError } = await query

        if (queryError) {
          throw queryError
        }

        setData(result || [])
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err)
        setError(`Failed to load ${activeTab}. ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, searchTerm, supabase, user, isAdmin])

  // Función para refrescar los datos
  const refreshData = () => {
    setSearchTerm("")
    setLoading(true)
    // El efecto se encargará de recargar los datos
  }

  // Funciones para gestión de productos
  const handleAddProduct = async () => {
    try {
      // Validar campos requeridos
      if (!productForm.name || !productForm.price || !productForm.category) {
        toast({
          title: "Error",
          description: "Name, price and category are required",
          variant: "destructive",
        })
        return
      }

      // Convertir precio a número
      const price = Number.parseFloat(productForm.price)
      const original_price = productForm.original_price ? Number.parseFloat(productForm.original_price) : null

      if (isNaN(price) || (productForm.original_price && isNaN(original_price as number))) {
        toast({
          title: "Error",
          description: "Price must be a valid number",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase.from("products").insert([
        {
          name: productForm.name,
          price,
          original_price,
          quantity: productForm.quantity,
          category: productForm.category,
          image: productForm.image || "/placeholder.svg",
          // Eliminar description de aquí también
        },
      ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      // Limpiar formulario y cerrar diálogo
      setProductForm({
        name: "",
        price: "",
        original_price: "",
        quantity: "",
        category: "",
        image: "",
        description: "",
      })
      setIsAddProductOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async () => {
    try {
      if (!currentProduct) return

      // Validar campos requeridos
      if (!productForm.name || !productForm.price || !productForm.category) {
        toast({
          title: "Error",
          description: "Name, price and category are required",
          variant: "destructive",
        })
        return
      }

      // Convertir precio a número
      const price = Number.parseFloat(productForm.price)
      const original_price = productForm.original_price ? Number.parseFloat(productForm.original_price) : null

      if (isNaN(price) || (productForm.original_price && isNaN(original_price as number))) {
        toast({
          title: "Error",
          description: "Price must be a valid number",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          name: productForm.name,
          price,
          original_price,
          quantity: productForm.quantity,
          category: productForm.category,
          image: productForm.image || "/placeholder.svg",
          // Eliminar description de aquí
        })
        .eq("id", currentProduct.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product updated successfully",
      })

      // Limpiar formulario y cerrar diálogo
      setProductForm({
        name: "",
        price: "",
        original_price: "",
        quantity: "",
        category: "",
        image: "",
        description: "", // Mantener en el estado local pero no enviar a la DB
      })
      setCurrentProduct(null)
      setIsEditProductOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async () => {
    try {
      if (!currentProduct) return

      const { error } = await supabase.from("products").delete().eq("id", currentProduct.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      setCurrentProduct(null)
      setIsDeleteProductOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const openEditProductDialog = (product: any) => {
    setCurrentProduct(product)
    setProductForm({
      name: product.name || "",
      price: product.price ? product.price.toString() : "",
      original_price: product.original_price ? product.original_price.toString() : "",
      quantity: product.quantity || "",
      category: product.category || "",
      image: product.image || "",
      description: "", // Eliminar referencia a product.description
    })
    setIsEditProductOpen(true)
  }

  const openDeleteProductDialog = (product: any) => {
    setCurrentProduct(product)
    setIsDeleteProductOpen(true)
  }

  // Función para actualizar el estado de una orden
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })

      setEditingOrderId(null)
      refreshData()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  // Renderizar las columnas según la tabla activa
  const renderColumns = () => {
    switch (activeTab) {
      case "products":
        return (
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        )
      case "profiles":
        return (
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        )
      case "orders":
        return (
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Total</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Created At</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        )
      case "order_items":
        return (
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Order ID</th>
            <th className="px-4 py-2 text-left">Product</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Price</th>
          </tr>
        )
      default:
        return null
    }
  }

  // Renderizar las filas según la tabla activa
  const renderRows = () => {
    if (!data.length) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
            {loading ? "Loading data..." : error ? error : "No data found"}
          </td>
        </tr>
      )
    }

    return data.map((item) => {
      switch (activeTab) {
        case "products":
          return (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">${Number.parseFloat(item.price).toFixed(2)}</td>
              <td className="px-4 py-2">{item.category}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditProductDialog(item)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteProductDialog(item)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )
        case "profiles":
          return (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.username}</td>
              <td className="px-4 py-2">{item.email}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {item.role || "customer"}
                </span>
              </td>
              <td className="px-4 py-2">{item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</td>
              <td className="px-4 py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/users")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Manage Roles
                </Button>
              </td>
            </tr>
          )
        case "orders":
          return (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.customer_name}</td>
              <td className="px-4 py-2">${Number.parseFloat(item.total).toFixed(2)}</td>
              <td className="px-4 py-2">
                {editingOrderId === item.id ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedOrderStatus}
                      onValueChange={setSelectedOrderStatus}
                      defaultValue={item.status}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOrderStatus(item.id, selectedOrderStatus)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingOrderId(null)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingOrderId(item.id)
                        setSelectedOrderStatus(item.status)
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </td>
              <td className="px-4 py-2">{item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</td>
              <td className="px-4 py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/orders/${item.id}`)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View Details
                </Button>
              </td>
            </tr>
          )
        case "order_items":
          return (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.order_id}</td>
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2">${Number.parseFloat(item.price).toFixed(2)}</td>
            </tr>
          )
        default:
          return null
      }
    })
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Database className="mr-2 h-6 w-6" /> Database Administration
        </h1>
        <Link href="/admin/users">
          <Button variant="outline" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Manage Users
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="order_items">Order Items</TabsTrigger>
            <Link href="/admin/categories">
              <Button variant="outline" className="flex items-center gap-2 ml-4">
                <Tag className="h-4 w-4" />
                Manage Categories
              </Button>
            </Link>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder={`Search ${activeTab}...`}
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === "products" && (
              <Button onClick={() => setIsAddProductOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="products" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="order_items" className="mt-0">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">{renderColumns()}</thead>
                <tbody>{renderRows()}</tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-sm text-gray-500">
        <p>Showing up to 100 records. Use the search box to filter results.</p>
      </div>

      {/* Diálogo para añadir producto */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details to add a new product to the database.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price*
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="original_price" className="text-right">
                Original Price
              </Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                value={productForm.original_price}
                onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                className="col-span-3"
                placeholder="e.g. 1 pc, 500g, 1kg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Select
                value={productForm.category}
                onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Bakery">Bakery</SelectItem>
                  <SelectItem value="Meat & Poultry">Meat & Poultry</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Personal Care">Personal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image URL
              </Label>
              <Input
                id="image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="col-span-3"
                placeholder="/placeholder.svg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar producto */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name*
              </Label>
              <Input
                id="edit-name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price*
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-original_price" className="text-right">
                Original Price
              </Label>
              <Input
                id="edit-original_price"
                type="number"
                step="0.01"
                value={productForm.original_price}
                onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                value={productForm.quantity}
                onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                className="col-span-3"
                placeholder="e.g. 1 pc, 500g, 1kg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category*
              </Label>
              <Select
                value={productForm.category}
                onValueChange={(value) => setProductForm({ ...productForm, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Bakery">Bakery</SelectItem>
                  <SelectItem value="Meat & Poultry">Meat & Poultry</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Personal Care">Personal Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-image" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-image"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="col-span-3"
                placeholder="/placeholder.svg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProduct} className="bg-green-600 hover:bg-green-700">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación de producto */}
      <Dialog open={isDeleteProductOpen} onOpenChange={setIsDeleteProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "{currentProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProductOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
