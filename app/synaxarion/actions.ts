'use server'

import { createArchiveClient } from '@/utils/supabase/archiveServer'
import { revalidatePath } from 'next/cache'

const BUCKET_NAME = 'synaxarion-docs'

const ARABIC_MONTHS: Record<number, string> = {
  1: 'كانون الثاني (January)',
  2: 'شباط (February)',
  3: 'آذار (March)',
  4: 'نيسان (April)',
  5: 'أيار (May)',
  6: 'حزيران (June)',
  7: 'تموز (July)',
  8: 'آب (August)',
  9: 'أيلول (September)',
  10: 'تشرين الأول (October)',
  11: 'تشرين الثاني (November)',
  12: 'كانون الأول (December)',
}

export async function uploadDailySynaxarion(formData: FormData) {
  const archiveSupabase = await createArchiveClient()

  const file = formData.get('file') as File
  const title = String(formData.get('title') || '').trim()
  const month = Number(formData.get('month'))
  const day = Number(formData.get('day'))
  const summary = String(formData.get('summary') || '').trim()

  if (!file || file.size === 0 || !title || !month || !day) {
    return { error: 'Month, Day, Title, and PDF file are required.' }
  }

  const fileExt = file.name.includes('.') ? `.${file.name.split('.').pop()}` : '.pdf'
  const filePath = `month-${month}/day-${day}-${crypto.randomUUID()}${fileExt}`

  // 1. Upload PDF to Storage
  const { error: uploadError } = await archiveSupabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, { contentType: 'application/pdf', upsert: true })

  if (uploadError) {
    console.error('Archive Storage Upload Error:', uploadError.message)
    return { error: uploadError.message }
  }

  // 2. Get Public URL
  const { data: { publicUrl } } = archiveSupabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  // 3. Insert Reading (Allows multiple documents per day)
  const { error: dbError } = await archiveSupabase
    .from('synaxarion_readings')
    .insert({
      month,
      day,
      month_name: ARABIC_MONTHS[month] || `Month ${month}`,
      title,
      summary: summary || null,
      file_path: filePath,
      file_url: publicUrl,
    })

  if (dbError) {
    console.error('Archive DB Insert Error:', dbError.message)
    await archiveSupabase.storage.from(BUCKET_NAME).remove([filePath])
    return { error: dbError.message }
  }

  revalidatePath('/synaxarion')
  revalidatePath('/')
  return { success: true }
}

export async function deleteSynaxarionReading(id: string, filePath: string) {
  const archiveSupabase = await createArchiveClient()

  // 1. Delete row from Database
  const { error: dbError } = await archiveSupabase
    .from('synaxarion_readings')
    .delete()
    .eq('id', id)

  if (dbError) {
    return { error: dbError.message }
  }

  // 2. Remove PDF from Storage
  const { error: storageError } = await archiveSupabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (storageError) {
    return { error: storageError.message }
  }

  revalidatePath('/synaxarion')
  revalidatePath('/')
  return { success: true }
}