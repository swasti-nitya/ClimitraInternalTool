import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error('No access token received')
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const googleUser = await userInfoResponse.json()

    // Check if email is @climitra.com
    if (!googleUser.email.endsWith('@climitra.com')) {
      return NextResponse.redirect(new URL('/?error=invalid_domain', request.url))
    }

    // Find user in database by email
    const user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/?error=user_not_found', request.url))
    }

    // Create response and set cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    // Store access token for Drive uploads
    response.cookies.set('googleAccessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour (tokens typically expire after 1 hour)
      path: '/',
    })
    
    // Store refresh token for persistent sessions (doesn't expire)
    if (tokens.refresh_token) {
      response.cookies.set('googleRefreshToken', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
