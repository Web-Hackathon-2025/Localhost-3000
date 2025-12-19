'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { Star } from 'lucide-react'

export default function ReviewBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/bookings/${params.id}/review`)
    } else if (user && user.role !== 'customer') {
      router.push('/unauthorized')
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

        // Check if booking is completed and belongs to user
        if (data.booking.status !== 'completed') {
          setError('Can only review completed bookings')
        }
        if (data.booking.customerId !== user?.id) {
          setError('Unauthorized to review this booking')
        }
        if (data.booking.review) {
          setError('Review already submitted for this booking')
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: params.id,
          rating,
          comment: comment || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit review')
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

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to leave a review." />
  }

  if (error && !booking) {
    return <ErrorState title="Error" message={error} />
  }

  if (!booking) {
    return <ErrorState title="Booking not found" message="The booking you are looking for does not exist." />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl font-bold mb-6">Leave a Review</h1>

        <Card>
          <CardHeader>
            <CardTitle>Review Your Service</CardTitle>
            <CardDescription>
              How was your experience with {booking.provider.user.name}?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
              )}

              {/* Service Info */}
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Service Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Service:</span> {booking.service.name}
                  </p>
                  <p>
                    <span className="font-medium">Provider:</span> {booking.provider.user.name}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(booking.requestedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {rating === 5
                        ? 'Excellent'
                        : rating === 4
                        ? 'Good'
                        : rating === 3
                        ? 'Average'
                        : rating === 2
                        ? 'Poor'
                        : 'Very Poor'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Share your experience with this service provider..."
                />
                <p className="mt-1 text-xs text-gray-500">{comment.length}/1000 characters</p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} disabled={rating === 0}>
                  Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

