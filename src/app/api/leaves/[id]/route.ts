import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Only admins can approve leaves' }, { status: 403 })
    }

    const { status } = await request.json()

    const leave = await prisma.leave.update({
      where: { id: params.id },
      data: { status },
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
    console.error('Error updating leave:', error)
    return NextResponse.json({ error: 'Failed to update leave' }, { status: 500 })
  }
}
