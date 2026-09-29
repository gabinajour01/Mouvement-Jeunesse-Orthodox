'use client'

import { useState } from 'react'
import { uploadDailySynaxarion } from '@/app/synaxarion/actions'
import { X, Loader2, Upload } from 'lucide-react'

const MONTHS = [
  { num: 1, name: 'كانون الثاني (January)' },
  { num: 2, name: 'شباط (February)' },
  { num: 3, name: 'آذار (March)' },
  { num: 4, name: 'نيسان (April)' },
  { num: 5, name: 'أيار (May)' },
  { num: 6, name: 'حزيران (June)' },
  { num: 7, name: 'تموز (July)' },
  { num: 8, name: 'آب (August)' },
  { num: 9, name: 'أيلول (September)' },
  { num: 10, name: 'تشرين الأول (October)' },
  { num: 11, name: 'تشرين الثاني (November)' },
  { num: 12, name: 'كانون الأول (December)' },
]

export default function UploadSynaxarionModal({
  defaultMonth,
  defaultDay,
  onClose,
}: {
  defaultMonth?: number
  defaultDay?: number
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(defaultMonth || new Date().getMonth() + 1)
  const [day, setDay] = useState(defaultDay || new Date().getDate())
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      setMessage('يرجى اختيار ملف وكتابة اسم التذكار/القديس.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const formData = new FormData()
      formData.set('month', String(month))
      formData.set('day', String(day))
      formData.set('title', title.trim())
      formData.set('summary', summary.trim())
      formData.set('file', file)

      const res = await uploadDailySynaxarion(formData)
      if (res?.error) {
        setMessage(res.error)
        return
      }

      setMessage('تم حفظ السنكسار بنجاح!')
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 700)
    } catch {
      setMessage('حدث خطأ أثناء الرفع.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#17295d]">
          <Upload className="h-5 w-5 text-sky-600" />
          إضافة سنكسار يومي
        </h3>

        {message && (
          <p className={`mb-4 rounded-lg p-2.5 text-xs ${message.includes('بنجاح') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">الشهر (Month)</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              >
                {MONTHS.map((m) => (
                  <option key={m.num} value={m.num}>{m.num} - {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">اليوم (Day)</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>اليوم {d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">عنوان القديس / العيد</label>
            <input
              type="text"
              placeholder="مثال: تذكار القديس جاورجيوس"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">نبذة مختصرة (اختياري)</label>
            <textarea
              rows={2}
              placeholder="سطر أو سطرين تمهيد..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">ملف السنكسار (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17295d] py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'جاري الرفع...' : 'حفظ ونشر'}
          </button>
        </form>
      </div>
    </div>
  )
}