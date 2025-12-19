'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { Users, UserCheck, Calendar, Star, AlertCircle, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchAnalytics()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.role === 'admin') {
          setUser(data.user)
        } else {
          router.push('/unauthorized')
        }
      } else {
        router.push('/login?redirect=/admin/dashboard')
      }
    } catch (error) {
      router.push('/login?redirect=/admin/dashboard')
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to access admin panel." />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{analytics?.overview.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Providers</p>
                <p className="text-2xl font-bold">{analytics?.overview.totalProviders || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{analytics?.overview.totalBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{analytics?.overview.totalReviews || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 mb-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-semibold">{analytics?.recentActivity.users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Bookings</span>
                <span className="font-semibold">{analytics?.recentActivity.bookings || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Reviews</span>
                <span className="font-semibold">{analytics?.recentActivity.reviews || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Verifications</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{analytics?.pendingVerifications || 0}</span>
                  {analytics?.pendingVerifications > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/providers">Review</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/providers">
                <UserCheck className="mr-2 h-4 w-4" />
                Manage Providers
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                View Bookings
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/reviews">
                <Star className="mr-2 h-4 w-4" />
                Moderate Reviews
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Status Breakdown */}
      {analytics?.bookingStatuses && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Booking Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {analytics.bookingStatuses.map((status: any) => (
                <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium capitalize">{status.status.replace('_', ' ')}</span>
                  <span className="font-bold">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Categories */}
      {analytics?.popularCategories && analytics.popularCategories.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.popularCategories.map((cat: any) => (
                <div key={cat.categoryId} className="flex items-center justify-between p-2">
                  <span className="text-sm">{cat.categoryName}</span>
                  <span className="text-sm font-semibold">{cat.count} services</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Providers */}
      {analytics?.topProviders && analytics.topProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProviders.map((provider: any, index: number) => (
                <div key={provider.providerId} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-xs text-gray-600">{provider.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{provider.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-600">{provider.totalReviews} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
