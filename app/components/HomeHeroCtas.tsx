'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { buildLoginHref } from '@/lib/auth/redirect'

export function HomeHeroCtas() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(!!data.session)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setIsSignedIn(!!s)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUpHref = buildLoginHref({ mode: 'signup', next: '/' })
  const secondaryHref = isSignedIn ? '/garage' : signUpHref
  const secondaryLabel = isSignedIn ? 'Open Garage' : 'Create free account'

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', opacity: ready ? 1 : 0, transition: 'opacity 0.15s' }}>
      <Link
        href="/browse"
        style={{
          display: 'inline-block',
          backgroundColor: '#E8841A',
          color: '#0D0D0D',
          borderRadius: 8,
          padding: '13px 20px',
          fontFamily: "'Helvetica Neue', 'Arial Black', Arial, sans-serif",
          fontWeight: 900,
          fontSize: 13,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Browse Accessories
      </Link>
      <Link
        href={secondaryHref}
        style={{
          display: 'inline-block',
          border: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'transparent',
          color: '#F5F3EE',
          borderRadius: 8,
          padding: '13px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 500,
          fontSize: 12,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {secondaryLabel}
      </Link>
    </div>
  )
}
