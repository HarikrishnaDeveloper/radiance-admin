import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radiance Admin",
  description: "Back office for Radiance — users, subscriptions, questions, categories.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set by components/theme-toggle.tsx; rendered server-side so there is no light flash.
  const dark = (await cookies()).get("theme")?.value === "dark";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${dark ? " dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
