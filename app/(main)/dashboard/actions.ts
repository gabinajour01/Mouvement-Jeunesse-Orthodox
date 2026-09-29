'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const BUCKET_NAME = 'Mjo docs'

export async function uploadDocument(formData: FormData) {
  try {
    const supabase = await createClient()

    const file = formData.get('file')
    const title = String(formData.get('title') || '').trim()
    const subtitle = String(formData.get('subtitle') || '').trim()
    const subject_id = String(formData.get('subject_id') || '').trim()

    if (!(file instanceof File) || file.size === 0 || !title || !subtitle || !subject_id) {
      return { error: 'Please provide all fields and select a file.' }
    }

    // 1. Verify the signed-in session required by the Storage RLS policy.
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Your session has expired. Please sign in again before uploading.' }
    }

    // 2. Format file path with original extension
    const fileExt = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
    const fileName = `${crypto.randomUUID()}${fileExt}`
    const filePath = `${subject_id}/${fileName}`
    const contentType = file.type || 'application/octet-stream'

    // 3. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { contentType, upsert: false })

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError)
      if (/row-level security policy/i.test(uploadError.message)) {
        return {
          error: 'Supabase is missing the upload permission. Run supabase/migrations/20260928000000_allow_authenticated_uploads_mjo_docs.sql in your project SQL Editor, then retry.',
        }
      }
      return { error: `Storage Error: ${uploadError.message}` }
    }

    // 4. Retrieve Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    // 5. Insert Record into Database
    const { error: dbError } = await supabase
      .from('subject_documents')
      .insert({
        subject_id,
        title,
        subtitle,
        file_path: filePath,
        file_url: publicUrl,
      })
      .select()

    if (dbError) {
      console.error('Database Insert Error:', dbError)
      // Cleanup orphan storage file if DB insert fails
      await supabase.storage.from(BUCKET_NAME).remove([filePath])
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

  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([document.file_path])

  if (storageError) {
    return { error: `Storage Error: ${storageError.message}` }
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