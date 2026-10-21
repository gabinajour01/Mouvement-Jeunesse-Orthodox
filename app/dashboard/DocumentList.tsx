'use client'

import { deleteDocument } from './actions'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DocumentList({ documents }: { documents: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return
    setDeletingId(id)
    await deleteDocument(id)
    setDeletingId(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {documents?.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 sm:px-6 sm:py-4 font-medium text-gray-900 max-w-[200px] truncate sm:max-w-none">{doc.title}</td>
                <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-gray-500 whitespace-nowrap">{doc.subjects?.title || '—'}</td>
                <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {(!documents || documents.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
