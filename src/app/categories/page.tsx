'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Hash, ArrowRight } from 'lucide-react'
import { Category } from '@/types'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white-900 mb-4">Data Analysis Categories</h1>
        <p className="text-xl text-gray-600">
          Explore statistical analysis and ML content by category
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories available</h3>
          <p className="text-gray-600">Categories will appear here once analytical content is published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.category}
              href={`/?category=${encodeURIComponent(category.category)}`}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.category}
                  </h3>
                  <p className="text-gray-600">
                    {category.count} article{category.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
