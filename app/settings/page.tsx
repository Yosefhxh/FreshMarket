"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Bell, Lock, LogOut, Moon, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("notifications")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Configuraciones de ejemplo (en una aplicación real, estas se guardarían en la base de datos)
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      promotions: false,
      newProducts: true,
    },
    appearance: {
      darkMode: false,
      highContrast: false,
      reducedMotion: false,
    },
    privacy: {
      shareData: false,
      cookieConsent: true,
      dataCollection: true,
    },
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  const updateSetting = (category: keyof typeof settings, setting: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))

    toast({
      title: "Setting updated",
      description: `${setting} has been ${value ? "enabled" : "disabled"}`,
    })
  }

  const handleDeleteAccount = () => {
    // En una aplicación real, aquí se eliminaría la cuenta
    toast({
      title: "Account deletion",
      description: "This feature is not implemented in this demo",
      variant: "destructive",
    })
    setIsDeleteDialogOpen(false)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Notification Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(value) => updateSetting("notifications", "emailNotifications", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderUpdates" className="font-medium">
                    Order Updates
                  </Label>
                  <p className="text-sm text-gray-500">Get notified about your order status</p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={settings.notifications.orderUpdates}
                  onCheckedChange={(value) => updateSetting("notifications", "orderUpdates", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promotions" className="font-medium">
                    Promotions and Offers
                  </Label>
                  <p className="text-sm text-gray-500">Receive emails about special offers and discounts</p>
                </div>
                <Switch
                  id="promotions"
                  checked={settings.notifications.promotions}
                  onCheckedChange={(value) => updateSetting("notifications", "promotions", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newProducts" className="font-medium">
                    New Products
                  </Label>
                  <p className="text-sm text-gray-500">Get notified when new products are added</p>
                </div>
                <Switch
                  id="newProducts"
                  checked={settings.notifications.newProducts}
                  onCheckedChange={(value) => updateSetting("notifications", "newProducts", value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Appearance Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500">Use dark theme for the application</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.appearance.darkMode}
                  onCheckedChange={(value) => updateSetting("appearance", "darkMode", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="highContrast" className="font-medium">
                    High Contrast
                  </Label>
                  <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="highContrast"
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(value) => updateSetting("appearance", "highContrast", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reducedMotion" className="font-medium">
                    Reduced Motion
                  </Label>
                  <p className="text-sm text-gray-500">Minimize animations throughout the app</p>
                </div>
                <Switch
                  id="reducedMotion"
                  checked={settings.appearance.reducedMotion}
                  onCheckedChange={(value) => updateSetting("appearance", "reducedMotion", value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Privacy Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shareData" className="font-medium">
                    Share Usage Data
                  </Label>
                  <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                </div>
                <Switch
                  id="shareData"
                  checked={settings.privacy.shareData}
                  onCheckedChange={(value) => updateSetting("privacy", "shareData", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cookieConsent" className="font-medium">
                    Cookie Consent
                  </Label>
                  <p className="text-sm text-gray-500">Allow cookies to enhance your browsing experience</p>
                </div>
                <Switch
                  id="cookieConsent"
                  checked={settings.privacy.cookieConsent}
                  onCheckedChange={(value) => updateSetting("privacy", "cookieConsent", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataCollection" className="font-medium">
                    Data Collection
                  </Label>
                  <p className="text-sm text-gray-500">Allow collection of data for personalized recommendations</p>
                </div>
                <Switch
                  id="dataCollection"
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(value) => updateSetting("privacy", "dataCollection", value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Account Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Change Password</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-md font-medium mb-2">Account Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your data
                          from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="confirmDelete">Type "DELETE" to confirm</Label>
                        <Input id="confirmDelete" className="mt-2" />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
