import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get total counts
    const [totalUsers, totalProviders, totalBookings, totalReviews] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'provider' } }),
      prisma.booking.count(),
      prisma.review.count({ where: { isVisible: true } }),
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [recentUsers, recentBookings, recentReviews] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.review.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          isVisible: true,
        },
      }),
    ])

    // Get pending verifications
    const pendingVerifications = await prisma.serviceProvider.count({
      where: {
        verificationStatus: 'pending',
      },
    })

    // Get booking status breakdown
    const bookingStatuses = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    // Get popular categories
    const popularCategories = await prisma.service.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    const categoriesWithNames = await Promise.all(
      popularCategories.map(async (cat) => {
        const category = await prisma.serviceCategory.findUnique({
          where: { id: cat.categoryId },
          select: { name: true },
        })
        return {
          categoryId: cat.categoryId,
          categoryName: category?.name || 'Unknown',
          count: cat._count.id,
        }
      })
    )

    // Get top providers by reviews
    const topProviders = await prisma.serviceProvider.findMany({
      where: {
        isActive: true,
        totalReviews: { gt: 0 },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        averageRating: 'desc',
      },
      take: 5,
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalProviders,
        totalBookings,
        totalReviews,
      },
      recentActivity: {
        users: recentUsers,
        bookings: recentBookings,
        reviews: recentReviews,
      },
      pendingVerifications,
      bookingStatuses: bookingStatuses.map((bs) => ({
        status: bs.status,
        count: bs._count.id,
      })),
      popularCategories: categoriesWithNames,
      topProviders: topProviders.map((tp) => ({
        providerId: tp.userId,
        name: tp.user.name,
        email: tp.user.email,
        averageRating: Number(tp.averageRating),
        totalReviews: tp.totalReviews,
        completedJobs: tp.completedJobs,
      })),
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

