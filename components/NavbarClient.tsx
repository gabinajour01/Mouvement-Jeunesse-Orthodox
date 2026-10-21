'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LayoutDashboard, LogOut, LogIn, ChevronRight } from 'lucide-react'
import { signout } from '@/app/login/actions'

interface NavbarClientProps {
  isLoggedIn: boolean
  isAdmin: boolean
}

export default function NavbarClient({ isLoggedIn, isAdmin }: NavbarClientProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#subjects', label: 'Toufoule Topics' },
    { href: '/#archive-subjects', label: 'Youth Topics' },
    { href: '/#contact', label: 'Contact' },
  ]

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
        hasScrolled || mobileMenuOpen
          ? 'border-b border-white/15 bg-[#0a1533]/90 shadow-xl backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-black/50 via-black/20 to-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="flex min-h-[72px] sm:min-h-[88px] lg:min-h-[104px] items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex shrink-0 items-center gap-2.5 sm:gap-3"
          >
            <Image
              src="/mjologo.png"
              alt="MJO Batroun logo"
              width={64}
              height={64}
              sizes="(max-width: 640px) 48px, 64px"
              unoptimized
              className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 object-contain drop-shadow-md transition-transform hover:scale-105"
              priority
            />
            <span className="border-l border-white/40 pl-2.5 sm:pl-3 font-serif text-[14px] sm:text-[18px] lg:text-[20px] font-bold leading-[1.05] tracking-[0.08em]">
              MJO BATROUN
              <small className="mt-0.5 block text-[7px] sm:text-[8px] lg:text-[9px] tracking-[0.14em] text-sky-200">
                SINCE 1942
              </small>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-100 transition-colors hover:text-sky-300"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-200 backdrop-blur transition hover:bg-sky-500/20 hover:text-white"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden items-center lg:flex">
            {isLoggedIn ? (
              <form action={signout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-bold text-[#17295d] shadow transition hover:bg-sky-50"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[72px] sm:top-[88px] bottom-0 z-40 flex flex-col bg-[#0a1533]/95 backdrop-blur-xl transition-all duration-300 lg:hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-sky-300 active:bg-white/15"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center justify-between rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3.5 text-base font-semibold text-sky-200 transition hover:bg-sky-500/20 active:bg-sky-500/25"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </span>
                  <ChevronRight className="h-4 w-4 text-sky-300/50" />
                </Link>
              )}
            </div>

            <div className="mt-8 border-t border-white/15 pt-6">
              {isLoggedIn ? (
                <form action={signout}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/15 py-3.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25 active:scale-[0.99]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-[#17295d] shadow transition hover:bg-sky-50 active:scale-[0.99]"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>

            <div className="mt-8 text-center text-xs text-white/40">
              <p>MJO Batroun · Since 1942</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
