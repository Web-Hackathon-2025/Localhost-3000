'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime } from '@/lib/utils'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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

export default function ProviderBookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/provider/bookings')
    } else if (user && user.role !== 'provider') {
      router.push('/unauthorized')
    } else if (user) {
      fetchBookings()
    }
  }, [user, authLoading, router, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await fetch(`/api/bookings${params}`)
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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Error updating booking:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to view your bookings." />
  }

  const pendingCount = bookings.filter((b) => b.status === 'requested').length
  const upcomingCount = bookings.filter((b) =>
    ['confirmed', 'in_progress'].includes(b.status)
  ).length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your service bookings and requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-8 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
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
            <Button
              variant={statusFilter === 'requested' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('requested')}
            >
              Pending Requests
            </Button>
            <Button
              variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
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
                ? "You don't have any bookings yet"
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
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={booking.customer.profile?.profilePictureUrl || null}
                          name={booking.customer.name}
                          size="md"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{booking.customer.name}</h3>
                          <p className="text-sm text-gray-600">{booking.service.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(booking.requestedDate)} at {formatTime(booking.requestedTime)}
                        </div>
                        {booking.specialInstructions && (
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                            <span className="line-clamp-2">{booking.specialInstructions}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/bookings/${booking.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {booking.status === 'requested' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            loading={updating === booking.id}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                            loading={updating === booking.id}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                          loading={updating === booking.id}
                        >
                          Start Service
                        </Button>
                      )}
                      {booking.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          loading={updating === booking.id}
                        >
                          Complete
                        </Button>
                      )}
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

