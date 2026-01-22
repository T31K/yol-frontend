import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Twitch Multi-View - Watch Two Streams',
  description:
    'Watch two Twitch streams side by side. Perfect for esports tournaments, multi-POV viewing, and more.',
  openGraph: {
    title: 'Twitch Multi-View | YouTubeOnLoop',
    description:
      'Watch two Twitch streams side by side. Perfect for esports tournaments and multi-POV viewing.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitch Multi-View | YouTubeOnLoop',
    description:
      'Watch two Twitch streams side by side. Perfect for esports and multi-POV viewing.',
    images: ['/og.png'],
  },
}

export default function TwitchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
