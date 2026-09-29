import { createClient } from '@/utils/supabase/server'
import { createArchiveClient } from '@/utils/supabase/archiveServer'
import { archiveSubjectsClient } from '@/utils/supabase/archiveSubjectsClient'
import HomeClient from '@/components/HomeClient'

export default async function Home() {
  const supabase = await createClient()
  const synaxarionSupabase = await createArchiveClient()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()

  // 1. Fetch Primary Project (Main Subjects, Subtitles, Documents)
  const [
    { data: subjects },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from('subjects')
      .select('*, subtitles(*)')
      .order('display_order', { ascending: true }),
    supabase
      .from('subject_documents')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  // 2. Fetch Project 2 (Synaxarion Readings) & Auth User
  const [{ data: synaxarionReadings }, { data: { user } }] = await Promise.all([
    synaxarionSupabase
      .from('synaxarion_readings')
      .select('id, month, day, month_name, title, summary, file_url')
      .order('month', { ascending: true })
      .order('day', { ascending: true }),
    supabase.auth.getUser(),
  ])

  const todayReading = (synaxarionReadings || []).find(
    (reading) => reading.month === currentMonth && reading.day === currentDay
  ) || null

  // 3. Fetch Project 3 (Archive Subjects with Subtitles & Documents)
  const [
    { data: archiveSubjects, error: archiveSubjectsError },
    { data: archiveDocuments, error: archiveDocsError },
  ] = await Promise.all([
    archiveSubjectsClient
      .from('subjects')
      .select('*, subtitles(*)')
      .order('created_at', { ascending: true }),
    archiveSubjectsClient
      .from('subject_documents')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  if (archiveSubjectsError) {
    console.error('Project 3 Subjects Error:', archiveSubjectsError.message)
  }
  if (archiveDocsError) {
    console.error('Project 3 Documents Error:', archiveDocsError.message)
  }

  // 4. Admin verification
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <HomeClient
      subjects={subjects || []}
      documents={documents || []}
      archiveSubjects={archiveSubjects || []}
      archiveDocuments={archiveDocuments || []}
      synaxarionReadings={synaxarionReadings || []}
      todayReading={todayReading || null}
      isAdmin={isAdmin}
    />
  )
}