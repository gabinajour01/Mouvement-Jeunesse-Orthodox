const programs = [
  {
    title: 'Academic Section',
    description: 'A strong foundation for curious minds and lifelong learning.',
    image: '/programpanelphotos/churchgeorge.jpeg',
    imagePosition: 'center',
  },
  {
    title: 'MJO Heritage',
    description: 'Discover the places, stories, and traditions that shape our community.',
    image: '/programpanelphotos/inside.jpg',
    imagePosition: 'center',
  },
  {
    title: 'Saint George',
    description: 'A living tradition of faith, culture, and shared identity.',
    image: '/programpanelphotos/saintgeorgess12.jpg',
    imagePosition: 'top',
  },
  {
    title: 'Our Community',
    description: 'People and experiences connected through learning and belonging.',
    image: '/programpanelphotos/a1a2a3.jpg',
    imagePosition: 'center',
  },
]

export default function ProgramsPanel() {
  return (
    <section className="relative z-20 mx-auto -mt-24 max-w-[1272px] rounded-[22px] bg-white p-5 shadow-2xl sm:p-7">
      <div className="mb-6 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-600">What we do</p>
          <h2 className="mt-2 text-2xl font-bold text-[#17295d] sm:text-3xl">Explore our community</h2>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">Learning, growth, and opportunity</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {programs.map((program) => (
          <article key={program.title} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
            <div
              className="h-44 bg-cover"
              style={{
                backgroundImage: `url('${program.image}')`,
                backgroundPosition: program.imagePosition || 'center',
              }}
            />
            <div className="p-4">
              <h3 className="text-lg font-bold text-[#17295d]">{program.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{program.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-semibold text-[#17295d]">Rooted in Batroun. Built for every generation.</p>
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          <span>Since 1942</span>
          <span className="h-1 w-1 rounded-full bg-sky-400" />
          <span>One community</span>
        </div>
      </div>
    </section>
  )
}