import SupabaseConnectionTest from "@/components/supabase-connection-test"
import Link from "next/link"
import { Database } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Configuración de Supabase</h2>
          <SupabaseConnectionTest />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-4">Database Administration</h2>
          <p className="text-gray-600 mb-4">View and manage your database tables directly from the application.</p>
          <Link href="/admin/database">
            <div className="flex items-center text-green-600 hover:text-green-700">
              <Database className="h-5 w-5 mr-2" />
              <span className="font-medium">Access Database Admin</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
