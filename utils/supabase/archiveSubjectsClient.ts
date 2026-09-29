import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_ARCHIVE_SUBJECTS_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_ARCHIVE_SUBJECTS_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Project 3 credentials in .env.local')
}

export const archiveSubjectsClient = createClient(supabaseUrl, supabaseAnonKey)