import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop Karaoke Songs on YouTube — Practice Vocals on Repeat',
  description:
    'Loop karaoke videos and instrumentals on YouTube to practice the chorus, nail the high notes, and memorize lyrics. Free karaoke looper — no signup.',
  keywords: [
    'loop karaoke youtube',
    'youtube karaoke on repeat',
    'practice singing youtube loop',
    'loop chorus youtube',
    'karaoke practice tool',
    'memorize lyrics loop',
  ],
  openGraph: {
    title: 'Loop Karaoke Songs on YouTube — Practice Vocals on Repeat',
    description:
      'Loop the chorus, drill the high notes, memorize lyrics. The simplest karaoke practice tool.',
    url: 'https://youtubeonloop.com/for/karaoke',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop Karaoke Songs on YouTube — Practice Vocals on Repeat',
    description: 'Loop karaoke tracks for singing practice. Free.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/karaoke',
  },
}

export default function KaraokePage() {
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
            🎤 Loop Karaoke Songs on YouTube
          </h1>
          <p className="text-lg font-base">
            Loop the chorus until you nail it. Loop the bridge until the lyrics stick. Loop that one impossible high note until your neighbors hate you.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open a karaoke track and start looping:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any karaoke URL
          </p>
        </div>

        {/* Why looping for karaoke */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why Looping Beats Replaying</h2>
          <p className="mb-3 font-base text-gray-700">
            The chorus of any song is roughly 20% of the runtime — but it&apos;s 80% of what you need to nail. Replaying the whole 4-minute track every time you want to practice the hook is just wasting reps.
          </p>
          <p className="font-base text-gray-700">
            Loop the chorus from 1:05 to 1:35 instead and you&apos;ll get five times more reps in the same practice block. Same trick for the bridge, the rap break, the high note that always trips you up.
          </p>
        </div>

        {/* How to use */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Practice With AB Repeat</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Find a karaoke version on YouTube</p>
                <p className="text-sm font-base text-gray-600">Search &quot;[song name] karaoke&quot; or &quot;[song name] instrumental&quot; — pick the one with on-screen lyrics if you&apos;re still learning.</p>
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
                <p className="font-heading">Set Start/End to the chorus</p>
                <p className="text-sm font-base text-gray-600">Trim it tight. The first chorus usually hits around 0:50–1:30 in a 3-min pop song.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Slow it down for the hard parts</p>
                <p className="text-sm font-base text-gray-600">Drop to 0.75× to learn fast verses or rap sections — pitch shifts a bit but the words become singable.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">5</span>
              <div>
                <p className="font-heading">Build a karaoke night playlist</p>
                <p className="text-sm font-base text-gray-600">Save your set list as a playlist — your start/end times stick around for next time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What to loop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">What Karaoke Singers Loop Most</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🎶', title: 'The chorus', desc: 'The part everyone sings — get this perfect first' },
              { emoji: '🚀', title: 'The high note', desc: 'Loop the 5-second money note 30 times in a row' },
              { emoji: '🗣', title: 'Rap breaks', desc: 'Slow down Eminem, Nicki, Kendrick verses to learn the cadence' },
              { emoji: '🎼', title: 'The bridge', desc: 'Often the hardest melody — loop it until lyrics stick' },
              { emoji: '🎤', title: 'Adlibs & runs', desc: 'Loop and slow R&B runs to nail the ornaments' },
              { emoji: '🌍', title: 'Foreign language songs', desc: 'Loop + slow K-pop, J-pop, Spanish hits to learn pronunciation' },
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
          <h2 className="mb-3 text-xl font-heading">💡 Karaoke Practice Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Sing along quietly first:</strong> First few loops, mouth the words. Sing full-out only after the melody is locked in.</li>
            <li>• <strong>Repeat count = drills:</strong> Set repeat = 10, drill the chorus, take a 30-sec break, do it again.</li>
            <li>• <strong>Match the singer&apos;s breaths:</strong> Looping shows you exactly where they breathe — copy it.</li>
            <li>• <strong>Use 0.5× to memorize lyrics:</strong> Words become impossible to mishear at half speed.</li>
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
              href="/for/dance-practice"
              className="rounded-base border-2 border-black bg-white p-3 shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <p className="font-heading">💃 Dance Practice</p>
              <p className="text-sm font-base text-gray-600">Slow + loop choreography to learn moves</p>
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

        {/* Popular karaoke loops */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">Popular Karaoke Songs</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/loop/someone-like-you" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Someone Like You</Link>
            <Link href="/loop/hello" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Hello</Link>
            <Link href="/loop/perfect" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Perfect</Link>
            <Link href="/loop/all-of-me" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">All of Me</Link>
            <Link href="/loop/bohemian-rhapsody" className="rounded-base border-2 border-black bg-white px-3 py-1 text-sm font-heading shadow-base transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Bohemian Rhapsody</Link>
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
