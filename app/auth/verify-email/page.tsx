"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const confirmation = searchParams.get("confirmation")

  useEffect(() => {
    if (!confirmation) {
      setIsVerifying(false)
      setError("Código de confirmación no encontrado")
      return
    }

    const verifyEmail = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"
        const response = await fetch(`${API_URL}/api/auth/email-confirmation?confirmation=${confirmation}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error.message || "Error al verificar el correo electrónico")
        }

        setIsSuccess(true)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error al verificar el correo electrónico")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [confirmation, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <Image src="/images/grocery-logo.png" alt="Grocery Store" width={80} height={80} />
          <div className="text-xl font-bold mt-2">
            <span className="text-orange-500">Grocery</span>
            <span className="text-green-500"> Store</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Verificación de Email</h2>

        {isVerifying && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p>Verificando tu correo electrónico...</p>
          </div>
        )}

        {!isVerifying && isSuccess && (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <p className="font-medium">¡Email verificado correctamente!</p>
              <p className="text-sm mt-2">Serás redirigido a la página de inicio de sesión en breve.</p>
            </div>
            <Button onClick={() => router.push("/auth/login")} className="bg-green-600 hover:bg-green-700">
              Ir a Iniciar Sesión
            </Button>
          </div>
        )}

        {!isVerifying && error && (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              <p className="font-medium">Error de verificación</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button onClick={() => router.push("/auth/login")} className="bg-green-600 hover:bg-green-700">
              Ir a Iniciar Sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
