"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createServerSupabaseClient } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const makeAdmin = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const supabase = createServerSupabaseClient()

      // Verificar si el usuario existe
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .single()

      if (userError) {
        if (userError.code === "PGRST116") {
          throw new Error(`No user found with email: ${email}`)
        }
        throw userError
      }

      // Actualizar el rol a admin
      const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userData.id)

      if (updateError) {
        throw updateError
      }

      setResult(`User ${email} has been successfully updated to admin role.`)
      toast({
        title: "Success",
        description: `User ${email} is now an admin`,
      })
    } catch (err) {
      console.error("Error making user admin:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Setup</h1>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">Enter the email of the user you want to make an admin.</p>
          </div>

          <Button onClick={makeAdmin} disabled={loading || !email} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Processing..." : "Make Admin"}
          </Button>

          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
          {result && <div className="p-3 bg-green-50 text-green-700 rounded-md">{result}</div>}
        </div>
      </div>
    </div>
  )
}
