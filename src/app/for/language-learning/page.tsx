import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Loop YouTube Videos for Language Learning — Repeat Any Scene',
  description:
    'Loop YouTube videos to learn languages faster. Repeat any dialogue, phrase, or pronunciation example until it clicks. Free AB repeat tool for language learners.',
  keywords: [
    'loop youtube for language learning',
    'youtube looper language learning',
    'repeat youtube dialogue',
    'loop youtube video for studying',
    'shadowing youtube loop',
    'repeat specific section youtube',
    'language learning youtube repeat',
  ],
  openGraph: {
    title: 'Loop YouTube Videos for Language Learning — Repeat Any Scene',
    description:
      'Loop YouTube videos to learn languages faster. Repeat any dialogue or phrase until it clicks. Free AB repeat tool for language learners.',
    url: 'https://youtubeonloop.com/for/language-learning',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loop YouTube Videos for Language Learning — Repeat Any Scene',
    description: 'Loop YouTube videos to learn languages faster. Free AB repeat tool for language learners.',
    images: ['/og.png'],
  },
  alternates: {
    canonical: 'https://youtubeonloop.com/for/language-learning',
  },
}

export default function LanguageLearningPage() {
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
            🗣 Loop YouTube Videos for Language Learning
          </h1>
          <p className="text-lg font-base">
            Repetition is the core of language acquisition. Loop any YouTube scene, dialogue, or pronunciation guide until it sticks — without constantly scrubbing back.
          </p>
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-base border-4 border-black bg-white p-6 shadow-base text-center">
          <p className="mb-4 text-lg font-heading">Open any language video and start repeating:</p>
          <Link
            href="/"
            className="inline-block rounded-base border-4 border-black bg-main px-8 py-3 text-xl font-heading shadow-base transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          >
            ▶ Open YouTubeOnLoop
          </Link>
          <p className="mt-4 text-sm font-base text-gray-600">
            Or replace <code className="rounded border border-gray-400 bg-gray-100 px-1">youtube.com</code> with{' '}
            <code className="rounded border border-black bg-main/30 px-1">youtubeonloop.com</code> in any YouTube URL
          </p>
        </div>

        {/* Why repetition works */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">Why Looping Works for Language Learning</h2>
          <p className="mb-3 font-base text-gray-700">
            The most effective language learners don&apos;t just watch content once — they re-listen to the same material many times. Your brain needs repeated exposure to a sound pattern before it can reproduce it naturally. One pass through a dialogue teaches you what words were said. Ten loops trains your ear and your mouth to recognize and produce those sounds without effort.
          </p>
          <p className="font-base text-gray-700">
            This is the basis of the <strong>shadowing technique</strong> — listening to a native speaker and repeating along, matching rhythm, intonation, and speed. Looping a short clip makes this practical: you get to shadow the same phrase over and over without interrupting your flow.
          </p>
        </div>

        {/* Shadowing with YouTubeOnLoop */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">How to Shadow with YouTubeOnLoop</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">1</span>
              <div>
                <p className="font-heading">Find a native speaker video</p>
                <p className="text-sm font-base text-gray-600">Look for YouTube channels with natural, conversational speech — vlogs, podcasts, interviews, or language lesson channels.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">2</span>
              <div>
                <p className="font-heading">Isolate one sentence or phrase</p>
                <p className="text-sm font-base text-gray-600">Set your Start and End times to loop just 5–15 seconds. One short phrase is better than a whole paragraph.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">3</span>
              <div>
                <p className="font-heading">Slow it down first</p>
                <p className="text-sm font-base text-gray-600">Use 0.75x speed to catch every syllable clearly. Once you can follow along, switch back to 1x to shadow at natural pace.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-base border-2 border-black bg-main font-heading">4</span>
              <div>
                <p className="font-heading">Repeat out loud</p>
                <p className="text-sm font-base text-gray-600">Say the phrase along with or just after the speaker on each loop. Aim for 10–20 repetitions per phrase before moving on.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip box */}
        <div className="mb-6 rotate-[0.4deg] rounded-base border-4 border-black bg-yellow-300 p-6 shadow-base">
          <h2 className="mb-3 text-xl font-heading">💡 Tips for Language Learners</h2>
          <ul className="space-y-2 font-base text-sm">
            <li>• <strong>Short loops win:</strong> A 5-second phrase looped 20 times beats a 60-second clip looped 3 times.</li>
            <li>• <strong>Use 0.75x speed:</strong> Hear every phoneme clearly without the audio becoming distorted.</li>
            <li>• <strong>Watch the mouth:</strong> Pause your own speaking, look at the speaker&apos;s mouth, then try again.</li>
            <li>• <strong>Bookmark your loops:</strong> Save the page once you set start/end times to return to the same drill.</li>
            <li>• <strong>Track your reps:</strong> The loop counter on screen shows you how many times you&apos;ve heard the phrase.</li>
          </ul>
        </div>

        {/* Best content types */}
        <div className="mb-6 rounded-base border-4 border-black bg-white p-6 shadow-base">
          <h2 className="mb-4 text-2xl font-heading">What Language Learners Loop Most</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { emoji: '🎬', title: 'TV show dialogues', desc: 'Casual, natural speech with real-world vocabulary' },
              { emoji: '📖', title: 'Pronunciation guides', desc: 'Drill specific sounds that don\'t exist in your native language' },
              { emoji: '🗞️', title: 'News clips', desc: 'Formal speech, clear enunciation — great for intermediate learners' },
              { emoji: '🎵', title: 'Songs in your target language', desc: 'Catchy melodies help vocabulary stick faster' },
              { emoji: '💬', title: 'Conversation lessons', desc: 'Repeat common phrases used in everyday situations' },
              { emoji: '🧑‍🏫', title: 'Grammar explanations', desc: 'Hear a grammar point explained multiple times until it clicks' },
            ].map((item) => (
              <div key={item.title} className="rounded-base border-2 border-black p-3">
                <p className="font-heading">{item.emoji} {item.title}</p>
                <p className="text-sm font-base text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
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
              <p className="text-sm font-base text-gray-600">Loop specific riffs and solos to build muscle memory</p>
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
