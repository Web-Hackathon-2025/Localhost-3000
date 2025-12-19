'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatTime } from '@/lib/utils'
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal'

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

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/bookings/${params.id}`)
    } else if (user) {
      fetchBooking()
    }
  }, [user, authLoading, router, params.id])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      setError('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBooking()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update booking')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: cancelReason,
        }),
      })

      if (response.ok) {
        setShowCancelModal(false)
        setCancelReason('')
        fetchBooking()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to cancel booking')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setUpdating(false)
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
    return <ErrorState title="Not authenticated" message="Please log in to view this booking." />
  }

  if (error && !booking) {
    return <ErrorState title="Booking not found" message={error} />
  }

  if (!booking) {
    return <ErrorState title="Loading..." message="Fetching booking details..." />
  }

  const isCustomer = booking.customerId === user.id
  const isProvider = booking.providerId === user.id
  const statusInfo = statusConfig[booking.status] || statusConfig.requested
  const canCancel = ['requested', 'pending', 'confirmed'].includes(booking.status)
  const canReschedule = ['requested', 'pending', 'confirmed'].includes(booking.status)
  const showContactInfo =
    ['confirmed', 'in_progress'].includes(booking.status) || booking.status === 'completed'

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Booking #{booking.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    {isCustomer ? 'Your service request' : 'Service booking request'}
                  </CardDescription>
                </div>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
              )}

              {/* Service Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Service:</span> {booking.service.name}
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> {booking.service.category.name}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Schedule</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                      <span>
                        {formatDate(booking.requestedDate)} at {formatTime(booking.requestedTime)}
                      </span>
                    </div>
                    {booking.confirmedDate && booking.confirmedTime && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>
                          Confirmed: {formatDate(booking.confirmedDate)} at{' '}
                          {formatTime(booking.confirmedTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                {booking.specialInstructions && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Special Instructions</h3>
                    <p className="text-sm text-gray-700">{booking.specialInstructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Provider/Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isCustomer ? 'Provider Information' : 'Customer Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar
                  src={
                    isCustomer
                      ? booking.provider.user.profile?.profilePictureUrl || null
                      : booking.customer.profile?.profilePictureUrl || null
                  }
                  name={isCustomer ? booking.provider.user.name : booking.customer.name}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {isCustomer ? booking.provider.user.name : booking.customer.name}
                  </h3>
                  {showContactInfo && (
                    <div className="space-y-1 text-sm text-gray-600">
                      {isCustomer && booking.provider.user.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {booking.provider.user.phone}
                        </div>
                      )}
                      {!isCustomer && booking.customer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {booking.customer.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {isCustomer ? booking.provider.user.email : booking.customer.email}
                      </div>
                    </div>
                  )}
                  {!showContactInfo && (
                    <p className="text-sm text-gray-600">
                      Contact information will be available after booking confirmation
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Provider Actions */}
              {isProvider && booking.status === 'requested' && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('confirmed')}
                    loading={updating}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Booking
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleStatusUpdate('rejected')}
                    loading={updating}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Booking
                  </Button>
                </>
              )}

              {isProvider && booking.status === 'confirmed' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate('in_progress')}
                  loading={updating}
                >
                  Mark as In Progress
                </Button>
              )}

              {isProvider && booking.status === 'in_progress' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate('completed')}
                  loading={updating}
                >
                  Mark as Completed
                </Button>
              )}

              {/* Customer Actions */}
              {isCustomer && canCancel && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Booking
                </Button>
              )}

              {canReschedule && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/bookings/${params.id}/reschedule`}>Request Reschedule</Link>
                </Button>
              )}

              {/* Review Link */}
              {booking.status === 'completed' && isCustomer && !booking.review && (
                <Button className="w-full" asChild>
                  <Link href={`/bookings/${params.id}/review`}>
                    <Star className="mr-2 h-4 w-4" />
                    Leave a Review
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal open={showCancelModal} onOpenChange={setShowCancelModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Cancel Booking</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Let the provider know why you're cancelling..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Keep Booking
              </Button>
              <Button variant="destructive" onClick={handleCancel} loading={updating}>
                Cancel Booking
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

