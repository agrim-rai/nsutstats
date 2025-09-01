'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching?: boolean
  className?: string
}

export default function SearchBar({ onSearch, isSearching = false, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className={`relative max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles by title, content, or tags..."
            className="w-full pl-12 pr-20 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 hover:bg-slate-800/70"
            disabled={isSearching}
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-16 flex items-center pr-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute inset-y-0 right-0 flex items-center px-4 py-2 m-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-sm font-medium">Search</span>
            )}
          </button>
        </div>
      </form>
      
      {/* Search suggestions or recent searches could go here */}
      <div className="absolute top-full left-0 right-0 mt-2 z-10">
        {/* Future: Add search suggestions dropdown */}
      </div>
    </div>
  )
}

