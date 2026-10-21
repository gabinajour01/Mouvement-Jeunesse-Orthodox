import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_ARCHIVE_SUBJECTS_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_ARCHIVE_SUBJECTS_ANON_KEY

export const archiveSubjectsClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null