'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { Search, Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface Provider {
  id: string
  name: string
  profile?: {
    profilePictureUrl?: string | null
    city?: string | null
    area?: string | null
  } | null
  providerInfo?: {
    verificationStatus: string
    averageRating: number
    totalReviews: number
    services: Array<{
      priceType: string
      priceMin?: number | null
      priceMax?: number | null
    }>
  } | null
  distance?: number | null
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Search state
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [area, setArea] = useState(searchParams.get('area') || '')
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'distance')
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>(
    []
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    searchProviders()
  }, [categoryId, city, area, minRating, minPrice, maxPrice, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const searchProviders = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (categoryId) params.append('categoryId', categoryId)
      if (city) params.append('city', city)
      if (area) params.append('area', area)
      if (minRating) params.append('minRating', minRating)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (sortBy) params.append('sortBy', sortBy)

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            params.append('latitude', position.coords.latitude.toString())
            params.append('longitude', position.coords.longitude.toString())
            performSearch(params)
          },
          () => {
            performSearch(params)
          }
        )
      } else {
        performSearch(params)
      }
    } catch (err) {
      setError('An error occurred while searching')
      setLoading(false)
    }
  }

  const performSearch = async (params: URLSearchParams) => {
    try {
      const response = await fetch(`/api/providers/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers || [])
      } else {
        setError('Failed to search providers')
      }
    } catch (err) {
      setError('An error occurred while searching')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setCategoryId('')
    setCity('')
    setArea('')
    setMinRating('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('distance')
  }

  const activeFiltersCount =
    [categoryId, city, area, minRating, minPrice, maxPrice].filter(Boolean).length

  if (loading && providers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Find Service Providers</h1>
        <p className="text-gray-600">Search for trusted professionals near you</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <Input
                type="text"
                placeholder="Enter area/locality"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="distance">Distance</option>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
      )}

      {providers.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Found {providers.length} provider{providers.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
