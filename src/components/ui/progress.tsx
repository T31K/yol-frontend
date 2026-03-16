'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

function Progress({
  value = 0,
  className,
  onSeek,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number
  onSeek?: (pct: number) => void
}) {
  const clamped = Math.min(100, Math.max(0, value))
  const barRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const seek = (e: React.MouseEvent | MouseEvent) => {
    if (!barRef.current || !onSeek) return
    const rect = barRef.current.getBoundingClientRect()
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    onSeek(pct)
  }

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) seek(e)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  })

  return (
    <div
      ref={barRef}
      className={cn('relative cursor-pointer py-2', className)}
      onMouseDown={(e) => {
        dragging.current = true
        seek(e)
      }}
      {...props}
    >
      <div className="h-3 w-full rounded-full border-2 border-black bg-stone-200">
        <div
          className="h-full rounded-full bg-black transition-[width] duration-100"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white"
        style={{ left: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
