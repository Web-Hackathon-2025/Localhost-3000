import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateServiceSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  priceType: z.enum(['fixed', 'range', 'quote']).optional(),
  priceMin: z.number().min(0).optional().nullable(),
  priceMax: z.number().min(0).optional().nullable(),
  durationMinutes: z.number().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
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
    if (!payload || payload.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
      select: { providerId: true },
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.providerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this service' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateServiceSchema.parse(body)

    const service = await prisma.service.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: true,
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update service error:', error)
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
    if (!payload || payload.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify service belongs to provider
    const existingService = await prisma.service.findUnique({
      where: { id: params.id },
      select: { providerId: true },
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.providerId !== payload.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this service' },
        { status: 403 }
      )
    }

    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

