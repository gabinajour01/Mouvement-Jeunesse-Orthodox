'use client'

import UploadDocumentModal from '@/components/UploadDocumentModal'
import { useEffect, useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Layers, Presentation, FileSpreadsheet } from 'lucide-react'
import { formatDocumentUrl } from '@/utils/documentUrl'

type Subject = {
  id: string
  title: string
  subtitles?: { id: string; title: string }[]
}

type SubjectDocument = {
  id: string
  title: string
  subtitle?: string | null
  subject_id: string
  file_url: string
}

export default function SubjectsSection({ 
  searchQuery, 
  subjects, 
  documents 
}: { 
  searchQuery: string
  subjects: Subject[]
  documents: SubjectDocument[]
}) {
  const [openCardId, setOpenCardId] = useState<string | null>(null)

  // Highlight search text helper
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 text-black">{part}</span>
      ) : (
        part
      )
    )
  }

  // When search query changes, auto-open the first matching card if query exists, or reset to closed
  useEffect(() => {
    if (searchQuery) {
      const allDocsMatch = documents.some(d => 
        (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (d.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (allDocsMatch) {
        setOpenCardId('all')
        return
      }

      const matchingSubject = subjects.find(subject => {
        const categoryMatches = (subject.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (subject.subtitles || []).some((subtitle: { title: string }) =>
            (subtitle.title || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        return categoryMatches || documents.some(d => 
          d.subject_id === subject.id && (
            (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
            (d.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      })

      if (matchingSubject) {
        setOpenCardId(matchingSubject.id)
      } else {
        setOpenCardId(null)
      }
    } else {
      setOpenCardId(null)
    }
  }, [searchQuery, subjects, documents])

  const toggleCard = (id: string) => {
    setOpenCardId(prev => (prev === id ? null : id))
  }

  // Filter docs helper
  const filterDocs = (docs: SubjectDocument[], categoryMatches = false) => {
    if (!searchQuery) return docs
    if (categoryMatches) return docs
    return docs.filter(d => 
      (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (d.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Helper to render distinct file icons & badges based on extension
  const renderFileIcon = (fileUrl: string) => {
    const url = (fileUrl || '').toLowerCase()
    if (url.includes('.pptx') || url.includes('.ppt')) {
      return (
        <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
          <Presentation className="h-4 w-4" />
        </span>
      )
    }
    if (url.includes('.docx') || url.includes('.doc')) {
      return (
        <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
          <FileText className="h-4 w-4" />
        </span>
      )
    }
    if (url.includes('.xlsx') || url.includes('.xls') || url.includes('.csv')) {
      return (
        <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
          <FileSpreadsheet className="h-4 w-4" />
        </span>
      )
    }
    return (
      <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition group-hover:bg-red-100 group-hover:text-red-600">
        <FileText className="h-4 w-4" />
      </span>
    )
  }

  const renderCard = (id: string, title: string, docs: SubjectDocument[], categoryMatches = false, icon?: React.ReactNode) => {
    const filteredDocs = filterDocs(docs, categoryMatches)
    const isExpanded = openCardId === id
    const hasMatch = categoryMatches || filteredDocs.length > 0
    
    if (searchQuery && !hasMatch) return null

    // Group by subtitle
    const grouped = filteredDocs.reduce((acc, doc) => {
      const sub = doc.subtitle || 'General'
      if (!acc[sub]) acc[sub] = []
      acc[sub].push(doc)
      return acc
    }, {} as Record<string, SubjectDocument[]>)

    return (
      <div key={id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_35px_-24px_rgba(23,41,93,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(23,41,93,0.65)]">
        <button 
          onClick={() => toggleCard(id)}
          aria-expanded={isExpanded}
          className="flex w-full items-center justify-between gap-3 border-l-4 border-transparent bg-white px-4 py-4 text-left transition-colors hover:border-sky-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:px-6 sm:py-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#17295d]/[0.08] text-[#17295d] transition-colors group-hover:bg-sky-100 group-hover:text-sky-700">
              {icon || <Layers className="h-4 w-4 sm:h-5 sm:w-5" />}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-[#17295d] sm:text-xl">
                {highlightMatch(title, searchQuery)}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {filteredDocs.length} {filteredDocs.length === 1 ? 'resource' : 'resources'}
              </p>
            </div>
          </div>
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-sm text-slate-500">No documents found.</p>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {Object.entries(grouped).map(([subtitle, items]) => (
                  <div key={subtitle}>
                    <h4 className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                      <span className="h-px w-4 sm:w-6 bg-sky-300" />
                      {highlightMatch(subtitle, searchQuery)}
                    </h4>
                    <ul className="space-y-2 sm:space-y-2.5">
                      {items.map((doc) => (
                        <li key={doc.id}>
                          <a 
                            href={formatDocumentUrl(doc.file_url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 transition-all hover:border-sky-300 hover:shadow-md"
                          >
                            {renderFileIcon(doc.file_url)}
                            <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-sky-700 line-clamp-2 break-words">
                              {highlightMatch(doc.title, searchQuery)}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="subjects" className="border-t border-slate-200 bg-[#f4f7fb] px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 sm:mb-10 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-600 sm:text-xs">Learning resources</p>
            <h2 className="mt-2 sm:mt-3 text-2xl font-bold tracking-tight text-[#17295d] sm:text-4xl">Toufoule Topics</h2>
            <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">
              Explore organized materials by subject, level, and topic.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span className="w-fit rounded-full border border-slate-300 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {(subjects || []).length + 1} collections
            </span>
            <UploadDocumentModal subjects={subjects || []} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {renderCard('all', 'All Subjects', documents || [])}
          {(subjects || []).map(subject => renderCard(
            subject.id, 
            subject.title, 
            (documents || []).filter(d => d.subject_id === subject.id),
            Boolean(searchQuery) && ((subject.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (subject.subtitles || []).some((subtitle: { title: string }) =>
                (subtitle.title || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
            )
          ))}
        </div>
      </div>
    </section>
  )
}