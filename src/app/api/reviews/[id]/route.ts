import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional().nullable(),
  isVisible: z.boolean().optional(),
})

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
    const validatedData = updateReviewSchema.parse(body)

    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        booking: true,
      },
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check authorization - customer can update their own review, admin can update any
    const isOwner = existingReview.reviewerId === payload.userId
    const isAdmin = payload.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: params.id },
      data: validatedData,
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

    // If rating changed, update provider's average rating
    if (validatedData.rating !== undefined) {
      const providerReviews = await prisma.review.findMany({
        where: {
          revieweeId: existingReview.revieweeId,
          isVisible: true,
        },
      })

      const averageRating =
        providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length

      await prisma.serviceProvider.update({
        where: { userId: existingReview.revieweeId },
        data: {
          averageRating: averageRating,
          totalReviews: providerReviews.length,
        },
      })
    }

    return NextResponse.json({ review })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check authorization
    const isOwner = existingReview.reviewerId === payload.userId
    const isAdmin = payload.role === 'admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete by hiding review
    await prisma.review.update({
      where: { id: params.id },
      data: { isVisible: false },
    })

    // Update provider's average rating
    const providerReviews = await prisma.review.findMany({
      where: {
        revieweeId: existingReview.revieweeId,
        isVisible: true,
      },
    })

    const averageRating =
      providerReviews.length > 0
        ? providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length
        : 0

    await prisma.serviceProvider.update({
      where: { userId: existingReview.revieweeId },
      data: {
        averageRating: averageRating,
        totalReviews: providerReviews.length,
      },
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

