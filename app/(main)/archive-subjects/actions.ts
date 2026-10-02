'use server'

import { archiveSubjectsClient } from '@/utils/supabase/archiveSubjectsClient'
import { revalidatePath } from 'next/cache'
import { uploadFileToGoogleDrive } from '@/utils/googleDrive'

const BUCKET_NAME = 'archive-docs'

export async function uploadArchiveDocument(formData: FormData) {
  const uploadMode = String(formData.get('upload_mode') || 'file')
  const externalUrl = String(formData.get('file_url') || '').trim()
  const file = formData.get('file') as File | null
  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const subject_id = String(formData.get('subject_id') || '').trim()

  if (!title || !subtitle || !subject_id) {
    return { error: 'All fields are required.' }
  }

  let finalFileUrl = ''
  let finalFilePath = 'google_drive'

  if (uploadMode === 'link' || externalUrl) {
    if (!externalUrl) {
      return { error: 'Please provide a valid document link.' }
    }
    finalFileUrl = externalUrl
  } else {
    if (!file || file.size === 0) {
      return { error: 'Please select a file to upload or enter a link.' }
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
    } catch (driveErr) {
      console.error('Google Drive Upload Error:', driveErr)
      return {
        error: driveErr instanceof Error ? driveErr.message : 'Google Drive upload failed. Please check credentials.',
      }
    }
  }

  // 2. Insert record into Project 3 subject_documents
  const { error: dbError } = await archiveSubjectsClient
    .from('subject_documents')
    .insert({
      subject_id,
      title,
      subtitle,
      file_path: finalFilePath,
      file_url: finalFileUrl,
    })

  if (dbError) {
    if (finalFilePath !== 'google_drive') {
      await archiveSubjectsClient.storage.from(BUCKET_NAME).remove([finalFilePath])
    }
    return { error: dbError.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteArchiveDocument(id: string, filePath: string) {
  const { error: dbError } = await archiveSubjectsClient
    .from('subject_documents')
    .delete()
    .eq('id', id)

  if (dbError) return { error: dbError.message }

  const { error: storageError } = await archiveSubjectsClient.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (storageError) return { error: storageError.message }

  revalidatePath('/')
  return { success: true }
}