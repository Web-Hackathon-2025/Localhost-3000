import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

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
    const { verificationStatus } = body

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Invalid verification status' },
        { status: 400 }
      )
    }

    // Check if user is a provider
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    })

    if (user?.role !== 'provider') {
      return NextResponse.json(
        { error: 'User is not a provider' },
        { status: 400 }
      )
    }

    await prisma.serviceProvider.update({
      where: { userId: params.id },
      data: { verificationStatus },
    })

    return NextResponse.json({
      message: `Provider ${verificationStatus === 'verified' ? 'verified' : 'verification updated'} successfully`,
    })
  } catch (error) {
    console.error('Verify provider error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

