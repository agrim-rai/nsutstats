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
  minLoadingTime = 500 // Default 500ms minimum loading time
}: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(true)
  
  useEffect(() => {
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
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!showSpinner) {
    return null
  }

  return (
    <div className={`flex justify-center items-center min-h-64 ${className}`}>
      <div className="text-center">
        <div 
          className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin`}
          style={{
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <p className="text-gray-600 animate-pulse">{text}</p>
      </div>
    </div>
  )
}
