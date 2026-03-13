"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Category = {
  id: string
  name: string
  color: string
  description?: string
}

type CategoryContextType = {
  categories: Category[]
  addCategory: (name: string) => void
  deleteCategory: (id: string) => void
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Personal", color: "bg-blue-500" },
  { id: "2", name: "Work", color: "bg-green-500" },
  { id: "3", name: "Health", color: "bg-red-500" },
  { id: "4", name: "Learning", color: "bg-purple-500" },
]

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)

  const addCategory = (name: string) => {
    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      return
    }
    
    // Limit category name to 20 characters
    const categoryName = name.trim().substring(0, 20);
    
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
    
    const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
    
    const category: Category = {
      id: Date.now().toString(),
      name: categoryName,
      color: randomColor,
    }

    setCategories([...categories, category])
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider")
  }
  return context
}