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
import { Search, UserCheck, UserX } from 'lucide-react'

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProviders()
    }
  }, [user, verificationFilter, search])

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
        router.push('/login?redirect=/admin/providers')
      }
    } catch (error) {
      router.push('/login?redirect=/admin/providers')
    }
  }

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('role', 'provider')
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        let filtered = data.users || []

        if (verificationFilter !== 'all') {
          filtered = filtered.filter(
            (p: any) => p.providerInfo?.verificationStatus === verificationFilter
          )
        }

        setProviders(filtered)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (providerId: string, status: 'verified' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/users/${providerId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status }),
      })

      if (response.ok) {
        fetchProviders()
      }
    } catch (error) {
      console.error('Error verifying provider:', error)
    }
  }

  const handleSuspend = async (providerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isActive ? 'activate' : 'suspend' }),
      })

      if (response.ok) {
        fetchProviders()
      }
    } catch (error) {
      console.error('Error updating provider:', error)
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
        <h1 className="font-heading text-3xl font-bold mb-2">Provider Management</h1>
        <p className="text-gray-600">Manage and verify service providers</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search providers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Verification Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      {providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-gray-600">No providers match your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          <Link
                            href={`/admin/users/${provider.id}`}
                            className="text-primary-600 hover:underline"
                          >
                            {provider.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">{provider.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <Badge
                        variant={
                          provider.providerInfo?.verificationStatus === 'verified'
                            ? 'success'
                            : provider.providerInfo?.verificationStatus === 'rejected'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {provider.providerInfo?.verificationStatus || 'pending'}
                      </Badge>
                      {provider.providerInfo && (
                        <Badge variant={provider.providerInfo.isActive ? 'success' : 'destructive'}>
                          {provider.providerInfo.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                      <div>
                        <span className="font-medium">Rating:</span>{' '}
                        {provider.providerInfo?.averageRating.toFixed(1) || '0.0'}
                      </div>
                      <div>
                        <span className="font-medium">Reviews:</span>{' '}
                        {provider.providerInfo?.totalReviews || 0}
                      </div>
                      <div>
                        <span className="font-medium">Jobs:</span>{' '}
                        {provider.providerInfo?.completedJobs || 0}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {provider.providerInfo?.verificationStatus !== 'verified' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(provider.id, 'verified')}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Verify
                      </Button>
                    )}
                    {provider.providerInfo?.verificationStatus !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(provider.id, 'rejected')}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    )}
                    {provider.providerInfo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSuspend(provider.id, !provider.providerInfo.isActive)
                        }
                      >
                        {provider.providerInfo.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${provider.id}`}>View Details</Link>
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

