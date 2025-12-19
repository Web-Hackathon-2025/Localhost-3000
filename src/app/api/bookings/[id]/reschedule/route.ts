import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const rescheduleSchema = z.object({
  requestedDate: z.string(),
  requestedTime: z.string(),
  reason: z.string().optional(),
})

export async function POST(
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
    const validatedData = rescheduleSchema.parse(body)

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check authorization
    const isCustomer = existingBooking.customerId === payload.userId
    const isProvider = existingBooking.providerId === payload.userId

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Only allow rescheduling for certain statuses
    if (!['requested', 'pending', 'confirmed'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: 'Cannot reschedule booking in current status' },
        { status: 400 }
      )
    }

    // Validate new date and time
    const requestedDate = new Date(validatedData.requestedDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (requestedDate < now) {
      return NextResponse.json(
        { error: 'Cannot reschedule to a past date' },
        { status: 400 }
      )
    }

    // Parse time
    const [hours, minutes] = validatedData.requestedTime.split(':').map(Number)
    const requestedDateTime = new Date(requestedDate)
    requestedDateTime.setHours(hours, minutes, 0, 0)

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        providerId: existingBooking.providerId,
        requestedDate: requestedDate,
        requestedTime: requestedDateTime,
        status: {
          in: ['requested', 'pending', 'confirmed', 'in_progress'],
        },
        id: { not: params.id },
      },
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 400 }
      )
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        requestedDate: requestedDate,
        requestedTime: requestedDateTime,
        status: 'requested',
        specialInstructions: validatedData.reason
          ? `${existingBooking.specialInstructions || ''}\n[Reschedule Request]: ${validatedData.reason}`.trim()
          : existingBooking.specialInstructions,
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

    return NextResponse.json({
      message: 'Booking rescheduled successfully',
      booking,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Reschedule booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

