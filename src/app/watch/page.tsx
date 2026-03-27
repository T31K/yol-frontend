'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function WatchRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const v = searchParams.get('v')

  useEffect(() => {
    router.replace(v ? `/?v=${v}` : '/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchRedirect />
    </Suspense>
  )
}
