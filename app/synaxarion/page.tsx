import Link from 'next/link'
import { ArrowLeft, Calendar, Download, Eye } from 'lucide-react'
import { createArchiveClient } from '@/utils/supabase/archiveServer'

interface SynaxarionReading {
  id: string
  month: number
  day: number
  month_name: string | null
  title: string
  summary: string | null
  file_url: string
}

export default async function SynaxarionArchivePage() {
  const archiveSupabase = await createArchiveClient()
  const { data } = await archiveSupabase
    .from('synaxarion_readings')
    .select('id, month, day, month_name, title, summary, file_url')
    .order('month', { ascending: true })
    .order('day', { ascending: true })

  const readings = (data || []) as SynaxarionReading[]

  return (
    <main className="min-h-screen border-t border-slate-200 bg-[#f4f7fb] px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-600">Daily Synaxarion</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17295d] sm:text-4xl">أرشيف السنكسار</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">تصفح قراءات السنكسار اليومية بحسب الشهر واليوم.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#17295d] hover:text-sky-700">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى الرئيسية
          </Link>
        </div>

        {readings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">لا توجد قراءات منشورة بعد.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {readings.map((reading) => (
              <article key={reading.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                  <Calendar className="h-4 w-4" />
                  {reading.month_name || `Month ${reading.month}`} - {reading.day}
                </p>
                <h2 className="mt-3 text-xl font-bold text-[#17295d]">{reading.title}</h2>
                {reading.summary && <p className="mt-3 text-sm leading-6 text-slate-600">{reading.summary}</p>}
                <div className="mt-5 flex items-center gap-3">
                  <a href={reading.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#17295d] px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                    <Eye className="h-4 w-4" /> قراءة الملف
                  </a>
                  <a href={reading.file_url} download className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700">
                    <Download className="h-4 w-4" /> تحميل
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}