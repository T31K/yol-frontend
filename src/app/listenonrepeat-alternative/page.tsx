import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'ListenOnRepeat Alternative — Free YouTube Looper That Works',
  description:
    'ListenOnRepeat is down? YouTubeOnLoop is the best free alternative. Loop any YouTube video endlessly, set start/end times, and control playback speed. No signup required.',
  keywords: [
    'listenonrepeat alternative',
    'listenonrepeat not working',
    'listenonrepeat down',
    'sites like listenonrepeat',
    'youtube looper free',
    'loop youtube video',
    'repeat youtube video',
  ],
  openGraph: {
    title: 'ListenOnRepeat Alternative — Free YouTube Looper That Works',
    description:
      'ListenOnRepeat is down? YouTubeOnLoop is the best free alternative. Loop any YouTube video endlessly. No signup required.',
    url: 'https://youtubeonloop.com/listenonrepeat-alternative',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ListenOnRepeat Alternative — Free YouTube Looper That Works',
    description:
      'ListenOnRepeat is down? YouTubeOnLoop is the best free alternative.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/listenonrepeat-alternative',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why is ListenOnRepeat down?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ListenOnRepeat has been experiencing extended downtime and appears to be offline indefinitely. YouTubeOnLoop is a fully working replacement with the same core feature — loop any YouTube video by swapping the domain in the URL.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does YouTubeOnLoop work the same way as ListenOnRepeat?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The URL trick works identically: take any YouTube URL and replace youtube.com with youtubeonloop.com. The video will open in loop mode automatically.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I loop a specific part of the video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Use the Start and End time fields (in seconds) to set a specific section to loop. This is great for guitar practice or language learning.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is YouTubeOnLoop free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Completely free. No account, no subscription, no ads on the player. Just paste and loop.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best ListenOnRepeat alternative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'YouTubeOnLoop is the best free ListenOnRepeat alternative. It supports the same URL trick, A/B loop points, playback speed control, playlists, and works on all devices with no signup required.',
      },
    },
  ],
}

export default function ListenOnRepeatAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px] p-4 md:p-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="YouTubeOnLoop — Loop Any YouTube Video"
              width={780}
              height={400}
              className="mx-auto h-14 w-auto"
            />
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-6 rounded-base border-4 border-black bg-main p-6 shadow-base md:p-8">
          <h1 className="mb-3 text-3xl font-heading tracking-tight md:text-4xl">
            ListenOnRepeat Is Down — Use This Free Alternative
          </h1>
          <p className="text-lg font-base">
            YouTubeOnLoop works exactly the same way. Paste any YouTube link and it loops forever — no account, no ads, no catch.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Start looping right now:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any YouTube URL
          </p>
        </div>

        {/* How it works */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Use It (Same as ListenOnRepeat)</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">1</span>
              <div>
                <p className="font-heading">Paste any YouTube URL</p>
                <p className="text-sm font-base text-gray-600">Copy the link from YouTube and paste it into the input on the homepage.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">2</span>
              <div>
                <p className="font-heading">Or just swap the URL</p>
                <p className="text-sm font-base text-gray-600">
                  Change <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> to{' '}
                  <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code> directly in the address bar.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading text-lg">3</span>
              <div>
                <p className="font-heading">It loops forever</p>
                <p className="text-sm font-base text-gray-600">The video plays on repeat automatically. You can set start/end times to loop a specific section.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">YouTubeOnLoop vs ListenOnRepeat</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-base">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-left font-heading">Feature</th>
                  <th className="py-2 text-center font-heading">YouTubeOnLoop</th>
                  <th className="py-2 text-center font-heading text-gray-400">ListenOnRepeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2">Loop YouTube videos</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Yes</td>
                  <td className="py-2 text-center text-gray-400">✓ Yes (when up)</td>
                </tr>
                <tr>
                  <td className="py-2">Loop specific section (AB repeat)</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Yes</td>
                  <td className="py-2 text-center text-gray-400">✓ Yes</td>
                </tr>
                <tr>
                  <td className="py-2">Playback speed control</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Yes</td>
                  <td className="py-2 text-center text-gray-400">Limited</td>
                </tr>
                <tr>
                  <td className="py-2">URL trick (replace domain)</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Yes</td>
                  <td className="py-2 text-center text-gray-400">✓ Yes</td>
                </tr>
                <tr>
                  <td className="py-2">No account required</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Free forever</td>
                  <td className="py-2 text-center text-gray-400">✓ Free</td>
                </tr>
                <tr>
                  <td className="py-2">Currently working</td>
                  <td className="py-2 text-center text-green-600 font-heading">✓ Yes</td>
                  <td className="py-2 text-center text-red-500 font-heading">✗ Down</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-heading">Why is ListenOnRepeat down?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                ListenOnRepeat has been experiencing extended downtime. The site appears to be offline indefinitely. YouTubeOnLoop is a fully working replacement with the same core feature — loop any YouTube video by swapping the domain in the URL.
              </p>
            </div>
            <div>
              <h3 className="font-heading">Does YouTubeOnLoop work the same way?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Yes. The URL trick works identically: take any YouTube URL and replace <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> with <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code>. The video will open in loop mode automatically.
              </p>
            </div>
            <div>
              <h3 className="font-heading">Can I loop a specific part of the video?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Yes. Use the Start and End time fields (in seconds) to set a specific section to loop. This is great for{' '}
                <Link href="/for/guitar-practice" className="font-heading underline decoration-2 underline-offset-2 hover:text-main">
                  guitar practice
                </Link>{' '}
                or{' '}
                <Link href="/for/language-learning" className="font-heading underline decoration-2 underline-offset-2 hover:text-main">
                  language learning
                </Link>.
              </p>
            </div>
            <div>
              <h3 className="font-heading">Is YouTubeOnLoop free?</h3>
              <p className="mt-1 text-sm font-base text-gray-600">
                Completely free. No account, no subscription, no ads on the player. Just paste and loop.
              </p>
            </div>
          </div>
        </div>

        {/* Internal links */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">More Ways to Use YouTubeOnLoop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/for/guitar-practice"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🎸 Guitar Practice</p>
              <p className="text-sm font-base text-gray-600">Loop specific riffs and solos to practice</p>
            </Link>
            <Link
              href="/for/language-learning"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🗣 Language Learning</p>
              <p className="text-sm font-base text-gray-600">Repeat dialogues and phrases to master pronunciation</p>
            </Link>
          </div>
        </div>

        {/* Popular loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Start Looping Now</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/bohemian-rhapsody" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Bohemian Rhapsody</Link>
            <Link href="/loop/blinding-lights" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Blinding Lights</Link>
            <Link href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lo-fi Radio</Link>
            <Link href="/loop/uptown-funk" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Uptown Funk</Link>
            <Link href="/loop/how-you-like-that" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">How You Like That</Link>
            <Link href="/loop" className="rounded-base border-2 border-black bg-main px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Browse all →</Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <Link href="/" className="text-sm font-heading underline hover:text-main">
            ← Back to YouTubeOnLoop
          </Link>
          <p className="mt-2 text-sm font-base text-gray-500">Made with ❤️ for endless loops</p>
        </footer>
      </div>
    </main>
    </>
  )
}
