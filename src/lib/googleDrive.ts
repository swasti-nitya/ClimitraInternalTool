import { google } from 'googleapis'
import { Readable } from 'stream'

// Shared folder ID where all files will be uploaded
const FOLDER_ID = '136j62fGm8lnQQTyt0-9q3gvXr1kIgGl-'

// Refresh expired access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('Failed to refresh token')
    }
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

// Initialize Google Drive with user's access token
export function getDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  // Set the user's access token
  oauth2Client.setCredentials({
    access_token: accessToken,
  })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

// Helper function to convert Buffer to Readable stream
function bufferToStream(buffer: Buffer): Readable {
  const readable = new Readable()
  readable._read = () => {} // _read is required but you can noop it
  readable.push(buffer)
  readable.push(null)
  return readable
}

export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  accessToken: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
  try {
    const drive = getDriveClient(accessToken)

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media: {
        mimeType: mimeType,
        body: bufferToStream(fileBuffer),
      },
      fields: 'id, webViewLink, webContentLink',
    })

    const fileId = response.data.id!
    
    // Make the file publicly accessible (read-only)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    return {
      fileId: fileId,
      webViewLink: response.data.webViewLink || getGoogleDriveViewLink(fileId),
      webContentLink: response.data.webContentLink || getGoogleDriveDownloadLink(fileId),
    }
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error)
    console.error('Error details:', error.response?.data || error.message)
    throw new Error(`Failed to upload to Google Drive: ${error.message}`)
  }
}

export function getGoogleDriveViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

export function getGoogleDriveDownloadLink(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}
