'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadFileToGoogleDrive } from '@/utils/googleDrive'

const BUCKET_NAME = 'Mjo docs'

export async function uploadDocument(formData: FormData) {
  try {
    const supabase = await createClient()

    const uploadMode = String(formData.get('upload_mode') || 'file')
    const externalUrl = String(formData.get('file_url') || '').trim()
    const file = formData.get('file')
    const title = String(formData.get('title') || '').trim()
    const subtitle = String(formData.get('subtitle') || '').trim()
    const subject_id = String(formData.get('subject_id') || '').trim()

    if (!title || !subtitle || !subject_id) {
      return { error: 'Please provide all fields.' }
    }

    let finalFileUrl = ''
    let finalFilePath = 'google_drive'

    if (uploadMode === 'link' || externalUrl) {
      if (!externalUrl) {
        return { error: 'Please provide a valid document link.' }
      }
      finalFileUrl = externalUrl
    } else {
      if (!(file instanceof File) || file.size === 0) {
        return { error: 'Please select a file to upload or enter a link.' }
      }

      // 1. Verify the signed-in session
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { error: 'Your session has expired. Please sign in again before uploading.' }
      }

      // 2. Upload file directly to Google Drive
      const fileExt = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
      const customFileName = `${title}${fileExt}`

      try {
        const driveResult = await uploadFileToGoogleDrive({
          file,
          customName: customFileName,
        })
        finalFileUrl = driveResult.fileUrl
        finalFilePath = `drive_${driveResult.fileId}`
      } catch (driveErr) {
        console.error('Google Drive Upload Error:', driveErr)
        return {
          error: driveErr instanceof Error ? driveErr.message : 'Google Drive upload failed. Please check credentials.',
        }
      }
    }

    // 5. Insert Record into Database
    const { error: dbError } = await supabase
      .from('subject_documents')
      .insert({
        subject_id,
        title,
        subtitle,
        file_path: finalFilePath,
        file_url: finalFileUrl,
      })
      .select()

    if (dbError) {
      console.error('Database Insert Error:', dbError)
      if (finalFilePath !== 'google_drive') {
        await supabase.storage.from(BUCKET_NAME).remove([finalFilePath])
      }
      return { error: `Database Error: ${dbError.message}` }
    }

    revalidatePath('/')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: unknown) {
    console.error('Server Action Unexpected Crash:', err)
    return { error: err instanceof Error ? err.message : 'Unexpected server error occurred.' }
  }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be signed in to delete documents.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Only admins can delete documents.' }
  }

  const { data: document, error: documentError } = await supabase
    .from('subject_documents')
    .select('file_path')
    .eq('id', id)
    .single()

  if (documentError || !document) {
    return { error: 'Document not found.' }
  }

  if (document.file_path && !document.file_path.startsWith('drive_') && document.file_path !== 'google_drive') {
    const { error: storageError } = await supabase.storage
      .from('Mjo docs')
      .remove([document.file_path])

    if (storageError) {
      console.warn(`Storage delete warning for ${document.file_path}:`, storageError.message)
    }
  }

  const { error: dbError } = await supabase
    .from('subject_documents')
    .delete()
    .eq('id', id)

  if (dbError) {
    return { error: `Database Error: ${dbError.message}` }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  return { success: true }
}