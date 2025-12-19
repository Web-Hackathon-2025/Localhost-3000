'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { Calendar, Clock } from 'lucide-react'

export default function RescheduleBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    requestedDate: '',
    requestedTime: '',
    reason: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/bookings/${params.id}/reschedule`)
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
        // Pre-fill with current date/time
        const requestedDate = new Date(data.booking.requestedDate)
        setFormData({
          requestedDate: requestedDate.toISOString().split('T')[0],
          requestedTime: new Date(data.booking.requestedTime).toTimeString().slice(0, 5),
          reason: '',
        })
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(`/api/bookings/${params.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reschedule booking')
        setSubmitting(false)
        return
      }

      // Redirect to booking detail
      router.push(`/bookings/${params.id}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to reschedule this booking." />
  }

  if (!booking) {
    return <ErrorState title="Booking not found" message="The booking you are looking for does not exist." />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-bold mb-6">Reschedule Booking</h1>

        <Card>
          <CardHeader>
            <CardTitle>Request New Date & Time</CardTitle>
            <CardDescription>
              Select a new date and time for your service. The provider will need to confirm the new
              schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
              )}

              {/* Current Booking Info */}
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Current Schedule</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Service:</span> {booking.service.name}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(booking.requestedDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {new Date(booking.requestedTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* New Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  New Date *
                </label>
                <Input
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  min={today}
                  required
                />
              </div>

              {/* New Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  New Time *
                </label>
                <Input
                  type="time"
                  value={formData.requestedTime}
                  onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reschedule (Optional)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Let the provider know why you need to reschedule..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting}>
                  Request Reschedule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

