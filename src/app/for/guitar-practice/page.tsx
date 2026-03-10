import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop YouTube Guitar Lessons on Repeat — Free AB Repeat Tool',
  description:
    'Loop any YouTube guitar tutorial on repeat. Set start and end times to practice specific riffs, solos, and chord transitions. Free YouTube looper for guitarists.',
  keywords: [
    'loop youtube video for guitar practice',
    'youtube ab repeat guitar',
    'loop guitar lesson youtube',
    'repeat youtube section guitar',
    'guitar practice youtube looper',
    'loop specific part youtube',
  ],
  openGraph: {
    title: 'Loop YouTube Guitar Lessons on Repeat — Free AB Repeat Tool',
    description:
      'Loop any YouTube guitar tutorial on repeat. Set start and end times to practice specific riffs and solos. Free tool for guitarists.',
    url: 'https://youtubeonloop.com/for/guitar-practice',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop YouTube Guitar Lessons on Repeat — Free AB Repeat Tool',
    description: 'Loop any YouTube guitar tutorial on repeat. Free AB repeat tool for guitarists.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/guitar-practice',
  },
}

export default function GuitarPracticePage() {
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
            🎸 Loop YouTube Guitar Lessons on Repeat
          </h1>
          <p className="text-lg font-base">
            Practice any riff, solo, or chord transition by looping that exact section — over and over until your fingers get it right.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open a guitar lesson and start looping:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any guitar lesson URL
          </p>
        </div>

        {/* Why looping works for guitar */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why Guitarists Loop YouTube Lessons</h2>
          <p className="mb-3 font-base text-gray-700">
            Muscle memory is built through repetition. When you&apos;re learning a difficult passage — a fast pentatonic run, a complex fingerpicking pattern, a tricky chord transition — you need to hear and play it dozens of times before your hands know where to go without thinking.
          </p>
          <p className="font-base text-gray-700">
            Watching a lesson on YouTube and having to scrub back manually every 30 seconds breaks your focus and your flow. A proper loop lets you stay in the zone, focus on your technique, and actually internalize the pattern.
          </p>
        </div>

        {/* How to use AB repeat */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Use AB Repeat for Guitar Practice</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Find the section you want to practice</p>
                <p className="text-sm font-base text-gray-600">Watch the lesson once and note the timestamps of the specific riff or technique you want to drill.</p>
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
                <p className="font-heading">Set your Start and End times</p>
                <p className="text-sm font-base text-gray-600">Enter the start and end timestamps in seconds. For example, if the solo runs from 1:23 to 1:45, enter Start: 83, End: 105.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Slow it down if needed</p>
                <p className="text-sm font-base text-gray-600">Use the speed control to set 0.5x or 0.75x playback. Hear every note clearly before building up to full speed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Practice tips */}
        <div className="mb-6 rotate-[-0.3deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Practice Tips</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Start slow:</strong> Set speed to 0.5x and loop until it&apos;s clean, then gradually increase.</li>
            <li>• <strong>Isolate small sections:</strong> A 5-second loop of a hard transition is more useful than a 30-second loop of an easy passage.</li>
            <li>• <strong>Count loops:</strong> The loop counter on screen helps you track how many reps you&apos;ve done.</li>
            <li>• <strong>Bookmark it:</strong> Once you set your start/end times, bookmark the page to come back to the same loop next practice session.</li>
          </ul>
        </div>

        {/* What to loop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">What Guitar Players Loop Most</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🎵', title: 'Difficult solos', desc: 'Learn famous solos one phrase at a time' },
              { emoji: '🤌', title: 'Fingerpicking patterns', desc: 'Drill fingerstyle patterns until they feel natural' },
              { emoji: '🔄', title: 'Chord transitions', desc: 'Loop the moment of transition until it&apos;s smooth' },
              { emoji: '⚡', title: 'Speed runs & shredding', desc: 'Build up speed gradually by looping the same lick' },
              { emoji: '🎸', title: 'Barre chord practice', desc: 'Repeat specific changes to build strength and clarity' },
              { emoji: '🎼', title: 'Rhythm patterns', desc: 'Lock in strumming and picking rhythms with repetition' },
            ].map((item) => (
              <div key={item.title} className="rounded-base border-2 border-black p-3">
                <p className="font-heading">{item.emoji} {item.title}</p>
                <p className="text-sm font-base text-gray-600" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            ))}
          </div>
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
