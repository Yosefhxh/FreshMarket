"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import { CheckCircle, XCircle } from "lucide-react"

export default function ConfirmEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setIsVerifying(true)

        // Obtener el token de la URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          throw new Error("Invalid confirmation link")
        }

        // Verificar el token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          throw new Error(error.message)
        }

        setIsSuccess(true)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } catch (error) {
        console.error("Error verifying email:", error)
        setError(error instanceof Error ? error.message : "Error verifying email")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, router, supabase.auth])

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

        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>

        {isVerifying && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p>Verifying your email address...</p>
          </div>
        )}

        {!isVerifying && isSuccess && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <p className="font-medium text-green-700 mb-4">Your email has been verified successfully!</p>
            <p className="text-sm text-gray-600 mb-6">You will be redirected to the login page shortly.</p>
            <Button onClick={() => router.push("/auth/login")} className="bg-green-600 hover:bg-green-700">
              Go to Login
            </Button>
          </div>
        )}

        {!isVerifying && error && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <p className="font-medium text-red-700 mb-2">Verification failed</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/auth/login")} className="bg-green-600 hover:bg-green-700">
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
