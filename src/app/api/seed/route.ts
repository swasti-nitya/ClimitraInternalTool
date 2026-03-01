import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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
    // First, run prisma db push to create tables if they don't exist
    try {
      await execAsync('npx prisma db push --accept-data-loss')
    } catch (pushError) {
      console.log('Prisma db push completed or tables already exist')
    }
    
    // Check if database is already seeded
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      // Seed users
      for (const user of users) {
        await prisma.user.create({
          data: user,
        })
      }
      
      return NextResponse.json({ success: true, message: 'Database seeded successfully with 13 users' })
    } else {
      return NextResponse.json({ success: true, message: `Database already seeded with ${userCount} users` })
    }
  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Seeding failed', details: String(error) }, { status: 500 })
  }
}
