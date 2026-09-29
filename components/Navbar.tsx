import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = data?.role === 'admin'
  }

  return (
    <NavbarClient>
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:pl-8 lg:pr-14">
        <div className="flex min-h-[104px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/mjologo.png"
              alt="MJO Batroun logo"
              width={72}
              height={72}
              sizes="72px"
              unoptimized
              className="h-[72px] w-[72px] shrink-0 object-contain drop-shadow-lg"
              priority
            />
            <span className="border-l border-white/50 pl-3 font-serif text-[16px] font-bold leading-[1.05] tracking-[0.08em] sm:text-[20px]">
              MJO BATROUN
              <small className="mt-1 block text-[8px] tracking-[0.13em] sm:text-[9px]">SINCE 1942</small>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-7 lg:flex">
              <Link href="/" className="font-semibold text-sky-300 transition-colors hover:text-white">Home</Link>
              <Link href="/#subjects" className="font-semibold transition-colors hover:text-sky-300">Our Subjects</Link>
              <Link href="/#contact" className="font-semibold transition-colors hover:text-sky-300">Contact</Link>
              {isAdmin && <Link href="/dashboard" className="font-semibold text-sky-200 transition-colors hover:text-white">Dashboard</Link>}
          </div>

          <div className="flex items-center lg:hidden">
            {user ? (
              <form action={signout}>
                <button type="submit" className="text-sm font-semibold hover:text-sky-200">Sign Out</button>
              </form>
            ) : (
              <Link href="/login" className="text-sm font-semibold hover:text-sky-200">Login</Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 py-3 text-xs font-semibold lg:hidden">
          <Link href="/" className="text-sky-300 transition-colors hover:text-white">Home</Link>
          <Link href="/#subjects" className="transition-colors hover:text-sky-300">Our Subjects</Link>
          <Link href="/#contact" className="transition-colors hover:text-sky-300">Contact</Link>
          {isAdmin && <Link href="/dashboard" className="text-sky-200 transition-colors hover:text-white">Dashboard</Link>}
        </div>
      </div>
    </NavbarClient>
  )
}
