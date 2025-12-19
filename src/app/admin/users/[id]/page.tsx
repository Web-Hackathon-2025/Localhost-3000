'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react'

interface UserDetail {
  id: string
  email: string
  name: string
  role: string
  phone?: string | null
  emailVerified: boolean
  createdAt: string
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
  _count?: {
    customerBookings: number
    providerBookings: number
    reviewsGiven: number
    reviewsReceived: number
  }
}

export default function UserDetailPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/admin/users')
    } else if (currentUser && currentUser.role !== 'admin') {
      router.push('/unauthorized')
    } else if (currentUser) {
      fetchUser()
    }
  }, [currentUser, authLoading, router, params.id])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (status: 'verified' | 'rejected') => {
    setVerifying(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      })
      if (response.ok) {
        fetchUser()
      }
    } catch (error) {
      console.error('Error verifying provider:', error)
    } finally {
      setVerifying(false)
    }
  }

  const handleSuspend = async (isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isActive ? 'activate' : 'suspend' }),
      })
      if (response.ok) {
        fetchUser()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!currentUser) {
    return <ErrorState title="Not authenticated" message="Please log in to access admin panel." />
  }

  if (!user) {
    return <ErrorState title="User not found" message="The user you're looking for doesn't exist." />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Information</CardTitle>
                <Badge
                  variant={
                    user.role === 'admin'
                      ? 'destructive'
                      : user.role === 'provider'
                      ? 'secondary'
                      : 'default'
                  }
                >
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={user.profile?.profilePictureUrl || null}
                  name={user.name}
                  size="lg"
                />
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Mail className="mr-2 h-4 w-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="mr-2 h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                </div>
              </div>

              {user.profile && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {user.profile.address || user.profile.area || user.profile.city || 'Not set'}
                  </div>
                  {user.profile.bio && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Bio</h4>
                      <p className="text-sm text-gray-600">{user.profile.bio}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                    {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          {user.role === 'provider' && user.providerInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Provider Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Verification Status</p>
                    <Badge
                      variant={
                        user.providerInfo.verificationStatus === 'verified'
                          ? 'success'
                          : user.providerInfo.verificationStatus === 'rejected'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="mt-1"
                    >
                      {user.providerInfo.verificationStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      variant={user.providerInfo.isActive ? 'success' : 'destructive'}
                      className="mt-1"
                    >
                      {user.providerInfo.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Radius</p>
                    <p className="font-semibold">{user.providerInfo.serviceRadiusKm} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="font-semibold">
                      {user.providerInfo.averageRating.toFixed(1)} / 5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="font-semibold">{user.providerInfo.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed Jobs</p>
                    <p className="font-semibold">{user.providerInfo.completedJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {user._count && (
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {user.role === 'customer' && (
                    <div>
                      <p className="text-sm text-gray-600">Bookings Made</p>
                      <p className="text-2xl font-bold">{user._count.customerBookings}</p>
                    </div>
                  )}
                  {user.role === 'provider' && (
                    <div>
                      <p className="text-sm text-gray-600">Bookings Received</p>
                      <p className="text-2xl font-bold">{user._count.providerBookings}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Reviews Given</p>
                    <p className="text-2xl font-bold">{user._count.reviewsGiven}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reviews Received</p>
                    <p className="text-2xl font-bold">{user._count.reviewsReceived}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.role === 'provider' && user.providerInfo && (
                <>
                  <div>
                    <p className="text-sm font-semibold mb-2">Verification</p>
                    <div className="space-y-2">
                      {user.providerInfo.verificationStatus !== 'verified' && (
                        <Button
                          className="w-full"
                          onClick={() => handleVerify('verified')}
                          loading={verifying}
                        >
                          Verify Provider
                        </Button>
                      )}
                      {user.providerInfo.verificationStatus !== 'rejected' && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleVerify('rejected')}
                          loading={verifying}
                        >
                          Reject Verification
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Account Status</p>
                    <Button
                      variant={user.providerInfo.isActive ? 'destructive' : 'default'}
                      className="w-full"
                      onClick={() => handleSuspend(user.providerInfo!.isActive)}
                    >
                      {user.providerInfo.isActive ? 'Suspend Account' : 'Activate Account'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

