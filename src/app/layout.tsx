import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

const siteUrl = 'https://youtubeonloop.com'

export const metadata: Metadata = {
  title: {
    default: 'YouTubeOnLoop - Loop Any YouTube Video Endlessly',
    template: '%s | YouTubeOnLoop',
  },
  description:
    'Loop any YouTube video endlessly for free. Paste a link and let it repeat! Perfect for music, studying, meditation, or learning. No signup required.',
  keywords: [
    'youtubeonloop',
    'youtube repeater',
    'youtube loop',
    'repeat youtube video',
    'loop video',
    'youtube on repeat',
    'endless youtube',
    'music loop',
    'video repeater',
  ],
  authors: [{ name: 'YouTubeOnLoop' }],
  creator: 'YouTubeOnLoop',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'YouTubeOnLoop - Loop Any YouTube Video Endlessly',
    description:
      'Loop any YouTube video endlessly for free. Paste a link and let it repeat! Perfect for music, studying, meditation, or learning.',
    siteName: 'YouTubeOnLoop',
    images: [
      {
        url: 'https://youtubeonloop.com/og.png',
        width: 1200,
        height: 630,
        alt: 'YouTubeOnLoop - Loop Any YouTube Video',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTubeOnLoop - Loop Any YouTube Video Endlessly',
    description:
      'Loop any YouTube video endlessly for free. Paste a link and let it repeat!',
    images: ['https://youtubeonloop.com/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  )
}
