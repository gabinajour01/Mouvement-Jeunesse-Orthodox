'use client'

import { useState } from 'react'
import { Loader2, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react'

export default function UploadForm({ subjects }: { subjects: any[] }) {
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')
  const [progress, setProgress] = useState<number | null>(null)
  const [statusText, setStatusText] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsSuccess(false)
    setProgress(0)
    setStatusText(uploadMode === 'file' ? 'Uploading file...' : 'Saving document...')

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('upload_mode', uploadMode)
    formData.set('target', 'dashboard')

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload', true)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && uploadMode === 'file') {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
            if (percent >= 100) {
              setStatusText('Processing on Google Drive...')
            } else {
              setStatusText(`Uploading file: ${percent}%`)
            }
          }
        }

        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText)
            if (xhr.status >= 200 && xhr.status < 300 && res.success) {
              resolve()
            } else {
              reject(new Error(res.error || `Server responded with ${xhr.status}`))
            }
          } catch {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Server error (${xhr.status}).`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error('Network error during upload. Please check connection.'))
        }

        xhr.ontimeout = () => {
          reject(new Error('Upload timed out. Use Google Drive link option for large files.'))
        }

        xhr.timeout = 120000
        xhr.send(formData)
      })

      setIsSuccess(true)
      setMessage(uploadMode === 'file' ? 'Document uploaded to Google Drive successfully!' : 'Document link saved successfully!')
      form.reset()
      setProgress(null)
      setStatusText('')
    } catch (err: unknown) {
      setIsSuccess(false)
      setProgress(null)
      setStatusText('')
      setMessage(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#17295d]">Upload Document</h3>
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
              uploadMode === 'file' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600'
            }`}
          >
            <Upload className="w-3 h-3 text-sky-600" />
            File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('drive')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
              uploadMode === 'drive' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600'
            }`}
          >
            <LinkIcon className="w-3 h-3 text-emerald-600" />
            Drive Link
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {isSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
          <span>{message}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
        <select
          name="subject_id"
          required
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        >
          <option value="">Select a subject...</option>
          {subjects?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          required
          disabled={loading}
          placeholder="Document Title"
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle / Section</label>
        <input
          type="text"
          name="subtitle"
          required
          disabled={loading}
          placeholder="Subtitle / Topic"
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {uploadMode === 'file' ? (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">File (PDF, DOCX, PPTX, etc.)</label>
          <input
            type="file"
            name="file"
            required
            disabled={loading}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100 cursor-pointer disabled:opacity-50"
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Google Drive Link</label>
          <input
            type="url"
            name="file_url"
            required
            disabled={loading}
            placeholder="https://drive.google.com/file/d/.../view"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
      )}

      {loading && progress !== null && (
        <div className="space-y-1.5 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-sky-900">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              {statusText}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sky-200">
            <div
              className="h-full bg-sky-600 transition-all duration-200 ease-out"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17295d] py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 text-sm shadow-sm"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading
          ? statusText || 'Processing...'
          : uploadMode === 'file'
          ? 'Upload to Google Drive'
          : 'Save Document'}
      </button>
    </form>
  )
}
