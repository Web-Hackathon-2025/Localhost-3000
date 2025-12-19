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
import { Star, MapPin, Clock, CheckCircle, Phone, Mail } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { formatDistance } from '@/lib/utils/distance'
import { useAuth } from '@/hooks/useAuth'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [provider, setProvider] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProvider()
    fetchReviews()
  }, [params.id])

  const fetchProvider = async () => {
    setLoading(true)
    try {
      let url = `/api/providers/${params.id}`
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            url += `?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
            performFetch(url)
          },
          () => {
            performFetch(url)
          }
        )
      } else {
        performFetch(url)
      }
    } catch (err) {
      setError('Failed to load provider')
      setLoading(false)
    }
  }

  const performFetch = async (url: string) => {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setProvider(data.provider)
      } else {
        setError('Provider not found')
      }
    } catch (err) {
      setError('Failed to load provider')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?providerId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleRequestService = () => {
    if (!currentUser) {
      router.push(`/login?redirect=/providers/${params.id}`)
    } else {
      router.push(`/bookings/request/${params.id}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (error || !provider) {
    return (
      <ErrorState
        title="Provider not found"
        message={error || 'The provider you are looking for does not exist.'}
      />
    )
  }

  const isVerified = provider.providerInfo?.verificationStatus === 'verified'
  const rating = provider.providerInfo?.averageRating || 0
  const reviewsCount = provider.providerInfo?.totalReviews || 0
  const services = provider.providerInfo?.services || []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar
                  src={provider.profile?.profilePictureUrl || null}
                  name={provider.name}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        {provider.name}
                        {isVerified && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </h1>
                      {provider.profile?.city && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {provider.profile.address || provider.profile.area || provider.profile.city}
                          {provider.distance !== null && provider.distance !== undefined && (
                            <span className="ml-2">• {formatDistance(provider.distance)} away</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-semibold">{rating.toFixed(1)}</span>
                      <span className="text-gray-600 ml-1">({reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.providerInfo?.completedJobs || 0} completed jobs
                    </div>
                  </div>

                  {provider.profile?.bio && (
                    <p className="text-gray-700 mb-4">{provider.profile.bio}</p>
                  )}

                  <Button onClick={handleRequestService} size="lg" className="w-full sm:w-auto">
                    Request Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>Services provided by {provider.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No services listed yet</p>
              ) : (
                <div className="space-y-4">
                  {services.map((service: any) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{service.category.name}</Badge>
                            {service.durationMinutes && (
                              <span className="text-sm text-gray-600">
                                ~{service.durationMinutes} minutes
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {service.priceType === 'fixed' && service.priceMin && (
                            <div className="font-semibold text-lg">
                              {formatCurrency(Number(service.priceMin))}
                            </div>
                          )}
                          {service.priceType === 'range' && (
                            <div className="font-semibold text-lg">
                              {formatCurrency(Number(service.priceMin || 0))} -{' '}
                              {formatCurrency(Number(service.priceMax || 0))}
                            </div>
                          )}
                          {service.priceType === 'quote' && (
                            <Badge variant="outline">Call for quote</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviewsCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start space-x-4">
                        <Avatar
                          src={review.reviewer.profile?.profilePictureUrl || null}
                          name={review.reviewer.name}
                          size="md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{review.reviewer.name}</h4>
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
                          {review.comment && (
                            <p className="text-sm text-gray-700">{review.comment}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Contact information will be available after booking confirmation.
              </p>
              <Button variant="outline" className="w-full" onClick={handleRequestService}>
                Request Service to Contact
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

