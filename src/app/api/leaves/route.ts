import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const currentUserId = cookieStore.get('userId')?.value

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    })

    let leaves

    // If user is admin, fetch ALL leaves; otherwise fetch only their own
    if (currentUser?.role === 'Super Admin') {
      leaves = await prisma.leave.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      })
    } else {
      leaves = await prisma.leave.findMany({
        where: { userId: currentUserId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      })
    }

    return NextResponse.json(leaves)
  } catch (error) {
    console.error('Error fetching leaves:', error)
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, type, reason } = await request.json()

    const leave = await prisma.leave.create({
      data: {
        date: new Date(date),
        type,
        reason: reason || null,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(leave)
  } catch (error) {
    console.error('Error creating leave:', error)
    return NextResponse.json({ error: 'Failed to create leave' }, { status: 500 })
  }
}
