import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube on Repeat — Loop Any YouTube Video Free',
  description:
    'Put any YouTube video on repeat in one click. Paste a URL or replace youtube.com with youtubeonloop.com in any YouTube link. Loop the full video or a specific section. Free, no signup.',
  keywords: [
    'youtube on repeat',
    'youtube repeat',
    'repeat youtube video',
    'put youtube video on repeat',
    'youtube video on repeat',
    'youtube loop url',
    'on repeat youtube',
    'yt on repeat',
    'youtube on replay',
  ],
  openGraph: {
    title: 'YouTube on Repeat — Loop Any YouTube Video Free',
    description:
      'Put any YouTube video on repeat instantly. Paste a URL or swap youtube.com → youtubeonloop.com. Free, no signup.',
    url: 'https://youtubeonloop.com/youtube-repeat',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube on Repeat — Loop Any YouTube Video Free',
    description: 'Put any YouTube video on repeat instantly. Free, no signup.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/youtube-repeat',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does YouTube have a built-in repeat button?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'YouTube has a right-click "Loop" option on desktop, but it\'s buried and unavailable on mobile. YouTubeOnLoop works on all devices and gives you more control — like looping a specific time range.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I repeat a YouTube video on my phone?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open the video on YouTube, copy the URL, then paste it at youtubeonloop.com/youtube-repeat. Or just change youtube.com to youtubeonloop.com in your mobile browser address bar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I loop just a part of a YouTube video on repeat?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Use the Start and End fields (in seconds) to set a specific section. The player will repeat only that segment — useful for music practice or language study.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I use a YouTube URL to loop a video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simply replace "youtube.com" with "youtubeonloop.com" in any YouTube video URL. The video will open and play on repeat automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is YouTubeOnLoop free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Completely free. No account, no subscription, no ads on the player.',
      },
    },
  ],
}

export default function YoutubeRepeatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
