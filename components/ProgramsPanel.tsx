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
    <section className="relative z-20 mx-3 -mt-10 max-w-[1272px] rounded-[20px] bg-white p-4 shadow-2xl sm:mx-6 sm:-mt-20 sm:p-7 xl:mx-auto">
      <div className="mb-5 flex items-end justify-between gap-4 px-1 sm:mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-600 sm:text-xs">
            What we do
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-[#17295d] sm:mt-2 sm:text-3xl">
            Explore our community
          </h2>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">
          Learning, growth, and opportunity
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {programs.map((program) => (
          <article
            key={program.title}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="h-36 sm:h-44 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `url('${program.image}')`,
                backgroundPosition: program.imagePosition || 'center',
              }}
            />
            <div className="p-3.5 sm:p-4">
              <h3 className="text-base font-bold text-[#17295d] sm:text-lg">
                {program.title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                {program.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-center sm:mt-7 sm:flex-row sm:text-left">
        <p className="text-xs sm:text-sm font-semibold text-[#17295d]">
          Rooted in Batroun. Built for every generation.
        </p>
        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          <span>Since 1942</span>
          <span className="h-1 w-1 rounded-full bg-sky-400" />
          <span>One community</span>
        </div>
      </div>
    </section>
  )
}
