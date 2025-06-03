import { getSupabaseClient } from "@/lib/supabase"

// Obtener todos los productos
export async function getProducts() {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      return []
    }

    // Añadir un log para depuración
    console.log("Fetching products from Supabase...")

    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      return []
    }

    // Verificar que los datos existan
    if (!data) {
      console.warn("No products found")
      return []
    }

    console.log(`Found ${data.length} products`)
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    // Devolver un array vacío en lugar de lanzar el error
    // para evitar que la aplicación se rompa
    return []
  }
}

// Obtener productos por categoría
export async function getProductsByCategory(category: string) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      return []
    }

    const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

    if (error) {
      console.error(`Supabase error for category ${category}:`, error)
      return []
    }

    // Verificar que los datos existan
    if (!data) {
      console.warn(`No products found for category ${category}`)
      return []
    }

    return data
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error)
    // Devolver un array vacío en lugar de lanzar el error
    return []
  }
}

// Crear una orden
export async function createOrder(orderData: any) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      throw new Error("Database connection error")
    }

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: orderData.customer,
          customer_name: orderData.customerName,
          email: orderData.email,
          phone: orderData.phone || "",
          address: orderData.address,
          zip_code: orderData.zipCode,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.deliveryFee,
          tax_amount: orderData.taxAmount,
          total: orderData.total,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw orderError
    }

    if (!order) {
      throw new Error("Failed to create order - no data returned")
    }

    // Crear los elementos de la orden
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      image: item.image,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      throw itemsError
    }

    return { data: order }
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Cancelar una orden
export async function cancelOrder(orderId: string) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      throw new Error("Database connection error")
    }

    // Actualizar el estado de la orden a "cancelled"
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      console.error("Error cancelling order:", error)
      throw error
    }

    if (!data) {
      throw new Error("Failed to cancel order - no data returned")
    }

    return { data }
  } catch (error) {
    console.error("Error cancelling order:", error)
    throw error
  }
}

// Eliminar una orden completamente
export async function deleteOrder(orderId: string) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      throw new Error("Database connection error")
    }

    // Primero eliminar los items de la orden
    const { error: itemsError } = await supabase.from("order_items").delete().eq("order_id", orderId)

    if (itemsError) {
      console.error("Error deleting order items:", itemsError)
      throw itemsError
    }

    // Luego eliminar la orden
    const { error: orderError } = await supabase.from("orders").delete().eq("id", orderId)

    if (orderError) {
      console.error("Error deleting order:", orderError)
      throw orderError
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

// Obtener órdenes del usuario
export async function getUserOrders(userId: string) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      throw new Error("Database connection error")
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "cancelled") // Excluir órdenes canceladas
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      throw error
    }

    if (!data) {
      return { data: [] }
    }

    // Formatear los datos para que coincidan con la estructura esperada
    const formattedOrders = data.map((order) => ({
      id: order.id,
      attributes: {
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        zipCode: order.zip_code,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        taxAmount: order.tax_amount,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        items: [], // Se llenarán más adelante
      },
    }))

    // Obtener los elementos de cada orden
    for (const order of formattedOrders) {
      const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", order.id)

      if (itemsError) {
        console.error("Error fetching order items:", itemsError)
        throw itemsError
      }

      order.attributes.items = items
        ? items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            image: item.image,
          }))
        : []
    }

    return { data: formattedOrders }
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

// Obtener una orden específica
export async function getOrder(orderId: string) {
  try {
    const supabase = getSupabaseClient()

    // Verificar que el cliente de Supabase se haya inicializado correctamente
    if (!supabase) {
      console.error("Supabase client not initialized")
      throw new Error("Database connection error")
    }

    const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (error) {
      console.error("Error fetching order:", error)
      throw error
    }

    if (!order) {
      throw new Error("Order not found")
    }

    // Obtener los elementos de la orden
    const { data: items, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      throw itemsError
    }

    // Formatear los datos para que coincidan con la estructura esperada
    const formattedOrder = {
      id: order.id,
      attributes: {
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        zipCode: order.zip_code,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        taxAmount: order.tax_amount,
        total: order.total,
        status: order.status,
        createdAt: order.created_at,
        items: items
          ? items.map((item) => ({
              id: item.id,
              productId: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
              image: item.image,
            }))
          : [],
      },
    }

    return { data: formattedOrder }
  } catch (error) {
    console.error("Error fetching order:", error)
    throw error
  }
}
