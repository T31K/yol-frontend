import { notFound } from 'next/navigation'
import { songs, categories } from '@/data/songs'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import LoopPlayer from './loop-player'

export async function generateStaticParams() {
  return songs.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const song = songs.find((s) => s.slug === params.slug)
  if (!song) return { title: 'Not Found | YouTubeOnLoop' }

  const title = `Loop ${song.title} by ${song.artist} on YouTube — Repeat Endlessly`
  const description = `Loop "${song.title}" by ${song.artist} on repeat. Free YouTube looper — no signup, no ads. Set start/end times and playback speed to loop any section.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://youtubeonloop.com/loop/${song.slug}`,
      images: [`https://i.ytimg.com/vi/${song.videoId}/maxresdefault.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://i.ytimg.com/vi/${song.videoId}/maxresdefault.jpg`],
    },
    alternates: {
      canonical: `https://youtubeonloop.com/loop/${song.slug}`,
    },
  }
}

export default function LoopSongPage({
  params,
}: {
  params: { slug: string }
}) {
  const song = songs.find((s) => s.slug === params.slug)
  if (!song) notFound()

  const sameCategorySongs = songs
    .filter((s) => s.category === song.category && s.slug !== song.slug)
    .slice(0, 6)
  const otherSongs = songs
    .filter((s) => s.category !== song.category && s.slug !== song.slug)
    .slice(0, 6)

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
          <p className="mb-1 text-sm font-base uppercase tracking-wider opacity-70">
            {song.category} — {song.artist}
          </p>
          <h1 className="text-2xl font-heading tracking-tight md:text-3xl">
            Loop &ldquo;{song.title}&rdquo; on YouTube
          </h1>
          <p className="mt-2 font-base">
            Play &ldquo;{song.title}&rdquo; by {song.artist} on repeat endlessly.
            Set start/end times to loop a specific section.
          </p>
        </div>

        {/* Player */}
        <LoopPlayer videoId={song.videoId} />

        {/* About this song */}
        <div className="mt-6 rounded-base border-4 border-black bg-white p-5 shadow-base md:p-6">
          <h2 className="mb-3 text-xl font-heading">
            Why People Loop &ldquo;{song.title}&rdquo;
          </h2>
          <p className="mb-3 font-base text-gray-700">
            &ldquo;{song.title}&rdquo; by {song.artist} is one of the most
            replayed tracks on YouTube. Whether you&apos;re studying, working out,
            practicing an instrument, or just vibing — this is a song that hits
            different on repeat.
          </p>
          <p className="font-base text-gray-700">
            Use the controls above to set a specific section to loop. Great for
            learning the lyrics, practicing the melody, or just letting it play
            in the background while you focus.
          </p>
        </div>

        {/* How to loop */}
        <div className="mt-4 rounded-base border-4 border-black bg-white p-5 shadow-base md:p-6">
          <h2 className="mb-3 text-xl font-heading">
            How to Loop &ldquo;{song.title}&rdquo;
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main text-sm font-heading">
                1
              </span>
              <p className="font-base text-gray-700">
                The video above is already set to loop automatically. Just press
                play!
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main text-sm font-heading">
                2
              </span>
              <p className="font-base text-gray-700">
                Use the <strong>Start</strong> and <strong>End</strong> time
                fields to loop just a specific part — enter times in seconds.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main text-sm font-heading">
                3
              </span>
              <p className="font-base text-gray-700">
                Adjust playback speed with the speed selector — slow it down for
                practice or speed it up for a quick listen.
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-4 rotate-[0.3deg] rounded-base border-4 border-black bg-yellow-300 p-4 shadow-base">
          <p className="text-sm font-heading">
            💡 <strong>Tip:</strong> Bookmark this page to come back and loop
            &ldquo;{song.title}&rdquo; anytime. Or replace{' '}
            <code className="rounded border border-gray-500 bg-white/50 px-1">
              youtube.com
            </code>{' '}
            with{' '}
            <code className="rounded border border-black bg-main/30 px-1">
              youtubeonloop.com
            </code>{' '}
            in any YouTube URL.
          </p>
        </div>

        {/* More from same category */}
        {sameCategorySongs.length > 0 && (
          <div className="mt-6 rounded-base border-4 border-black bg-white p-5 shadow-base md:p-6">
            <h2 className="mb-3 text-xl font-heading">
              More {song.category} to Loop
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {sameCategorySongs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/loop/${s.slug}`}
                  className="flex items-center gap-3 rounded-base border-2 border-black p-2 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${s.videoId}/default.jpg`}
                    alt=""
                    className="h-10 w-14 shrink-0 rounded border border-black object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-heading">{s.title}</p>
                    <p className="truncate text-xs font-base text-gray-500">
                      {s.artist}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other songs */}
        {otherSongs.length > 0 && (
          <div className="mt-4 rounded-base border-4 border-black bg-[#FFECD2] p-5 shadow-base md:p-6">
            <h2 className="mb-3 text-xl font-heading">
              Other Popular Loops
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {otherSongs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/loop/${s.slug}`}
                  className="flex items-center gap-3 rounded-base border-2 border-black bg-white p-2 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${s.videoId}/default.jpg`}
                    alt=""
                    className="h-10 w-14 shrink-0 rounded border border-black object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-heading">{s.title}</p>
                    <p className="truncate text-xs font-base text-gray-500">
                      {s.artist}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse all */}
        <div className="mt-4 rounded-base border-4 border-black bg-white p-5 shadow-base text-center md:p-6">
          <p className="mb-3 font-heading">Loop any YouTube video</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-6 py-2 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
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
