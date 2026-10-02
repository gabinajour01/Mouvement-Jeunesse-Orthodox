'use client'

import { useState } from 'react'
import { uploadDocument } from './actions'

export default function UploadForm({ subjects }: { subjects: any[] }) {
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    formData.set('upload_mode', uploadMode)
    const result = await uploadDocument(formData)

    if (result?.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage('Document saved successfully!')
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-[#17295d]">Upload Document</h3>
      
      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <select name="subject_id" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
          <option value="">Select a subject...</option>
          {subjects?.map((s) => (
             <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" name="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subtitle / Topic</label>
        <input type="text" name="subtitle" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-md border border-slate-200">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`py-1.5 text-xs font-semibold rounded transition ${uploadMode === 'file' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600'}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('drive')}
            className={`py-1.5 text-xs font-semibold rounded transition ${uploadMode === 'drive' ? 'bg-white text-[#17295d] shadow-sm' : 'text-slate-600'}`}
          >
            Google Drive Link
          </button>
        </div>
      </div>

      {uploadMode === 'file' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">File</label>
          <input type="file" name="file" required={uploadMode === 'file'} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Google Drive Link</label>
          <input type="url" name="file_url" required={uploadMode === 'drive'} placeholder="https://drive.google.com/file/d/.../view" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm" />
          <p className="mt-1 text-xs text-slate-500">Ensure link sharing is set to &ldquo;Anyone with the link can view&rdquo;.</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 font-medium text-sm">
        {loading ? 'Saving...' : 'Save Document'}
      </button>
    </form>
  )
}
