import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop YouTube Dance Tutorials — Slow & Repeat Choreography',
  description:
    'Loop choreography sections at 0.5× or 0.75× speed to learn dance moves frame by frame. Free YouTube AB repeat tool for dancers and choreographers.',
  keywords: [
    'loop youtube dance tutorial',
    'slow down dance video youtube',
    'choreography loop tool',
    'youtube ab repeat dance',
    'learn dance from youtube slow',
    'dance practice looper',
  ],
  openGraph: {
    title: 'Loop YouTube Dance Tutorials — Slow & Repeat Choreography',
    description:
      'Slow choreography to 0.5× and loop tricky 8-counts until your body memorizes them. Built for dancers.',
    url: 'https://youtubeonloop.com/for/dance-practice',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop YouTube Dance Tutorials — Slow & Repeat Choreography',
    description: 'Slow + loop dance tutorials. Free for dancers.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/dance-practice',
  },
}

export default function DancePracticePage() {
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
            💃 Loop YouTube Dance Tutorials
          </h1>
          <p className="text-lg font-base">
            Drill that one tricky 8-count at half speed, on a 6-second loop, until your body finally gets it — then ramp it back up.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open a dance tutorial and start looping:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any tutorial URL
          </p>
        </div>

        {/* Why looping for dance */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why Dancers Loop YouTube Tutorials</h2>
          <p className="mb-3 font-base text-gray-700">
            Choreography is mostly muscle memory. Watching an 8-count once and trying to mirror it across the room is the slowest way to learn — every time you look back at the screen, you lose the count.
          </p>
          <p className="font-base text-gray-700">
            A short loop of one phrase, played at 0.5× or 0.75×, lets you mark it five times, full-out it five more, then ramp speed without ever having to scrub the timeline. The reps stack up fast.
          </p>
        </div>

        {/* How to use */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Drill an 8-Count on Loop</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Watch the tutorial once at full speed</p>
                <p className="text-sm font-base text-gray-600">Note the timestamp where the section you want to drill starts and ends — usually 5–10 seconds.</p>
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
                <p className="font-heading">Set Start and End times tight</p>
                <p className="text-sm font-base text-gray-600">Trim it to just the 8-count you&apos;re drilling. A 5-second loop is way more useful than a 30-second one.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Slow it to 0.5× or 0.75×</p>
                <p className="text-sm font-base text-gray-600">Mark it slow until the move is clean, then bump speed up gradually. The loop keeps going — you don&apos;t have to do anything else.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">5</span>
              <div>
                <p className="font-heading">Move on to the next 8-count</p>
                <p className="text-sm font-base text-gray-600">Update Start and End to the next phrase. Repeat. Then string them together at full speed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What to drill */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">What Dancers Loop Most</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🕺', title: 'Hip-hop choreography', desc: 'Drill 8-counts from MihRan, Kyle Hanagami, Matt Steffanina' },
              { emoji: '💃', title: 'K-pop dance covers', desc: 'Mirror BLACKPINK, BTS, Twice routines from official dance practice videos' },
              { emoji: '🩰', title: 'Ballet & contemporary', desc: 'Loop a single grand jeté or pirouette transition until it cleans up' },
              { emoji: '🎶', title: 'TikTok dances', desc: 'Slow short trends down so the moves actually register' },
              { emoji: '🌀', title: 'Footwork combos', desc: 'Salsa, bachata, breaking — anything fast benefits from 0.5×' },
              { emoji: '🔁', title: 'Transitions', desc: 'The ugly half-second between moves is where loops shine' },
            ].map((item) => (
              <div key={item.title} className="rounded-base border-2 border-black p-3">
                <p className="font-heading">{item.emoji} {item.title}</p>
                <p className="text-sm font-base text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Dance Drill Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>0.5× is your friend:</strong> If 0.75× feels too fast, drop to 0.5× — pitch shifts, but moves get clearer.</li>
            <li>• <strong>Mirror mode in your head:</strong> Most tutorials are already mirrored — if not, dance backwards from the screen.</li>
            <li>• <strong>Loop counter = reps:</strong> Set a goal (&quot;drill 20 times&quot;) and the on-screen counter does the counting for you.</li>
            <li>• <strong>Bookmark the page:</strong> Your start/end times save automatically — come back tomorrow to the exact same drill.</li>
          </ul>
        </div>

        {/* Internal links */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">More Uses for YouTubeOnLoop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/for/guitar-practice"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🎸 Guitar Practice</p>
              <p className="text-sm font-base text-gray-600">Loop riffs and solos at any speed</p>
            </Link>
            <Link
              href="/for/transcription"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">✍️ Transcription</p>
              <p className="text-sm font-base text-gray-600">Slow audio to capture every word or note</p>
            </Link>
            <Link
              href="/for/karaoke"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🎤 Karaoke</p>
              <p className="text-sm font-base text-gray-600">Loop tricky chorus sections and runs</p>
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

        {/* Popular dance loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Songs to Drill</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/how-you-like-that" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">How You Like That</Link>
            <Link href="/loop/dynamite" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Dynamite</Link>
            <Link href="/loop/butter" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Butter</Link>
            <Link href="/loop/uptown-funk" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Uptown Funk</Link>
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
