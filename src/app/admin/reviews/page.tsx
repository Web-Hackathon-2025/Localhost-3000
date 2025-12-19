'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { Star, Eye, EyeOff } from 'lucide-react'

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [filterVisible, setFilterVisible] = useState<string>('all')

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchReviews()
    }
  }, [user, filterVisible])

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
        router.push('/login?redirect=/admin/reviews')
      }
    } catch (error) {
      router.push('/login?redirect=/admin/reviews')
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = filterVisible !== 'all' ? `?isVisible=${filterVisible}` : ''
      const response = await fetch(`/api/admin/reviews${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility }),
      })

      if (response.ok) {
        fetchReviews()
      }
    } catch (error) {
      console.error('Error updating review:', error)
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
        <h1 className="font-heading text-3xl font-bold mb-2">Review Moderation</h1>
        <p className="text-gray-600">Manage and moderate all reviews</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterVisible === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisible('all')}
            >
              All Reviews
            </Button>
            <Button
              variant={filterVisible === 'true' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisible('true')}
            >
              Visible
            </Button>
            <Button
              variant={filterVisible === 'false' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisible('false')}
            >
              Hidden
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
            <p className="text-gray-600">There are no reviews to moderate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className={!review.isVisible ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-3">
                      <Avatar
                        src={review.reviewer.profile?.profilePictureUrl || null}
                        name={review.reviewer.name}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{review.reviewer.name}</h3>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Review for: {review.reviewee.name}
                        </p>
                        {review.booking && (
                          <p className="text-xs text-gray-500 mb-2">
                            Service: {review.booking.service.name}
                          </p>
                        )}
                        {review.comment && (
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                    >
                      {review.isVisible ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

