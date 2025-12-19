import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  requestedDate: z.string(),
  requestedTime: z.string(),
  specialInstructions: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = payload.role

    // Build where clause based on role
    const where: any = {}
    if (role === 'customer') {
      where.customerId = payload.userId
    } else if (role === 'provider') {
      where.providerId = payload.userId
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile: {
              select: {
                profilePictureUrl: true,
              },
            },
          },
        },
        provider: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profile: {
                  select: {
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        },
        service: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { requestedDate: 'desc' },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can create bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Verify provider and service exist
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.providerId !== validatedData.providerId) {
      return NextResponse.json(
        { error: 'Service does not belong to this provider' },
        { status: 400 }
      )
    }

    if (!service.isActive) {
      return NextResponse.json(
        { error: 'Service is not available' },
        { status: 400 }
      )
    }

    // Verify provider is active
    if (!service.provider.user.providerInfo?.isActive) {
      return NextResponse.json(
        { error: 'Provider is not accepting bookings' },
        { status: 400 }
      )
    }

    // Validate date and time
    const requestedDate = new Date(validatedData.requestedDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (requestedDate < now) {
      return NextResponse.json(
        { error: 'Cannot book in the past' },
        { status: 400 }
      )
    }

    // Parse time
    const [hours, minutes] = validatedData.requestedTime.split(':').map(Number)
    const requestedDateTime = new Date(requestedDate)
    requestedDateTime.setHours(hours, minutes, 0, 0)

    // Check for duplicate bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        providerId: validatedData.providerId,
        requestedDate: requestedDate,
        requestedTime: requestedDateTime,
        status: {
          in: ['requested', 'pending', 'confirmed', 'in_progress'],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: payload.userId,
        providerId: validatedData.providerId,
        serviceId: validatedData.serviceId,
        requestedDate: requestedDate,
        requestedTime: requestedDateTime,
        specialInstructions: validatedData.specialInstructions || null,
        status: 'requested',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        service: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

