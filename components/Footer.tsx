import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#101f48] text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/mjologo.png"
                alt="MJO Batroun logo"
                width={60}
                height={60}
                sizes="56px"
                unoptimized
                className="h-14 w-14 shrink-0 object-contain"
              />
              <span className="font-serif text-xl font-bold tracking-[0.08em]">MJO BATROUN</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/65">
              A trusted place to discover, share, and organize learning resources for the whole community.
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Since 1942</p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Explore</h2>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-white/65">
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              <Link href="/#subjects" className="transition-colors hover:text-white">Our Subjects</Link>
              <Link href="/#subjects" className="transition-colors hover:text-white">Learning Resources</Link>
              <Link href="/login" className="transition-colors hover:text-white">Login</Link>
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Connect</h2>
            <div className="mt-5 space-y-4 text-sm text-white/65">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold text-sky-300">IG</span> Instagram <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold text-sky-300">FB</span> Facebook <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=MJO+Batroun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <MapPin className="h-4 w-4 shrink-0 text-sky-300" /> Location <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a href="tel:+96100000000" className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-sky-300" /> +961 00 000 000
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} MJO Batroun. All rights reserved.</p>
          <p>Learning together, growing together.</p>
        </div>
      </div>
    </footer>
  )
}
