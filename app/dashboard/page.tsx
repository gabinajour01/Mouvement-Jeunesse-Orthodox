import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { signout } from '@/app/login/actions'
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dedicated Admin Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/mjologo.png"
                alt="MJO Batroun logo"
                width={36}
                height={36}
                unoptimized
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 object-contain"
              />
              <span className="font-serif font-bold text-slate-900 tracking-wide text-xs sm:text-base">
                MJO BATROUN
              </span>
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-sky-800">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Website</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <form action={signout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:text-red-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold leading-7 text-gray-900">
            Resource Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Upload new documents to Google Drive or manage existing subjects and resources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <UploadForm subjects={subjects || []} />
          </div>
          <div className="lg:col-span-2">
            <DocumentList documents={documents || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
