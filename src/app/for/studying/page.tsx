import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop Study Music on YouTube — Focus Sounds on Repeat',
  description:
    'Loop lo-fi, classical, brown noise, or any focus playlist on YouTube — endlessly, with no ads breaking your flow. Free study music looper for deep work.',
  keywords: [
    'loop study music youtube',
    'youtube study music on repeat',
    'lofi on repeat',
    'focus music looper',
    'youtube on loop for studying',
    'concentration music repeat',
  ],
  openGraph: {
    title: 'Loop Study Music on YouTube — Focus Sounds on Repeat',
    description:
      'Loop lo-fi, classical, brown noise, or any focus video on YouTube — no ads, no breaks. Built for deep work.',
    url: 'https://youtubeonloop.com/for/studying',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop Study Music on YouTube — Focus Sounds on Repeat',
    description: 'Loop any focus video endlessly. Free study music looper.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/studying',
  },
}

export default function StudyingPage() {
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
            📚 Loop Study Music on YouTube
          </h1>
          <p className="text-lg font-base">
            Put your favorite lo-fi stream, classical playlist, or brown noise track on infinite repeat — so the music never stops and your focus never breaks.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Pick a focus track and loop it:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any study video URL
          </p>
        </div>

        {/* Why looping for studying */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why Looping Music Helps You Focus</h2>
          <p className="mb-3 font-base text-gray-700">
            Researchers studying flow states have found that <strong>familiar, repetitive audio</strong> is one of the easiest ways to enter and stay in deep work. Once your brain stops noticing the music, it stops being a distraction and starts being a wall against everything else.
          </p>
          <p className="font-base text-gray-700">
            That breaks the moment YouTube cuts to an ad, autoplays a different track, or — worse — drops a Mr. Beast thumbnail into your peripheral vision. A real loop solves all three.
          </p>
        </div>

        {/* What to loop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Best Things to Loop for Studying</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🎧', title: 'Lo-fi hip hop', desc: 'The classic deep-work soundtrack' },
              { emoji: '🌧', title: 'Brown / pink noise', desc: 'Steady masking of background sound' },
              { emoji: '🎻', title: 'Classical & baroque', desc: 'Bach, Mozart, Vivaldi for structured thinking' },
              { emoji: '☕', title: 'Coffee shop ambience', desc: 'Café murmur without leaving the desk' },
              { emoji: '🔥', title: 'Fireplace & rain', desc: 'Cozy, slow, low-frequency comfort' },
              { emoji: '🎮', title: 'Video game OSTs', desc: 'Designed to be heard for hours without fatigue' },
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
          <h2 className="mb-4 text-2xl font-heading">How to Set Up a Study Loop</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Pick a long video — or just one track</p>
                <p className="text-sm font-base text-gray-600">A 1-hour lo-fi mix loops great. So does a 3-minute song you genuinely love. Both work — pick what your brain ignores fastest.</p>
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
                <p className="font-heading">Skip the intro / talking parts</p>
                <p className="text-sm font-base text-gray-600">If a video has a voiceover or an ad-read in the first 30 seconds, set Start to skip it — so your loop is pure music every time it restarts.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Build a study playlist</p>
                <p className="text-sm font-base text-gray-600">Stack 5–10 focus tracks into a playlist, turn on Loop Playlist, and you have hours of curated study music with no auto-play surprises.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Focus Session Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Same song, every session:</strong> One single track on repeat for every Pomodoro becomes a focus trigger — your brain learns to drop in within 30 seconds.</li>
            <li>• <strong>Set a repeat count = your timer:</strong> Use the loop counter to time a focus block — e.g. &quot;loop this 25-min track 1 time, then break.&quot;</li>
            <li>• <strong>Lyrics rarely help:</strong> If you&apos;re reading or writing, instrumental wins almost every time.</li>
            <li>• <strong>Sync across devices:</strong> Save your study playlist when signed in — pick it up on your phone for the library.</li>
          </ul>
        </div>

        {/* Internal links */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">More Uses for YouTubeOnLoop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/for/sleep"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">😴 Sleep & Rest</p>
              <p className="text-sm font-base text-gray-600">Loop a calming track to fall asleep to</p>
            </Link>
            <Link
              href="/for/meditation"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🧘 Meditation</p>
              <p className="text-sm font-base text-gray-600">Loop mantras and sound baths during practice</p>
            </Link>
            <Link
              href="/for/language-learning"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🗣 Language Learning</p>
              <p className="text-sm font-base text-gray-600">Repeat dialogues and phrases to master pronunciation</p>
            </Link>
            <Link
              href="/listenonrepeat-alternative"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🔁 ListenOnRepeat Alternative</p>
              <p className="text-sm font-base text-gray-600">The best replacement for the popular looping site</p>
            </Link>
          </div>
        </div>

        {/* Popular study loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Study Loops</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lofi Hip Hop Radio</Link>
            <Link href="/loop/coffee-shop-ambience" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Coffee Shop Ambience</Link>
            <Link href="/loop/rain-sounds" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Rain Sounds</Link>
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
