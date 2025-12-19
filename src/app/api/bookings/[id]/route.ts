import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateBookingStatusSchema = z.object({
  status: z.enum([
    'requested',
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'rejected',
  ]),
  cancellationReason: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
                city: true,
                area: true,
                address: true,
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
                    city: true,
                    area: true,
                    address: true,
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
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check authorization
    const isCustomer = booking.customerId === payload.userId
    const isProvider = booking.providerId === payload.userId
    const isAdmin = payload.role === 'admin'

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateBookingStatusSchema.parse(body)

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check authorization and status transition rules
    const isCustomer = existingBooking.customerId === payload.userId
    const isProvider = existingBooking.providerId === payload.userId
    const isAdmin = payload.role === 'admin'

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Validate status transitions
    const currentStatus = existingBooking.status
    const newStatus = validatedData.status

    const validTransitions: Record<string, string[]> = {
      requested: ['confirmed', 'rejected', 'cancelled'],
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: [],
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      )
    }

    // Role-specific restrictions
    if (newStatus === 'confirmed' && !isProvider && !isAdmin) {
      return NextResponse.json(
        { error: 'Only provider can confirm bookings' },
        { status: 403 }
      )
    }

    if (newStatus === 'rejected' && !isProvider && !isAdmin) {
      return NextResponse.json(
        { error: 'Only provider can reject bookings' },
        { status: 403 }
      )
    }

    if (newStatus === 'in_progress' && !isProvider && !isAdmin) {
      return NextResponse.json(
        { error: 'Only provider can mark booking as in progress' },
        { status: 403 }
      )
    }

    if (newStatus === 'completed' && !isProvider && !isAdmin) {
      return NextResponse.json(
        { error: 'Only provider can mark booking as completed' },
        { status: 403 }
      )
    }

    // Update booking
    const updateData: any = {
      status: newStatus,
    }

    if (newStatus === 'confirmed' && currentStatus === 'requested') {
      updateData.confirmedDate = existingBooking.requestedDate
      updateData.confirmedTime = existingBooking.requestedTime
    }

    if (newStatus === 'cancelled') {
      updateData.cancellationReason = validatedData.cancellationReason || null
      updateData.cancelledById = payload.userId
    }

    // Update completed jobs count if completed
    if (newStatus === 'completed' && currentStatus !== 'completed') {
      await prisma.serviceProvider.update({
        where: { userId: existingBooking.providerId },
        data: {
          completedJobs: {
            increment: 1,
          },
        },
      })
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
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
    })

    return NextResponse.json({ booking })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

