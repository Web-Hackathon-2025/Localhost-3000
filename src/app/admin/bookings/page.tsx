'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatDate, formatTime } from '@/lib/utils'
import { Search, Calendar } from 'lucide-react'

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  requested: { label: 'Requested', variant: 'warning' },
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user, statusFilter])

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
        router.push('/login?redirect=/admin/bookings')
      }
    } catch (error) {
      router.push('/login?redirect=/admin/bookings')
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await fetch(`/api/admin/bookings${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
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
        <h1 className="font-heading text-3xl font-bold mb-2">All Bookings</h1>
        <p className="text-gray-600">View and manage all platform bookings</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            {Object.keys(statusConfig).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {statusConfig[status].label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "There are no bookings yet"
                : `No bookings with status "${statusFilter}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusInfo = statusConfig[booking.status] || statusConfig.requested
            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Booking #{booking.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">{booking.service.name}</p>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                        <div>
                          <span className="font-medium">Customer:</span> {booking.customer.name}
                        </div>
                        <div>
                          <span className="font-medium">Provider:</span> {booking.provider.user.name}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {formatDate(booking.requestedDate)} at {formatTime(booking.requestedTime)}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/bookings/${booking.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

