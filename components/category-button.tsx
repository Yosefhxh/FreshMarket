import { LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function CategoryButton() {
  const categories = [
    "Vegetables",
    "Fruits",
    "Dairy",
    "Bakery",
    "Meat & Poultry",
    "Frozen Foods",
    "Beverages",
    "Snacks",
    "Personal Care",
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-slate-100 border-slate-200 rounded-full px-6">
          <LayoutGrid className="h-5 w-5" />
          <span>Category</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {categories.map((category) => (
          <DropdownMenuItem key={category}>{category}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
