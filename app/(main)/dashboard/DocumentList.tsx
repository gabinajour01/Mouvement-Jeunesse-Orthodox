'use client'

import { deleteDocument } from './actions'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DocumentList({ documents }: { documents: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('Are you sure you want to delete this document?')) return
    setDeletingId(id)
    await deleteDocument(id, filePath)
    setDeletingId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents?.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.subjects?.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleDelete(doc.id, doc.file_path)}
                  disabled={deletingId === doc.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
          {(!documents || documents.length === 0) && (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No documents found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
