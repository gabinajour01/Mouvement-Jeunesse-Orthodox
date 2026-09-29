import { login } from './actions'
import { LockKeyhole, UserRound } from 'lucide-react'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d9ddd] px-6 py-12 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden"
      >
        <div className="absolute -top-20 left-[-8%] h-44 w-[86%] rotate-[14deg] bg-white/25" />
        <div className="absolute -top-24 right-[-5%] h-52 w-[62%] -rotate-[37deg] bg-white/20" />
        <div className="absolute -top-16 left-[27%] h-44 w-[75%] rotate-[18deg] bg-white/15" />
      </div>

      <div className="relative z-10 w-full max-w-[334px] -translate-y-2">
        <div className="mb-8">
          <h1 className="text-[18px] font-semibold tracking-[0.01em]">USER LOGIN</h1>
          <div className="mt-2 h-px w-[50px] bg-white/90" />

          {params.error && (
            <div className="mt-5 rounded border border-red-200/60 bg-red-950/20 px-3 py-2 text-xs text-white">
              <p className="font-semibold">Authentication failed</p>
              <p>{params.error}</p>
            </div>
          )}
        </div>

        <form className="space-y-7" action={login}>
          <div className="space-y-6">
            <label className="relative block" htmlFor="email">
              <UserRound aria-hidden="true" className="absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" strokeWidth={1.5} />
              <span className="sr-only">Email address</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Username"
                className="h-[51px] w-full rounded-full border border-black bg-transparent pl-[57px] pr-5 text-[13px] text-black outline-none placeholder:text-black focus:border-black focus:ring-1 focus:ring-black/50"
              />
            </label>
            <label className="relative block" htmlFor="password">
              <LockKeyhole aria-hidden="true" className="absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" strokeWidth={1.5} />
              <span className="sr-only">Password</span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                className="h-[51px] w-full rounded-full border border-black bg-transparent pl-[57px] pr-5 text-[13px] text-black outline-none placeholder:text-black focus:border-black focus:ring-1 focus:ring-black/50"
              />
            </label>
          </div>

          <div className="space-y-9">
            <button
              type="submit"
              className="h-[51px] w-full rounded-full bg-white px-4 text-[14px] font-medium text-[#1684b5] shadow-sm transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#0d9ddd] active:scale-[0.99]"
            >
              LOGIN
            </button>
            <button type="button" className="mx-auto block text-[12px] font-medium text-[#075f8a] transition-colors hover:text-white focus:outline-none focus:underline">
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
