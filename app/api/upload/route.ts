import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { archiveSubjectsClient } from '@/utils/supabase/archiveSubjectsClient'
import { uploadFileToGoogleDrive } from '@/utils/googleDrive'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const uploadMode = String(formData.get('upload_mode') || 'file')
    const externalUrl = String(formData.get('file_url') || '').trim()
    const file = formData.get('file')
    const title = String(formData.get('title') || '').trim()
    const subtitle = String(formData.get('subtitle') || '').trim()
    const subjectId = String(formData.get('subject_id') || '').trim()
    const target = String(formData.get('target') || 'dashboard') // 'dashboard' | 'archive'

    if (!title || !subtitle || !subjectId) {
      return NextResponse.json(
        { error: 'Please provide all required fields (Subject, Subtitle, and Title).' },
        { status: 400 }
      )
    }

    let finalFileUrl = ''
    let finalFilePath = 'google_drive'

    if (uploadMode === 'link' || externalUrl) {
      if (!externalUrl) {
        return NextResponse.json(
          { error: 'Please provide a valid document link.' },
          { status: 400 }
        )
      }
      finalFileUrl = externalUrl
    } else {
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: 'Please select a file to upload or enter a link.' },
          { status: 400 }
        )
      }

      const fileExt = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
      const customFileName = `${title}${fileExt}`

      try {
        const driveResult = await uploadFileToGoogleDrive({
          file,
          customName: customFileName,
        })
        finalFileUrl = driveResult.fileUrl
        finalFilePath = `drive_${driveResult.fileId}`
      } catch (driveErr: unknown) {
        console.error('Google Drive Upload Error:', driveErr)
        const errMsg = driveErr instanceof Error ? driveErr.message : 'Google Drive upload failed.'
        return NextResponse.json({ error: errMsg }, { status: 500 })
      }
    }

    if (target === 'archive') {
      const { error: dbError } = await archiveSubjectsClient
        .from('subject_documents')
        .insert({
          subject_id: subjectId,
          title,
          subtitle,
          file_path: finalFilePath,
          file_url: finalFileUrl,
        })

      if (dbError) {
        console.error('Archive Database Insert Error:', dbError)
        return NextResponse.json(
          { error: `Database Error: ${dbError.message}` },
          { status: 500 }
        )
      }

      revalidatePath('/')
      revalidatePath('/archive-subjects')
    } else {
      const supabase = await createClient()
      const { error: dbError } = await supabase
        .from('subject_documents')
        .insert({
          subject_id: subjectId,
          title,
          subtitle,
          file_path: finalFilePath,
          file_url: finalFileUrl,
        })

      if (dbError) {
        console.error('Database Insert Error:', dbError)
        return NextResponse.json(
          { error: `Database Error: ${dbError.message}` },
          { status: 500 }
        )
      }

      revalidatePath('/')
      revalidatePath('/dashboard')
    }

    return NextResponse.json({
      success: true,
      fileUrl: finalFileUrl,
      filePath: finalFilePath,
    })
  } catch (err: unknown) {
    console.error('Upload Route Error:', err)
    const errMsg = err instanceof Error ? err.message : 'Unexpected server error occurred during upload.'
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
