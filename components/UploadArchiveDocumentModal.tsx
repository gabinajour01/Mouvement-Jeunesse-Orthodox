'use client'

import { useState, useEffect } from 'react'
import { uploadArchiveDocument } from '@/app/(main)/archive-subjects/actions'
import { X, Loader2, Upload, Link as LinkIcon } from 'lucide-react'

interface Subtitle {
  id: string
  title: string
}

interface Subject {
  id: string
  title: string
  subtitles?: Subtitle[]
}

export default function UploadArchiveDocumentModal({
  subjects = [],
  onClose,
}: {
  subjects: Subject[]
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')
  const [driveUrl, setDriveUrl] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [subtitle, setSubtitle] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  // Find the currently selected subject
  const selectedSubject = subjects.find((s) => s.id === subjectId)
  const availableSubtitles = selectedSubject?.subtitles || []

  // Whenever subjectId changes, reset the selected subtitle to avoid mismatched values
  useEffect(() => {
    if (availableSubtitles.length > 0) {
      setSubtitle(availableSubtitles[0].title)
    } else {
      setSubtitle('')
    }
  }, [subjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !subtitle || !subjectId) {
      setMessage('يرجى ملء جميع الحقول.')
      return
    }

    if (uploadMode === 'file' && !file) {
      setMessage('يرجى اختيار الملف للرفع.')
      return
    }

    if (uploadMode === 'drive' && !driveUrl.trim()) {
      setMessage('يرجى إدخال رابط Google Drive صحيح.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const formData = new FormData()
      formData.set('subject_id', subjectId)
      formData.set('subtitle', subtitle.trim())
      formData.set('title', title.trim())
      formData.set('upload_mode', uploadMode)

      if (uploadMode === 'drive') {
        formData.set('file_url', driveUrl.trim())
      } else if (file) {
        formData.set('file', file)
      }

      const res = await uploadArchiveDocument(formData)
      if (res?.error) {
        setMessage(res.error)
        return
      }

      setMessage('تم حفظ المستند في الأرشيف بنجاح!')
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
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#17295d]">
          <Upload className="h-5 w-5 text-sky-600" />
          إضافة مستند إلى الأرشيف
        </h3>

        {message && (
          <p
            className={`mb-4 rounded-lg p-2.5 text-xs ${
              message.includes('بنجاح')
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Subject */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              الموضوع (Subject)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title}
                </option>
              ))}
            </select>
          </div>

          {/* Select or Type Subtitle for THIS Subject */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              العنوان الفرعي (Subtitle)
            </label>
            {availableSubtitles.length > 0 ? (
              <select
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              >
                {availableSubtitles.map((st) => (
                  <option key={st.id} value={st.title}>
                    {st.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="اكتب العنوان الفرعي الخاص بهذا الموضوع..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              عنوان المستند (Document Title)
            </label>
            <input
              type="text"
              placeholder="اسم الملف أو الموضوع"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {/* Mode Toggle: File vs Google Drive */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              طريقة الإضافة (Source)
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition ${uploadMode === 'file' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                رفع ملف
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('drive')}
                className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition ${uploadMode === 'drive' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                رابط Google Drive
              </button>
            </div>
          </div>

          {uploadMode === 'file' ? (
            /* PDF File Upload */
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                الملف (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required={uploadMode === 'file'}
                className="w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>
          ) : (
            /* Google Drive Link */
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                رابط Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                required={uploadMode === 'drive'}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                تأكد من تفعيل خاصية المشاركة (Anyone with the link can view) في Drive.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17295d] py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'جاري الحفظ...' : 'حفظ ونشر'}
          </button>
        </form>
      </div>
    </div>
  )
}