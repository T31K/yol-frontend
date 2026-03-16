import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube Repeat — Put Any YouTube Video on Loop Free',
  description:
    'Repeat any YouTube video on loop instantly. Paste a URL, set start/end times, and control playback speed. Free YouTube repeat tool — no signup, no ads.',
  keywords: [
    'youtube repeat',
    'repeat youtube video',
    'youtube on repeat',
    'how to repeat a youtube video',
    'youtube loop',
    'put youtube on repeat',
    'youtube video on loop',
    'repeat youtube',
  ],
  openGraph: {
    title: 'YouTube Repeat — Put Any YouTube Video on Loop Free',
    description:
      'Repeat any YouTube video on loop instantly. Paste a URL and it loops forever. Free, no signup.',
    url: 'https://youtubeonloop.com/youtube-repeat',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Repeat — Put Any YouTube Video on Loop Free',
    description:
      'Repeat any YouTube video on loop instantly. Free, no signup.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/youtube-repeat',
  },
}

export default function YoutubeRepeatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
