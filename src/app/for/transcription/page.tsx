import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop YouTube Audio for Transcription — Slow & AB Repeat',
  description:
    'Transcribe interviews, lectures, songs, or sermons from YouTube. Slow audio to 0.5×, loop tricky sections, never lose your place. Free transcription tool.',
  keywords: [
    'transcribe youtube video',
    'slow down youtube audio',
    'youtube transcription tool',
    'loop youtube for transcription',
    'transcribe music by ear',
    'lecture transcription youtube',
  ],
  openGraph: {
    title: 'Loop YouTube Audio for Transcription — Slow & AB Repeat',
    description:
      'Slow audio, loop sections, never lose your place. Built for journalists, musicians, and students transcribing from YouTube.',
    url: 'https://youtubeonloop.com/for/transcription',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop YouTube Audio for Transcription — Slow & AB Repeat',
    description: 'Slow + loop YouTube for transcription. Free.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/transcription',
  },
}

export default function TranscriptionPage() {
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
            ✍️ Loop YouTube for Transcription
          </h1>
          <p className="text-lg font-base">
            Slow audio to 0.5×, set a tight A/B loop on the section you&apos;re transcribing, and type without ever losing your place.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open the video and start transcribing:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any video URL
          </p>
        </div>

        {/* Why looping for transcription */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why a Looper Beats Hotkeys</h2>
          <p className="mb-3 font-base text-gray-700">
            The standard transcription workflow is: play 5 seconds, pause, type, rewind, miss it, type, rewind again. Half your time is spent fighting the timeline.
          </p>
          <p className="font-base text-gray-700">
            A real A/B loop replaces all that. Set the loop to a 5-second window, slow it to 0.5×, and the same chunk plays automatically every 10 seconds — for as long as you need. Move the window forward when you&apos;re done.
          </p>
        </div>

        {/* Use cases */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Who This Helps</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '📰', title: 'Journalists', desc: 'Transcribe interviews, press conferences, podcast clips' },
              { emoji: '🎓', title: 'Students', desc: 'Capture lectures and seminars from YouTube' },
              { emoji: '🎵', title: 'Musicians', desc: 'Transcribe solos, basslines, melodies by ear' },
              { emoji: '⛪', title: 'Sermon notes', desc: 'Capture key sections from church live streams' },
              { emoji: '🌍', title: 'Translators', desc: 'Slow speech to catch every word in a foreign language' },
              { emoji: '⚖️', title: 'Researchers', desc: 'Pull exact quotes from interviews and panel talks' },
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
          <h2 className="mb-4 text-2xl font-heading">The Transcription Workflow</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Open the video on YouTubeOnLoop</p>
                <p className="text-sm font-base text-gray-600">Replace <code className="rounded border border-gray-300 bg-gray-100 px-1 text-xs">youtube.com</code> with <code className="rounded border border-black bg-main/30 px-1 text-xs">youtubeonloop.com</code> or paste the URL on the homepage.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">2</span>
              <div>
                <p className="font-heading">Set a 5–10 second window</p>
                <p className="text-sm font-base text-gray-600">Trim Start/End around one sentence or musical phrase. Anything tighter is too noisy; anything wider, you forget.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">3</span>
              <div>
                <p className="font-heading">Drop speed to 0.5× or 0.75×</p>
                <p className="text-sm font-base text-gray-600">Slow speech makes mumbled words audible; slow music makes individual notes pickable.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Type. Loop runs in the background.</p>
                <p className="text-sm font-base text-gray-600">No need to touch the timeline — the same chunk replays until you advance the window.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">5</span>
              <div>
                <p className="font-heading">Move the window forward</p>
                <p className="text-sm font-base text-gray-600">Bump Start by 5–10 seconds. Repeat until done. Bookmarks save your spot if you need to break.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Transcription Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Headphones beat speakers:</strong> Slowed audio gets muddy on speakers — closed-back headphones reveal everything.</li>
            <li>• <strong>0.75× is the sweet spot:</strong> Slow enough to catch words, fast enough you&apos;re not falling asleep.</li>
            <li>• <strong>Use YouTube&apos;s captions as a draft:</strong> Auto-captions are 80% right — fix the wrong 20% with your loop.</li>
            <li>• <strong>Sign in to save your spot:</strong> Loop points sync across devices — start on desktop, finish on laptop.</li>
          </ul>
        </div>

        {/* Internal links */}
        <div className="mb-8 rounded-base border-4 border-black bg-[#FFECD2] p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">More Uses for YouTubeOnLoop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/for/language-learning"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🗣 Language Learning</p>
              <p className="text-sm font-base text-gray-600">Repeat dialogues and phrases to master pronunciation</p>
            </Link>
            <Link
              href="/for/guitar-practice"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">🎸 Guitar Practice</p>
              <p className="text-sm font-base text-gray-600">Loop riffs and solos at any speed</p>
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
