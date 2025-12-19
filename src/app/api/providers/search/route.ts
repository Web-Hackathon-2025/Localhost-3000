import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateDistance } from '@/lib/utils/distance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const city = searchParams.get('city')
    const area = searchParams.get('area')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '50'
    const minRating = searchParams.get('minRating')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'distance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      providerInfo: {
        isActive: true,
      },
      services: {
        some: {
          isActive: true,
        },
      },
    }

    // Filter by category
    if (categoryId) {
      where.services = {
        some: {
          categoryId,
          isActive: true,
        },
      }
    }

    // Filter by location
    if (city) {
      where.profile = {
        city: {
          contains: city,
          mode: 'insensitive',
        },
      }
    }

    if (area) {
      where.profile = {
        ...where.profile,
        area: {
          contains: area,
          mode: 'insensitive',
        },
      }
    }

    // Get providers
    const providers = await prisma.user.findMany({
      where: {
        role: 'provider',
        ...where,
      },
      include: {
        profile: true,
        providerInfo: {
          include: {
            services: {
              where: {
                isActive: true,
                ...(categoryId && { categoryId }),
              },
              include: {
                category: true,
              },
            },
          },
        },
      },
      take: limit,
      skip,
    })

    // Calculate distances and filter by radius if coordinates provided
    let providersWithDistance = providers.map((provider) => {
      let distance: number | null = null

      if (
        latitude &&
        longitude &&
        provider.profile?.latitude &&
        provider.profile?.longitude
      ) {
        distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          Number(provider.profile.latitude),
          Number(provider.profile.longitude)
        )
      }

      return {
        ...provider,
        distance,
      }
    })

    // Filter by radius
    if (latitude && longitude) {
      providersWithDistance = providersWithDistance.filter((p) => {
        if (p.distance === null) return false
        return p.distance <= parseFloat(radius)
      })
    }

    // Filter by rating
    if (minRating) {
      providersWithDistance = providersWithDistance.filter((p) => {
        const rating = Number(p.providerInfo?.averageRating || 0)
        return rating >= parseFloat(minRating)
      })
    }

    // Filter by price
    if (minPrice || maxPrice) {
      providersWithDistance = providersWithDistance.filter((p) => {
        const services = p.providerInfo?.services || []
        return services.some((service: any) => {
          if (service.priceType === 'quote') return true
          if (service.priceType === 'fixed') {
            const price = Number(service.priceMin || 0)
            if (minPrice && price < parseFloat(minPrice)) return false
            if (maxPrice && price > parseFloat(maxPrice)) return false
            return true
          }
          if (service.priceType === 'range') {
            const min = Number(service.priceMin || 0)
            const max = Number(service.priceMax || 0)
            if (minPrice && max < parseFloat(minPrice)) return false
            if (maxPrice && min > parseFloat(maxPrice)) return false
            return true
          }
          return false
        })
      })
    }

    // Sort
    providersWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return a.distance - b.distance
        case 'rating':
          return (
            Number(b.providerInfo?.averageRating || 0) -
            Number(a.providerInfo?.averageRating || 0)
          )
        case 'reviews':
          return (
            (b.providerInfo?.totalReviews || 0) -
            (a.providerInfo?.totalReviews || 0)
          )
        case 'price_low':
          const aMinPrice = Math.min(
            ...(a.providerInfo?.services.map((s: any) => Number(s.priceMin || 0)) || [0])
          )
          const bMinPrice = Math.min(
            ...(b.providerInfo?.services.map((s: any) => Number(s.priceMin || 0)) || [0])
          )
          return aMinPrice - bMinPrice
        case 'price_high':
          const aMaxPrice = Math.max(
            ...(a.providerInfo?.services.map((s: any) => Number(s.priceMax || s.priceMin || 0)) || [0])
          )
          const bMaxPrice = Math.max(
            ...(b.providerInfo?.services.map((s: any) => Number(s.priceMax || s.priceMin || 0)) || [0])
          )
          return bMaxPrice - aMaxPrice
        default:
          return 0
      }
    })

    const total = providersWithDistance.length

    return NextResponse.json({
      providers: providersWithDistance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Search providers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

