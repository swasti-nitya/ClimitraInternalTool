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
    // First, ensure tables exist by trying to create them
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Expense (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      paidTo TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      paymentProof TEXT,
      invoice TEXT,
      remarks TEXT,
      status TEXT NOT NULL DEFAULT 'Pending approval',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id)
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Leave (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id)
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS Holiday (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
    
    // Now seed users
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
