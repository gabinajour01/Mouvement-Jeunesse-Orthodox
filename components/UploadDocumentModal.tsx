'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Upload, Plus, X, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react'

type Subject = { id: string; title: string }
type Subtitle = { id: string; title: string }

export default function UploadDocumentModal({ subjects }: { subjects: Subject[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [statusText, setStatusText] = useState('')
  const [fetchingSubtitles, setFetchingSubtitles] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [subtitlesList, setSubtitlesList] = useState<Subtitle[]>([])
  const [subtitle, setSubtitle] = useState('')
  const [customSubtitle, setCustomSubtitle] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  // Whenever the selected subjectId changes, fetch its subtitles from the database
  useEffect(() => {
    async function loadSubtitles() {
      if (!subjectId) return
      setFetchingSubtitles(true)

      const { data, error } = await supabase
        .from('subtitles')
        .select('*')
        .eq('subject_id', subjectId)
        .order('display_order', { ascending: true })

      if (!error && data && data.length > 0) {
        setSubtitlesList(data)
        setSubtitle(data[0]?.title || '')
      } else {
        setSubtitlesList([])
        setSubtitle('')
      }
      setFetchingSubtitles(false)
    }

    loadSubtitles()
  }, [subjectId, supabase])

  const effectiveSubtitle = subtitle || customSubtitle.trim()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsSuccess(false)

    if (!title.trim() || !effectiveSubtitle || !subjectId) {
      setMessage('Please complete every field.')
      return
    }

    if (uploadMode === 'file' && !file) {
      setMessage('Please choose a file to upload.')
      return
    }

    if (uploadMode === 'drive' && !driveUrl.trim()) {
      setMessage('Please enter a Google Drive link.')
      return
    }

    try {
      setLoading(true)
      setUploadProgress(0)
      setStatusText(uploadMode === 'file' ? 'Uploading file to server...' : 'Saving document...')

      const formData = new FormData()
      formData.set('subject_id', subjectId)
      formData.set('title', title.trim())
      formData.set('subtitle', effectiveSubtitle)
      formData.set('upload_mode', uploadMode)
      formData.set('target', 'dashboard')

      if (uploadMode === 'file' && file) {
        formData.set('file', file)
      } else if (uploadMode === 'drive') {
        formData.set('file_url', driveUrl.trim())
      }

      // Perform upload via API route with real-time XMLHttpRequest progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload', true)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && uploadMode === 'file') {
            const percent = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percent)
            if (percent >= 100) {
              setStatusText('Processing & saving to Google Drive...')
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
              reject(new Error(res.error || `Server responded with status ${xhr.status}`))
            }
          } catch {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Server error (${xhr.status}). Please try again.`))
            }
          }
        }

        xhr.onerror = () => {
          reject(new Error('Network error during upload. Please check your connection.'))
        }

        xhr.ontimeout = () => {
          reject(new Error('Upload timed out. Please try again or use the Google Drive Link option.'))
        }

        // 120s client timeout
        xhr.timeout = 120000
        xhr.send(formData)
      })

      setIsSuccess(true)
      setMessage(uploadMode === 'file' ? 'Document uploaded to Google Drive successfully!' : 'Document link saved successfully!')
      setTitle('')
      setFile(null)
      setDriveUrl('')
      setCustomSubtitle('')
      setUploadProgress(null)
      setStatusText('')

      setTimeout(() => {
        setIsOpen(false)
        window.location.reload()
      }, 1000)
    } catch (error) {
      setIsSuccess(false)
      setUploadProgress(null)
      setStatusText('')
      setMessage(error instanceof Error ? error.message : 'Failed to upload document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage('')
          setIsSuccess(false)
          setUploadProgress(null)
          setStatusText('')
          setIsOpen(true)
        }}
        disabled={subjects.length === 0}
        className="inline-flex items-center gap-2 rounded-full bg-[#17295d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Add document
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => !loading && setIsOpen(false)}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-[#17295d]">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Document
            </h3>
            <p className="mb-4 text-sm text-slate-500">
              Add a document directly to the MJO Google Drive folder or via Drive link.
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
                Upload File
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
                Google Drive Link
              </button>
            </div>

            {message && (
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                  isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                <p className="flex-1">{message}</p>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              {/* 1. Subject Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject Category
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Subtitle Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle Section
                </label>
                {fetchingSubtitles ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    Loading subtitles...
                  </div>
                ) : subtitlesList.length > 0 ? (
                  <select
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                  >
                    {subtitlesList.map((sub) => (
                      <option key={sub.id} value={sub.title}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter subtitle (e.g. General, الآباء)..."
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                  />
                )}
              </div>

              {/* 3. Document Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. القدّيس يوحنّا"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                  required
                />
              </div>

              {/* 4. File or Drive Link */}
              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Choose Document (PDF, Word, PowerPoint, etc.)
                  </label>
                  <input
                    type="file"
                    aria-describedby="upload-file-help"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading}
                    className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100 cursor-pointer disabled:opacity-50"
                    required
                  />
                  <p id="upload-file-help" className="mt-1 text-xs text-slate-500">
                    File will be uploaded and stored directly in MJO Google Drive.
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Google Drive Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Paste the file link from Google Drive. Ensure general access is set to <strong>&ldquo;Anyone with the link&rdquo;</strong>.
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17295d] py-2.5 font-semibold text-white shadow-md transition hover:bg-sky-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? statusText || 'Processing...'
                  : uploadMode === 'file'
                  ? 'Upload to Google Drive'
                  : 'Save & Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}