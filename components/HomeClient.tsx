'use client'

import { useState } from 'react'
import Hero from './Hero'
import ProgramsPanel from './ProgramsPanel'
import SubjectsSection from './SubjectsSection'
import ArchiveSubjectsSection from './ArchiveSubjectsSection'
import SynaxarionSection from './SynaxarionSection'

interface Subject {
  id: string
  title: string
  subtitles?: { id: string; title: string }[]
}

interface DocumentRecord {
  id: string
  title: string
  subtitle: string | null
  subject_id: string
  file_url: string
}

interface SynaxarionReading {
  id: string
  month: number
  day: number
  month_name: string | null
  title: string
  summary: string | null
  file_url: string
}

export default function HomeClient({ 
  subjects, 
  documents,
  archiveSubjects,
  archiveDocuments,
  synaxarionReadings,
  todayReading,
  isAdmin,
}: { 
  subjects: Subject[],
  documents: DocumentRecord[],
  archiveSubjects: Subject[],
  archiveDocuments: DocumentRecord[],
  synaxarionReadings: SynaxarionReading[],
  todayReading: SynaxarionReading | null,
  isAdmin: boolean,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProgramsPanel />
      <SubjectsSection searchQuery={searchQuery} subjects={subjects} documents={documents} />
      <ArchiveSubjectsSection searchQuery={searchQuery} subjects={archiveSubjects} documents={archiveDocuments} />
      <SynaxarionSection
        todayReading={todayReading}
        readings={synaxarionReadings}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
      />
    </>
  )
}