import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PublicSummary {
  slug: string
  name: string
  emoji?: string | null
  viewCount: number
  videoCount: number
  firstVideoId?: string | null
  ownerName?: string | null
  updatedAt: string
}

export const metadata: Metadata = {
  title: 'Public YouTube Loop Playlists — YouTubeOnLoop',
  description:
    'Browse public YouTube loop playlists shared by the community. Curated sets of videos with custom A/B loop points — perfect for studying, practice, or background music.',
  openGraph: {
    title: 'Public YouTube Loop Playlists — YouTubeOnLoop',
    description: 'Browse public YouTube loop playlists with custom start/end points.',
    url: 'https://youtubeonloop.com/playlists',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/playlists',
  },
}

async function fetchAll(): Promise<PublicSummary[]> {
  try {
    const res = await fetch(`${API_URL}/yol/public-playlists?limit=200`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return (await res.json()) as PublicSummary[]
  } catch {
    return []
  }
}

export default async function PublicPlaylistsIndexPage() {
  const playlists = await fetchAll()

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
          <h1 className="mb-2 text-2xl font-heading tracking-tight md:text-3xl">
            Public YouTube Loop Playlists
          </h1>
          <p className="font-base text-lg">
            Curated sets of videos with custom start/end loop points, shared by the YouTubeOnLoop community.
          </p>
        </div>

        {playlists.length === 0 ? (
          <div className="rounded-base border-4 border-black bg-white p-8 text-center shadow-base">
            <p className="mb-3 font-heading text-lg">No public playlists yet.</p>
            <p className="mb-4 font-base text-stone-600">
              Be the first to share one — make a playlist, then toggle it public.
            </p>
            <Link
              href="/"
              className="inline-block rounded-base border-4 border-black bg-main px-6 py-2 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            >
              ▶ Open YouTubeOnLoop
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((p) => (
              <Link
                key={p.slug}
                href={`/p/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-base border-4 border-black bg-white shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
              >
                {p.firstVideoId && (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <img
                      src={`https://i.ytimg.com/vi/${p.firstVideoId}/mqdefault.jpg`}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full border-b-4 border-black object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded border-2 border-black bg-white px-2 py-0.5 text-xs font-heading">
                      {p.videoCount} {p.videoCount === 1 ? 'video' : 'videos'}
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-heading">
                    {p.emoji ? <span className="mr-1">{p.emoji}</span> : null}
                    {p.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-base text-stone-500">
                    {p.ownerName ? `by ${p.ownerName}` : 'shared'} · {p.viewCount} view{p.viewCount === 1 ? '' : 's'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 rounded-base border-4 border-black bg-[#FFECD2] p-5 text-center shadow-base">
          <p className="mb-3 font-heading">Want to share your own?</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-6 py-2 font-heading shadow-base transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
          >
            ▶ Make a playlist
          </Link>
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
