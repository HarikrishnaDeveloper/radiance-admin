'use client'

import { Icon } from '@/components/icons'

// Collapses the sidebar to an icon-only rail and back. The state lives on
// <html data-sidebar> (styled by the `collapsed:` variant in globals.css) and
// in a cookie, which app/layout.tsx reads so pages render in the right mode.
export function SidebarToggle() {
  function toggle() {
    const root = document.documentElement
    const next = root.dataset.sidebar === 'collapsed' ? 'expanded' : 'collapsed'
    root.dataset.sidebar = next
    document.cookie = `sidebar=${next}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Collapse or expand the menu"
      aria-label="Collapse or expand the menu"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#fff]/70 transition hover:bg-[#fff]/15 hover:text-[#fff]"
    >
      <Icon name="sidebar" className="h-[18px] w-[18px]" />
    </button>
  )
}
