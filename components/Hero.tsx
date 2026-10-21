import { Search, X } from 'lucide-react'

export default function Hero({ 
  searchQuery, 
  setSearchQuery 
}: { 
  searchQuery: string, 
  setSearchQuery: (val: string) => void 
}) {
  return (
    <section
      className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-[700px] overflow-hidden bg-[#17295d] bg-cover bg-center"
      style={{ backgroundImage: "url('/saintgeorge.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#071a3b]/65 via-[#071a3b]/25 to-[#071a3b]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071a3b]/60 via-transparent to-transparent" />
      
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-44">
        <div className="max-w-xl">
          <p className="mb-7 text-[15px] font-semibold uppercase tracking-[0.28em] text-sky-200 sm:text-sm">
            MJO Batroun · Since 1942
          </p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-5xl">
            لأَنَّنَا بِهِ نَحْيَا وَنَتَحَرَّكُ وَنُوجَدُ -(أعمال ١٧: ٢٨)
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/90 sm:mt-5 sm:text-lg sm:leading-7">
           حركة الشبيبة الارثوذكسية
          </p>
        </div>

        <div className="relative mt-7 max-w-xl sm:mt-9">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-4">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-white/40 bg-white py-3.5 pl-11 pr-10 text-[16px] leading-5 text-gray-900 shadow-2xl placeholder:text-gray-400 focus:border-white focus:outline-none focus:ring-2 focus:ring-sky-300 sm:py-4 sm:pl-12 sm:pr-10 sm:text-sm"
            placeholder="Search subjects, topics, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
