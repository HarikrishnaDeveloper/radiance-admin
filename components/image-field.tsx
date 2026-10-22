'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { uploadImage } from '@/app/actions/questions'
import { backendFileUrl } from '@/lib/backend-files'
import { useToast } from '@/components/toast'

// Picks an image, uploads it to radiance-backend straight away, and keeps the
// returned path in a hidden input so it saves with the rest of the form.
export function ImageField({
  name,
  defaultValue,
  label = 'Image',
}: {
  name: string
  defaultValue: string | null
  label?: string
}) {
  // Import placeholders like "pending_extraction.jpg" aren't real files.
  const [path, setPath] = useState(defaultValue?.startsWith('/') ? defaultValue : '')
  const toast = useToast()
  const [pending, startTransition] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)
  const hiddenInput = useRef<HTMLInputElement>(null)

  // Setting a hidden input's value fires no event; tell the form (the live
  // MobilePreview listens to it) that the image changed.
  useEffect(() => {
    hiddenInput.current?.form?.dispatchEvent(new Event('input', { bubbles: true }))
  }, [path])

  function onPick(file: File | undefined) {
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    startTransition(async () => {
      const result = await uploadImage(form)
      if ('error' in result) toast.error('Image upload failed', result.error)
      else setPath(result.url)
    })
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className="mt-1.5">
      <input ref={hiddenInput} type="hidden" name={name} value={path} />
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {path && (
        // eslint-disable-next-line @next/next/no-img-element -- proxied backend file, not a static asset
        <img
          src={backendFileUrl(path)}
          alt=""
          className="mb-1 max-h-40 w-full rounded-lg border border-slate-200 bg-white object-contain"
        />
      )}

      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          disabled={pending}
          onClick={() => fileInput.current?.click()}
          className="rounded border border-slate-200 px-2 py-0.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          {pending ? 'Uploading…' : path ? `Replace ${label.toLowerCase()}` : `+ ${label}`}
        </button>
        {path && !pending && (
          <button type="button" onClick={() => setPath('')} className="text-red-500 hover:underline">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
