import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can create reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createReviewSchema.parse(body)

    // Verify booking exists and belongs to customer
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.customerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to review this booking' },
        { status: 403 }
      )
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        bookingId: validatedData.bookingId,
        reviewerId: payload.userId,
        revieweeId: booking.providerId,
        rating: validatedData.rating,
        comment: validatedData.comment || null,
      },
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
    })

    // Update provider's average rating and review count
    const providerReviews = await prisma.review.findMany({
      where: {
        revieweeId: booking.providerId,
        isVisible: true,
      },
    })

    const averageRating =
      providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length

    await prisma.serviceProvider.update({
      where: { userId: booking.providerId },
      data: {
        averageRating: averageRating,
        totalReviews: providerReviews.length,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')
    const bookingId = searchParams.get('bookingId')

    if (!providerId && !bookingId) {
      return NextResponse.json(
        { error: 'providerId or bookingId is required' },
        { status: 400 }
      )
    }

    const where: any = { isVisible: true }
    if (providerId) {
      where.revieweeId = providerId
    }
    if (bookingId) {
      where.bookingId = bookingId
    }

    const reviews = await prisma.review.findMany({
      where,
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
      take: 50,
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

