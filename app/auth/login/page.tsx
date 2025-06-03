"use client"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoading, error, isEmailNotConfirmed, emailPendingConfirmation, resendConfirmationEmail } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailPendingConfirmation || "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password)
  }

  const handleResendConfirmation = async () => {
    if (emailPendingConfirmation) {
      await resendConfirmationEmail(emailPendingConfirmation)
    } else {
      const email = form.getValues("email")
      if (email) {
        await resendConfirmationEmail(email)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 28H16L18 20H28L30 28H32L29 12H11L12 28Z" fill="white" />
              <circle cx="14" cy="32" r="2" fill="white" />
              <circle cx="28" cy="32" r="2" fill="white" />
              <path
                d="M20 16L22 18L26 14"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-600">FreshMarket</div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">Sign In to Account</h2>
        <p className="text-center text-gray-500 mb-6">Enter your Email and Password to Sign In</p>

        {error && !isEmailNotConfirmed && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

        {isEmailNotConfirmed && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Email confirmation required</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p className="mb-2">Please check your inbox and confirm your email address before logging in.</p>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-600 hover:bg-amber-100"
                onClick={handleResendConfirmation}
                disabled={isLoading}
              >
                Resend confirmation email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Click here to create new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
