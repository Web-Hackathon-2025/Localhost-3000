import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  priceType: z.enum(['fixed', 'range', 'quote']),
  priceMin: z.number().min(0).optional().nullable(),
  priceMax: z.number().min(0).optional().nullable(),
  durationMinutes: z.number().min(1).optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const services = await prisma.service.findMany({
      where: {
        providerId: payload.userId,
      },
      include: {
        category: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
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
    if (!payload || payload.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)

    // Verify category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify provider exists
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: payload.userId },
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      )
    }

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        providerId: payload.userId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

