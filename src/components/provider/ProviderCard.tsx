import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Star, MapPin } from 'lucide-react'
import { formatDistance } from '@/lib/utils/distance'
import { formatCurrency } from '@/lib/utils'

interface ProviderCardProps {
  provider: {
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
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const isVerified = provider.providerInfo?.verificationStatus === 'verified'
  const rating = provider.providerInfo?.averageRating || 0
  const reviews = provider.providerInfo?.totalReviews || 0

  // Calculate price range
  const services = provider.providerInfo?.services || []
  const prices = services
    .flatMap((s) => {
      if (s.priceType === 'fixed' && s.priceMin) return [s.priceMin]
      if (s.priceType === 'range' && s.priceMin && s.priceMax)
        return [s.priceMin, s.priceMax]
      return []
    })
    .filter((p) => p > 0)

  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null

  return (
    <Link href={`/providers/${provider.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar
              src={provider.profile?.profilePictureUrl || null}
              name={provider.name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    {provider.name}
                    {isVerified && (
                      <Badge variant="success" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </h3>
                  {provider.profile?.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {provider.profile.area || provider.profile.city}
                      {provider.distance !== null && provider.distance !== undefined && (
                        <span className="ml-2">• {formatDistance(provider.distance)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium">
                    {rating.toFixed(1)} ({reviews})
                  </span>
                </div>
                {minPrice !== null && (
                  <div className="text-sm text-gray-600">
                    {minPrice === maxPrice
                      ? formatCurrency(minPrice)
                      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {services.slice(0, 3).map((service, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {service.priceType === 'quote' ? 'Call for quote' : 'Service'}
                  </Badge>
                ))}
                {services.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{services.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

