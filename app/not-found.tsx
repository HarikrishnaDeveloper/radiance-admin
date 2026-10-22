import Image from 'next/image'
import Link from 'next/link'

// Unknown URLs anywhere in the app. Rendered outside the dashboard shell, so
// it borrows the login page's look instead.
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8a0a8f] via-[#6d0b86] to-[#4a0a73] px-4">
      <div className="w-full max-w-md rounded-sm bg-[#fff] p-10 text-center shadow-[0_20px_60px_-15px_rgba(40,0,70,0.45)]">
        <Image src="/logo.png" alt="Radiance" width={900} height={212} priority className="mx-auto h-auto w-40" />
        <p className="mt-8 bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a] bg-clip-text text-6xl font-extrabold text-transparent">404</p>
        <h1 className="mt-3 text-xl font-medium text-[#1b1b3a]">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">The page you’re looking for doesn’t exist.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-gradient-to-r from-[#5b0f8a] to-[#8e0a9a] px-6 py-2.5 text-sm font-semibold text-[#fff] shadow-md transition hover:brightness-110"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
