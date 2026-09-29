'use client'

import { useEffect, useState } from 'react'

export default function NavbarClient({ children }: { children: React.ReactNode }) {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
        hasScrolled
          ? 'border-b border-white/15 bg-black/25 shadow-lg backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      {children}
    </nav>
  )
}