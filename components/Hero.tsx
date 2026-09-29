import { Search } from 'lucide-react'

export default function Hero({ 
  searchQuery, 
  setSearchQuery 
}: { 
  searchQuery: string, 
  setSearchQuery: (val: string) => void 
}) {
  return (
    <section
      className="relative min-h-[700px] overflow-hidden bg-[#17295d] bg-cover bg-center"
      style={{ backgroundImage: "url('/saintgeorge.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#071a3b]/55 via-[#071a3b]/15 to-[#071a3b]/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071a3b]/50 via-transparent to-transparent" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-28 pt-44 sm:px-8">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-sky-200 sm:text-sm">MJO Batroun · Since 1942</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Empowering the Community
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/90 sm:text-lg">
            Discover, share, and organize the study materials you need in one place.
          </p>
        </div>
        <div className="relative mt-9 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-white/40 bg-white px-5 py-4 pl-12 leading-5 text-gray-900 placeholder-gray-500 shadow-2xl focus:border-white focus:outline-none focus:ring-2 focus:ring-sky-300 sm:text-sm"
            placeholder="Search for subjects, topics, or document titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>
    </section>
  )
}
