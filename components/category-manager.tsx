"use client"

import { useState } from "react"
import { useCategories, type Category } from "@/contexts/categories-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2, Plus, Save, X } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CategoryManagerProps {
  onClose: () => void
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({
    title: "",
    icon: "",
  })

  const handleSaveEdit = () => {
    if (!editingCategory) return

    updateCategory(editingCategory.id, {
      title: editingCategory.title,
      icon: editingCategory.icon,
    })

    toast({
      title: "Category updated",
      description: `${editingCategory.title} has been updated successfully.`,
    })

    setEditingCategory(null)
  }

  const handleAddCategory = () => {
    if (!newCategory.title) {
      toast({
        title: "Error",
        description: "Category title is required.",
        variant: "destructive",
      })
      return
    }

    addCategory({
      title: newCategory.title,
      icon: newCategory.icon || "/placeholder.svg",
    })

    toast({
      title: "Category added",
      description: `${newCategory.title} has been added successfully.`,
    })

    setNewCategory({ title: "", icon: "" })
    setIsAddDialogOpen(false)
  }

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return

    deleteCategory(categoryToDelete.id)

    toast({
      title: "Category deleted",
      description: `${categoryToDelete.title} has been deleted successfully.`,
    })

    setCategoryToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Categories</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg p-4 bg-white flex flex-col">
            {editingCategory?.id === category.id ? (
              // Edit mode
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`title-${category.id}`}>Title</Label>
                  <Input
                    id={`title-${category.id}`}
                    value={editingCategory.title}
                    onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`icon-${category.id}`}>Icon URL</Label>
                  <Input
                    id={`icon-${category.id}`}
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    placeholder="/images/category-icon.png"
                  />
                </div>
                <div className="flex justify-center py-2">
                  <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={editingCategory.icon || "/placeholder.svg"}
                      alt={editingCategory.title}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              // View mode
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{category.title}</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCategoryToDelete(category)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center py-4 flex-grow">
                  <div className="relative h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={category.icon || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <p>Slug: {category.slug}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for your store.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-title">Category Title</Label>
              <Input
                id="new-title"
                value={newCategory.title}
                onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                placeholder="e.g., Snacks"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-icon">Icon URL</Label>
              <Input
                id="new-icon"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                placeholder="/images/category-icon.png"
              />
            </div>
            {newCategory.icon && (
              <div className="flex justify-center py-2">
                <div className="relative h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={newCategory.icon || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
