'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { uploadDocument } from '@/app/(main)/dashboard/actions'
import { Upload, Plus, X, Loader2, Link as LinkIcon } from 'lucide-react'

type Subject = { id: string; title: string }
type Subtitle = { id: string; title: string }

export default function UploadDocumentModal({ subjects }: { subjects: Subject[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingSubtitles, setFetchingSubtitles] = useState(false)
  
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')
  const [driveUrl, setDriveUrl] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [subtitlesList, setSubtitlesList] = useState<Subtitle[]>([])
  const [subtitle, setSubtitle] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

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

      if (!error && data) {
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subtitle || !subjectId) {
      setMessage('Please complete every field.')
      return
    }

    if (uploadMode === 'file' && !file) {
      setMessage('Please choose a file to upload.')
      return
    }

    if (uploadMode === 'drive' && !driveUrl.trim()) {
      setMessage('Please enter a valid Google Drive or document link.')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const formData = new FormData()
      formData.set('subject_id', subjectId)
      formData.set('title', title.trim())
      formData.set('subtitle', subtitle.trim())
      formData.set('upload_mode', uploadMode)

      if (uploadMode === 'drive') {
        formData.set('file_url', driveUrl.trim())
      } else if (file) {
        formData.set('file', file)
      }

      const result = await uploadDocument(formData)
      if (result?.error) {
        setMessage(result.error)
        return
      }

      setMessage('Document added successfully.')
      setTitle('')
      setFile(null)
      setDriveUrl('')
      setTimeout(() => {
        setIsOpen(false)
        window.location.reload()
      }, 700)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setMessage(''); setIsOpen(true) }}
        disabled={subjects.length === 0}
        className="inline-flex items-center gap-2 rounded-full bg-[#17295d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Add document
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-[#17295d]">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Document
            </h3>
            <p className="mb-5 text-sm text-slate-500">Add a file or Google Drive link to the selected subject.</p>

            {message && (
              <p className={`mb-4 rounded-lg px-3 py-2 text-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </p>
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
                  required
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Subtitle Select (Auto-loaded from DB) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle Section
                </label>
                <select
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  disabled={fetchingSubtitles || subtitlesList.length === 0}
                  required
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {fetchingSubtitles ? (
                    <option>Loading subtitles...</option>
                  ) : subtitlesList.length === 0 ? (
                    <option value="">No subtitles found for this subject</option>
                  ) : (
                    subtitlesList.map((sub) => (
                      <option key={sub.id} value={sub.title}>
                        {sub.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 3. Document Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 1 - Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>

              {/* 4. Document Source Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Document Source
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition ${uploadMode === 'file' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('drive')}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition ${uploadMode === 'drive' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Google Drive Link
                  </button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                /* File Input */
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select File · Any file type
                  </label>
                  <input
                    type="file"
                    aria-describedby="upload-file-help"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                    required={uploadMode === 'file'}
                  />
                  <p id="upload-file-help" className="mt-1 text-xs text-slate-500">
                    PDFs, Word, PowerPoint, images, and other file formats are accepted.
                  </p>
                  {file && <p className="mt-2 break-all text-xs font-medium text-slate-700">Selected: {file.name}</p>}
                </div>
              ) : (
                /* Google Drive Link Input */
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Google Drive / Document Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required={uploadMode === 'drive'}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Paste the file link from Google Drive. Ensure link sharing is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || subtitlesList.length === 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#17295d] py-2.5 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Saving...' : 'Save & Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}