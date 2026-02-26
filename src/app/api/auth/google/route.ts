import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.append('client_id', clientId!)
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri!)
  googleAuthUrl.searchParams.append('response_type', 'code')
  googleAuthUrl.searchParams.append('scope', 'email profile https://www.googleapis.com/auth/drive.file')
  googleAuthUrl.searchParams.append('access_type', 'offline')
  googleAuthUrl.searchParams.append('prompt', 'consent')
  
  // Optional: Only allow @climitra.com emails
  googleAuthUrl.searchParams.append('hd', 'climitra.com')
  
  return NextResponse.redirect(googleAuthUrl.toString())
}
