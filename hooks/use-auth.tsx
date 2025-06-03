"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase"

interface AuthUser {
  id: string
  username: string
  email: string
  phoneNumber?: string
  role: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, additionalData?: any) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
  resendConfirmationEmail: (email: string) => Promise<void>
  isEmailNotConfirmed: boolean
  emailPendingConfirmation: string | null
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  const [emailPendingConfirmation, setEmailPendingConfirmation] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Verificar sesión al cargar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = getSupabaseClient()
        if (!supabase) return

        const { data } = await supabase.auth.getSession()
        if (data.session) {
          // Obtener perfil del usuario
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single()

          if (profile) {
            const userWithRole = {
              id: data.session.user.id,
              username: profile.username || data.session.user.email?.split("@")[0] || "",
              email: data.session.user.email || "",
              phoneNumber: profile.phone || "",
              role: profile.role || "customer",
              address: {
                street: profile.street || "",
                city: profile.city || "",
                state: profile.state || "",
                zip: profile.zip || "",
              },
            }
            setUser(userWithRole)
            setIsAdmin(userWithRole.role === "admin")
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()
  }, [])

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient()

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection error. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // Obtener perfil del usuario
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        if (profile) {
          const userWithRole = {
            id: data.user.id,
            username: profile.username || data.user.email?.split("@")[0] || "",
            email: data.user.email || "",
            phoneNumber: profile.phone || "",
            role: profile.role || "customer",
            address: {
              street: profile.street || "",
              city: profile.city || "",
              state: profile.state || "",
              zip: profile.zip || "",
            },
          }
          setUser(userWithRole)
          setIsAdmin(userWithRole.role === "admin")
        } else {
          // Si no hay perfil, crear uno básico
          const basicUser = {
            id: data.user.id,
            username: data.user.email?.split("@")[0] || "",
            email: data.user.email || "",
            role: "customer",
          }
          setUser(basicUser)
          setIsAdmin(false)
        }

        toast({
          title: "Login successful",
          description: "You have been logged in successfully",
        })

        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Failed to login")

      toast({
        title: "Login error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string, additionalData = {}) => {
    const supabase = getSupabaseClient()

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection error. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            ...additionalData,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // Crear perfil de usuario en la tabla profiles
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username,
            email,
            role: "customer",
            phone: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            ...additionalData,
          },
        ])

        if (profileError) {
          console.error("Error creating profile:", profileError)
          // Continuar aunque haya error en el perfil
        }

        // Establecer usuario en el estado
        const newUser = {
          id: data.user.id,
          username: username,
          email: email,
          role: "customer",
          phoneNumber: "",
          address: {
            street: "",
            city: "",
            state: "",
            zip: "",
          },
        }
        setUser(newUser)
        setIsAdmin(false)

        toast({
          title: "Registration successful",
          description: "Your account has been created successfully",
        })

        router.push("/")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError(error instanceof Error ? error.message : "Failed to register")

      toast({
        title: "Registration error",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    toast({
      title: "Feature not available",
      description: "Email confirmation is currently disabled for development",
    })
  }

  const logout = async () => {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setIsAdmin(false)
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
        resendConfirmationEmail,
        isEmailNotConfirmed,
        emailPendingConfirmation,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
