"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Palette, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCategories } from "@/lib/category-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Category = {
  id: string
  name: string
  color: string
  description?: string
}

const DEFAULT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

export function CategoriesModule() {
  const { categories, addCategory, deleteCategory } = useCategories()
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editColor, setEditColor] = useState("")
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'created'>('name')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { toast } = useToast()

  // Filter and sort categories
  const filteredCategories = categories
    .filter((c) => searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'created') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      })
      return
    }
    
    // Limit category name to 20 characters
    const categoryName = newCategoryName.trim().substring(0, 20);

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
      toast({
        title: "Error",
        description: "Category already exists",
        variant: "destructive",
      })
      return
    }

    addCategory(categoryName)
    setNewCategoryName("")
    toast({
      title: "Category Added!",
      description: `New category "${categoryName}" created`,
    })
  }

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id)
    toast({
      title: "Category Deleted",
      description: "Category removed from your list",
    })
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setEditName(category.name)
    setEditDescription(category.description || "")
    setEditColor(category.color)
  }

  const saveCategoryEdits = () => {
    if (editingCategory) {
      // In a real app, you would update the category with the new details
      // For now, we'll just show a toast
      toast({
        title: "Category Updated!",
        description: `Category "${editName}" has been updated`,
      })
      setEditingCategory(null)
    }
  }

  const confirmDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
  }

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      handleDeleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Sorting and Add Button */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Search */}
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border-border focus:border-primary"
                />
              </div>
              
              {/* Sort By */}
              <div className="w-full sm:w-40">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="rounded-lg border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Creation Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Add Category Button */}
            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        placeholder="Enter category name"
                        value={newCategoryName}
                        onChange={(e) => {
                          // Limit category name to 20 characters
                          const value = e.target.value.substring(0, 20);
                          setNewCategoryName(value);
                        }}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum 20 characters
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewCategoryName("")}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCategory}>
                        Create Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      {filteredCategories.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="font-medium text-foreground truncate" title={category.name}>
                      {category.name}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex gap-1 mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input
                              id="edit-name"
                              value={editName}
                              onChange={(e) => {
                                // Limit category name to 20 characters when editing
                                const value = e.target.value.substring(0, 20);
                                setEditName(value);
                              }}
                              maxLength={20}
                            />
                            <p className="text-xs text-muted-foreground">
                              Maximum 20 characters
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              placeholder="Add a description for this category..."
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-color">Color</Label>
                            <Select value={editColor} onValueChange={setEditColor}>
                              <SelectTrigger id="edit-color">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEFAULT_COLORS.map((color) => (
                                  <SelectItem key={color} value={color}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full ${color}`}></div>
                                      <span className="capitalize">
                                        {color.replace("bg-", "").replace("-500", "")}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingCategory(null)}>
                              Cancel
                            </Button>
                            <Button onClick={saveCategoryEdits}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDeleteCategory(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the category "{category.name}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories yet. Add your first category to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Preset Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Quick Start Categories
          </CardTitle>
          <CardDescription>Jumpstart your organization with these preset categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Work", color: "bg-blue-500", description: "Tasks related to your job or career" },
              { name: "Personal", color: "bg-green-500", description: "Personal projects and goals" },
              { name: "Health", color: "bg-red-500", description: "Fitness and wellness activities" },
              { name: "Learning", color: "bg-yellow-500", description: "Education and skill development" },
              { name: "Finance", color: "bg-purple-500", description: "Budgeting and financial planning" },
              { name: "Social", color: "bg-pink-500", description: "Relationships and social activities" }
            ].map((preset, index) => (
              <div 
                key={index} 
                className="flex flex-col p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  setNewCategoryName(preset.name);
                  handleAddCategory();
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${preset.color}`}></div>
                  <span className="font-medium text-foreground">{preset.name}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {preset.description}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
