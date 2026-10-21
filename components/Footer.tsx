import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#101f48] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16 md:pb-12">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/mjologo.png"
                alt="MJO Batroun logo"
                width={56}
                height={56}
                sizes="56px"
                unoptimized
                className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 object-contain"
              />
              <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.08em]">MJO BATROUN</span>
            </Link>
            <p className="mt-4 sm:mt-6 max-w-sm text-xs sm:text-sm leading-6 sm:leading-7 text-white/70">
              A trusted place to discover, share, and organize learning resources for the whole community.
            </p>
            <p className="mt-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Since 1942
            </p>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/90">Explore</h2>
            <nav className="mt-4 sm:mt-5 flex flex-col items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-white/70">
              <Link href="/" className="py-1 transition-colors hover:text-white">Home</Link>
              <Link href="/#subjects" className="py-1 transition-colors hover:text-white">Toufoule Topics</Link>
              <Link href="/#archive-subjects" className="py-1 transition-colors hover:text-white">Youth Topics</Link>
              <Link href="/login" className="py-1 transition-colors hover:text-white">Login</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/90">Connect</h2>
            <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 text-xs sm:text-sm text-white/70">
              <a
                href="https://www.instagram.com/mjobatroun?vrfl=NjdpYjNlNTlpeXE1&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1 transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold text-sky-300">IG</span> Instagram <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.facebook.com/share/1C1nT5wWZ4/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1 transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold text-sky-300">FB</span> Facebook <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://maps.app.goo.gl/Gww4nwXuihpWmv1G7?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-1 transition-colors hover:text-white"
              >
                <MapPin className="h-4 w-4 shrink-0 text-sky-300" /> Location <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="tel:+96103723026" className="flex items-center gap-3 py-1 transition-colors hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-sky-300" /> +961 03 723 026
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-[11px] sm:text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} MJO Batroun. All rights reserved.</p>
          <p>Learning together, growing together.</p>
        </div>
      </div>
    </footer>
  )
}
