"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, ShieldAlert, ArrowLeft, Check, X, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function UserManagementPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("customer")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    username: "",
    role: "customer",
  })
  const supabase = getSupabaseClient()

  // Redirigir si el usuario no está autenticado o no es administrador
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    } else if (!isAdmin) {
      router.push("/access-denied")
    }
  }, [user, isAdmin, router])

  // Cargar usuarios
  useEffect(() => {
    async function fetchUsers() {
      if (!user || !isAdmin) return

      setLoading(true)
      setError(null)

      try {
        let query = supabase.from("profiles").select("*")

        if (searchTerm) {
          query = query.or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        }

        query = query.order("username")

        const { data: result, error: queryError } = await query

        if (queryError) {
          throw queryError
        }

        setUsers(result || [])
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(`Failed to load users. ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [searchTerm, supabase, user, isAdmin])

  // Función para refrescar los datos
  const refreshData = () => {
    setSearchTerm("")
    setLoading(true)
    // El efecto se encargará de recargar los datos
  }

  // Función para actualizar el rol de un usuario
  const updateUserRole = async (userId: string, role: string) => {
    if (!isAdmin) return

    try {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

      if (error) {
        throw error
      }

      // Actualizar la lista de usuarios
      setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)))
      setEditingUser(null)

      toast({
        title: "User role updated",
        description: "The user's role has been updated successfully",
      })
    } catch (err) {
      console.error("Error updating user role:", err)
      toast({
        title: "Error",
        description: `Failed to update user role. ${err instanceof Error ? err.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // Función para añadir un nuevo usuario
  const handleAddUser = async () => {
    try {
      // Validar campos requeridos
      if (!newUserForm.email || !newUserForm.username) {
        toast({
          title: "Error",
          description: "Email and username are required",
          variant: "destructive",
        })
        return
      }

      // Generar una contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8)

      // Registrar el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserForm.email,
        password: tempPassword,
        email_confirm: true, // Confirmar el email automáticamente
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Failed to create user")
      }

      // Crear el perfil del usuario
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          username: newUserForm.username,
          email: newUserForm.email,
          role: newUserForm.role,
        },
      ])

      if (profileError) {
        throw profileError
      }

      toast({
        title: "User created successfully",
        description: `Temporary password: ${tempPassword}`,
      })

      // Limpiar formulario y cerrar diálogo
      setNewUserForm({
        email: "",
        username: "",
        role: "customer",
      })
      setIsAddUserOpen(false)
      refreshData()
    } catch (error) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      })
    }
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
        <div className="flex items-center">
          <Link href="/admin/database">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Database
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6" /> User Management
          </h1>
        </div>
        <Button onClick={() => setIsAddUserOpen(true)} className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold">Users</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      {editingUser === u.id ? (
                        <Select
                          value={selectedRole}
                          onValueChange={setSelectedRole}
                          defaultValue={u.role || "customer"}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role || "customer"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{u.created_at ? new Date(u.created_at).toLocaleString() : "N/A"}</td>
                    <td className="px-4 py-2 text-right">
                      {editingUser === u.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateUserRole(u.id, selectedRole)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(null)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(u.id)
                            setSelectedRole(u.role || "customer")
                          }}
                          disabled={u.id === user.id} // No permitir editar el propio usuario
                          className={u.id === user.id ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          Change Role
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Note: You cannot change your own role to prevent accidental loss of admin access.</p>
      </div>

      {/* Diálogo para añadir usuario */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username*
              </Label>
              <Input
                id="username"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUserForm.role}
                onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
