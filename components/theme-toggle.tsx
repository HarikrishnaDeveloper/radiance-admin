'use client'

import { useState } from 'react'
import { saveTheme } from '@/app/actions/theme'

export type Theme = 'light' | 'dark'

// Flips the .dark class on <html> immediately and stores the choice in a
// cookie (via a Server Action), which the layouts read so the next page load
// renders in the right theme with no flash.
export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial)

  function choose(next: Theme) {
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    void saveTheme(next)
  }

  const other: Theme = theme === 'light' ? 'dark' : 'light'

  return (
    <>
      <div role="radiogroup" aria-label="Theme" className="flex rounded-full bg-[#fff]/10 p-1 collapsed:hidden">
        {(['light', 'dark'] as const).map((option) => {
          const active = theme === option
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(option)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition ${
                active ? 'bg-[#fff] text-[#5b0f8a] shadow-sm' : 'text-[#fff]/70 hover:text-[#fff]'
              }`}
            >
              {option === 'light' ? <SunIcon /> : <MoonIcon />}
              {option === 'light' ? 'Light' : 'Dark'}
            </button>
          )
        })}
      </div>

      {/* Collapsed sidebar: one round button showing the theme it switches to. */}
      <button
        type="button"
        onClick={() => choose(other)}
        title={`Switch to ${other} theme`}
        aria-label={`Switch to ${other} theme`}
        className="mx-auto hidden h-10 w-10 items-center justify-center rounded-full bg-[#fff]/10 text-[#fff] transition hover:bg-[#fff]/20 collapsed:flex"
      >
        {other === 'light' ? <SunIcon size="h-[18px] w-[18px]" /> : <MoonIcon size="h-[18px] w-[18px]" />}
      </button>
    </>
  )
}

function SunIcon({ size = 'h-3.5 w-3.5' }: { size?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ size = 'h-3.5 w-3.5' }: { size?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={size} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
