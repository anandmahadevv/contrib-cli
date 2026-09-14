import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { GeistPixelGrid } from 'geist/font/pixel'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'gsoc-contrib (contrib) — Instant GitHub Workspaces Without Massive Clones',
  description:
    'Fast, lightweight contribution workspace manager for GitHub issues using Git blobless clones (--filter=blob:none) and sparse checkouts. Save 95% bandwidth and 90% disk space.',
  keywords: [
    'gsoc-contrib',
    'contrib-cli',
    'git blobless clone',
    'git sparse checkout',
    'github issue workspace',
    'open source onboarding',
    'google summer of code',
  ],
  authors: [{ name: 'Anand' }],
  creator: 'gsoc-contrib',
  publisher: 'gsoc-contrib',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'gsoc-contrib (contrib) — Instant GitHub Workspaces Without Massive Clones',
    description:
      'Fast, lightweight contribution workspace manager for GitHub issues using Git blobless clones (--filter=blob:none) and sparse checkouts.',
    siteName: 'gsoc-contrib',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'gsoc-contrib (contrib) CLI',
    description: 'Instant GitHub Workspaces Without Massive Clones',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${GeistPixelGrid.variable}`} suppressHydrationWarning>
      <body className="font-mono antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
