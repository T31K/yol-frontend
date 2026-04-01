import type { Metadata } from 'next'
import { Lexend } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const lexend = Lexend({ subsets: ['latin'] })

const siteUrl = 'https://youtubeonloop.com'

export const metadata: Metadata = {
  title: {
    default: 'YouTubeOnLoop — Loop YouTube Videos on Repeat, Free',
    template: '%s | YouTubeOnLoop',
  },
  description:
    'Loop or repeat any YouTube video endlessly — free. Paste a link or replace youtube.com with youtubeonloop.com. Set A/B loop points, control speed. Best ListenOnRepeat alternative. No signup.',
  keywords: [
    'youtube on loop',
    'youtube looper',
    'youtube loop',
    'loop youtube video',
    'repeat youtube video',
    'youtube on repeat',
    'youtube loop url',
    'listenonrepeat alternative',
    'how to loop a youtube video',
    'youtube ab repeat',
    'loop specific part of youtube video',
    'youtubeonloop',
    'youtube repeater',
    'on loop youtube',
  ],
  authors: [{ name: 'YouTubeOnLoop' }],
  creator: 'YouTubeOnLoop',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'YouTubeOnLoop — Loop & Repeat YouTube Videos Free',
    description:
      'Free YouTube looper — loop any YouTube video endlessly. Best ListenOnRepeat alternative. No signup required.',
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
      <body className={lexend.className}>
        {children}
        <Script
          src="https://umami.t31k.cloud/script.js"
          data-website-id="f30df7aa-6302-4888-9f2a-30337586e310"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
