import { google } from 'googleapis'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'

function getGoogleAuth() {
  const credentialsFilePath = path.join(process.cwd(), 'service-account.json')

  // 1. Check if a service-account.json file exists in project root
  if (fs.existsSync(credentialsFilePath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(credentialsFilePath, 'utf8'))
      return new google.auth.JWT({
        email: fileData.client_email,
        key: fileData.private_key,
        scopes: ['https://www.googleapis.com/auth/drive'],
      })
    } catch (e) {
      console.error('Failed to parse service-account.json:', e)
    }
  }

  // 2. Otherwise check environment variables
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Google Drive credentials not found. Please provide service-account.json in the project root or set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env.local.'
    )
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

export async function uploadFileToGoogleDrive({
  file,
  customName,
}: {
  file: File
  customName?: string
}): Promise<{ fileId: string; fileUrl: string; webViewLink: string }> {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL
  const fileName = customName || file.name
  const mimeType = file.type || 'application/octet-stream'

  // If Google Apps Script Web App is configured, upload through it (bypasses service account quota)
  if (appsScriptUrl) {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        fileName,
        mimeType,
        folderId,
      }),
      redirect: 'follow',
    })

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload file to Google Drive.')
    }

    const directDownload = `https://drive.google.com/uc?export=download&id=${data.fileId}`
    return {
      fileId: data.fileId,
      fileUrl: directDownload,
      webViewLink: data.fileUrl || directDownload,
    }
  }

  const auth = getGoogleAuth()
  const drive = google.drive({ version: 'v3', auth })

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined

  // Convert Web File arrayBuffer to Node Buffer and readable stream
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const stream = Readable.from(buffer)

  let response
  try {
    response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true,
    })
  } catch (createErr: unknown) {
    const errMsg = createErr instanceof Error ? createErr.message : String(createErr)
    if (errMsg.includes('storage quota') || errMsg.includes('Service Accounts do not have storage quota')) {
      throw new Error(
        'Google Service Accounts have 0 GB storage quota on personal Google Drives. Please set up the Google Apps Script Web App (GOOGLE_APPS_SCRIPT_URL) or switch to the "Google Drive Link" option to paste your link directly.'
      )
    }
    throw createErr
  }

  const fileId = response.data.id
  if (!fileId) {
    throw new Error('Google Drive upload failed: No file ID returned.')
  }

  // Make the file publicly viewable so any visitor can read the document
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    })
  } catch (permError) {
    console.warn('Could not set public permission on Drive file:', permError)
  }

  const directViewLink = `https://drive.google.com/file/d/${fileId}/view`
  const webViewLink = response.data.webViewLink || directViewLink

  return {
    fileId,
    fileUrl: webViewLink,
    webViewLink,
  }
}

export function formatDocumentUrl(url: string): string {
  if (!url) return '#'
  
  // Extract ID from drive.google.com/file/d/ID or docs.google.com/.../d/ID
  const match = url.match(/\/(?:file|document|presentation|spreadsheets)\/d\/([-\w]+)/)
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`
  }

  return url
}
