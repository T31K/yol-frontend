import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import PublicPlaylistPlayer from './public-player'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface PublicVideo {
  videoId: string
  title?: string
  loopStart?: string
  loopEnd?: string
}

interface PublicPlaylist {
  slug: string
  name: string
  emoji?: string | null
  videos: PublicVideo[]
  viewCount: number
  ownerName?: string | null
  createdAt: string
  updatedAt: string
}

async function fetchPlaylist(slug: string): Promise<PublicPlaylist | null> {
  try {
    const res = await fetch(`${API_URL}/yol/public-playlists/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return (await res.json()) as PublicPlaylist
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const playlist = await fetchPlaylist(params.slug)
  if (!playlist) return { title: 'Playlist Not Found | YouTubeOnLoop' }

  const title = `${playlist.emoji ? playlist.emoji + ' ' : ''}${playlist.name} — YouTube Loop Playlist`
  const description = `Loop "${playlist.name}" on YouTube — ${playlist.videos.length} video${
    playlist.videos.length === 1 ? '' : 's'
  } with custom start/end loop points${playlist.ownerName ? ` shared by ${playlist.ownerName}` : ''}. Free, no signup.`

  const firstVideoId = playlist.videos[0]?.videoId
  const ogImage = firstVideoId
    ? `https://i.ytimg.com/vi/${firstVideoId}/maxresdefault.jpg`
    : 'https://youtubeonloop.com/og.png'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://youtubeonloop.com/p/${playlist.slug}`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://youtubeonloop.com/p/${playlist.slug}`,
    },
  }
}

export default async function PublicPlaylistPage({
  params,
}: {
  params: { slug: string }
}) {
  const playlist = await fetchPlaylist(params.slug)
  if (!playlist) notFound()

  return (
    <main className="min-h-screen bg-white bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
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
            Shared playlist{playlist.ownerName ? ` · by ${playlist.ownerName}` : ''}
          </p>
          <h1 className="text-2xl font-heading tracking-tight md:text-3xl">
            {playlist.emoji ? <span className="mr-2">{playlist.emoji}</span> : null}
            {playlist.name}
          </h1>
          <p className="mt-2 font-base">
            {playlist.videos.length} video{playlist.videos.length === 1 ? '' : 's'} · with loop start/end points · loop endlessly
          </p>
        </div>

        {/* Player + sidebar */}
        <PublicPlaylistPlayer playlist={playlist} />

        {/* SEO content block */}
        <div className="mt-6 rounded-base border-4 border-black bg-white p-5 shadow-base md:p-6">
          <h2 className="mb-3 text-xl font-heading">About this playlist</h2>
          <p className="mb-3 font-base text-gray-700">
            This is a public YouTube loop playlist — a curated set of videos with custom start and end points
            so you can loop just the section that matters. Press play and let it run, or jump between tracks
            in the sidebar.
          </p>
          <p className="font-base text-gray-700">
            Want your own? Make a YouTube loop playlist on{' '}
            <Link href="/" className="font-heading underline hover:text-main">YouTubeOnLoop</Link>{' '}
            and share it with anyone, no signup needed to listen.
          </p>
        </div>

        {/* Track list (visible HTML for SEO) */}
        <div className="mt-4 rounded-base border-4 border-black bg-[#FFECD2] p-5 shadow-base md:p-6">
          <h2 className="mb-3 text-xl font-heading">Tracks in this playlist</h2>
          <ol className="space-y-2">
            {playlist.videos.map((v, i) => (
              <li key={v.videoId} className="flex items-center gap-3 rounded-base border-2 border-black bg-white p-2 shadow-base">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main text-sm font-heading">
                  {i + 1}
                </span>
                <img
                  src={`https://i.ytimg.com/vi/${v.videoId}/default.jpg`}
                  alt={v.title || `Video ${i + 1}`}
                  className="h-10 w-14 shrink-0 rounded border border-black object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-heading">{v.title || v.videoId}</p>
                  {(v.loopStart || v.loopEnd) && (
                    <p className="truncate text-xs font-base text-gray-500">
                      Loop: {v.loopStart || '0'}s → {v.loopEnd || 'end'}s
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Browse all */}
        <div className="mt-4 rounded-base border-4 border-black bg-white p-5 shadow-base text-center md:p-6">
          <p className="mb-3 font-heading">Make and share your own loop playlist</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-6 py-2 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-3">
            <Link href="/playlists" className="text-sm font-heading underline hover:text-main">
              Browse all public playlists →
            </Link>
          </p>
        </div>

        <footer className="mt-8 text-center">
          <Link href="/" className="text-sm font-heading underline hover:text-main">
            ← Back to YouTubeOnLoop
          </Link>
          <p className="mt-2 text-sm font-base text-gray-500">Made with ❤️ for endless loops</p>
        </footer>
      </div>
    </main>
  )
}
