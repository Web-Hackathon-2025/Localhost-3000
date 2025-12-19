import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateDistance } from '@/lib/utils/distance'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')

    const provider = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'provider',
      },
      include: {
        profile: true,
        providerInfo: {
          include: {
            services: {
              where: { isActive: true },
              include: {
                category: true,
                _count: {
                  select: { bookings: true },
                },
              },
            },
            availabilitySlots: {
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
        reviewsReceived: {
          where: { isVisible: true },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviewsReceived: {
              where: { isVisible: true },
            },
          },
        },
      },
    })

    if (!provider || !provider.providerInfo) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Calculate distance if coordinates provided
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

    return NextResponse.json({
      provider: {
        ...provider,
        distance,
      },
    })
  } catch (error) {
    console.error('Get provider error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

