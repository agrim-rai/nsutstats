'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Plus, Menu, X, Shield } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              NSUT Stats
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-gray-900 transition-colors">
              Categories
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    href="/create" 
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Post</span>
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-sm text-gray-700 font-medium">
                      {user.username}
                      {user.role === 'admin' && (
                        <span className="ml-1 text-xs text-blue-600">(Admin)</span>
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/categories" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Categories
              </Link>
              <Link href="/tags" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Tags
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/create" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                      New Post
                    </Link>
                  )}
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Welcome, {user.username}
                    {user.role === 'admin' && (
                      <span className="ml-1 text-blue-600">(Admin)</span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                    Login
                  </Link>
                  <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                    Admin
                  </Link>
                  <Link href="/register" className="block px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
