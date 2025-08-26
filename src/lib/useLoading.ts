import { useState, useEffect, useCallback } from 'react'

interface UseLoadingOptions {
  minLoadingTime?: number
  onError?: (error: Error) => void
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { minLoadingTime = 500, onError } = options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const setLoadingError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
    if (onError) {
      onError(new Error(errorMessage))
    }
  }, [onError])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: { minTime?: number }
  ): Promise<T | null> => {
    const startTime = Date.now()
    startLoading()
    
    try {
      const result = await asyncFn()
      
      // Ensure minimum loading time
      const elapsed = Date.now() - startTime
      const minTime = options?.minTime ?? minLoadingTime
      
      if (elapsed < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - elapsed))
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setLoadingError(errorMessage)
      return null
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading, setLoadingError, minLoadingTime])

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading
  }
}
