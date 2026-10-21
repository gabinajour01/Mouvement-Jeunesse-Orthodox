'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react'

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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [statusText, setStatusText] = useState('')
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [subtitle, setSubtitle] = useState('')
  const [customSubtitle, setCustomSubtitle] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Find the currently selected subject
  const selectedSubject = subjects.find((s) => s.id === subjectId)
  const availableSubtitles = selectedSubject?.subtitles || []

  // Whenever subjectId changes, reset the selected subtitle
  useEffect(() => {
    if (availableSubtitles.length > 0) {
      setSubtitle(availableSubtitles[0].title)
    } else {
      setSubtitle('')
    }
  }, [subjectId])

  const effectiveSubtitle = subtitle || customSubtitle.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsSuccess(false)

    if (!title.trim() || !effectiveSubtitle || !subjectId) {
      setMessage('يرجى ملء جميع الحقول المطلوبة.')
      return
    }

    if (uploadMode === 'file' && !file) {
      setMessage('يرجى اختيار الملف للرفع.')
      return
    }

    if (uploadMode === 'drive' && !driveUrl.trim()) {
      setMessage('يرجى إدخال رابط جوجل درايف.')
      return
    }

    try {
      setLoading(true)
      setUploadProgress(0)
      setStatusText(uploadMode === 'file' ? 'جاري رفع الملف...' : 'جاري حفظ المستند...')

      const formData = new FormData()
      formData.set('subject_id', subjectId)
      formData.set('subtitle', effectiveSubtitle)
      formData.set('title', title.trim())
      formData.set('upload_mode', uploadMode)
      formData.set('target', 'archive')

      if (uploadMode === 'file' && file) {
        formData.set('file', file)
      } else if (uploadMode === 'drive') {
        formData.set('file_url', driveUrl.trim())
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload', true)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && uploadMode === 'file') {
            const percent = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percent)
            if (percent >= 100) {
              setStatusText('جاري المعالجة والحفظ في جوجل درايف...')
            } else {
              setStatusText(`جاري رفع الملف: ${percent}%`)
            }
          }
        }

        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText)
            if (xhr.status >= 200 && xhr.status < 300 && res.success) {
              resolve()
            } else {
              reject(new Error(res.error || `خطأ في الخادم (${xhr.status})`))
            }
          } catch {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`خطأ في الخادم (${xhr.status}). يرجى المحاولة لاحقاً.`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error('خطأ في الاتصال بالشبكة أثناء الرفع.'))
        }

        xhr.ontimeout = () => {
          reject(new Error('انتهت مهلة الرفع. يرجى تجربة خيار رابط جوجل درايف للملفات الكبيرة.'))
        }

        xhr.timeout = 120000
        xhr.send(formData)
      })

      setIsSuccess(true)
      setMessage(uploadMode === 'file' ? 'تم رفع المستند إلى جوجل درايف وحفظه بنجاح!' : 'تم حفظ رابط المستند بنجاح!')
      setTitle('')
      setFile(null)
      setDriveUrl('')
      setCustomSubtitle('')
      setUploadProgress(null)
      setStatusText('')

      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1000)
    } catch (error) {
      setIsSuccess(false)
      setUploadProgress(null)
      setStatusText('')
      setMessage(error instanceof Error ? error.message : 'حدث خطأ أثناء الرفع.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <button
          onClick={() => !loading && onClose()}
          type="button"
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-30"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-[#17295d]">
          <Upload className="h-5 w-5 text-sky-600" />
          إضافة مستند إلى الأرشيف
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          رفع ملف مباشرة إلى مجلد جوجل درايف أو إدخال رابط مشاركة.
        </p>

        {/* Mode Toggle Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            disabled={loading}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              uploadMode === 'file' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-sky-600" />
            رفع ملف
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('drive')}
            disabled={loading}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              uploadMode === 'drive' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
            رابط جوجل درايف
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-2.5 text-xs ${
              isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
            <p className="flex-1">{message}</p>
          </div>
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
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title}
                </option>
              ))}
            </select>
          </div>

          {/* Select or Type Subtitle */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              العنوان الفرعي (Subtitle)
            </label>
            {availableSubtitles.length > 0 ? (
              <select
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
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
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
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
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
            />
          </div>

          {/* File or Drive Link */}
          {uploadMode === 'file' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                الملف (PDF، Word، PowerPoint، إلخ)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-semibold file:text-sky-700 hover:file:bg-sky-100 cursor-pointer disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                سيتم رفع الملف وحفظه مباشرة في مجلد جوجل درايف.
              </p>
              {file && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs text-sky-800">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="shrink-0 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                رابط جوجل درايف
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                disabled={loading}
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                تأكد أن إذن المشاركة هو <strong>&ldquo;أي شخص لديه الرابط&rdquo;</strong>.
              </p>
            </div>
          )}

          {/* Real-time Progress Bar */}
          {loading && uploadProgress !== null && (
            <div className="mt-2 space-y-1.5 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-900">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                  {statusText}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sky-200">
                <div
                  className="h-full bg-sky-600 transition-all duration-200 ease-out"
                  style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!subtitle && !customSubtitle.trim())}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17295d] py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? statusText || 'جاري المعالجة...'
              : uploadMode === 'file'
              ? 'رفع إلى جوجل درايف'
              : 'حفظ ونشر'}
          </button>
        </form>
      </div>
    </div>
  )
}