import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        providerInfo: true,
        _count: {
          select: {
            customerBookings: true,
            providerBookings: true,
            reviewsGiven: true,
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...updateData } = body

    // Handle suspend/activate for providers
    if (action === 'suspend' || action === 'activate') {
      const user = await prisma.user.findUnique({
        where: { id: params.id },
        select: { role: true },
      })

      if (user?.role === 'provider') {
        await prisma.serviceProvider.update({
          where: { userId: params.id },
          data: { isActive: action === 'activate' },
        })
      }

      return NextResponse.json({
        message: `User ${action === 'activate' ? 'activated' : 'suspended'} successfully`,
      })
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        profile: true,
        providerInfo: true,
      },
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

