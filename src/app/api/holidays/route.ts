import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(holidays)
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Only admins can declare holidays' }, { status: 403 })
    }

    const { date, name } = await request.json()

    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
      },
    })

    return NextResponse.json(holiday)
  } catch (error) {
    console.error('Error creating holiday:', error)
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
  }
}
