import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop Meditation Music on YouTube — Mantras & Sound Baths on Repeat',
  description:
    'Loop meditation tracks, mantras, sound baths, and 432 Hz frequencies on YouTube — uninterrupted, no ads, no autoplay. Free meditation looper.',
  keywords: [
    'loop meditation music youtube',
    'mantra on repeat',
    'sound bath loop',
    '432 hz on repeat',
    'meditation timer youtube',
    'youtube on loop meditation',
  ],
  openGraph: {
    title: 'Loop Meditation Music on YouTube — Mantras & Sound Baths on Repeat',
    description:
      'Loop mantras, sound baths, and meditation tracks endlessly. No ads, no autoplay — just stillness.',
    url: 'https://youtubeonloop.com/for/meditation',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop Meditation Music on YouTube — Mantras & Sound Baths on Repeat',
    description: 'Loop meditation tracks endlessly. Free.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/meditation',
  },
}

export default function MeditationPage() {
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
            🧘 Loop Meditation Music on YouTube
          </h1>
          <p className="text-lg font-base">
            Loop mantras, sound baths, and ambient meditation tracks without an ad or autoplay break ever pulling you out of practice.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open a meditation track and loop it:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any meditation URL
          </p>
        </div>

        {/* Why looping for meditation */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why a Pure Loop Matters in Practice</h2>
          <p className="mb-3 font-base text-gray-700">
            Meditation works because your brain finally stops anticipating what comes next. Anything that interrupts that — a mid-roll ad, a YouTube auto-suggest, the next track being slightly louder — drops you back into thinking mode.
          </p>
          <p className="font-base text-gray-700">
            A clean loop of one mantra or one sound bath holds the field steady for as long as you need. The track ends, immediately starts again, and your attention has nothing to grab onto.
          </p>
        </div>

        {/* What to loop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Best Tracks to Loop for Meditation</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🕉', title: 'Mantras', desc: 'Om Mani Padme Hum, Gayatri, So Hum — chanted on repeat' },
              { emoji: '🔔', title: 'Singing bowls', desc: 'Tibetan and crystal bowl drones, full sound bath sessions' },
              { emoji: '🎶', title: '432 Hz / 528 Hz', desc: 'Solfeggio frequencies for chakra and healing work' },
              { emoji: '🌬', title: 'Breathwork tracks', desc: 'Box breathing, Wim Hof, 4-7-8 — sync to the loop' },
              { emoji: '🌊', title: 'Nature soundscapes', desc: 'Forest, stream, ocean — set and forget' },
              { emoji: '🎙', title: 'Guided sessions', desc: 'Loop a 10-min session twice for a 20-min sit' },
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
          <h2 className="mb-4 text-2xl font-heading">How to Set Up a Meditation Loop</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Pick a track without spoken intros</p>
                <p className="text-sm font-base text-gray-600">A talking voice every loop will pull you out. Look for tracks where the music starts at 0:00.</p>
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
                <p className="font-heading">Use repeat count as your timer</p>
                <p className="text-sm font-base text-gray-600">A 10-min track + repeat 2 = a 20-min sit. The audio fades out when the count completes — no alarm needed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Trim out the outro</p>
                <p className="text-sm font-base text-gray-600">Many tracks have 30 seconds of silence or credits at the end — set End just before that so each loop transitions cleanly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Practice Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Same track, daily:</strong> Looping the same mantra every morning becomes a state-trigger — your nervous system drops in faster.</li>
            <li>• <strong>Lower volume than you think:</strong> Meditation works best when the audio is just below conscious notice.</li>
            <li>• <strong>Build a meditation playlist:</strong> Save your morning, evening, and breathwork tracks separately — sign in to sync them.</li>
            <li>• <strong>Phone do-not-disturb:</strong> Combine with DND so notifications don&apos;t puncture the loop.</li>
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
              href="/for/studying"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">📚 Studying</p>
              <p className="text-sm font-base text-gray-600">Loop focus music for deep work sessions</p>
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

        {/* Popular meditation loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Meditation Loops</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/rain-sounds" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Rain Sounds</Link>
            <Link href="/loop/coffee-shop-ambience" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Coffee Shop Ambience</Link>
            <Link href="/loop/lofi-hip-hop-radio" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Lofi Radio</Link>
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
