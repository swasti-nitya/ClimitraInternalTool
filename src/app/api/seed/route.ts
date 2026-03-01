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
    // Check if User table exists, if not create all tables
    let tableExists = false
    try {
      await prisma.user.count()
      tableExists = true
    } catch {
      // Tables don't exist, create them
      await prisma.$executeRawUnsafe(`
        CREATE TABLE User (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE Expense (
          id TEXT PRIMARY KEY NOT NULL,
          date DATETIME NOT NULL,
          amount REAL NOT NULL,
          paidTo TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          paymentProof TEXT,
          invoice TEXT,
          remarks TEXT,
          status TEXT NOT NULL DEFAULT 'Pending approval',
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          userId TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES User(id)
        )
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE Leave (
          id TEXT PRIMARY KEY NOT NULL,
          date DATETIME NOT NULL,
          type TEXT NOT NULL,
          reason TEXT,
          status TEXT NOT NULL DEFAULT 'Pending',
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          userId TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES User(id)
        )
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE Holiday (
          id TEXT PRIMARY KEY NOT NULL,
          date DATETIME NOT NULL UNIQUE,
          name TEXT NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }
    
    // Now check user count
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
