import React, { useState, useEffect } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  variant?: 'spinner' | 'skeleton'
  minLoadingTime?: number // Minimum time to show loading in milliseconds
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  variant = 'spinner',
  minLoadingTime = 0 // Default 0ms - let parent control loading state
}: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(true)
  
  useEffect(() => {
    if (minLoadingTime <= 0) return
    
    const timer = setTimeout(() => {
      setShowSpinner(false)
    }, minLoadingTime)
    
    return () => clearTimeout(timer)
  }, [minLoadingTime])

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center w-full max-w-md">
            <div className="w-8 h-8 bg-slate-600 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-slate-600 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-slate-600 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (minLoadingTime > 0 && !showSpinner) {
    return null
  }

  return (
    <div className={`flex justify-center items-center min-h-64 ${className}`}>
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin`}
          style={{
            animation: 'spin 1s linear infinite',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}
        ></div>
        <p className="text-slate-300 animate-pulse">{text}</p>
      </div>
    </div>
  )
}
