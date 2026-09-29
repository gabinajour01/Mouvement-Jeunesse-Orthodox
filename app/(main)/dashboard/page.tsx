import { createClient } from '@/utils/supabase/server'
import UploadForm from './UploadForm'
import DocumentList from './DocumentList'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch subjects for the dropdown
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('display_order', { ascending: true })

  // Fetch documents for the list
  const { data: documents } = await supabase
    .from('subject_documents')
    .select('*, subjects(title)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Admin Dashboard
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UploadForm subjects={subjects || []} />
        </div>
        <div className="lg:col-span-2">
          <DocumentList documents={documents || []} />
        </div>
      </div>
    </div>
  )
}
