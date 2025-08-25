'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag, ArrowRight } from 'lucide-react'
import { Tag as TagType } from '@/types'

export default function Tags() {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Statistical Tags</h1>
        <p className="text-xl text-gray-600">
          Explore ML and data analysis content by tags
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Tag className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tags available</h3>
          <p className="text-gray-600">Tags will appear here once analytical content is published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Link
              key={tag.tag}
              href={`/?tag=${encodeURIComponent(tag.tag)}`}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    #{tag.tag}
                  </h3>
                  <p className="text-gray-600">
                    {tag.count} article{tag.count !== 1 ? 's' : ''}
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
