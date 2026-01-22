'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, X, Tv2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function TwitchPage() {
  const [stream1, setStream1] = useState('')
  const [stream2, setStream2] = useState('')
  const [activeStream1, setActiveStream1] = useState<string | null>(null)
  const [activeStream2, setActiveStream2] = useState<string | null>(null)

  const extractChannelName = (input: string): string => {
    // Handle full URLs like twitch.tv/channel or https://www.twitch.tv/channel
    const urlMatch = input.match(/twitch\.tv\/(\w+)/i)
    if (urlMatch) return urlMatch[1]
    // Otherwise assume it's just the channel name
    return input.trim()
  }

  const handleLoad = () => {
    if (stream1) {
      setActiveStream1(extractChannelName(stream1))
    }
    if (stream2) {
      setActiveStream2(extractChannelName(stream2))
    }
  }

  const clearStream1 = () => {
    setStream1('')
    setActiveStream1(null)
  }

  const clearStream2 = () => {
    setStream2('')
    setActiveStream2(null)
  }

  const clearAll = () => {
    setStream1('')
    setStream2('')
    setActiveStream1(null)
    setActiveStream2(null)
  }

  const hasActiveStreams = activeStream1 || activeStream2

  return (
    <main className="min-h-screen bg-white p-4 md:p-8 bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] bg-[size:45px_45px]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo.webp"
              alt="YouTubeOnLoop"
              width={200}
              height={57}
              className="h-12 w-auto"
            />
          </Link>
          <div className="inline-flex items-center gap-2 bg-purple-500 text-white border-4 border-black shadow-base px-4 py-2 rounded-base ml-4">
            <Tv2 className="w-5 h-5" />
            <span className="font-heading">Twitch Multi-View</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading tracking-tight mt-4">
            Watch Two Twitch Streams at Once
          </h1>
          <p className="text-lg font-base mt-2 text-gray-600">
            Enter channel names or Twitch URLs to watch side by side
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white border-4 border-black shadow-base p-4 md:p-6 rounded-base mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-heading text-sm mb-2 block">Stream 1</label>
              <input
                type="text"
                value={stream1}
                onChange={(e) => setStream1(e.target.value)}
                placeholder="Channel name or twitch.tv/..."
                className="w-full px-4 py-3 text-lg border-4 border-black rounded-base focus:outline-none focus:ring-4 focus:ring-purple-400 font-base"
              />
            </div>
            <div>
              <label className="font-heading text-sm mb-2 block">Stream 2</label>
              <input
                type="text"
                value={stream2}
                onChange={(e) => setStream2(e.target.value)}
                placeholder="Channel name or twitch.tv/..."
                className="w-full px-4 py-3 text-lg border-4 border-black rounded-base focus:outline-none focus:ring-4 focus:ring-purple-400 font-base"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleLoad}
              size="lg"
              className="bg-purple-500 hover:bg-purple-600 text-white font-heading"
              disabled={!stream1 && !stream2}
            >
              <Play className="w-5 h-5 mr-2" />
              Load Streams
            </Button>
            {hasActiveStreams && (
              <Button
                onClick={clearAll}
                variant="neutral"
                size="lg"
              >
                <X className="w-5 h-5 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Streams */}
        {hasActiveStreams ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stream 1 */}
            <div className="bg-white border-4 border-black shadow-base rounded-base overflow-hidden">
              {activeStream1 ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b-4 border-black bg-purple-100">
                    <span className="font-heading flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      {activeStream1}
                    </span>
                    <button
                      onClick={clearStream1}
                      className="p-1 hover:bg-purple-200 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${activeStream1}&parent=youtubeonloop.com&muted=false`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 font-base">No stream loaded</p>
                </div>
              )}
            </div>

            {/* Stream 2 */}
            <div className="bg-white border-4 border-black shadow-base rounded-base overflow-hidden">
              {activeStream2 ? (
                <>
                  <div className="flex items-center justify-between p-3 border-b-4 border-black bg-purple-100">
                    <span className="font-heading flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      {activeStream2}
                    </span>
                    <button
                      onClick={clearStream2}
                      className="p-1 hover:bg-purple-200 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={`https://player.twitch.tv/?channel=${activeStream2}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&muted=false`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 font-base">No stream loaded</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border-4 border-black shadow-base p-8 md:p-12 rounded-base text-center">
            <div className="text-6xl mb-4">📺📺</div>
            <h2 className="text-2xl font-heading mb-2">No streams loaded</h2>
            <p className="text-gray-600 font-base mb-6">
              Enter Twitch channel names above to watch two streams at once!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-purple-100 border-2 border-black px-3 py-1 rounded-base text-sm">
                twitch.tv/channel
              </span>
              <span className="bg-purple-100 border-2 border-black px-3 py-1 rounded-base text-sm">
                channel_name
              </span>
            </div>
          </div>
        )}

        {/* Chat Section */}
        {hasActiveStreams && (
          <div className="mt-8">
            <h2 className="text-xl font-heading mb-4">Live Chats</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeStream1 && (
                <div className="bg-white border-4 border-black shadow-base rounded-base overflow-hidden">
                  <div className="p-3 border-b-4 border-black bg-purple-100">
                    <span className="font-heading">{activeStream1} Chat</span>
                  </div>
                  <iframe
                    src={`https://www.twitch.tv/embed/${activeStream1}/chat?parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&darkpopout`}
                    className="w-full h-96"
                  />
                </div>
              )}
              {activeStream2 && (
                <div className="bg-white border-4 border-black shadow-base rounded-base overflow-hidden">
                  <div className="p-3 border-b-4 border-black bg-purple-100">
                    <span className="font-heading">{activeStream2} Chat</span>
                  </div>
                  <iframe
                    src={`https://www.twitch.tv/embed/${activeStream2}/chat?parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}&darkpopout`}
                    className="w-full h-96"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-purple-200 border-4 border-black shadow-base p-4 rounded-base rotate-[0.5deg] mt-8">
          <p className="font-heading text-sm">
            💡 <strong>{`Tip:`}</strong> {`You can enter just the channel name (e.g., "caedrel") or the full URL (e.g., "twitch.tv/caedrel")`}
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-base mt-2">
            Made with ❤️ for multi-stream viewing
          </p>
        </footer>
      </div>
    </main>
  )
}
