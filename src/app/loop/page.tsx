import { songs, categories } from '@/data/songs'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop Popular Songs on YouTube — Free YouTube Looper',
  description:
    'Browse 50+ popular songs to loop on YouTube. Pop, rock, K-pop, lo-fi, hip hop, anime OSTs and more. Free YouTube looper — no signup required.',
  openGraph: {
    title: 'Loop Popular Songs on YouTube — Free YouTube Looper',
    description:
      'Browse 50+ popular songs to loop on YouTube. Free looper with speed control and AB repeat.',
    url: 'https://youtubeonloop.com/loop',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/loop',
  },
}

export default function LoopIndexPage() {
  return (
    <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
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
        <div className="mb-6 rounded-base border-4 border-black bg-main p-5 shadow-base md:p-6">
          <h1 className="mb-2 text-2xl font-heading tracking-tight md:text-3xl">
            Popular Songs to Loop on YouTube
          </h1>
          <p className="font-base text-lg">
            Pick a song and loop it endlessly. Set start/end times, adjust speed, and let it repeat.
          </p>
        </div>

        {/* Songs by category */}
        {categories.map((category) => {
          const categorySongs = songs.filter((s) => s.category === category)
          return (
            <div
              key={category}
              className="mb-4 rounded-base border-4 border-black bg-white p-5 shadow-base md:p-6"
            >
              <h2 className="mb-3 text-xl font-heading">{category}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {categorySongs.map((song) => (
                  <Link
                    key={song.slug}
                    href={`/loop/${song.slug}`}
                    className="flex items-center gap-3 rounded-base border-2 border-black p-2 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${song.videoId}/default.jpg`}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded border border-black object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-heading">
                        {song.title}
                      </p>
                      <p className="truncate text-xs font-base text-gray-500">
                        {song.artist}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {/* CTA */}
        <div className="mb-4 rounded-base border-4 border-black bg-[#FFECD2] p-5 shadow-base text-center md:p-6">
          <p className="mb-3 font-heading">Don&apos;t see your song?</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-6 py-2 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
          >
            ▶ Paste any YouTube URL to loop it
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-heading underline hover:text-main"
          >
            ← Back to YouTubeOnLoop
          </Link>
          <p className="mt-2 text-sm font-base text-gray-500">
            Made with ❤️ for endless loops
          </p>
        </footer>
      </div>
    </main>
  )
}
