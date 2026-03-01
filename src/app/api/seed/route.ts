import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const users = [
  { name: 'Aryaman', email: 'aryaman@climitra.com', role: 'Super Admin' },
  { name: 'Shrinivas', email: 'shrinivas@climitra.com', role: 'User' },
  { name: 'Sanat', email: 'sanat@climitra.com', role: 'User' },
  { name: 'Shubhankar', email: 'shubhankar@climitra.com', role: 'Super Admin' },
  { name: 'Shaurya', email: 'shaurya@climitra.com', role: 'Super Admin' },
  { name: 'Deepam', email: 'deepam@climitra.com', role: 'User' },
  { name: 'Sankalp', email: 'sankalp@climitra.com', role: 'User' },
  { name: 'Nandini', email: 'nandini@climitra.com', role: 'User' },
  { name: 'Aman', email: 'aman@climitra.com', role: 'User' },
  { name: 'Khyati', email: 'khyati@climitra.com', role: 'User' },
  { name: 'Sanskriti', email: 'sanskriti@climitra.com', role: 'User' },
  { name: 'Swasti', email: 'swasti@climitra.com', role: 'User' },
  { name: 'Admin', email: 'admin@climitra.com', role: 'Super Admin' },
]

export async function GET() {
  try {
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      })
    }
    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
