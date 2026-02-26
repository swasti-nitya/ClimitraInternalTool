import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { uploadToGoogleDrive, refreshAccessToken } from '@/lib/googleDrive'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const filterUserId = searchParams.get('userId')

    let expenses

    if (user.role === 'Super Admin') {
      // Admin sees all expenses or filtered by user
      expenses = await prisma.expense.findMany({
        where: filterUserId ? { userId: filterUserId } : {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Regular users see only their own expenses
      expenses = await prisma.expense.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    let googleAccessToken = cookieStore.get('googleAccessToken')?.value
    const googleRefreshToken = cookieStore.get('googleRefreshToken')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // If access token is missing but refresh token exists, try to refresh
    if (!googleAccessToken && googleRefreshToken) {
      try {
        googleAccessToken = await refreshAccessToken(googleRefreshToken)
      } catch (error) {
        return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })
      }
    }
    
    if (!googleAccessToken) {
      return NextResponse.json({ error: 'Google access token not available. Please log in again.' }, { status: 401 })
    }

    const formData = await request.formData()
    
    const date = formData.get('date') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paidTo = formData.get('paidTo') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const remarks = (formData.get('remarks') as string) || ''
    
    let paymentProofPath = null
    let invoicePath = null

    // Handle payment proof file upload to Google Drive
    const paymentProof = formData.get('paymentProof') as File | null
    if (paymentProof) {
      try {
        const bytes = await paymentProof.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `payment_${Date.now()}_${paymentProof.name.replace(/\s/g, '-')}`
        
        const result = await uploadToGoogleDrive(buffer, fileName, paymentProof.type, googleAccessToken)
        paymentProofPath = result.webViewLink // Store the Google Drive link
      } catch (error) {
        console.error('Failed to upload payment proof to Google Drive:', error)
      }
    }

    // Handle invoice file upload to Google Drive
    const invoice = formData.get('invoice') as File | null
    if (invoice) {
      try {
        const bytes = await invoice.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `invoice_${Date.now()}_${invoice.name.replace(/\s/g, '-')}`
        
        const result = await uploadToGoogleDrive(buffer, fileName, invoice.type, googleAccessToken)
        invoicePath = result.webViewLink // Store the Google Drive link
      } catch (error) {
        console.error('Failed to upload invoice to Google Drive:', error)
      }
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        amount,
        paidTo,
        category,
        description,
        remarks,
        paymentProof: paymentProofPath,
        invoice: invoicePath,
        userId,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
