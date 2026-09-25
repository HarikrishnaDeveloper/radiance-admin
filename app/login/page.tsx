'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10">
      {/* Purple backdrop covering the left half of the viewport */}
      <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-br from-[#8a0a8f] via-[#6d0b86] to-[#4a0a73] md:block" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-sm bg-white shadow-[0_20px_60px_-15px_rgba(40,0,70,0.35)] md:min-h-[560px] md:flex-row">
        {/* Left: greeting panel */}
        <div className="relative flex min-h-[220px] items-center overflow-hidden bg-gradient-to-b from-[#8e0a9a] via-[#5b0f8a] to-[#2d0c6b] px-10 py-12 md:w-1/2 md:px-12">
          {/* Streaks */}
          <span className="absolute left-8 top-10 h-px w-10 rotate-[20deg] bg-white/15" />
          <span className="absolute left-24 top-16 h-px w-6 rotate-[20deg] bg-white/10" />
          <span className="absolute right-16 top-24 h-px w-12 rotate-[20deg] bg-white/15" />
          <span className="absolute right-10 top-40 h-px w-8 rotate-[20deg] bg-white/10" />
          <span className="absolute left-12 top-48 h-px w-10 rotate-[20deg] bg-white/10" />
          <div className="absolute left-1/2 top-20 flex rotate-[20deg] gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-4 w-px bg-white/25" />
            ))}
          </div>

          {/* Stars */}
          <span className="absolute right-20 top-1/4 h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute left-5 top-[36%] h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute right-28 top-[55%] h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute bottom-1/4 left-1/4 h-1.5 w-1.5 rounded-full bg-white" />

          {/* Mountains */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 w-full"
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 160 L60 90 L110 60 L170 110 L200 160 Z" fill="#7a1a8f" fillOpacity="0.35" />
            <path d="M120 160 L230 70 L300 110 L400 160 Z" fill="#8a1f9c" fillOpacity="0.3" />
          </svg>

          <div className="absolute left-10 top-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/20 md:left-12">
            <Image src="/logo-mark.png" alt="" width={256} height={256} priority className="h-9 w-9" />
          </div>

          <div className="relative text-white">
            <p className="text-3xl font-light md:text-4xl">Hello!</p>
            <p className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">Have a</p>
            <p className="text-3xl font-extrabold leading-tight md:text-4xl">GOOD DAY</p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="relative flex flex-1 flex-col justify-center px-8 py-12 md:px-14">
          {/* Corner ornament */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full border border-slate-400" />
          <div className="pointer-events-none absolute -right-6 -top-6 h-14 w-14 rounded-full bg-[#6d0b86]" />

          <Image src="/logo.png" alt="Radiance" width={900} height={212} priority className="mx-auto h-auto w-48" />
          <h1 className="mt-6 text-center text-3xl font-medium text-[#1b1b3a]">Login</h1>
          <p className="mt-2 text-center text-xs text-slate-400">Admin panel</p>

          <form action={formAction} className="mx-auto mt-8 w-full max-w-xs space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs text-slate-500">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#7b0f91] focus:outline-none focus:ring-1 focus:ring-[#7b0f91]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-slate-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1.5 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-[#7b0f91] focus:outline-none focus:ring-1 focus:ring-[#7b0f91]"
              />
            </div>

            {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={pending}
                className="w-40 rounded-md bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a] px-6 py-2.5 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
              >
                {pending ? 'Signing in…' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
