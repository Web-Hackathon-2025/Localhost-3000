'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'provider' | 'admin'
  phone?: string | null
  emailVerified: boolean
  profile?: {
    profilePictureUrl?: string | null
    bio?: string | null
    city?: string | null
    area?: string | null
    address?: string | null
  } | null
  providerInfo?: {
    verificationStatus: string
    isActive: boolean
    serviceRadiusKm: number
    averageRating: number
    totalReviews: number
    completedJobs: number
  } | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = () => {
    fetchUser()
  }

  return {
    user,
    loading,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  }
}

