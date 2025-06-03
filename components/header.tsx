"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import CategoryButton from "./category-button"
import SearchBar from "./search-bar"
import CartButton from "./cart-button"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, ShoppingBag, Heart, Settings, Database, ShieldAlert, ShoppingCart } from "lucide-react"

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-xl font-bold">
            <span className="text-green-600">Fresh</span>
            <span className="text-gray-700">Market</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Category Button */}
          <CategoryButton />

          {/* Search Bar */}
          <SearchBar />

          {/* Cart Button */}
          <CartButton />

          {/* Login/User Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-green-50">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 border-b">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  {isAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Administrador
                    </span>
                  )}
                </div>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/orders")}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Mis Pedidos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/wishlist")}>
                  <Heart className="h-4 w-4 mr-2" />
                  Lista de Deseos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <div className="border-t my-1"></div>
                    <DropdownMenuItem onClick={() => router.push("/admin/database")}>
                      <Database className="h-4 w-4 mr-2" />
                      Admin Base de Datos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Gestión de Usuarios
                    </DropdownMenuItem>
                  </>
                )}

                <div className="border-t my-1"></div>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/auth/login")}>
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
