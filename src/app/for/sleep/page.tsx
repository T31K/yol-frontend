import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop a Song to Sleep To — YouTube Sleep Music on Repeat',
  description:
    'Loop rain sounds, white noise, or your favorite calming song on YouTube to fall asleep — without ads or autoplay waking you up. Free overnight YouTube looper.',
  keywords: [
    'loop song to sleep',
    'youtube sleep music on repeat',
    'rain sounds on loop',
    'white noise youtube loop',
    'play youtube on repeat overnight',
    'sleep loop youtube',
  ],
  openGraph: {
    title: 'Loop a Song to Sleep To — YouTube Sleep Music on Repeat',
    description:
      'Put rain sounds, sleep music, or any calming track on infinite loop. No ads, no autoplay — sleep through the night.',
    url: 'https://youtubeonloop.com/for/sleep',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop a Song to Sleep To — YouTube Sleep Music on Repeat',
    description: 'Loop any sleep track endlessly. No ads, no autoplay surprises.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/sleep',
  },
}

export default function SleepPage() {
  return (
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
            😴 Loop a Song to Sleep To
          </h1>
          <p className="text-lg font-base">
            Put rain, white noise, or your favorite calming track on endless repeat — and never get jolted awake by a YouTube ad or autoplay surprise.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Pick a sleep track and loop it:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any sleep video URL
          </p>
        </div>

        {/* Why this matters */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why You Need a Real Loop at Night</h2>
          <p className="mb-3 font-base text-gray-700">
            YouTube&apos;s native &quot;loop video&quot; option does work — but only if YouTube doesn&apos;t cut to a mid-roll ad first, doesn&apos;t lose the tab, and doesn&apos;t fall back to autoplay when something hiccups. Any of those will yank you out of the deepest part of the night.
          </p>
          <p className="font-base text-gray-700">
            A dedicated looper bypasses all of that. The same track plays from start to end, then immediately starts over. No ad-breaks. No &quot;Up next.&quot; No volume jumps.
          </p>
        </div>

        {/* What to loop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Best Sounds to Loop for Sleep</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🌧', title: 'Rain on a roof', desc: 'Steady, predictable, deeply soothing' },
              { emoji: '🌊', title: 'Ocean waves', desc: 'Slow rhythm syncs with breathing' },
              { emoji: '🔥', title: 'Crackling fireplace', desc: 'Warm, low frequencies — bedroom-friendly' },
              { emoji: '💨', title: 'Brown / pink noise', desc: 'Masks footsteps, traffic, snoring partners' },
              { emoji: '🎵', title: '8-hour sleep mixes', desc: 'Already designed to play through the night' },
              { emoji: '🌙', title: 'Solfeggio / 432 Hz', desc: 'Slow ambient frequencies for deep rest' },
            ].map((item) => (
              <div key={item.title} className="rounded-base border-2 border-black p-3">
                <p className="font-heading">{item.emoji} {item.title}</p>
                <p className="text-sm font-base text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to use */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Loop YouTube Overnight</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Pick a track without a sponsor read</p>
                <p className="text-sm font-base text-gray-600">Avoid videos that open with the creator talking — those wake you up every loop. Pure ambience tracks loop seamlessly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">2</span>
              <div>
                <p className="font-heading">Open it on YouTubeOnLoop</p>
                <p className="text-sm font-base text-gray-600">Replace <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> with <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code> or paste the URL on the homepage.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">3</span>
              <div>
                <p className="font-heading">Trim out the intro</p>
                <p className="text-sm font-base text-gray-600">If the first 10 seconds is a logo or fade-in that&apos;s noticeably louder, set Start a few seconds in so each loop starts smoothly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Set the volume — and remember it</p>
                <p className="text-sm font-base text-gray-600">Lower the volume to bedroom level. The app remembers it next time you open a sleep loop, so you won&apos;t wake up to a 100% blast.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Sleep Loop Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Use a repeat count as a sleep timer:</strong> Set repeat = 5 on a 30-min track to auto-stop after 2.5 hours.</li>
            <li>• <strong>Save your sleep playlist:</strong> Sign in and your favorite night tracks sync to your phone for travel.</li>
            <li>• <strong>Avoid mid-loop spikes:</strong> Some &quot;sleep&quot; videos secretly contain a 1-min talking section halfway through — preview before bed.</li>
            <li>• <strong>Phone face-down:</strong> Combine with do-not-disturb — the loop keeps playing, notifications don&apos;t.</li>
          </ul>
        </div>

        {/* Internal links */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">More Uses for YouTubeOnLoop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/for/meditation"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🧘 Meditation</p>
              <p className="text-sm font-base text-gray-600">Loop mantras and sound baths during practice</p>
            </Link>
            <Link
              href="/for/studying"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">📚 Studying</p>
              <p className="text-sm font-base text-gray-600">Loop focus music for deep work sessions</p>
            </Link>
            <Link
              href="/listenonrepeat-alternative"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🔁 ListenOnRepeat Alternative</p>
              <p className="text-sm font-base text-gray-600">The best replacement for the popular looping site</p>
            </Link>
            <Link
              href="/youtube-repeat"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🔂 YouTube Repeat</p>
              <p className="text-sm font-base text-gray-600">All ways to put a YouTube video on repeat</p>
            </Link>
          </div>
        </div>

        {/* Popular sleep loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Sleep Loops</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/rain-sounds" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Rain Sounds for Sleep</Link>
            <Link href="/loop/coffee-shop-ambience" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Coffee Shop Ambience</Link>
            <Link href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lofi Hip Hop Radio</Link>
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
  )
}
