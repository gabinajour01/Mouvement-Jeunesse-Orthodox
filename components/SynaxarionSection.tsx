'use client'

import { useState } from 'react'
import { Calendar, Download, Upload, Eye, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import UploadSynaxarionModal from './UploadSynaxarionModal'

interface SynaxarionReading {
  id: string
  month: number
  day: number
  month_name?: string | null
  title: string
  summary: string | null
  file_url: string
}

export default function SynaxarionSection({
  todayReading,
  readings,
  searchQuery,
  isAdmin,
}: {
  todayReading: SynaxarionReading | null
  readings: SynaxarionReading[]
  searchQuery: string
  isAdmin: boolean
}) {
  const [showUpload, setShowUpload] = useState(false)
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const matchingReadings = searchQuery
    ? readings.filter((reading) =>
        [reading.title, reading.summary, reading.month_name, String(reading.day)]
          .some((value) => value?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      )
    : []

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#17295d] via-[#1e3a8a] to-[#0f172a] p-6 text-white shadow-xl sm:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Calendar className="h-3.5 w-3.5 text-sky-300" />
              <span>السنكسار اليومي • Daily Synaxarion</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {todayReading ? todayReading.title : 'قراءة اليوم غير متوفرة بعد'}
            </h2>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              {todayReading?.summary ||
                'تابع سِيَر القديسين والأعياد بحسب روزنامة اليوم مع إمكانية قراءة أو تحميل الملف كاملاً.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {todayReading ? (
              <>
                <a
                  href={todayReading.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#17295d] shadow transition hover:bg-slate-100"
                >
                  <Eye className="h-4 w-4" />
                  قراءة الملف (PDF)
                </a>
                <a
                  href={todayReading.file_url}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  <Download className="h-4 w-4" />
                </a>
              </>
            ) : null}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-sm font-semibold text-sky-200 backdrop-blur transition hover:bg-sky-500/30"
              >
                <Upload className="h-4 w-4" />
                رفع سنكسار اليوم
              </button>
            )}

            <Link
              href="/synaxarion"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-semibold text-slate-300 transition hover:text-white"
            >
              عرض الأرشيف كاملاً
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {searchQuery && matchingReadings.length > 0 && (
        <div id="synaxarion-search-results" className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-lg font-bold text-[#17295d]">Synaxarion readings</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {matchingReadings.map((reading) => (
              <li key={reading.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sky-700">
                    {reading.month_name || `Month ${reading.month}`} · Day {reading.day}
                  </p>
                  <h4 className="mt-1 font-bold text-[#17295d]">{reading.title}</h4>
                  {reading.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{reading.summary}</p>}
                </div>
                <a href={reading.file_url} target="_blank" rel="noopener noreferrer" aria-label={`Read ${reading.title}`} className="shrink-0 rounded-lg bg-[#17295d] p-2.5 text-white hover:bg-sky-700">
                  <Eye className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Modal (if Admin) */}
      {showUpload && (
        <UploadSynaxarionModal
          defaultMonth={currentMonth}
          defaultDay={currentDay}
          onClose={() => setShowUpload(false)}
        />
      )}
    </section>
  )
}