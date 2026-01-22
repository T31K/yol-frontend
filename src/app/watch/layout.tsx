import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Watch & Loop Video',
  description:
    'Watch and loop this YouTube video endlessly. Perfect for music, studying, or learning.',
  openGraph: {
    title: 'Watch & Loop Video | YouTubeOnLoop',
    description:
      'Watch and loop this YouTube video endlessly. Perfect for music, studying, or learning.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch & Loop Video | YouTubeOnLoop',
    description:
      'Watch and loop this YouTube video endlessly. Perfect for music, studying, or learning.',
    images: ['/og.png'],
  },
}

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
